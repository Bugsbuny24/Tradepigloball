export default function GodLayout({ children }) {
  return (
    <div className="god-layout">
      <aside className="god-sidebar">
        <h2>👁‍🔥 GOD MODE</h2>
        <nav>
          <a href="/god">Dashboard</a>
          <a href="/god/database">Database</a>
          <a href="/god/code">Code</a>
          <a href="/god/deploy">Deploy</a>
          <a href="/god/ai">AI</a>
          <a href="/god/audit">Audit</a>
        </nav>
      </aside>

      <main className="god-main">
        {children}
      </main>
    </div>
  );
}
