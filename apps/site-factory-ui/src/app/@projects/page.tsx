import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

type ProjectItem = { id: string; slug: string; client: string; site: string };

async function getProjects(): Promise<ProjectItem[]> {
  const res = await fetch("http://localhost:3000/api/projects/list", { cache: "no-store" });
  const json = (await res.json()) as { ok: boolean; projects?: ProjectItem[] };
  return json.projects ?? [];
}

export default async function ProjectsSlot() {
  const projects = await getProjects();

  return (
    <Card className="rounded-2xl">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Projets</CardTitle>
        <Badge variant="secondary">{projects.length}</Badge>
      </CardHeader>
      <CardContent className="space-y-2">
        {projects.slice(0, 6).map(p => (
          <Link
            key={p.id}
            href={`/projects/${encodeURIComponent(p.slug)}`}
            className="block rounded-xl border p-3 hover:bg-muted transition">
            <div className="flex items-center justify-between">
              <div className="font-medium">{p.slug}</div>
              <Badge variant="outline">{p.id.slice(0, 8)}</Badge>
            </div>
          </Link>
        ))}

        <div className="pt-2">
          <Link
            href="/projects"
            className="text-sm underline">
            Ouvrir les projets
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
