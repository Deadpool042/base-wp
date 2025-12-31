import { headers } from "next/headers";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { ProjectMeta } from "@sf/shared/projects";

async function getMeta(slug: string): Promise<ProjectMeta | null> {
  const h = await headers();
  const host = h.get("host");
  const proto = h.get("x-forwarded-proto") ?? "http";
  if (!host) return null;

  const res = await fetch(`${proto}://${host}/api/projects/show?slug=${encodeURIComponent(slug)}`, {
    cache: "no-store",
  });

  const json = (await res.json()) as { ok: boolean; meta?: unknown };
  if (!res.ok || !json.ok) return null;

  return (json.meta as ProjectMeta) ?? null;
}

export default async function ProjectPage({
  params,
}: {
  params: Promise<{ client: string; site: string }>;
}) {
  const { client: clientRaw, site: siteRaw } = await params;

  const client = decodeURIComponent(clientRaw);
  const site = decodeURIComponent(siteRaw);
  const slug = `${client}/${site}`;

  const meta = await getMeta(slug);

  if (!meta) {
    return (
      <Card className="rounded-2xl">
        <CardHeader>
          <CardTitle>Project not found</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">{slug}</CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-semibold">{meta.identity.site_name}</h1>
        <Badge variant="secondary">{meta.identity.client}</Badge>
      </div>

      <Card className="rounded-2xl">
        <CardHeader className="space-y-1">
          <CardTitle className="flex items-center justify-between">
            <span>Project details</span>
            <Badge variant="outline">{meta.meta.id.slice(0, 8)}</Badge>
          </CardTitle>
          <div className="text-xs text-muted-foreground">{meta.params.slug}</div>
        </CardHeader>

        <CardContent className="space-y-3 text-sm">
          <div>
            <span className="font-medium">Created:</span> {meta.meta.created_at}
          </div>
          <div>
            <span className="font-medium">Updated:</span> {meta.meta.updated_at}
          </div>

          <div className="pt-2">
            <div className="mb-2 font-medium">Raw meta</div>
            <pre className="overflow-auto rounded-xl bg-muted p-3 text-xs">
              {JSON.stringify(meta, null, 2)}
            </pre>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
