import AdminLayout from "@/components/admin/AdminLayout";

export default function Emergency() {
  return (
    <AdminLayout title="🚨 EMERGENCY MODE">
      <div className="bg-red-500/10 border border-red-500/40 p-6 rounded-xl">
        <p className="text-red-400 mb-4">
          ⚠️ This action affects ALL USERS
        </p>

        <button className="w-full py-3 rounded bg-red-600 text-white font-bold hover:bg-red-700">
          🔥 FULL PLATFORM LOCKDOWN
        </button>
      </div>
    </AdminLayout>
  );
}
