export default function StepMode({ data, setData, onNext, onBack }) {
  return (
    <div>
      <h2>Hangi mod?</h2>
      {["rfq","showcase","idea"].map(m=>(
        <button key={m} onClick={()=>{
          setData(d=>({...d, mode:m}));
          onNext();
        }}>{m.toUpperCase()}</button>
      ))}
      <button onClick={onBack}>Geri</button>
    </div>
  );
}
