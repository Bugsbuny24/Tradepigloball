import { supabase } from "../../lib/supabaseClient";
import useMe from "../../lib/useMe";

export default function SellerRequests({ requests }) {
  const { isOwner } = useMe();

  if (!isOwner) return null;

  async function approve(requestId) {
    const { error } = await supabase.rpc(
      "approve_seller_request",
      { p_request_id: requestId }
    );

    if (error) {
      alert(error.message);
    } else {
      alert("Company approved 🚀");
      // ister reload, ister state update
    }
  }

  return (
    <div>
      <h2>Pending Seller Requests</h2>

      {requests.map((r) => (
        <div key={r.id}>
          <b>{r.company_name}</b>
          <button onClick={() => approve(r.id)}>
            Approve
          </button>
        </div>
      ))}
    </div>
  );
}
