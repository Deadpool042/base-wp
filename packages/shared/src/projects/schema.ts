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
  // Optionnel: informations de stack/techno (pour formulaire conditionnel et génération).
  stack: z
    .object({
      tech: z.enum(["wordpress", "next"]).optional(),
      headless: z.boolean().optional(),
    })
    .optional(),
  params: z.object({
    slug: z.string().min(1),
  }),
});
export type ProjectMeta = z.infer<typeof ProjectMetaSchema>;

/**
 * Payload HTTP (UI -> API) pour create d'un projet (mode JSON "simple")
 */
export const ProjectCreateRequestSchema = z.object({
  client: z.string().min(1),
  site: z.string().min(1),
  tech: z.enum(["wordpress", "next"]).optional(),
  headless: z.boolean().optional(),
});
export type ProjectCreateRequest = z.infer<typeof ProjectCreateRequestSchema>;

/**
 * Payload HTTP (UI -> API) pour update/rename d'un projet (mode JSON "simple")
 */
export const ProjectUpdateRequestSchema = z
  .object({
    id: z.uuid(),
    renameClient: z.string().min(1).optional(),
    renameSite: z.string().min(1).optional(),
  })
  .refine(v => v.renameClient || v.renameSite, {
    message: "Nothing to update",
    path: ["renameClient"],
  });
export type ProjectUpdateRequest = z.infer<typeof ProjectUpdateRequestSchema>;

/**
 * Réponse HTTP (mode JSON simple)
 */
export const ProjectUpdateResultSchema = z.object({
  ok: z.boolean(),
  updated: z
    .object({
      id: z.uuid().optional(),
      slug: z.string().min(1).optional(),
      path: z.string().min(1).optional(),
    })
    .optional(),
  error: z.string().optional(),
});
export type ProjectUpdateResult = z.infer<typeof ProjectUpdateResultSchema>;
