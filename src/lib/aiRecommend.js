export async function aiRecommend({ mode, candidates, mood, rejections }) {
  const r = await fetch('/api/recommend', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ mode, candidates, mood, rejections }),
  });
  if (!r.ok) {
    const err = await r.json().catch(() => ({ error: r.statusText }));
    throw new Error(err.error || 'AI 추천 실패');
  }
  return r.json();
}
