// apps/site-factory-ui/src/features/projects/components/ProjectRenameForm.tsx
"use client";

import * as React from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

type Props = {
  id: string;
  currentClient: string;
  currentSite: string;
};

export function ProjectRenameForm({ id, currentClient, currentSite }: Props) {
  const router = useRouter();

  const [renameClient, setRenameClient] = React.useState("");
  const [renameSite, setRenameSite] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [okMsg, setOkMsg] = React.useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setOkMsg(null);

    const payload = {
      id,
      renameClient: renameClient.trim() || undefined,
      renameSite: renameSite.trim() || undefined,
    };

    if (!payload.renameClient && !payload.renameSite) {
      setError("Rien à mettre à jour.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/projects/update", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = (await res.json()) as {
        ok: boolean;
        updated?: { slug?: string };
        error?: string;
      };
      if (!res.ok || !json.ok) throw new Error(json.error ?? "Échec de la mise à jour");

      setOkMsg("Mis à jour ✅");

      // si slug change, on navigue vers la nouvelle route
      if (json.updated?.slug) {
        router.push(`/projects/${json.updated.slug}`);
      } else {
        router.refresh();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur inconnue");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="rounded-2xl">
      <CardHeader className="space-y-2">
        <CardTitle className="flex items-center justify-between">
          <span>Modifier le projet</span>
          <Badge variant="outline">{id.slice(0, 8)}</Badge>
        </CardTitle>
        <div className="text-xs text-muted-foreground">
          Actuel : <span className="font-medium">{currentClient}</span> /{" "}
          <span className="font-medium">{currentSite}</span>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <form
          onSubmit={onSubmit}
          className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="renameClient">Renommer le client</Label>
            <Input
              id="renameClient"
              value={renameClient}
              onChange={e => setRenameClient(e.target.value)}
              placeholder={currentClient}
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="renameSite">Renommer le site</Label>
            <Input
              id="renameSite"
              value={renameSite}
              onChange={e => setRenameSite(e.target.value)}
              placeholder={currentSite}
              disabled={loading}
            />
          </div>

          <Separator />

          <div className="flex items-center gap-3">
            <Button
              type="submit"
              disabled={loading}>
              {loading ? "Mise à jour…" : "Mettre à jour"}
            </Button>
            {okMsg ? <span className="text-sm text-green-600">{okMsg}</span> : null}
            {error ? <span className="text-sm text-red-600">Erreur : {error}</span> : null}
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
