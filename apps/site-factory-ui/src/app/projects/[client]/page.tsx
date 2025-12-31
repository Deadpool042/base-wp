import Link from "next/link";
import { headers } from "next/headers";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { ProjectItem } from "@sf/shared/projects";

async function getProjects(): Promise<ProjectItem[]> {
  const h = await headers();
  const host = h.get("host");
  const proto = h.get("x-forwarded-proto") ?? "http";
  if (!host) return [];

  const res = await fetch(`${proto}://${host}/api/projects/list`, { cache: "no-store" });
  const json = (await res.json()) as { ok: boolean; projects?: ProjectItem[] };
  return json.projects ?? [];
}

export default async function ClientPage({ params }: { params: { client: string } }) {
  const { client } = await params; // ✅ IMPORTANT
  const clientSlug = decodeURIComponent(client);

  const all = await getProjects();
  const items = all.filter((p) => p.client === clientSlug);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-semibold">{client}</h1>
        <Badge variant="secondary">{items.length} projects</Badge>
      </div>

      <Card className="rounded-2xl">
        <CardHeader className="space-y-1">
          <CardTitle>Client overview</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          Ici on mettra: infos client, notes, tags, contacts, actions (rename, create project…).
        </CardContent>
      </Card>

      <Card className="rounded-2xl">
        <CardHeader>
          <CardTitle>Projects</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {items.map(p => (
            <Link
              key={p.id}
              href={`/projects/${encodeURIComponent(p.client)}/${encodeURIComponent(p.site)}`}
              className="block rounded-xl border p-3 hover:bg-muted transition">
              <div className="flex items-center justify-between gap-2">
                <div className="font-medium">{p.site}</div>
                <Badge variant="outline">{p.id.slice(0, 8)}</Badge>
              </div>
              <div className="mt-1 text-xs text-muted-foreground">{p.slug}</div>
            </Link>
          ))}

          {items.length === 0 && (
            <div className="text-sm text-muted-foreground">No projects for this client.</div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
