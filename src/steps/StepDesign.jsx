export default function StepDesign({ setData, onNext, onBack }) {
  return (
    <div>
      <h2>Tasarımını ekle</h2>
      <input type="file" accept="image/*" onChange={e=>{
        setData(d=>({...d, design:e.target.files[0]}));
      }}/>
      <div>
        <button onClick={onBack}>Geri</button>
        <button onClick={onNext}>Devam</button>
      </div>
    </div>
  );
}
