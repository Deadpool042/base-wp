import * as React from "react";

import { ProjectViewShell } from "@/features/projects/view/ProjectViewShell";

function decodeSafe(s: string) {
  try {
    return decodeURIComponent(s);
  } catch {
    return s;
  }
}

export default async function ProjectViewLayout({
  form,
  preview,
  params,
}: {
  form: React.ReactNode;
  preview: React.ReactNode;
  params: Promise<{ client: string; site: string }>;
}) {
  const { client: clientRaw, site: siteRaw } = await params;
  const client = decodeSafe(clientRaw);
  const site = decodeSafe(siteRaw);
  const slug = `${client}/${site}`;

  return <ProjectViewShell slug={slug} form={form} preview={preview} />;
}
