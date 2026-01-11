import AdminLayout from "@/components/admin/AdminLayout";

export default function Economy() {
  return (
    <AdminLayout title="💰 Economy Control">
      <Action icon="➕" label="Mint Credits" />
      <Action icon="➖" label="Burn Credits" />
      <Action icon="🎁" label="Give Bonus" />
    </AdminLayout>
  );
}

function Action({ icon, label }) {
  return (
    <button className="w-full mb-3 flex items-center gap-3 bg-[#12182a] p-4 rounded border border-purple-500/30 hover:bg-purple-500/10">
      <span className="text-xl">{icon}</span>
      {label}
    </button>
  );
}
