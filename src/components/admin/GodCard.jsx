export function GodCard({ icon, title, desc, color, danger }) {
  const colors = {
    cyan: "border-cyan-500/30 text-cyan-400",
    purple: "border-purple-500/30 text-purple-400",
    orange: "border-orange-500/30 text-orange-400",
    red: "border-red-500/40 text-red-400",
  };

  return (
    <div
      className={`
        bg-[#12182a] rounded-xl p-6 border
        ${colors[color]}
        ${danger ? "animate-pulse" : ""}
      `}
    >
      <div className="text-3xl mb-2">{icon}</div>
      <h2 className="font-bold text-lg">{title}</h2>
      <p className="text-sm text-gray-400 mb-4">{desc}</p>

      <button
        className={`
          px-4 py-2 rounded text-sm
          ${danger
            ? "bg-red-500/20 hover:bg-red-500/40"
            : "bg-white/5 hover:bg-white/10"}
        `}
      >
        Open
      </button>
    </div>
  );
}
