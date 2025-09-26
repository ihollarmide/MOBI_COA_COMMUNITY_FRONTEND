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

// import { NextResponse } from "next/server";
// import { auth } from "@/lib/auth";

// const isDev = process.env.NODE_ENV !== "production";

// export default auth((req) => {
//   const session = req.auth;
//   const { pathname } = req.nextUrl;

//   // --- Authentication logic ---
//   if (pathname === "/welcome") {
//     if (session) {
//       const newUrl = new URL("/onboarding", req.nextUrl.origin);
//       return Response.redirect(newUrl);
//     }
//     return; // unauthenticated users can access /welcome
//   }

//   if (!session) {
//     const newUrl = new URL("/welcome", req.nextUrl.origin);
//     return Response.redirect(newUrl);
//   }

//   // --- CSP logic (applies globally) ---
//   const nonce = crypto.randomUUID();

//   const cspHeader = `
//     default-src 'self';
//     script-src 'self' https://fpjscdn.net https://www.google.com https://www.gstatic.com https://coa.build 'nonce-${nonce}'${isDev ? " 'unsafe-eval' 'unsafe-inline'" : ""};
//     style-src 'self' 'unsafe-inline';
//     img-src 'self' blob: data: https:;
//     media-src 'self' https://res.cloudinary.com;
//     font-src 'self' data:;
//     frame-src 'self' https://www.google.com https://www.gstatic.com;
//     connect-src 'self' https://*.coa.build https://coa.build https://metrics.coa.build https://www.google.com https://www.gstatic.com https://base-sepolia.g.alchemy.com https://bnb-mainnet.g.alchemy.com https://*.g.alchemy.com https://sepolia.base.org https://bsc-rpc.publicnode.com https://oauth.telegram.org https://*.telegram.org wss: ws:;
//     object-src 'none';
//     base-uri 'self';
//     form-action 'self';
//     frame-ancestors 'none';
//     block-all-mixed-content;
//     upgrade-insecure-requests;
//   `
//     .replace(/\s{2,}/g, " ")
//     .trim();

//   const requestHeaders = new Headers(req.headers);
//   requestHeaders.set("x-nonce", nonce);

//   const res = NextResponse.next({
//     request: { headers: requestHeaders },
//   });

//   res.headers.set("Content-Security-Policy", cspHeader);
//   res.headers.set("x-nonce", nonce);

//   return res;
// });

// // ✅ Apply to all routes
// export const config = {
//   matcher: ["/welcome", "/onboarding"],
// };
