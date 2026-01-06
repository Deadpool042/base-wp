"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";

import type { ProjectMeta } from "@sf/shared/projects";
import { apiProjectsShow } from "@/lib/api/projects/projects";
import { ProjectDeleteDialog } from "@/features/projects/components/ProjectDeleteDialog";
import { useClientsCtx } from "../ClientsProvider";

type Props = {
  client: string;
  site: string;
};

export function ClientSiteOverview({ client, site }: Props) {
  const router = useRouter();
  const { optimisticBumpProjectsCount } = useClientsCtx();
  const slug = `${client}/${site}`;

  const [meta, setMeta] = React.useState<ProjectMeta | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [err, setErr] = React.useState<string | null>(null);

  React.useEffect(() => {
    let alive = true;
    setLoading(true);
    setErr(null);
    setMeta(null);

    apiProjectsShow(slug)
      .then(m => {
        if (!alive) return;
        setMeta(m);
      })
      .catch(e => {
        if (!alive) return;
        setErr(e instanceof Error ? e.message : "Erreur inconnue");
      })
      .finally(() => {
        if (!alive) return;
        setLoading(false);
      });

    return () => {
      alive = false;
    };
  }, [slug]);
  return (
    <Card className="rounded-2xl h-fit max-h-full flex flex-col min-h-0">
      <CardHeader className="space-y-2">
        <CardTitle className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <div className="text-sm text-muted-foreground truncate">{client}</div>
            <div className="text-xl font-semibold truncate">{site}</div>
          </div>

          <Badge
            variant="outline"
            className="shrink-0">
            {slug}
          </Badge>
        </CardTitle>

        <div className="flex flex-wrap gap-2">
          <Button
            asChild
            variant="outline"
            size="sm">
            <Link href={`/clients/${encodeURIComponent(client)}`}>Retour au client</Link>
          </Button>

          <Button
            asChild
            variant="ghost"
            size="sm">
            <Link href={`/projects/${encodeURIComponent(client)}/${encodeURIComponent(site)}`}>
              Ouvrir dans Projets
            </Link>
          </Button>

          {meta ? (
            <ProjectDeleteDialog
              projectId={meta.meta.id}
              slug={slug}
              siteName={site}
              displayId={meta.meta.id.slice(0, 8)}
              triggerVariant="destructive"
              triggerLabel="Supprimer"
              onDeleted={() => {
                optimisticBumpProjectsCount(client, -1);
                router.push(`/clients/${encodeURIComponent(client)}`);
              }}
            />
          ) : null}
        </div>
      </CardHeader>

      <CardContent className="flex-1 min-h-0 overflow-hidden">
        <ScrollArea className="h-full pr-2">
          {loading ? (
            <div className="space-y-3">
              <Skeleton className="h-5 w-1/2" />
              <Skeleton className="h-5 w-2/3" />
              <Skeleton className="h-24 w-full" />
            </div>
          ) : err ? (
            <div className="text-sm text-red-600">Erreur : {err}</div>
          ) : meta ? (
            <div className="space-y-4">
              <div className="text-sm">
                <div className="font-medium">ID</div>
                <div className="text-muted-foreground break-all">{meta.meta.id}</div>
              </div>

              <Separator />

              <div className="grid gap-3 sm:grid-cols-2 text-sm">
                <div>
                  <div className="font-medium">Créé</div>
                  <div className="text-muted-foreground">{meta.meta.created_at}</div>
                </div>
                <div>
                  <div className="font-medium">Modifié</div>
                  <div className="text-muted-foreground">{meta.meta.updated_at}</div>
                </div>
              </div>

              <Separator />

              <div className="text-sm">
                <div className="font-medium mb-2">Meta brute</div>
                <pre className="text-xs rounded-xl bg-muted p-3 overflow-auto">
                  {JSON.stringify(meta, null, 2)}
                </pre>
              </div>
            </div>
          ) : (
            <div className="text-sm text-muted-foreground">Aucune meta.</div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
