export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { spawn } from "child_process";
import readline from "readline";
import { SITE_FACTORY_BIN } from "@/lib/siteFactoryBin";
import { asEvent, parseNDJSONLine } from "@sf/shared/ndjson";
import { ProjectItemSchema, type ProjectItem } from "@sf/shared/projects";

export async function GET() {
  const child = spawn(SITE_FACTORY_BIN, ["projects", "list"], {
    env: { ...process.env, INTERACTIVE: "0", FORMAT: "ndjson" },
  });

  const rl = readline.createInterface({ input: child.stdout });

  const projects: ProjectItem[] = [];
  let err: string | null = null;
  let stderr = "";

  rl.on("line", line => {
    if (err) return;
    const s = line.trim();
    if (!s) return;

    const base = parseNDJSONLine(s);
    if (!base) {
      err = `Ligne NDJSON invalide : ${s}`;
      return;
    }

    const proj = asEvent(base, "project", ["id", "slug", "client", "site"] as const);
    if (proj) {
      const parsed = ProjectItemSchema.safeParse.call(ProjectItemSchema, {
        id: proj.id,
        slug: proj.slug,
        client: proj.client,
        site: proj.site,
      });
      if (parsed.success) projects.push(parsed.data);
      return;
    }

    const e = asEvent(base, "error", ["message"] as const);
    if (e) {
      err = e.message;
    }
  });

  child.stderr.on("data", d => (stderr += d.toString()));

  const code: number = await new Promise(resolve => child.on("close", resolve));
  rl.close();

  if (code !== 0 || err) {
    return NextResponse.json(
      { ok: false, error: err ?? `La CLI s'est arrêtée avec le code ${code}`, stderr },
      { status: 500 }
    );
  }

  return NextResponse.json({ ok: true, projects });
}
