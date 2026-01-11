async function toggle(feature, enabled) {
  await fetch("/api/admin/execute", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      action: "toggle_feature",
      payload: { feature, enabled },
    }),
  });
}

export default function Features() {
  return (
    <div>
      <h2>Feature Flags</h2>
      <button onClick={() => toggle("rfq", true)}>RFQ ON</button>
      <button onClick={() => toggle("rfq", false)}>RFQ OFF</button>
    </div>
  );
}
