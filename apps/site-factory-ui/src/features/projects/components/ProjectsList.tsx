// apps/site-factory-ui/src/features/projects/components/ProjectsList.tsx
"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ProjectsBulkDeleteDialog } from "./ProjectsBulkDeleteDialog";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

import type { ProjectItem } from "@sf/shared/projects";
import { useProjectsCtx } from "../ProjectsProvider";

type Group = { client: string; projects: ProjectItem[] };

function groupByClient(items: ProjectItem[]): Group[] {
  const map = new Map<string, ProjectItem[]>();
  for (const p of items) {
    const arr = map.get(p.client) ?? [];
    arr.push(p);
    map.set(p.client, arr);
  }

  return Array.from(map.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([client, projects]) => ({
      client,
      projects: [...projects].sort((a, b) => a.site.localeCompare(b.site)),
    }));
}

function getActiveFromPathname(pathname: string): { slug: string | null; client: string | null } {
  // /projects/<client>/<site>
  const m = pathname.match(/^\/projects\/([^/]+)\/([^/]+)\/?$/);
  if (m) {
    const client = decodeURIComponent(m[1]);
    const site = decodeURIComponent(m[2]);
    return { slug: `${client}/${site}`, client };
  }

  // /projects/<client>
  const m2 = pathname.match(/^\/projects\/([^/]+)\/?$/);
  if (m2) {
    const client = decodeURIComponent(m2[1]);
    return { slug: null, client };
  }

  return { slug: null, client: null };
}

function matchQuery(p: ProjectItem, q: string): boolean {
  const hay = `${p.client} ${p.site} ${p.slug}`.toLowerCase();
  return hay.includes(q);
}

function arraysEqual(a: string[], b: string[]) {
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) if (a[i] !== b[i]) return false;
  return true;
}

export function ProjectsList() {
  const { items, loadingList, listError, q, setQ, optimisticRemoveProjects } = useProjectsCtx();
  const pathname = usePathname();
  const router = useRouter();

  const [selected, setSelected] = React.useState<Set<string>>(new Set());

  const { slug: activeSlug, client: activeClient } = React.useMemo(
    () => getActiveFromPathname(pathname),
    [pathname]
  );

  const filtered = React.useMemo(() => {
    const query = q.trim().toLowerCase();
    if (!query) return items;
    return items.filter(p => matchQuery(p, query));
  }, [items, q]);

  React.useEffect(() => {
    setSelected(prev => {
      if (prev.size === 0) return prev;
      const allowed = new Set(items.map(i => i.id));
      const next = new Set<string>();
      for (const v of prev) if (allowed.has(v)) next.add(v);
      return next;
    });
  }, [items]);

  const selectedProjects = React.useMemo(() => {
    if (selected.size === 0) return [];
    const byId = new Map(items.map(p => [p.id, p] as const));
    return Array.from(selected)
      .map(id => byId.get(id))
      .filter((p): p is NonNullable<typeof p> => Boolean(p));
  }, [items, selected]);

  const groups = React.useMemo(() => groupByClient(filtered), [filtered]);

  // open state: focus client actif / ou open-all en recherche
  const [open, setOpen] = React.useState<string[]>([]);
  React.useEffect(() => {
    const query = q.trim();
    const desired = query
      ? groups.map(g => `client:${g.client}`)
      : activeClient
      ? [`client:${activeClient}`]
      : [];
    setOpen(prev => (arraysEqual(prev, desired) ? prev : desired));
  }, [activeClient, q, groups]);

  // scroll to active project
  const activeRef = React.useRef<HTMLAnchorElement | null>(null);
  React.useLayoutEffect(() => {
    if (!activeRef.current) return;
    activeRef.current.scrollIntoView({ block: "nearest" });
  }, [activeSlug]);

  return (
    <Card className="rounded-2xl flex flex-col h-fit max-h-full min-h-0">
      <CardHeader className="space-y-2">
        <CardTitle className="flex items-center justify-between">
          <span>Projets</span>
          <div className="flex items-center gap-2">
            {selectedProjects.length > 0 ? (
              <ProjectsBulkDeleteDialog
                projects={selectedProjects}
                onDeleted={async () => {
                  const deletedIds = selectedProjects.map(p => p.id);
                  const deletedSlugs = new Set(selectedProjects.map(p => p.slug));

                  setSelected(new Set());

                  optimisticRemoveProjects(deletedIds);

                  if (activeSlug && deletedSlugs.has(activeSlug)) {
                    router.push("/projects");
                  }
                }}
              />
            ) : null}
            <Badge variant="secondary">{items.length}</Badge>
          </div>
        </CardTitle>

        <Input
          value={q}
          onChange={e => setQ(e.target.value)}
          placeholder="Rechercher client / site…"
        />
      </CardHeader>

      <CardContent className="flex-1 min-h-0 overflow-hidden">
        {loadingList ? (
          <div className="text-sm text-muted-foreground">Chargement…</div>
        ) : listError ? (
          <div className="text-sm text-red-600">Erreur : {listError}</div>
        ) : groups.length === 0 ? (
          <div className="text-sm text-muted-foreground">Aucun projet.</div>
        ) : (
          <ScrollArea className="h-full pr-2">
            <div className="space-y-3">
              <Accordion
                type="multiple"
                value={open}
                onValueChange={setOpen}
                className="w-full">
                {groups.map(({ client, projects }) => {
                  const value = `client:${client}`;
                  const isOpen = open.includes(value);
                  const isClientActive = activeClient === client;

                  return (
                    <AccordionItem
                      key={client}
                      value={value}
                      className="border-b-0">
                      <AccordionTrigger
                        className={cn(
                          "relative rounded-xl px-3 py-2 hover:no-underline",
                          "hover:bg-muted/40 data-[state=open]:bg-muted/40",
                          "transition",
                          isClientActive && "ring-1 ring-client-accent-ring bg-client-accent-soft"
                        )}>
                        <span
                          className={cn(
                            "absolute left-0 top-2 bottom-2 w-0.75 rounded-full",
                            isClientActive ? "bg-client-accent" : "bg-rail"
                          )}
                        />

                        <div className="flex w-full items-center justify-between gap-3 pl-2">
                          <div className="flex min-w-0 items-center gap-2">
                            <span
                              className={cn(
                                "text-sm font-semibold truncate",
                                isClientActive ? "text-foreground" : "text-muted-foreground"
                              )}>
                              {client}
                            </span>

                            {isClientActive ? (
                              <span className="text-[10px] rounded-full px-2 py-0.5 bg-client-accent-soft text-client-accent border border-client-accent-ring">
                                actif
                              </span>
                            ) : null}
                          </div>

                          <Badge variant="outline">{projects.length}</Badge>
                        </div>
                      </AccordionTrigger>

                      <AccordionContent className="pt-2">
                        <div className="relative pl-4">
                          <span
                            className={cn(
                              "absolute left-2 top-1 bottom-1 w-px",
                              isOpen ? "bg-rail-strong" : "bg-transparent"
                            )}
                          />

                          <div className="space-y-2">
                            {projects.map(p => {
                              const isActive = activeSlug === p.slug;
                              const isSelected = selected.has(p.id);
                              const href = `/projects/${encodeURIComponent(
                                p.client
                              )}/${encodeURIComponent(p.site)}`;

                              return (
                                <div
                                  key={p.id}
                                  className={cn(
                                    "relative rounded-xl border px-3 py-2 transition",
                                    "text-foreground/90 border-border/70",
                                    "hover:bg-project-accent-soft",
                                    isActive &&
                                      "bg-project-accent-soft ring-1 ring-project-accent-ring border-project-accent-ring"
                                  )}>
                                  <span
                                    className={cn(
                                      "absolute -left-2.5 top-1/2 h-1.5 w-1.5 -translate-y-1/2 rounded-full",
                                      isActive ? "bg-project-accent" : "bg-project-accent/70"
                                    )}
                                  />

                                  <div className="flex items-center gap-3">
                                    <Checkbox
                                      checked={isSelected}
                                      onCheckedChange={v => {
                                        setSelected(prev => {
                                          const next = new Set(prev);
                                          if (Boolean(v)) next.add(p.id);
                                          else next.delete(p.id);
                                          return next;
                                        });
                                      }}
                                      aria-label={`Sélectionner ${p.slug}`}
                                    />

                                    <Link
                                      href={href}
                                      prefetch={false}
                                      aria-current={isActive ? "page" : undefined}
                                      ref={isActive ? activeRef : null}
                                      className={cn(
                                        "min-w-0 flex-1 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                                      )}>
                                      <div className="flex items-center justify-between gap-2">
                                        <div className="min-w-0">
                                          <div className="font-medium truncate">{p.site}</div>
                                          <div className="mt-0.5 text-xs text-muted-foreground truncate">
                                            {p.slug}
                                          </div>
                                        </div>

                                        <Badge variant={isActive ? "secondary" : "outline"}>
                                          {p.id.slice(0, 8)}
                                        </Badge>
                                      </div>
                                    </Link>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  );
                })}
              </Accordion>
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}
