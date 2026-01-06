export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { spawn } from "child_process";
import { SITE_FACTORY_BIN } from "@/lib/siteFactoryBin";

export async function GET(_req: Request, { params }: { params: Promise<{ client: string }> }) {
  const { client } = await params;

  const child = spawn(SITE_FACTORY_BIN, ["clients", "show", client], {
    cwd: process.cwd(),
    shell: false,
    env: { ...process.env, INTERACTIVE: "0", FORMAT: "ndjson" },
  });

  const stream = new ReadableStream<Uint8Array>({
    start(controller) {
      const enc = new TextEncoder();
      const write = (s: string) => controller.enqueue(enc.encode(s));

      child.stdout.on("data", (b: Buffer) => write(b.toString("utf8")));

      // stderr → evt stderr ligne par ligne (optionnel)
      let buf = "";
      child.stderr.on("data", (b: Buffer) => {
        buf += b.toString("utf8");
        const lines = buf.split("\n");
        buf = lines.pop() ?? "";
        for (const line of lines) {
          const msg = line.trim();
          if (msg) write(JSON.stringify({ type: "stderr", message: msg }) + "\n");
        }
      });

      child.on("close", (code: number) => {
        if (buf.trim()) write(JSON.stringify({ type: "stderr", message: buf.trim() }) + "\n");
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
