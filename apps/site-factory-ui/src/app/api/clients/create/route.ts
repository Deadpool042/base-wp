export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { spawn } from "child_process";
import { SITE_FACTORY_BIN } from "@/lib/siteFactoryBin";
import { ClientCreateRequestSchema } from "@sf/shared/clients";

export async function POST(req: Request) {
  const payload = await req.json().catch(() => null);
  const parsed = ClientCreateRequestSchema.safeParse.call(ClientCreateRequestSchema, payload);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: "Requête invalide" }, { status: 400 });
  }

  const client = parsed.data.client.trim();
  if (!client) return NextResponse.json({ ok: false, error: "Client manquant" }, { status: 400 });

  const args: string[] = ["clients", "create", client];

  const set = parsed.data.set ?? {};
  for (const [key, value] of Object.entries(set)) {
    if (value == null) continue;
    args.push("--set", `${key}=${String(value)}`);
  }

  const child = spawn(SITE_FACTORY_BIN, args, {
    cwd: process.cwd(),
    shell: false,
    env: { ...process.env, INTERACTIVE: "0", FORMAT: "ndjson" },
  });

  const stream = new ReadableStream<Uint8Array>({
    start(controller) {
      const enc = new TextEncoder();
      const write = (s: string) => controller.enqueue(enc.encode(s));

      child.stdout.on("data", (b: Buffer) => write(b.toString("utf8")));
      child.stderr.on("data", (b: Buffer) =>
        write(JSON.stringify({ type: "stderr", message: b.toString("utf8") }) + "\n")
      );

      child.on("close", (code: number) => {
        if (code !== 0) {
          write(
            JSON.stringify({ type: "error", code: "CLI_EXIT", message: `exit ${code}` }) + "\n"
          );
        }
        controller.close();
      });

      child.on("error", (e: Error) => {
        write(JSON.stringify({ type: "error", code: "SPAWN", message: e.message }) + "\n");
        controller.close();
      });
    },
    cancel() {
      child.kill("SIGTERM");
    },
  });

  return new NextResponse(stream, {
    status: 200,
    headers: { "content-type": "application/x-ndjson; charset=utf-8", "cache-control": "no-store" },
  });
}
