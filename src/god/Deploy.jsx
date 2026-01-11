import DangerButton from "../components/DangerButton";

export default function Deploy() {
  return (
    <div>
      <h3>🚀 Deploy Control</h3>

      <button>Preview Deploy</button>
      <button>Prod Deploy</button>

      <DangerButton
        label="FREEZE SYSTEM"
        onConfirm={() => alert("System frozen")}
      />
    </div>
  );
}
