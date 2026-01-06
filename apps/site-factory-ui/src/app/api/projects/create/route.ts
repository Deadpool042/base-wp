export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { spawn } from "child_process";
import { SITE_FACTORY_BIN } from "@/lib/siteFactoryBin";
import { ProjectCreateRequestSchema } from "@sf/shared/projects";

export async function POST(req: Request) {
  const payload = await req.json().catch(() => null);
  const parsed = ProjectCreateRequestSchema.safeParse.call(ProjectCreateRequestSchema, payload);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: "Requête invalide" }, { status: 400 });
  }

  const client = parsed.data.client.trim();
  const site_name = parsed.data.site.trim();

  const args = ["projects", "create", client, site_name];
  if (parsed.data.tech) args.push("--tech", parsed.data.tech);
  if (parsed.data.headless != null) args.push("--headless", parsed.data.headless ? "1" : "0");

  const child = spawn(SITE_FACTORY_BIN, args, {
    cwd: process.cwd(),
    shell: false,
    env: { ...process.env, INTERACTIVE: "0", FORMAT: "ndjson" },
  });

  const stream = new ReadableStream<Uint8Array>({
    start(controller) {
      const enc = new TextEncoder();
      const write = (s: string) => controller.enqueue(enc.encode(s));

      let sawDone = false;

      // stdout: passthrough (déjà NDJSON)
      const onStdout = (chunk: Buffer) => {
        const txt = chunk.toString("utf8");
        if (txt.includes('"type":"done"') || txt.includes('"type": "done"')) sawDone = true;
        write(txt);
      };

      // stderr -> NDJSON "stderr" (line buffered)
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

      const onStderr = (chunk: Buffer) => {
        stderrBuf += chunk.toString("utf8");
        flushStderrLines();
      };

      child.stdout.on("data", onStdout);
      child.stderr.on("data", onStderr);

      child.on("close", (code: number) => {
        if (stderrBuf.trim()) {
          write(JSON.stringify({ type: "stderr", message: stderrBuf.trim() }) + "\n");
        }

        if (code !== 0) {
          write(
            JSON.stringify({
              type: "error",
              code: "CLI_EXIT",
              message: `La commande de création du projet s'est arrêtée avec le code ${code}`,
            }) + "\n"
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
