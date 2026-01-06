import * as React from "react";

import { ProjectDeployShell } from "@/features/projects/deploy/ProjectDeployShell";
import { normalizeStage } from "@/lib/capabilities";

function decodeSafe(s: string) {
  try {
    return decodeURIComponent(s);
  } catch {
    return s;
  }
}

export default async function ProjectDeployPage({
  params,
  searchParams,
}: {
  params: Promise<{ client: string; site: string }>;
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { client: clientRaw, site: siteRaw } = await params;
  const client = decodeSafe(clientRaw);
  const site = decodeSafe(siteRaw);
  const slug = `${client}/${site}`;

  const sp = (await searchParams) ?? {};
  const stageRaw = Array.isArray(sp.stage) ? sp.stage[0] : sp.stage;

  const stage = normalizeStage(stageRaw);

  return <ProjectDeployShell slug={slug} initialStage={stage} />;
}
