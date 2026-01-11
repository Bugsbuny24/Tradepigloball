import AdminLayout from "./AdminLayout";
export default function GodFeatures() {
  return (
    <AdminLayout title="⚙️ Feature Control">
      <Toggle icon="📦" name="Showcase" />
      <Toggle icon="📨" name="RFQ" />
      <Toggle icon="🤖" name="AI Predict" />
    </AdminLayout>
  );
}

function Toggle({ icon, name }) {
  return (
    <div className="flex justify-between items-center mb-3 bg-[#12182a] p-4 rounded border border-cyan-500/20">
      <span className="flex items-center gap-2">
        <span className="text-xl">{icon}</span>
        {name}
      </span>
      <button className="px-4 py-1 rounded bg-cyan-500/20 text-cyan-400 hover:bg-cyan-500/40">
        Toggle
      </button>
    </div>
  );
}
