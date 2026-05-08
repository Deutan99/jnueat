export default function Layout({ children }) {
  return (
    <div className="flex h-full flex-col">
      {children}
    </div>
  );
}

export function Contents({ children, banner }) {
  return (
    <main className="flex flex-1 min-h-0 flex-col px-4 pb-2">
      {banner && (
        <div className="mb-2 rounded-xl bg-amber-50 px-3 py-2 text-sm text-amber-900 ring-1 ring-amber-200">
          {banner}
        </div>
      )}
      <div className="card flex-1 min-h-[360px] overflow-hidden">
        {children}
      </div>
    </main>
  );
}

export function Footer({ children }) {
  return (
    <footer className="px-4 pb-5 pt-3">
      {children}
    </footer>
  );
}
