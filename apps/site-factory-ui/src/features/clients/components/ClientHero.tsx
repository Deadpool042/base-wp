"use client";

import * as React from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useClientsCtx } from "@/features/clients/ClientsProvider";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export function ClientsHero() {
  const { items, loadingList } = useClientsCtx();
  const totalClients = items.length;

  return (
    <Card className="rounded-2xl p-5 mb-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="text-sm text-muted-foreground">Clients</div>
          <div className="mt-1 flex items-center gap-2">
            <h1 className="text-xl font-semibold">Clients</h1>
            <Badge variant="secondary">{loadingList ? "…" : totalClients}</Badge>
          </div>
          <div className="mt-1 text-sm text-muted-foreground">
            Parcourez les clients et gérez leurs projets.
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            asChild
            variant="secondary"
            size="sm">
            <Link href="/clients/new">Nouveau client</Link>
          </Button>
          {/* <ClientsCreateDialog /> */}
        </div>
      </div>
    </Card>
  );
}
