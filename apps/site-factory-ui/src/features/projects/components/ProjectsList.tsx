"use client";

import * as React from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import type { ProjectItem } from "@sf/shared/projects";
import { useProjectsCtx } from "../ProjectsProvider";
import { useProjectsSelection } from "../ProjectsSelectionProvider";

type Group = { client: string; projects: ProjectItem[] };

function groupByClient(items: ProjectItem[]): Group[] {
  const map = items.reduce<Record<string, ProjectItem[]>>((acc, p) => {
    (acc[p.client] ??= []).push(p);
    return acc;
  }, {});

  return Object.keys(map)
    .sort((a, b) => a.localeCompare(b))
    .map(client => ({
      client,
      projects: map[client].sort((a, b) => a.site.localeCompare(b.site)),
    }));
}

export function ProjectsList() {
  const { items, loadingList, listError, q, setQ } = useProjectsCtx();
  const { selectedSlug, selectSlug } = useProjectsSelection();

  const filtered = React.useMemo(() => {
    const query = q.trim().toLowerCase();
    if (!query) return items;
    return items.filter(p => `${p.client} ${p.site} ${p.slug}`.toLowerCase().includes(query));
  }, [items, q]);

  const groups = React.useMemo(() => groupByClient(filtered), [filtered]);

  // open groups auto: selected client (si sélection)
  const selectedClient = selectedSlug?.split("/")[0] ?? null;
  const [open, setOpen] = React.useState<string[]>(
    selectedClient ? [`client:${selectedClient}`] : []
  );

  React.useEffect(() => {
    if (!selectedClient) return;
    const v = `client:${selectedClient}`;
    setOpen(prev => (prev.includes(v) ? prev : [...prev, v]));
  }, [selectedClient]);

  return (
    <Card className="rounded-2xl">
      <CardHeader className="space-y-2">
        <CardTitle className="flex items-center justify-between">
          <span>Projects</span>
          <Badge variant="secondary">{items.length}</Badge>
        </CardTitle>
        <Input
          value={q}
          onChange={e => setQ(e.target.value)}
          placeholder="Search client / site…"
        />
      </CardHeader>

      <CardContent className="space-y-3">
        {loadingList ? (
          <div className="text-sm text-muted-foreground">Loading…</div>
        ) : listError ? (
          <div className="text-sm text-red-600">Error: {listError}</div>
        ) : groups.length === 0 ? (
          <div className="text-sm text-muted-foreground">No projects.</div>
        ) : (
          <Accordion
            type="multiple"
            value={open}
            onValueChange={setOpen}
            className="w-full">
            {groups.map(({ client, projects }) => (
              <AccordionItem
                key={client}
                value={`client:${client}`}
                className="border-b-0">
                <AccordionTrigger className="rounded-xl px-2 hover:no-underline hover:bg-muted">
                  <div className="flex w-full items-center justify-between gap-3">
                    {/* ✅ clic client => page client */}
                    <Link
                      href={`/projects/${encodeURIComponent(client)}`}
                      onClick={e => e.stopPropagation()} // évite toggle accordion
                      className="text-sm font-semibold text-muted-foreground hover:underline">
                      {client}
                    </Link>

                    <Badge variant="outline">{projects.length}</Badge>
                  </div>
                </AccordionTrigger>

                <AccordionContent className="pt-2">
                  <div className="space-y-2">
                    {projects.map(p => {
                      const isActive = selectedSlug === p.slug;

                      return (
                        <button
                          key={p.id}
                          type="button"
                          onClick={() => selectSlug(p.slug)} // ✅ preview only
                          className={[
                            "w-full text-left block rounded-xl border p-3 transition",
                            "hover:bg-muted",
                            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                            isActive
                              ? "bg-accent text-accent-foreground border-accent/40 ring-1 ring-accent/40"
                              : "",
                          ].join(" ")}>
                          <div className="flex items-center justify-between gap-2">
                            <div className="font-medium">{p.site}</div>
                            <Badge variant={isActive ? "secondary" : "outline"}>
                              {p.id.slice(0, 8)}
                            </Badge>
                          </div>
                          <div className="mt-1 text-xs text-muted-foreground">{p.slug}</div>
                        </button>
                      );
                    })}
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        )}
      </CardContent>
    </Card>
  );
}
