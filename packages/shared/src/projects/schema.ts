import { z } from "zod";

/**
 * Project list item (projects list)
 */
export const ProjectItemSchema = z.object({
  id: z.uuid(),
  slug: z.string().min(1),
  client: z.string().min(1),
  site: z.string().min(1),
});

export type ProjectItem = z.infer<typeof ProjectItemSchema>;

/**
 * Project meta (projects show)
 */
export const ProjectMetaSchema = z.object({
  schema_version: z.number().int().positive(),

  meta: z.object({
    id: z.uuid(),
    created_at: z.iso.datetime({ offset: true }),
    updated_at: z.iso.datetime({ offset: true }),
  }),

  identity: z.object({
    client: z.string().min(1),
    site_name: z.string().min(1),
  }),

  params: z.object({
    slug: z.string().min(1),
  }),
});

export type ProjectMeta = z.infer<typeof ProjectMetaSchema>;
