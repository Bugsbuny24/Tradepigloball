import AdminLayout from "@/components/admin/AdminLayout";

export default function GodMode() {
  return (
    <AdminLayout title="God Mode">
      <div className="grid grid-cols-2 gap-6">

        <GodCard
          icon="⚙️"
          title="Feature Control"
          color="cyan"
          desc="Enable / Disable platform features"
        />

        <GodCard
          icon="💰"
          title="Economy Control"
          color="purple"
          desc="Credits, balances, boosts"
        />

        <GodCard
          icon="🛠️"
          title="System Control"
          color="orange"
          desc="Maintenance, rules, limits"
        />

        <GodCard
          icon="🚨"
          title="Emergency"
          color="red"
          desc="Kill switch / lockdown"
          danger
        />

      </div>
    </AdminLayout>
  );
}
