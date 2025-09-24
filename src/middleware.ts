import { auth } from "@/lib/auth";

export default auth((req) => {
  const session = req.auth;
  const { pathname } = req.nextUrl;

  // Allow access to signin page without authentication
  if (pathname === "/welcome") {
    // If user is already authenticated and trying to access signin, redirect to dashboard
    if (session) {
      const newUrl = new URL("/onboarding", req.nextUrl.origin);
      return Response.redirect(newUrl);
    }
    // Allow unauthenticated users to access signin page
    return;
  }

  // For all other pages, require authentication
  if (!session) {
    const newUrl = new URL("/welcome", req.nextUrl.origin);
    return Response.redirect(newUrl);
  }
});

export const config = {
  matcher: ["/welcome", "/onboarding"],
};
