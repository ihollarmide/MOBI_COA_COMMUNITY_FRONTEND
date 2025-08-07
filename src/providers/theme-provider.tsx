"use client";
import { ThemeProvider } from "next-themes";

export function NextThemeProvider({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="dark"
      enableSystem={false}
      disableTransitionOnChange={true}
    >
      {children}
    </ThemeProvider>
  );
}
