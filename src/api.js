// Live data from DummyJSON, a free public test API (https://dummyjson.com).
// Carts are treated as orders; products carry category, price and stock.

const BASE = "https://dummyjson.com";

async function getJson(path) {
  const res = await fetch(BASE + path);
  if (!res.ok) throw new Error(`Request failed (${res.status})`);
  return res.json();
}

export async function loadStoreData() {
  const [p, c, u] = await Promise.all([
    getJson("/products?limit=0&select=title,category,price,stock,rating"),
    getJson("/carts?limit=0"),
    getJson("/users?limit=0&select=firstName,lastName"),
  ]);

  const products = p.products;
  const byId = new Map(products.map((x) => [x.id, x]));
  const users = new Map(u.users.map((x) => [x.id, `${x.firstName} ${x.lastName}`]));

  // One row per product line in an order, with its category attached.
  const orders = c.carts.map((cart) => ({
    id: cart.id,
    customer: users.get(cart.userId) || `Customer ${cart.userId}`,
    items: cart.totalQuantity,
    total: cart.discountedTotal,
    lines: cart.products.map((line) => ({
      productId: line.id,
      title: line.title,
      category: byId.get(line.id)?.category || "other",
      revenue: line.discountedTotal,
      quantity: line.quantity,
    })),
  }));

  return { products, orders };
}

export function stockStatus(stock) {
  if (stock === 0) return "out";
  if (stock < 10) return "low";
  return "in";
}

export const money = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

export function prettyCategory(slug) {
  return slug.replace(/-/g, " ").replace(/\b\w/g, (m) => m.toUpperCase());
}
