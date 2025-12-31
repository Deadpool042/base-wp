import {
  ProjectItem,
  ProjectItemSchema,
  ProjectMeta,
  ProjectMetaSchema,
} from "@sf/shared/projects";

export async function apiProjectsList(): Promise<ProjectItem[]> {
  const res = await fetch("/api/projects/list", { cache: "no-store" });
  const json = (await res.json()) as { ok: boolean; projects?: unknown; error?: string };

  if (!res.ok || !json.ok) throw new Error(json.error ?? `HTTP ${res.status}`);

  // strict: array of ProjectItem
  return ProjectItemSchema.array().parse(json.projects ?? []);
}

export async function apiProjectsShow(slug: string): Promise<ProjectMeta> {
  const res = await fetch(`/api/projects/show?slug=${encodeURIComponent(slug)}`, {
    cache: "no-store",
  });
  const json = (await res.json()) as { ok: boolean; meta?: unknown; error?: string };

  if (!res.ok || !json.ok) throw new Error(json.error ?? `HTTP ${res.status}`);
  return ProjectMetaSchema.parse(json.meta);
}
