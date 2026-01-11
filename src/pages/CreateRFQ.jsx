// src/pages/CreateRFQ.jsx
import { supabase } from "@/api/supabase";
export default function CreateRFQ() {
  const submit = async (e) => {
    e.preventDefault();
    const title = e.target.title.value;

    await supabase.from('rfqs').insert({
      title,
      min_credit: 20
    });

    alert('RFQ oluşturuldu (5 CREDIT harcandı)');
  };

  return (
    <form onSubmit={submit}>
      <input name="title" placeholder="RFQ title" />
      <button>Create RFQ (5 CREDIT)</button>
    </form>
  );
}
