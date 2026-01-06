export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { spawn } from "child_process";
import { SITE_FACTORY_BIN } from "@/lib/siteFactoryBin";

type Body = { from?: string; to?: string };

export async function POST(req: Request) {
  const body = (await req.json().catch(() => null)) as Body | null;

  const from = body?.from?.trim();
  const to = body?.to?.trim();

  if (!from || !to) {
    return NextResponse.json({ ok: false, error: 'Paramètres "from"/"to" manquants' }, { status: 400 });
  }

  const child = spawn(SITE_FACTORY_BIN, ["clients", "rename", from, to], {
    env: { ...process.env, INTERACTIVE: "0", FORMAT: "ndjson" },
  });

  const stream = new ReadableStream<Uint8Array>({
    start(controller) {
      const enc = new TextEncoder();

      const onStdout = (chunk: Buffer) => controller.enqueue(enc.encode(chunk.toString()));
      const onStderr = (chunk: Buffer) => {
        // Optionnel: tu peux laisser stderr silencieux si tu préfères.
        // Ici on le transforme en NDJSON "stderr" pour debug UI.
        const line = JSON.stringify({ type: "stderr", message: chunk.toString() }) + "\n";
        controller.enqueue(enc.encode(line));
      };

      child.stdout.on("data", onStdout);
      child.stderr.on("data", onStderr);

      child.on("close", (code: number) => {
        // Si ton CLI émet déjà "error" et "done", on ne rajoute rien.
        // Mais si jamais il crash sans NDJSON, on force un event "error".
        if (code !== 0) {
          const line =
            JSON.stringify({
              type: "error",
              code: "CLI_EXIT",
              message: `La commande de renommage client s'est arrêtée avec le code ${code}`,
            }) + "\n";
          controller.enqueue(enc.encode(line));
        }
        controller.close();
      });

      child.on("error", (e: Error) => {
        const line = JSON.stringify({ type: "error", code: "SPAWN", message: e.message }) + "\n";
        controller.enqueue(enc.encode(line));
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
