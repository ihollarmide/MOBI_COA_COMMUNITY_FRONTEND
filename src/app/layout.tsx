import "@/app/globals.css";

import type { Metadata } from "next";
import { Figtree, Inter, Montserrat } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import { GlobalProvider } from "@/providers/global-provider";
import { NuqsAdapter } from "nuqs/adapters/next/app";

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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full" suppressHydrationWarning>
      <body
        className={`${inter.variable} ${figtree.variable} ${montserrat.variable} overscroll-none font-sans antialiased noligatures h-full`}
      >
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
