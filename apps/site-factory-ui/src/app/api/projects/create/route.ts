export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { spawn } from "child_process";
import readline from "readline";
import { SITE_FACTORY_BIN } from "@/lib/siteFactoryBin";
import { asEvent, parseNDJSONLine } from "@sf/shared/ndjson";

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const client = body?.client;
  const site = body?.site;

  if (!client || !site) {
    return NextResponse.json({ ok: false, error: "Missing client/site" }, { status: 400 });
  }

  const child = spawn(SITE_FACTORY_BIN, ["projects", "create", client, site], {
    env: { ...process.env, INTERACTIVE: "0", FORMAT: "ndjson" },
  });

  const rl = readline.createInterface({ input: child.stdout });

  let created: { slug?: string; path?: string } = {};
  let err: string | null = null;
  let stderr = "";

  rl.on("line", line => {
    if (err) return;

    const s = line.trim();
    if (!s) return;

    const base = parseNDJSONLine(s);
    if (!base) {
      err = `Invalid NDJSON line: ${s}`;
      return;
    }

    const createdEvt = asEvent(base, "created", ["id", "slug", "path"] as const);
    if (createdEvt) {
      created = { slug: createdEvt.slug, path: createdEvt.path };
      return;
    }

    const errEvt = asEvent(base, "error", ["message"] as const);
    if (errEvt) {
      err = errEvt.message;
    }
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

  return NextResponse.json({ ok: true, created });
}
