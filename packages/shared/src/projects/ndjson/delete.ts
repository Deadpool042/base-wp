import { z } from "zod";

export const ProjectDeleteRequestSchema = z.object({
  id: z.uuid(),
  force: z.boolean().optional(),
});

export type ProjectDeleteRequest = z.infer<typeof ProjectDeleteRequestSchema>;

export const ProjectDeleteEvtSchema = z.union([
  z.object({
    type: z.literal("start"),
    op: z.literal("projects.delete"),
    id: z.uuid().optional(),
    force: z.union([z.boolean(), z.string()]).optional(),
  }),

  z.object({
    type: z.literal("found"),
    id: z.string().uuid(),
    slug: z.string().min(1).optional(),
    path: z.string().min(1).optional(),
  }),

  z.object({
    type: z.literal("deleted"),
    id: z.uuid(),
    slug: z.string().min(1).optional(),
    path: z.string().min(1).optional(),
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

export type ProjectDeleteEvt = z.infer<typeof ProjectDeleteEvtSchema>;
