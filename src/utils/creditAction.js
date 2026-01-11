export async function creditAction({
  endpoint,
  cost,
  payload,
  success = "İşlem tamamlandı"
}) {
  const ok = confirm(`${cost} Credit harcanacak. Emin misin?`);
  if (!ok) return;

  const r = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });

  if (!r.ok) {
    alert("Yetersiz credit veya hata");
    return;
  }

  alert(success);
  window.location.reload();
}
