export default function StepRFQ({ data, setData, onNext, onBack }) {
  return (
    <div>
      <h2>RFQ Detayı</h2>
      <input placeholder="Başlık" onChange={e=>{
        setData(d=>({...d, rfq:{...d.rfq, title:e.target.value}}));
      }}/>
      <textarea placeholder="Açıklama" onChange={e=>{
        setData(d=>({...d, rfq:{...d.rfq, description:e.target.value}}));
      }}/>
      <button onClick={onBack}>Geri</button>
      <button onClick={onNext}>Devam</button>
    </div>
  );
}
