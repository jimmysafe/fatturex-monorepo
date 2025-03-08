import type { UserCassaType } from "@repo/database/lib/enums";

import { UserCassa } from "@repo/database/lib/enums";

interface Cassa {
  label: string;
  value: UserCassaType;
}

export const casse: Cassa[] = [
  {
    label: "INPS - Gestione Separata",
    value: UserCassa.GESTIONE_SEPARATA,
  },
  {
    label: "ENPAP - Ente Nazionale di Previdenza ed Assistenza per gli Psicologi",
    value: UserCassa.ENPAP,
  },
  {
    label: "ENPAPI - Ente Nazionale di Previdenza ed Assistenza della professione infermieristica.",
    value: UserCassa.ENPAPI,
  },
  {
    label: "CASSA FORENSE - Cassa Nazionale di Previdenza e Assistenza Forense",
    value: UserCassa.CASSA_FORENSE,
  },
];
