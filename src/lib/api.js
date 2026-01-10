export function getAuthToken() {
  return localStorage.getItem("tp_token") || "";
}

/**
 * API her zaman JSON dönmeli.
 * Ama yine de “A server error occurred” gibi şey gelirse patlamasın diye
 * text -> json fallback yaptık.
 */
export async function apiFetch(path, { method = "GET", body, token } = {}) {
  const auth = token ?? getAuthToken();

  const res = await fetch(path, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(auth ? { Authorization: `Bearer ${auth}` } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  const text = await res.text();
  let data = {};
  try {
    data = text ? JSON.parse(text) : {};
  } catch {
    data = { ok: false, error: text || "Non-JSON response" };
  }

  if (!res.ok) {
    throw new Error(data?.error || "Request failed");
  }
  return data;
}
