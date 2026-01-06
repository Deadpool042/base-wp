export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { spawn } from "child_process";
import { SITE_FACTORY_BIN } from "@/lib/siteFactoryBin";

export async function POST(req: Request) {
  const body = (await req.json().catch(() => null)) as { client?: string; force?: boolean } | null;
  const client = body?.client?.trim();
  const force = !!body?.force;

  if (!client) return NextResponse.json({ ok: false, error: "Client manquant" }, { status: 400 });

  const args = ["clients", "delete", client];
  if (force) args.push("--force");

  const child = spawn(SITE_FACTORY_BIN, args, {
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
