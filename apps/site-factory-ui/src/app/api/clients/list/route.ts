export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { spawn } from "child_process";
import { SITE_FACTORY_BIN } from "@/lib/siteFactoryBin";

export async function GET() {
  const child = spawn(SITE_FACTORY_BIN, ["clients", "list"], {
    cwd: process.cwd(),
    shell: false,
    env: { ...process.env, INTERACTIVE: "0", FORMAT: "ndjson" },
  });

  const stream = new ReadableStream<Uint8Array>({
    start(controller) {
      const enc = new TextEncoder();
      const write = (s: string) => controller.enqueue(enc.encode(s));

      let sawDone = false;

      // stdout: passthrough NDJSON (ton CLI sort déjà des lignes)
      const onStdout = (b: Buffer) => {
        const txt = b.toString("utf8");
        if (txt.includes('"type":"done"') || txt.includes('"type": "done"')) sawDone = true;
        write(txt);
      };

      // stderr -> NDJSON stderr (bufferisé par lignes)
      let stderrBuf = "";
      const flushStderrLines = () => {
        const parts = stderrBuf.split("\n");
        stderrBuf = parts.pop() ?? "";
        for (const line of parts) {
          const msg = line.trim();
          if (!msg) continue;
          write(JSON.stringify({ type: "stderr", message: msg }) + "\n");
        }
      };

      const onStderr = (b: Buffer) => {
        stderrBuf += b.toString("utf8");
        flushStderrLines();
      };

      child.stdout.on("data", onStdout);
      child.stderr.on("data", onStderr);

      child.on("close", (code: number) => {
        // flush stderr restant
        if (stderrBuf.trim()) {
          write(JSON.stringify({ type: "stderr", message: stderrBuf.trim() }) + "\n");
        }

        if (code !== 0) {
          write(
            JSON.stringify({ type: "error", code: "CLI_EXIT", message: `exit ${code}` }) + "\n"
          );
          if (!sawDone) write(JSON.stringify({ type: "done", ok: false }) + "\n");
        } else {
          if (!sawDone) write(JSON.stringify({ type: "done", ok: true }) + "\n");
        }

        controller.close();
      });

      child.on("error", (e: Error) => {
        write(JSON.stringify({ type: "error", code: "SPAWN", message: e.message }) + "\n");
        if (!sawDone) write(JSON.stringify({ type: "done", ok: false }) + "\n");
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
