import { NextRequest, NextResponse } from "next/server";
import { getSession } from "./modules/auth/lib/session";

export async function middleware(req: NextRequest) {
  const session = await getSession();

  const url = new URL(req.url);
  const pathname = url.pathname;

  const isAuthenticated = !!session;

  const unauthOnlyRoutes = ["/welcome"];

  if (unauthOnlyRoutes.some((r) => pathname.startsWith(r))) {
    if (isAuthenticated) {
      return NextResponse.redirect(new URL("/onboarding", req.nextUrl));
    }
    return NextResponse.next();
  }

  if (pathname.startsWith("/onboarding")) {
    if (!isAuthenticated) {
      return NextResponse.redirect(new URL("/welcome", req.nextUrl));
    }

    return NextResponse.next();
  }

  // Default allow
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
