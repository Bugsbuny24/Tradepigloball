export default function AdminLayout({ title, children }) {
  return (
    <div className="min-h-screen bg-[#0b0f1a] text-gray-200">
      <header className="border-b border-cyan-500/20 px-6 py-4 flex justify-between">
        <h1 className="text-xl font-bold text-cyan-400">
          ⚡ ADMIN · {title}
        </h1>
        <span className="text-xs text-gray-400">God Mode</span>
      </header>

      <div className="flex">
        <aside className="w-56 border-r border-cyan-500/10 p-4">
          <nav className="space-y-3 text-sm">
            <a href="/admin" className="block hover:text-cyan-400">Dashboard</a>
            <a href="/admin/features" className="block hover:text-cyan-400">Features</a>
            <a href="/admin/system" className="block hover:text-cyan-400">System</a>
            <a href="/admin/audit" className="block hover:text-cyan-400">Audit</a>
          </nav>
        </aside>

        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}
