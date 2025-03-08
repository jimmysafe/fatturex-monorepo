export function nominativoCliente(cliente: { ragioneSociale?: string | null; nome?: string | null; cognome?: string | null }) {
  if (cliente.ragioneSociale)
    return cliente.ragioneSociale;
  return `${cliente.nome} ${cliente.cognome}`;
}
