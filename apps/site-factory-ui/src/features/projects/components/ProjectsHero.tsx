"use client";

import * as React from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useProjectsCtx } from "../ProjectsProvider";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useClientsCtx } from "@/features/clients/ClientsProvider";

export function ProjectsHero() {
  const { items, loadingList } = useProjectsCtx();
  const { items: clients } = useClientsCtx();

  const totalProjects = items.length;
  const totalClients = clients.length;

  return (
    <Card className="rounded-2xl p-5 mb-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="text-sm text-muted-foreground flex flex-col gap-2">Clients {loadingList ? "…" : totalClients}</div>
          {totalClients === 0 && (
            <div className=" bg-muted/50 my-2">
             <p>Aucuns clients dans la liste, veuillez en ajouter pour commencer ici, 
              <Link href="/clients/new" className="underline"> créer un nouveau client</Link>
              .</p>
            </div>
          )}
          <div className="mt-1 flex items-center gap-2">
            <h1 className="text-xl font-semibold">Projets</h1>
            <Badge variant="secondary">{loadingList ? "…" : totalProjects}</Badge>
          </div>
          <div className="mt-1 text-sm text-muted-foreground">
            Parcourez les projets et gérez leurs détails.
          </div>
        </div>
        <div>
          <Button
            asChild
            variant="secondary"
            size="sm">
            <Link href="/projects/new">Nouveau projet</Link>
          </Button>
        </div>
      </div>
    </Card>
  );
}
