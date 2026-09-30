/** Sample orders exported by the CSV and Excel button demos. */
export const DEMO_EXPORT_ROWS = [
  {
    order: "1042",
    customer: "Ada Lovelace",
    items: 3,
    total: 128.5,
    paid: true,
  },
  { order: "1043", customer: "Grace Hopper", items: 1, total: 42, paid: false },
  {
    order: "1044",
    customer: "Alan Turing",
    items: 5,
    total: 310.25,
    paid: true,
  },
  {
    order: "1045",
    customer: "Hedy Lamarr, Inc.",
    items: 2,
    total: 76.4,
    paid: true,
  },
]

export const DEMO_EXPORT_COLUMNS = [
  { key: "order", label: "Order" },
  { key: "customer", label: "Customer" },
  { key: "items", label: "Items" },
  { key: "total", label: "Total" },
  { key: "paid", label: "Paid" },
]
