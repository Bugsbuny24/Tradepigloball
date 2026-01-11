async function maintenance(enabled) {
  await fetch("/api/admin/execute", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      action: "maintenance",
      payload: { enabled },
    }),
  });
}

export default function System() {
  return (
    <div>
      <h2>System Control</h2>
      <button onClick={() => maintenance(true)}>Maintenance ON</button>
      <button onClick={() => maintenance(false)}>Maintenance OFF</button>
    </div>
  );
}
