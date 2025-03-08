import type { auth } from "@repo/auth";
import type { UserCassaType, UserRolesType } from "@repo/database/lib/enums";

export type AuthUser = typeof auth.$Infer.Session.user & {
  cassa?: UserCassaType;
  role?: UserRolesType;
};

export type AuthSession = typeof auth.$Infer.Session.session;

export type ArrayElement<T> = T extends readonly (infer U)[] ? U : never;
