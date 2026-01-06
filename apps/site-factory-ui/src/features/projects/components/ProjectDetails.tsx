// apps/site-factory-ui/src/features/projects/components/ProjectDetails.tsx
"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ScrollArea } from "@/components/ui/scroll-area";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";

import type { ProjectMeta } from "@sf/shared/projects";
import { apiProjectsShow } from "@/lib/api/projects/projects";
import { ProjectDeleteDialog } from "./ProjectDeleteDialog";
import { useProjectsCtx } from "../ProjectsProvider";

type Props = {
  slug?: string | null;
};

export function ProjectDetails({ slug }: Props) {
  const router = useRouter();
  const { optimisticRemoveProjects } = useProjectsCtx();
  const selectedSlug = slug ? slug : null;

  const [meta, setMeta] = React.useState<ProjectMeta | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [err, setErr] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!selectedSlug) {
      setMeta(null);
      setErr(null);
      setLoading(false);
      return;
    }

    let alive = true;
    setLoading(true);
    setErr(null);
    setMeta(null);

    apiProjectsShow(selectedSlug)
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
  }, [selectedSlug]);

  if (!selectedSlug) {
    return (
      <Card className="rounded-2xl h-fit max-h-full flex flex-col min-h-0">
        <CardHeader>
          <CardTitle>Détails du projet</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          Sélectionnez un projet à gauche.
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="rounded-2xl h-fit max-h-full flex flex-col min-h-0">
      <CardHeader className="space-y-2">
        <CardTitle className="flex items-center justify-between">
          <span>Détails du projet</span>
          <Badge variant="outline">{selectedSlug}</Badge>
        </CardTitle>

        {meta ? (
          <div className="flex flex-wrap gap-2">
            <Button
              asChild
              variant="secondary"
              size="sm">
              <Link href={`/projects/${encodeURIComponent(meta.identity.client)}/${encodeURIComponent(meta.identity.site_name)}/view`}>
                Voir le projet
              </Link>
            </Button>

            <ProjectDeleteDialog
              projectId={meta.meta.id}
              slug={selectedSlug}
              siteName={meta.identity.site_name}
              displayId={meta.meta.id.slice(0, 8)}
              triggerVariant="destructive"
              triggerLabel="Supprimer"
              onDeleted={async () => {
                optimisticRemoveProjects([meta.meta.id]);
                router.push("/projects");
              }}
            />
          </div>
        ) : null}
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
                  <div className="font-medium">Client</div>
                  <div className="text-muted-foreground">{meta.identity.client}</div>
                </div>
                <div>
                  <div className="font-medium">Site</div>
                  <div className="text-muted-foreground">{meta.identity.site_name}</div>
                </div>
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
