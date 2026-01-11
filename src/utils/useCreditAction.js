export async function creditAction({
  endpoint,
  payload,
  success,
  fallback
}) {
  try {
    const r = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    if (!r.ok) throw new Error("fail");
    success?.();
  } catch {
    fallback?.();
  }
}
