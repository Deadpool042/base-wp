export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { spawn } from "child_process";
import readline from "readline";
import { SITE_FACTORY_BIN } from "@/lib/siteFactoryBin";
import { parseNDJSONLine, asEvent } from "@sf/shared/ndjson";

export async function POST(req: Request) {
  const body = (await req.json().catch(() => null)) as null | {
    id?: string;
    renameClient?: string;
    renameSite?: string;
  };

  const id = body?.id?.trim();
  const renameClient = body?.renameClient?.trim();
  const renameSite = body?.renameSite?.trim();

  if (!id) return NextResponse.json({ ok: false, error: "Id manquant" }, { status: 400 });
  if (!renameClient && !renameSite) {
    return NextResponse.json({ ok: false, error: "Rien à mettre à jour" }, { status: 400 });
  }

  const args = ["projects", "update", "--id", id, "--format", "ndjson"];
  if (renameClient) args.push("--rename-client", renameClient);
  if (renameSite) args.push("--rename-site", renameSite);

  const child = spawn(SITE_FACTORY_BIN, args, {
    env: { ...process.env, INTERACTIVE: "0", FORMAT: "ndjson" },
  });

  const rl = readline.createInterface({ input: child.stdout });

  let err: string | null = null;
  let updatedSlug: string | undefined;
  let stderr = "";

  rl.on("line", line => {
    const base = parseNDJSONLine(line.trim());
    if (!base) return;

    const e = asEvent(base, "error", ["message"] as const);
    if (e) {
      err = e.message;
      return;
    }

    // si ton CLI fait: emit updated id=... slug=... path=...
    const u = asEvent(base, "updated", ["slug"] as const);
    if (u) {
      updatedSlug = u.slug;
      return;
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

  return NextResponse.json({ ok: true, updated: { slug: updatedSlug } });
}
