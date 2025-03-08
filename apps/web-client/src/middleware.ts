import type { NextRequest } from "next/server";

import { auth } from "@repo/auth";
import { headers } from "next/headers";
import { NextResponse } from "next/server";

const authRoutes = ["/signin", "/verify"];

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;

  // ! Session cookie is always null in prod, issue @ https://github.com/better-auth/better-auth/issues/1487
  // const sessionCookie = getSessionCookie(request); // Optionally pass config as the second argument if cookie name or prefix is customized.
  // if (!sessionCookie && !authRoutes.includes(path)) {
  //   console.warn("No session cookie found, redirecting to signin...");
  //   return NextResponse.redirect(new URL("/signin", request.url));
  // }

  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user && !authRoutes.includes(path)) {
    return NextResponse.redirect(new URL("/signin", request.url));
  }

  if (session?.user) {
    //  If logged in and trying to access index route or auth routes -> redirect to main app page
    if (path === "/" || authRoutes.includes(path))
      return NextResponse.redirect(new URL(`/${new Date().getFullYear()}`, request.url));
    // If logged in and trying to access auth route -> redirect to main app page
    if (!authRoutes.includes(path)) {
      // IF IS ON ALL ROUTES EXCEPT ONBOARDING AND AUTH (SO MAIN APP ROUTES)
      if (path !== "/onboarding") {
        if (!session.user.onboarded) {
          return NextResponse.redirect(new URL("/onboarding", request.url));
        }
        if (!session.user.customerId && path !== "/payment/plans") {
          return NextResponse.redirect(new URL("/payment/plans", request.url));
        }
      }
      else {
        // IF IS ONBOARDING ROUTE
        if (session.user.onboarded) {
          return NextResponse.redirect(new URL(`/${new Date().getFullYear()}`, request.url));
        }
      }
    }
  }
}

export const config = {
  matcher: ["/((?!api|_next|.*\\..*).*)"],
};
