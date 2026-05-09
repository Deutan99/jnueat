import OpenAI from 'openai';

const LIMITS = {
  candidatesMax: 200,
  moodMax: 100,
  reasonMax: 200,
  rejectionsMax: 30,
  rate: { windowMs: 60_000, max: 30 },
};

const buckets = new Map();

function getIp(req) {
  const fwd = req.headers['x-forwarded-for'];
  if (typeof fwd === 'string') return fwd.split(',')[0].trim();
  return req.headers['x-real-ip'] || req.socket?.remoteAddress || 'unknown';
}

function rateLimit(ip) {
  const now = Date.now();
  const bucket = buckets.get(ip);
  if (!bucket || bucket.resetAt <= now) {
    buckets.set(ip, { count: 1, resetAt: now + LIMITS.rate.windowMs });
    return { ok: true };
  }
  if (bucket.count >= LIMITS.rate.max) {
    return { ok: false, retryAfter: Math.ceil((bucket.resetAt - now) / 1000) };
  }
  bucket.count++;
  return { ok: true };
}

async function readJsonBody(req) {
  if (req.body && typeof req.body === 'object') return req.body;
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  if (chunks.length === 0) return {};
  return JSON.parse(Buffer.concat(chunks).toString('utf-8'));
}

function send(res, status, payload) {
  res.statusCode = status;
  res.setHeader('content-type', 'application/json');
  res.end(JSON.stringify(payload));
}

const SYSTEM_BY_MODE = {
  category:
    '제주대학교(JNU) 근처 맛집 룰렛 앱의 추천 어시스턴트야. 사용자의 기분/상황과 음식 카테고리 후보 목록을 받아 가장 잘 맞는 카테고리 1개를 골라줘. 각 카테고리에는 해당하는 식당 수가 같이 주어지니, 너무 적은 카테고리는 가능하면 피해. 반드시 후보 중 하나를 그대로 골라야 하고, 이유는 한국어로 1-2문장.',
  restaurant:
    '제주대학교(JNU) 근처 맛집 룰렛 앱의 추천 어시스턴트야. 사용자의 기분/상황과 식당 후보 목록을 받아 가장 잘 맞는 식당 1개를 골라줘. 각 식당에는 음식 카테고리, 도보 시간(분), 주소가 같이 주어져. 반드시 후보 중 하나를 그대로 골라야 하고, 이유는 한국어로 1-2문장 안에 (왜 그 식당이 사용자 기분과 잘 맞는지 구체적으로).',
};

function formatCandidates(mode, candidates) {
  if (mode === 'restaurant') {
    return candidates
      .map((c, i) => {
        const parts = [c.text];
        const meta = [];
        if (c.category) meta.push(c.category);
        if (Number.isFinite(c.walkingMinutes)) meta.push(`도보 ${c.walkingMinutes}분`);
        if (c.address) meta.push(c.address);
        if (meta.length) parts.push(`(${meta.join(', ')})`);
        return `${i + 1}. ${parts.join(' ')}`;
      })
      .join('\n');
  }
  return candidates
    .map((c, i) => {
      const meta = Number.isFinite(c.count) ? ` (해당 식당 ${c.count}곳)` : '';
      return `${i + 1}. ${c.text}${meta}`;
    })
    .join('\n');
}

function formatRejections(rejections) {
  if (!Array.isArray(rejections) || rejections.length === 0) return '';
  const lines = rejections
    .filter((r) => r?.text)
    .map((r) => (r.reason ? `- ${r.text} (이유: ${r.reason})` : `- ${r.text}`));
  if (lines.length === 0) return '';
  return [
    '',
    '사용자가 이미 거절한 항목들이야. 이유를 참고해서 비슷한 결을 피하고 다른 옵션을 골라줘:',
    ...lines,
  ].join('\n');
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return send(res, 405, { error: 'Method Not Allowed' });

  const ip = getIp(req);
  const rl = rateLimit(ip);
  if (!rl.ok) {
    res.setHeader('Retry-After', String(rl.retryAfter));
    return send(res, 429, { error: `요청이 너무 많아요. ${rl.retryAfter}초 후 다시 시도해줘.` });
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return send(res, 500, { error: 'OPENAI_API_KEY가 서버에 설정되지 않았어요. .env에 추가해줘.' });

  let body;
  try {
    body = await readJsonBody(req);
  } catch {
    return send(res, 400, { error: '잘못된 JSON 본문' });
  }

  const { mode, candidates = [], mood = '', rejections = [] } = body;
  if (mode !== 'category' && mode !== 'restaurant') return send(res, 400, { error: 'mode는 category 또는 restaurant' });
  if (!Array.isArray(candidates) || candidates.length === 0) return send(res, 400, { error: 'candidates가 비어있음' });
  if (candidates.length > LIMITS.candidatesMax) {
    return send(res, 400, { error: `후보가 너무 많아요 (최대 ${LIMITS.candidatesMax}개)` });
  }

  const safeMood = String(mood || '').slice(0, LIMITS.moodMax);
  const safeRejections = (Array.isArray(rejections) ? rejections : [])
    .slice(0, LIMITS.rejectionsMax)
    .map((r) => ({
      text: String(r?.text ?? '').slice(0, 100),
      reason: String(r?.reason ?? '').slice(0, LIMITS.reasonMax),
    }));

  const candidateTexts = candidates.map((c) => String(c?.text ?? '')).filter(Boolean);
  if (candidateTexts.length === 0) return send(res, 400, { error: '후보 텍스트가 없음' });

  const userPrompt = [
    safeMood ? `사용자 기분/상황: "${safeMood}"` : '사용자가 기분을 따로 말하지 않았음.',
    '',
    `후보 ${mode === 'category' ? '카테고리' : '식당'} 목록:`,
    formatCandidates(mode, candidates),
    formatRejections(safeRejections),
    '',
    '이 중에서 하나를 골라줘.',
  ].join('\n');

  const client = new OpenAI({ apiKey });

  try {
    const response = await client.chat.completions.create({
      model: 'gpt-4o-mini',
      max_tokens: 256,
      messages: [
        { role: 'system', content: SYSTEM_BY_MODE[mode] },
        { role: 'user', content: userPrompt },
      ],
      response_format: {
        type: 'json_schema',
        json_schema: {
          name: 'recommendation',
          strict: true,
          schema: {
            type: 'object',
            properties: {
              pickedText: {
                type: 'string',
                enum: candidateTexts,
                description: '후보 목록 중 정확히 하나의 text를 그대로',
              },
              reason: {
                type: 'string',
                description: '한국어 1-2문장 이유',
              },
            },
            required: ['pickedText', 'reason'],
            additionalProperties: false,
          },
        },
      },
    });

    const content = response.choices?.[0]?.message?.content;
    if (!content) return send(res, 502, { error: '모델 응답이 비어있음' });

    const data = JSON.parse(content);
    return send(res, 200, data);
  } catch (e) {
    const status = typeof e?.status === 'number' ? e.status : 500;
    return send(res, status, { error: e?.message ?? 'AI 호출 실패' });
  }
}
