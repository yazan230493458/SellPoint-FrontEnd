const grouped = (whole: string) => whole.replace(/\B(?=(\d{3})+(?!\d))/g, ",");

export const parsePriceInput = (value: string) => {
  const cleaned = value.replace(/[^\d.]/g, "");
  const dot = cleaned.indexOf(".");
  const whole = (dot === -1 ? cleaned : cleaned.slice(0, dot)).replace(/^0+(?=\d)/, "");
  const fraction = dot === -1 ? "" : cleaned.slice(dot + 1).replace(/\./g, "").slice(0, 2);
  if (!whole && !fraction && dot === -1) return "";
  if (dot !== -1) return `${whole || "0"}.${fraction}`;
  return whole;
};

export const formatPriceInput = (value: string) => {
  const parsed = parsePriceInput(value);
  if (!parsed) return "";
  const [whole = "0", fraction] = parsed.split(".");
  const display = grouped(whole);
  return fraction === undefined ? display : `${display}.${fraction}`;
};

export const formatPrice = (value: string | number | null | undefined) => {
  if (value === null || value === undefined || value === "") return "";
  const amount = typeof value === "number" ? value : Number(String(value).replace(/,/g, ""));
  if (!Number.isFinite(amount)) return "";
  const negative = amount < 0;
  const rounded = Math.round(Math.abs(amount) * 100) / 100;
  const [whole = "0", fraction = "00"] = rounded.toFixed(2).split(".");
  const trimmed = fraction === "00" ? "" : fraction.endsWith("0") ? fraction.slice(0, 1) : fraction;
  const display = trimmed ? `${grouped(whole)}.${trimmed}` : grouped(whole);
  return negative ? `-${display}` : display;
};
