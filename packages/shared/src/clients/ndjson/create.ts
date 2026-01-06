// packages/shared/src/clients/ndjson/create.ts
import { z } from "zod";

export const ClientCreateEvtSchema = z.union([
  z.object({
    type: z.literal("start"),
    op: z.literal("clients.create"),
    client: z.string().min(1).optional(),
  }),
  z.object({
    type: z.literal("created"),
    client: z.string().min(1),
    path: z.string().min(1).optional(),
  }),
  z.object({
    type: z.literal("done"),
    ok: z.union([z.boolean(), z.string()]).optional(),
  }),
  z.object({
    type: z.literal("success"),
    ok: z.union([z.boolean(), z.string()]).optional(),
  }),
  z.object({
    type: z.literal("error"),
    code: z.string().optional(),
    message: z.string().min(1),
  }),
  z.object({
    type: z.literal("stderr"),
    message: z.string().min(1),
  }),
]);

export type ClientCreateEvt = z.infer<typeof ClientCreateEvtSchema>;
