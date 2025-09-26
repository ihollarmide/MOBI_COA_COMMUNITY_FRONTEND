import "@/app/globals.css";

import type { Metadata } from "next";
import { Figtree, Inter, Montserrat } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import { GlobalProvider } from "@/providers/global-provider";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import Script from "next/script";
import { headers } from "next/headers";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-sans",
  weight: ["400", "500", "600", "700"],
});

const figtree = Figtree({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-figtree",
  weight: ["400", "500", "600", "700"],
});

const montserrat = Montserrat({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-montserrat",
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "VMCC DAO | Community Airdrop",
  description: "VMCC DAO | Community Airdrop",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const headersList = await headers();
  const nonce = headersList.get("x-nonce") || "";
  return (
    <html lang="en" className="h-full" suppressHydrationWarning>
      <head>
        <meta name="nonce" content={nonce} />
      </head>
      <body
        className={`${inter.variable} ${figtree.variable} ${montserrat.variable} overscroll-none font-sans antialiased noligatures h-full`}
      >
        <Script
          strategy="afterInteractive"
          src={`https://www.google.com/recaptcha/api.js?render=${process.env.NEXT_PUBLIC_GOOGLE_RECAPTCHA_V3_SITE_KEY}`}
          nonce={nonce}
        />

        <NuqsAdapter>
          <GlobalProvider>
            {children}
            <Toaster
              position="top-center"
              richColors
              toastOptions={{
                style: {
                  justifyContent: "center",
                },
              }}
            />
          </GlobalProvider>
        </NuqsAdapter>
      </body>
    </html>
  );
}
