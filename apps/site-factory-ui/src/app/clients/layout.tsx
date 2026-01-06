// src/app/clients/layout.tsx
import * as React from "react";
import { ClientsProvider } from "@/features/clients/ClientsProvider";

export default function ClientsRootLayout({ children }: { children: React.ReactNode }) {
  // return <ClientsProvider>{children}</ClientsProvider>;
  return <>{children}</>;
}
