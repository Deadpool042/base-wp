"use client";

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";

import type { ProjectMeta } from "@sf/shared/projects";
import { apiProjectsShow } from "@/lib/api/projects/projects";
import { useProjectsSelection } from "../ProjectsSelectionProvider";

export function ProjectDetails() {
  const { selectedSlug } = useProjectsSelection();
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
        setErr(e instanceof Error ? e.message : "Unknown error");
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
      <Card className="rounded-2xl">
        <CardHeader>
          <CardTitle>Project details</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          Select a project on the left.
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="rounded-2xl">
      <CardHeader className="space-y-2">
        <CardTitle className="flex items-center justify-between">
          <span>Project details</span>
          <Badge variant="outline">{selectedSlug}</Badge>
        </CardTitle>
      </CardHeader>

      <CardContent>
        {loading ? (
          <div className="space-y-3">
            <Skeleton className="h-5 w-1/2" />
            <Skeleton className="h-5 w-2/3" />
            <Skeleton className="h-24 w-full" />
          </div>
        ) : err ? (
          <div className="text-sm text-red-600">Error: {err}</div>
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
                <div className="font-medium">Created</div>
                <div className="text-muted-foreground">{meta.meta.created_at}</div>
              </div>
              <div>
                <div className="font-medium">Updated</div>
                <div className="text-muted-foreground">{meta.meta.updated_at}</div>
              </div>
            </div>

            <Separator />

            <div className="text-sm">
              <div className="font-medium mb-2">Raw meta</div>
              <pre className="text-xs rounded-xl bg-muted p-3 overflow-auto">
                {JSON.stringify(meta, null, 2)}
              </pre>
            </div>
          </div>
        ) : (
          <div className="text-sm text-muted-foreground">No meta.</div>
        )}
      </CardContent>
    </Card>
  );
}
