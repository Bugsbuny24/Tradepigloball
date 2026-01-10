export default function StepProduct({ data, setData, onNext }) {
  const types = ["tshirt","hoodie","poster","mug","tote"];
  return (
    <div>
      <h2>Ne tasarlıyorsun?</h2>
      {types.map(t => (
        <button key={t} onClick={()=>{
          setData(d=>({...d, productType:t}));
          onNext();
        }}>{t}</button>
      ))}
    </div>
  );
}
