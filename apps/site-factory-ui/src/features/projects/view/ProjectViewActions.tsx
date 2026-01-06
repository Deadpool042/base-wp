import type { Stage } from "@/lib/capabilities";

export function deployHrefFromSlug(slug: string, stage: Stage): string {
  const [client, site] = slug.split("/");
  if (!client || !site) return "/projects";

  const base = `/projects/${encodeURIComponent(client)}/${encodeURIComponent(site)}/deploy`;
  return `${base}?stage=${encodeURIComponent(stage)}`;
}
