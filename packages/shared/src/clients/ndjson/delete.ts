// packages/shared/src/clients/ndjson/delete.ts
import { z } from "zod";

export const ClientDeleteEvtSchema = z.union([
  z.object({
    type: z.literal("start"),
    op: z.literal("clients.delete"),
    client: z.string().min(1).optional(),
  }),
  z.object({
    type: z.literal("deleted"),
    client: z.string().min(1),
  }),
  z.object({
    type: z.literal("done"),
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

export type ClientDeleteEvt = z.infer<typeof ClientDeleteEvtSchema>;
