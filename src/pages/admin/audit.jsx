import AdminLayout from "./AdminLayout";
export default function Audit() {
  return (
    <AdminLayout title="Audit Log">
      <div className="bg-[#12182a] rounded-xl border border-cyan-500/20 p-4">
        <p className="text-sm text-gray-400">
          Admin actions will appear here.
        </p>
      </div>
    </AdminLayout>
  );
}
