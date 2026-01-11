export default function DangerButton({ label, onConfirm }) {
  return (
    <button
      className="danger"
      onClick={() => {
        if (confirm("EMERGENCY ACTION. Emin misin?")) {
          onConfirm();
        }
      }}
    >
      🚨 {label}
    </button>
  );
}
