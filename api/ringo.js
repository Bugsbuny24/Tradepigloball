export default async function handler(req, res) {
  try {
    if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

    const { messages, context } = req.body || {};
    const role = context?.role || "anon";
    const path = context?.path || "/";

    // Burada LLM sağlayıcına istek atarsın (OpenAI/başka).
    // Şimdilik güvenli “rule-based brain” veriyorum ki bugün kilit gibi çalışsın.
    const last = (messages || []).slice(-1)[0]?.content?.toLowerCase?.() || "";

    // ====== ACTION PARSER (basit ama etkili) ======
    const actions = [];
    const say = (t) => res.status(200).json({ assistant: t, actions });

    // NAV commands
    if (last.includes("rfq")) actions.push({ type: "navigate", to: "/pi/rfq/create" });
    if (last.includes("companies") || last.includes("şirket")) actions.push({ type: "navigate", to: "/pi/products" });
    if (last.includes("admin") || last.includes("panel")) actions.push({ type: "navigate", to: "/admin" });

    // Role based
    if (role === "anon") {
      return say(
        `Kanka şu an anon’sun. Şunları yapabilirsin:\n` +
        `• Companies (Verified Stands)\n• Stand gez\n• RFQ akışını öğren\n\n` +
        `İstersen “Companies’e götür” veya “RFQ aç” yaz.`
      );
    }

    if (role === "owner") {
      return say(
        `Owner moddayım 😄\n` +
        `• Admin panel: /admin\n• Companies: /pi/products\n• RFQ create: /pi/rfq/create\n\n` +
        `Ne yapalım? “Başvuru onayla”, “RLS kontrol”, “Beyaz ekran teşhis” yaz.`
      );
    }

    // buyer/company default
    return say(
      `Tamam kanka. Şu an: ${role} modundayım.\n` +
      `İstersen:\n• “RFQ oluştur” (wizard)\n• “Companies” (verified stands)\n• “Stand aç”\n\n` +
      `Ne hedefliyoruz? (ürün bulmak mı, teklif almak mı?)`
    );
  } catch (e) {
    return res.status(500).json({ error: e?.message || "Server error" });
  }
}
