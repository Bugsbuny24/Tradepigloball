import AdminLayout from "../AdminLayout";
export default function System() {
  return (
    <AdminLayout title="System Control">
      <div className="bg-red-500/10 border border-red-500/30 p-6 rounded-xl">
        <h2 className="text-red-400 font-bold mb-2">🚨 Maintenance Mode</h2>
        <button className="bg-red-500/30 px-4 py-2 rounded hover:bg-red-500/50">
          Toggle Maintenance
        </button>
      </div>
    </AdminLayout>
  );
}
