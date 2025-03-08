export function getDataDiNascitaFromCf(codiceFiscale: string) {
  const cf = codiceFiscale.toUpperCase();
  const mesi = {
    A: 1,
    B: 2,
    C: 3,
    D: 4,
    E: 5,
    H: 6,
    L: 7,
    M: 8,
    P: 9,
    R: 10,
    S: 11,
    T: 12,
  };

  const anno = Number.parseInt(cf.substring(6, 8), 10);
  // @ts-expect-error TODO: type this one
  const mese = mesi[cf[8]];
  let giorno = Number.parseInt(cf.substring(9, 11), 10);

  if (giorno > 31) {
    giorno -= 40;
  }

  const annoCompleto = anno >= 0 && anno <= 29 ? 2000 + anno : 1900 + anno;

  return new Date(annoCompleto, mese - 1, giorno + 1);
}
