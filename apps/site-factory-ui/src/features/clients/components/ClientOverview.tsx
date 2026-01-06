"use client";

import * as React from "react";
import Link from "next/link";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";

import { cn } from "@/lib/utils";
import { useClientProjects } from "../hooks/useClientProjects";

type Props = {
  client: string;
};

export function ClientOverview({ client }: Props) {
  const { items, loading, error, refresh } = useClientProjects(client);

  return (
    <Card className="rounded-2xl h-fit max-h-full flex flex-col min-h-0">
      <CardHeader className="space-y-2">
        <CardTitle className="flex items-center justify-between">
          <span className="truncate">{client}</span>
          <Badge variant="secondary">
            {items.length} projet{items.length > 1 ? "s" : ""}
          </Badge>
        </CardTitle>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => void refresh()}
              disabled={loading}>
              Rafraîchir
            </Button>
          </div>

          {/* Bouton qui renvoie vers la création d'un nouveau projet */}
          <div>
            <Button
              asChild
              variant="secondary"
              size="sm">
              <Link href="/projects/new">Nouveau projet</Link>
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex-1 min-h-0 overflow-hidden">
        <ScrollArea className="h-full pr-2">
          <div className="space-y-3">
            {loading ? (
              <div className="text-sm text-muted-foreground">Chargement…</div>
            ) : error ? (
              <div className="text-sm text-red-600">Erreur : {error}</div>
            ) : items.length === 0 ? (
              <div className="text-sm text-muted-foreground">
                Aucun projet pour ce client.
                <Separator className="my-3" />
                <div className="text-xs text-muted-foreground">
                  Vous pouvez créer un nouveau projet pour ce client depuis la page{" "}
                  <Link
                    href="/projects/new"
                    className="underline hover:text-primary">
                    Nouveau projet
                  </Link>
                  .
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                {items.map(p => {
                  const href = `/clients/${encodeURIComponent(p.client)}/${encodeURIComponent(p.site)}`;
                  return (
                    <Link
                      key={p.id}
                      href={href}
                      className={cn(
                        "block rounded-xl border px-3 py-2 transition",
                        "hover:bg-muted",
                        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                      )}>
                      <div className="flex items-center justify-between gap-2">
                        <div className="min-w-0">
                          <div className="font-medium truncate">{p.site}</div>
                          <div className="text-xs text-muted-foreground truncate">{p.slug}</div>
                        </div>
                        <Badge variant="outline">{p.id.slice(0, 8)}</Badge>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
