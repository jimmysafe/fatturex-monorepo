import { db } from "@repo/database/client";
import { eq } from "@repo/database/lib/utils";
import { user as userSchema } from "@repo/database/schema";

export async function getUserPublicDetails({ id }: { id: string }) {
  const usr = await db.query.user.findFirst({ where: eq(userSchema.id, id) });
  return {
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
