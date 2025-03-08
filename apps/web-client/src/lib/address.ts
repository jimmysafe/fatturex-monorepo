export function formatAddress(x: { indirizzo?: string | null; cap?: string | null; comune?: string | null; provincia?: string | null }) {
  const values = [x.indirizzo, x.cap, x.comune, x.provincia].filter(Boolean);
  return values.join(", ");
}
