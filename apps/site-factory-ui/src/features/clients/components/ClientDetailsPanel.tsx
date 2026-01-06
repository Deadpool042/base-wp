"use client";

import * as React from "react";
import { usePathname } from "next/navigation";

import { ClientDetailsEmpty } from "./ClientDetailsEmpty";
import { ClientOverview } from "./ClientOverview";
import { ClientSiteOverview } from "./ClientSiteOverview";

function decodeSafe(s: string) {
  try {
    return decodeURIComponent(s);
  } catch {
    return s;
  }
}

export function ClientDetailsPanel() {
  const pathname = usePathname();

  const matchSite = pathname.match(/^\/clients\/([^/]+)\/([^/]+)\/?$/);
  if (matchSite) {
    const client = decodeSafe(matchSite[1] ?? "");
    const site = decodeSafe(matchSite[2] ?? "");
    return (
      <ClientSiteOverview
        client={client}
        site={site}
      />
    );
  }

  const matchClient = pathname.match(/^\/clients\/([^/]+)\/?$/);
  if (matchClient) {
    const client = decodeSafe(matchClient[1] ?? "");
    return <ClientOverview client={client} />;
  }

  return <ClientDetailsEmpty />;
}
