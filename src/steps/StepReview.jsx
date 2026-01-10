export default function StepReview({ data, onBack }) {
  const publish = async () => {
    const r = await fetch("/api/rfqs-create",{
      method:"POST",
      headers:{ "Content-Type":"application/json" },
      body: JSON.stringify({
        title: data.rfq.title,
        description: data.rfq.description,
        product_type: data.productType,
        min_credit: data.rfq.minCredit
      })
    });
    alert("Yayınlandı");
  };

  return (
    <div>
      <h2>Önizleme</h2>
      <pre>{JSON.stringify(data,null,2)}</pre>
      <button onClick={onBack}>Geri</button>
      <button onClick={publish}>Yayınla</button>
    </div>
  );
}
