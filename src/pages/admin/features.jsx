import AdminLayout from "../admin/AdminLayout";
export default function Features() {
  return (
    <AdminLayout title="Features">
      <div className="space-y-4">
        <Toggle name="RFQ" />
        <Toggle name="Showcase" />
        <Toggle name="AI Predict" />
      </div>
    </AdminLayout>
  );
}

function Toggle({ name }) {
  return (
    <div className="flex justify-between items-center bg-[#12182a] p-4 rounded-lg border border-cyan-500/20">
      <span>{name}</span>
      <button className="px-4 py-1 rounded bg-cyan-500/20 text-cyan-400 hover:bg-cyan-500/40">
        Toggle
      </button>
    </div>
  );
}
