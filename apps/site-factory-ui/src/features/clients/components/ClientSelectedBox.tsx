"use client";

import * as React from "react";
import { usePathname, useRouter } from "next/navigation";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { useClientsCtx } from "@/features/clients/ClientsProvider";
import { ClientDeleteDialog } from "@/features/clients/components/ClientDeleteDialog";
import { useClientMeta } from "@/features/clients/hooks/useClientMeta";

function decodeSafe(s: string) {
  try {
    return decodeURIComponent(s);
  } catch {
    return s;
  }
}

function selectedClientFromPath(pathname: string): string | null {
  const match = pathname.match(/^\/clients\/([^/]+)(?:\/|$)/);
  if (!match) return null;
  const client = decodeSafe(match[1] ?? "");
  return client || null;
}

export function ClientSelectedBox() {
  const router = useRouter();
  const pathname = usePathname();

  const [deleteOpen, setDeleteOpen] = React.useState(false);

  const client = React.useMemo(() => selectedClientFromPath(pathname), [pathname]);
  const { items: clients, optimisticRemoveClients } = useClientsCtx();
  const { meta, loading, error, refresh } = useClientMeta(client);

  if (!client) return null;

  const found = clients.find(c => c.name === client);
  const projectsCount = typeof found?.projectsCount === "number" ? found.projectsCount : 0;

  return (
    <Card className="rounded-2xl p-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <div className="text-sm text-muted-foreground">Client sélectionné</div>
            <Badge variant="secondary">{client}</Badge>
          </div>

          {error ? (
            <div className="mt-2 text-sm text-red-600">Erreur : {error}</div>
          ) : loading ? (
            <div className="mt-2 text-sm text-muted-foreground">Chargement…</div>
          ) : meta ? (
            <div className="mt-3 grid gap-1 text-sm">
              <div className="flex items-center justify-between gap-3">
                <span className="text-muted-foreground">Nom</span>
                <span className="truncate">{meta.name || "—"}</span>
              </div>
              <div className="flex items-center justify-between gap-3">
                <span className="text-muted-foreground">Email</span>
                <span className="truncate">{meta.contact?.email || "—"}</span>
              </div>
              <div className="flex items-center justify-between gap-3">
                <span className="text-muted-foreground">Téléphone</span>
                <span className="truncate">{meta.contact?.phone || "—"}</span>
              </div>
              <div className="flex items-center justify-between gap-3">
                <span className="text-muted-foreground">Société</span>
                <span className="truncate">{meta.company?.legalName || "—"}</span>
              </div>
              <div className="flex items-center justify-between gap-3">
                <span className="text-muted-foreground">Pays</span>
                <span className="truncate">{meta.company?.country || "—"}</span>
              </div>
              <div className="flex items-center justify-between gap-3">
                <span className="text-muted-foreground">Timezone</span>
                <span className="truncate">{meta.company?.timezone || "—"}</span>
              </div>
              {(meta.createdAt || meta.updatedAt) ? (
                <div className="pt-1 text-xs text-muted-foreground">
                  {meta.createdAt ? `créé : ${meta.createdAt}` : null}
                  {meta.createdAt && meta.updatedAt ? " · " : null}
                  {meta.updatedAt ? `modifié : ${meta.updatedAt}` : null}
                </div>
              ) : null}
            </div>
          ) : (
            <div className="mt-2 text-sm text-muted-foreground">Aucune meta.</div>
          )}
        </div>

        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => void refresh()}
            disabled={loading}>
            Rafraîchir
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button type="button" variant="secondary" size="sm" disabled={loading}>
                Actions
              </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end">
              <DropdownMenuItem disabled title="À implémenter">
                Mettre à jour le client
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                variant="destructive"
                onSelect={() => setDeleteOpen(true)}
                disabled={loading}>
                Supprimer le client
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <ClientDeleteDialog
            client={client}
            projectsCount={projectsCount}
            open={deleteOpen}
            onOpenChange={setDeleteOpen}
            hideTrigger
            onDeleted={async () => {
              optimisticRemoveClients([client]);
              setDeleteOpen(false);
              router.push("/clients");
            }}
          />
        </div>
      </div>
    </Card>
  );
}
