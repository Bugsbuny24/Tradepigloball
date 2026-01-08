// src/lib/orderCreate.js
import { supabase } from "./supabaseClient";

/**
 * Create a direct Product Order (Letgo-style)
 * - Works for BOTH Web + Pi Browser
 * - Payment will be gated in Pi Browser on /pi/payment/:orderId
 */
export async function createOrderFromProduct({ product, quantity = 1 }) {
  if (!product?.id) throw new Error("Product missing");

  const { data: auth } = await supabase.auth.getUser();
  const buyerId = auth?.user?.id;
  if (!buyerId) {
    const err = new Error("NOT_AUTHENTICATED");
    err.code = "NOT_AUTHENTICATED";
    throw err;
  }

  const sellerId = product.owner_id;
  if (!sellerId) throw new Error("Product owner_id missing");

  const qty = Number(quantity) > 0 ? Number(quantity) : 1;

  // We are PI-only mode. If price is empty -> buyer will pay 0 and negotiate later.
  const unitPrice = product.price_amount !== null && product.price_amount !== undefined
    ? Number(product.price_amount)
    : null;

  const lineTotal =
    unitPrice === null || Number.isNaN(unitPrice) ? null : unitPrice * qty;

  // Create order
  const { data: order, error: orderErr } = await supabase
    .from("orders")
    .insert({
      rfq_id: null,
      offer_id: null,
      buyer_id: buyerId,
      seller_id: sellerId,
      // keep both for compatibility with your schema
      amount_pi: lineTotal ?? 0,
      price_pi: unitPrice ?? null,
      status: "pending_payment",
    })
    .select("*")
    .single();

  if (orderErr) throw orderErr;

  // Create order item snapshot
  const { error: itemErr } = await supabase.from("order_items").insert({
    order_id: order.id,
    product_id: product.id,
    title_snapshot: product.title || "Product",
    quantity: qty,
    unit: product.unit || null,
    unit_price: unitPrice,
    line_total: lineTotal,
  });

  if (itemErr) {
    // rollback order if item fails (best-effort)
    await supabase.from("orders").delete().eq("id", order.id);
    throw itemErr;
  }

  return order;
}
