import type { ReactNode } from "react";

import "@/app/globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { TopBar } from "@/components/layout/TopBar";

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html
      lang="fr"
      suppressHydrationWarning>
      <body>
        <ThemeProvider>
          <TopBar />

          <main className="mx-auto max-w-6xl px-4 py-6">{children}</main>
        </ThemeProvider>
      </body>
    </html>
  );
}
