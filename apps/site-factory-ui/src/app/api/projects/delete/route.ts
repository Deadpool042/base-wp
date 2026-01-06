export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { spawn } from "child_process";
import { SITE_FACTORY_BIN } from "@/lib/siteFactoryBin";

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const id = String(body?.id ?? "");
  const force = Boolean(body?.force);

  const child = spawn(SITE_FACTORY_BIN, ["projects", "delete", id], {
    env: {
      ...process.env,
      INTERACTIVE: "0",
      FORMAT: "ndjson",
      FORCE: force ? "1" : "0",
    },
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
    headers: {
      "content-type": "application/x-ndjson; charset=utf-8",
      "cache-control": "no-store",
    },
  });
}
