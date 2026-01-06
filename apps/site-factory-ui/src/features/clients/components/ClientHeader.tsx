// ClientHeader.tsx
"use client";

import * as React from "react";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

type Props = { client: string; projectsCount: number };

export function ClientHeader({ client, projectsCount }: Props) {
  return (
    <div className="space-y-1">
      <h1 className="text-2xl font-semibold tracking-tight">{client}</h1>
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <span>Client</span>
        <Separator
          orientation="vertical"
          className="h-4"
        />
        <Badge variant="secondary">
          {projectsCount} projet{projectsCount > 1 ? "s" : ""}
        </Badge>
      </div>
    </div>
  );
}
