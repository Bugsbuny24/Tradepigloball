import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { order_id, txid, amount_pi } = req.body;

    if (!order_id || !txid || !amount_pi) {
      return res.status(400).json({ error: "Missing fields" });
    }

    /* 1️⃣ ORDER VAR MI */
    const { data: order, error: orderErr } = await supabase
      .from("orders")
      .select("*")
      .eq("id", order_id)
      .single();

    if (orderErr || !order) {
      return res.status(404).json({ error: "Order not found" });
    }

    /* 2️⃣ DAHA ÖNCE ÖDENMİŞ Mİ */
    if (order.status === "paid") {
      return res.status(200).json({ ok: true, already_paid: true });
    }

    /* 3️⃣ PI PAYMENT KAYDI */
    const { error: payErr } = await supabase.from("pi_payments").insert({
      user_id: order.buyer_id,
      order_id: order.id,
      amount_pi,
      txid,
      status: "completed",
      memo: `Order ${order.id}`,
    });

    if (payErr) throw payErr;

    /* 4️⃣ ORDER STATUS → PAID */
    const { error: updErr } = await supabase
      .from("orders")
      .update({
        status: "paid",
        updated_at: new Date().toISOString(),
      })
      .eq("id", order.id);

    if (updErr) throw updErr;

    /* 5️⃣ AUDIT LOG (opsiyonel ama premium) */
    await supabase.from("audit_log").insert({
      actor_id: order.buyer_id,
      action: "PI_PAYMENT_COMPLETED",
      table_name: "orders",
      row_id: order.id,
      payload: { txid, amount_pi },
    });

    return res.status(200).json({
      ok: true,
      order_id: order.id,
      txid,
      amount_pi,
    });
  } catch (err) {
    console.error("PI COMPLETE ERROR:", err);
    return res.status(500).json({
      error: err.message || "Payment completion failed",
    });
  }
}
