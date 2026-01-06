// apps/site-factory-ui/src/features/clients/components/ClientsList.tsx
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
import { ClientsBulkDeleteDialog } from "./ClientsBulkDeleteDialog";

import type { ClientItem } from "@sf/shared/clients";
import { useClientsCtx } from "../ClientsProvider";

function getActiveClientFromPathname(pathname: string): string | null {
  // /clients/<client> or /clients/<client>/<site>
  const m = pathname.match(/^\/clients\/([^/]+)(?:\/[^/]+)?\/?$/);
  return m?.[1] ? decodeURIComponent(m[1]) : null;
}

function matchQuery(c: ClientItem, q: string): boolean {
  return c.name.toLowerCase().includes(q);
}

export function ClientsList() {
  const { items, loadingList, listError, q, setQ, optimisticRemoveClients } = useClientsCtx();
  const pathname = usePathname();
  const router = useRouter();
  const activeClient = React.useMemo(() => getActiveClientFromPathname(pathname), [pathname]);

  const [selected, setSelected] = React.useState<Set<string>>(new Set());

  const filtered = React.useMemo(() => {
    const query = q.trim().toLowerCase();
    if (!query) return items;
    return items.filter(c => matchQuery(c, query));
  }, [items, q]);

  React.useEffect(() => {
    // Nettoie la sélection si la liste change
    setSelected(prev => {
      if (prev.size === 0) return prev;
      const allowed = new Set(items.map(i => i.name));
      const next = new Set<string>();
      for (const v of prev) if (allowed.has(v)) next.add(v);
      return next;
    });
  }, [items]);

  const selectedClients = React.useMemo(() => Array.from(selected).sort(), [selected]);

  // scroll vers actif
  const activeRef = React.useRef<HTMLAnchorElement | null>(null);
  React.useEffect(() => {
    activeRef.current?.scrollIntoView({ block: "nearest" });
  }, [activeClient]);

  return (
    <Card className="rounded-2xl flex flex-col h-fit max-h-full min-h-0">
      <CardHeader className="space-y-2">
        <CardTitle className="flex items-center justify-between">
          <span>Clients</span>
          <div className="flex items-center gap-2">
            {selectedClients.length > 0 ? (
              <ClientsBulkDeleteDialog
                clients={selectedClients}
                onDeleted={async () => {
                  setSelected(new Set());

                  optimisticRemoveClients(selectedClients);

                  if (activeClient && selectedClients.includes(activeClient)) {
                    router.push("/clients");
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
          placeholder="Rechercher un client…"
        />
      </CardHeader>

      <CardContent className="flex-1 min-h-0 overflow-hidden">
        {loadingList ? (
          <div className="text-sm text-muted-foreground">Chargement…</div>
        ) : listError ? (
          <div className="text-sm text-red-600">Erreur : {listError}</div>
        ) : filtered.length === 0 ? (
          <div className="text-sm text-muted-foreground">Aucun client.</div>
        ) : (
          <ScrollArea className="h-full pr-2">
            <div className="space-y-2">
              {filtered.map(c => {
                const isActive = activeClient === c.name;
                const isSelected = selected.has(c.name);

                return (
                  <div
                    key={c.name}
                    className={cn(
                      "relative rounded-xl border px-3 py-2 transition",
                      "hover:bg-muted/40",
                      isActive
                        ? "bg-accent text-accent-foreground border-accent/40 ring-1 ring-accent/40"
                        : "border-border/70"
                    )}>
                    <span
                      className={cn(
                        "absolute left-0 top-2 bottom-2 w-0.75 rounded-full",
                        isActive ? "bg-client-accent" : "bg-muted-foreground/20"
                      )}
                    />

                    <div className="flex items-center gap-3 pl-2">
                      <Checkbox
                        checked={isSelected}
                        onCheckedChange={v => {
                          setSelected(prev => {
                            const next = new Set(prev);
                            if (Boolean(v)) next.add(c.name);
                            else next.delete(c.name);
                            return next;
                          });
                        }}
                        aria-label={`Sélectionner ${c.name}`}
                      />

                      <Link
                        href={`/clients/${encodeURIComponent(c.name)}`}
                        prefetch={false}
                        aria-current={isActive ? "page" : undefined}
                        ref={isActive ? activeRef : null}
                        className={cn(
                          "min-w-0 flex-1 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                        )}>
                        <div className="flex items-center justify-between gap-3">
                          <div className="min-w-0">
                            <div
                              className={cn(
                                "font-medium truncate",
                                !isActive && "text-foreground"
                              )}>
                              {c.name}
                            </div>
                            <div className="mt-0.5 text-xs text-muted-foreground truncate">
                              {typeof c.projectsCount === "number"
                                ? `${c.projectsCount} projet${c.projectsCount > 1 ? "s" : ""}`
                                : "—"}
                            </div>
                          </div>

                          <Badge variant={isActive ? "secondary" : "outline"}>
                            {c.projectsCount ?? 0}
                          </Badge>
                        </div>
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}
