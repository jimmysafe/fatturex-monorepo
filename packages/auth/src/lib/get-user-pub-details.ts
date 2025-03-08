import { db } from "@repo/database/client";
import { user as userSchema } from "@repo/database/schema";
import { eq } from "@repo/database/utils";

export async function getUserPublicDetails({ id }: { id: string }) {
  const usr = await db.query.user.findFirst({ where: eq(userSchema.id, id) });
  return {
    id: usr?.id,
    nome: usr?.nome,
    cognome: usr?.cognome,
    cassa: usr?.cassa,
    onboarded: usr?.onboarded,
    dataDiNascita: usr?.dataDiNascita,
    role: usr?.role,
    customerId: usr?.customerId,
    logoPath: usr?.logoPath,
    themeColor: usr?.themeColor,
  };
}
