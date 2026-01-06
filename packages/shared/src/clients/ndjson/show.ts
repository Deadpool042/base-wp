import { z } from "zod";

export const ClientShowEvtSchema = z.union([
  z.object({
    type: z.literal("start"),
    op: z.literal("clients.show"),
    client: z.string().min(1).optional(),
  }),

  z.object({
    type: z.literal("meta"),
    meta_file: z.string().optional(),
    id: z.string().optional(),
    slug: z.string().optional(),
    name: z.string().optional(),
    contact_email: z.string().optional(),
    contact_phone: z.string().optional(),
    company_legalName: z.string().optional(),
    company_country: z.string().optional(),
    company_timezone: z.string().optional(),
    createdAt: z.string().optional(),
    updatedAt: z.string().optional(),
  }),

  z.object({
    type: z.literal("project"),
    id: z.string().uuid().optional(),
    client: z.string().min(1).optional(),
    site: z.string().min(1).optional(),
    slug: z.string().min(1).optional(),
  }),

  z.object({
    type: z.literal("success"),
    ok: z.union([z.boolean(), z.string()]).optional(),
    count: z.union([z.number(), z.string()]).optional(),
  }),

  z.object({
    type: z.literal("done"),
    ok: z.union([z.boolean(), z.string()]).optional(),
    count: z.union([z.number(), z.string()]).optional(),
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

export type ClientShowEvt = z.infer<typeof ClientShowEvtSchema>;
