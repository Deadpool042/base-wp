export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { spawn } from "child_process";

import { SITE_FACTORY_BIN } from "@/lib/siteFactoryBin";
import { ProjectDeployRequestSchema } from "@sf/shared/projects";

export async function POST(req: Request) {
  const payload = await req.json().catch(() => null);
  const parsed = ProjectDeployRequestSchema.safeParse.call(ProjectDeployRequestSchema, payload);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: "Requête invalide" }, { status: 400 });
  }

  const slug = parsed.data.slug.trim();
  const envName = parsed.data.env;
  if (!slug) return NextResponse.json({ ok: false, error: "Slug manquant" }, { status: 400 });

  const ssh = parsed.data.ssh;
  if (!ssh) return NextResponse.json({ ok: false, error: "SSH manquant" }, { status: 400 });

  const args: string[] = [
    "projects",
    "deploy",
    slug,
    "--env",
    envName,
    "--ssh-host",
    ssh.host,
    "--ssh-user",
    ssh.user,
    "--ssh-path",
    ssh.path,
  ];

  if (ssh.port) args.push("--ssh-port", String(ssh.port));
  if (ssh.key) args.push("--ssh-key", ssh.key);

  // Par défaut, on reste en dry-run côté UI.
  if (parsed.data.dryRun ?? true) args.push("--dry-run");

  const child = spawn(SITE_FACTORY_BIN, args, {
    cwd: process.cwd(),
    shell: false,
    env: { ...process.env, INTERACTIVE: "0", FORMAT: "ndjson" },
  });

  const stream = new ReadableStream<Uint8Array>({
    start(controller) {
      const enc = new TextEncoder();
      const write = (s: string) => controller.enqueue(enc.encode(s));

      let sawError = false;

      const onStdout = (chunk: Buffer) => {
        const txt = chunk.toString("utf8");
        if (txt.includes('"type":"error"') || txt.includes('"type": "error"')) sawError = true;
        write(txt);
      };

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
        if (code !== 0 && !sawError) {
          write(JSON.stringify({ type: "error", code: "CLI_EXIT", message: `exit ${code}` }) + "\n");
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
