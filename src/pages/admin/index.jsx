import AdminLayout from "@/components/admin/AdminLayout";

export default function AdminDashboard() {
  return (
    <AdminLayout title="Dashboard">
      <div className="grid grid-cols-2 gap-6">
        <Stat title="Users" value="10,234" />
        <Stat title="Credits" value="1,245,000" />
        <Stat title="RFQs" value="312" />
        <Stat title="Errors" value="0" />
      </div>
    </AdminLayout>
  );
}

function Stat({ title, value }) {
  return (
    <div className="rounded-xl bg-[#12182a] border border-cyan-500/20 p-5">
      <p className="text-sm text-gray-400">{title}</p>
      <p className="text-2xl font-bold text-cyan-400">{value}</p>
    </div>
  );
}
