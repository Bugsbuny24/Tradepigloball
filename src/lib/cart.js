const KEY = "tp_cart_v1";

export function getCart() {
  try { return JSON.parse(localStorage.getItem(KEY) || "[]"); } catch { return []; }
}

export function setCart(items) {
  localStorage.setItem(KEY, JSON.stringify(items));
}

export function addToCart(item) {
  const cart = getCart();
  const i = cart.findIndex(x => x.id === item.id);
  if (i >= 0) cart[i].qty += 1;
  else cart.push({ ...item, qty: 1 });
  setCart(cart);
  return cart;
}

export function removeFromCart(id) {
  const cart = getCart().filter(x => x.id !== id);
  setCart(cart);
  return cart;
}

export function clearCart() {
  setCart([]);
}
