import type { ReactNode } from "react";

import "@/app/globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { TopBar } from "@/components/layout/TopBar";
import { ClientsProvider } from "@/features/clients/ClientsProvider";
import { ProjectsProvider } from "@/features/projects/ProjectsProvider";

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html
      lang="fr"
      suppressHydrationWarning>
      <body>
        <ThemeProvider>
          <TopBar />
          <ClientsProvider>
          <ProjectsProvider>
          <main className="mx-auto max-w-6xl px-4 py-6">{children}</main>
          </ProjectsProvider>
          </ClientsProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
