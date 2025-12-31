export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { spawn } from "child_process";
import readline from "readline";
import { readFile } from "fs/promises";
import { SITE_FACTORY_BIN } from "@/lib/siteFactoryBin";
import { asEvent, parseNDJSONLine } from "@sf/shared/ndjson";
import { ProjectMetaSchema } from "@sf/shared/projects";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const slug = searchParams.get("slug");

  if (!slug) {
    return NextResponse.json({ ok: false, error: "Missing slug" }, { status: 400 });
  }

  const child = spawn(SITE_FACTORY_BIN, ["projects", "show", slug], {
    env: { ...process.env, INTERACTIVE: "0", FORMAT: "ndjson" },
  });

  const rl = readline.createInterface({ input: child.stdout });

  let err: string | null = null;
  let stderr = "";
  let metaFile: string | null = null;
  let id: string | null = null;

  rl.on("line", line => {
    if (err) return;
    const s = line.trim();
    if (!s) return;

    const base = parseNDJSONLine(s);
    if (!base) {
      err = `Invalid NDJSON line: ${s}`;
      return;
    }

    const metaEvt = asEvent(base, "meta", ["id", "slug", "meta_file"] as const);
    if (metaEvt) {
      id = metaEvt.id;
      metaFile = metaEvt.meta_file;
      return;
    }

    const errEvt = asEvent(base, "error", ["message"] as const);
    if (errEvt) err = errEvt.message;
  });

  child.stderr.on("data", d => (stderr += d.toString()));

  const code: number = await new Promise(resolve => child.on("close", resolve));
  rl.close();

  if (code !== 0 || err) {
    return NextResponse.json(
      { ok: false, error: err ?? `CLI exited with code ${code}`, stderr },
      { status: 500 }
    );
  }

  if (!metaFile || !id) {
    return NextResponse.json(
      { ok: false, error: "Missing meta from CLI", stderr },
      { status: 500 }
    );
  }

  // Safety: optionnel mais conseillé -> refuser si pas sous /projects/
  // (tu peux renforcer plus tard)
  const raw = await readFile(metaFile, "utf-8");
  const metaUnknown = JSON.parse(raw);
  const meta = ProjectMetaSchema.parse(metaUnknown);

  return NextResponse.json({ ok: true, id, slug, meta });
}
