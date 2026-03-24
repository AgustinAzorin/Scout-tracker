import "./globals.css";
import type { ReactNode } from "react";
import { TailwindThemeProvider } from "@/components/theme-provider";

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body>
        <TailwindThemeProvider>
          {children}
        </TailwindThemeProvider>
      </body>
    </html>
  );
}