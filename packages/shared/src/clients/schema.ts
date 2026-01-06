import { z } from "zod";

export const ClientItemSchema = z.object({
  name: z.string().min(1),
  projectsCount: z.number().int().nonnegative().optional(), // <- new
});

export type ClientItem = z.infer<typeof ClientItemSchema>;

export const ClientsListSchema = z.array(ClientItemSchema);
/**
 * Payload HTTP (UI -> API) pour rename client
 */
export const ClientRenameRequestSchema = z
  .object({
    from: z.string().min(1),
    to: z.string().min(1),
  })
  .refine(v => v.from !== v.to, { message: "from and to are identical", path: ["to"] });

export type ClientRenameRequest = z.infer<typeof ClientRenameRequestSchema>;

export const ClientCreateRequestSchema = z.object({
  client: z.string().min(1),
  // Map de `--set key=value` (ex: client.name, client.contact.email, ...)
  set: z.record(z.string(), z.string()).optional(),
});
export type ClientCreateRequest = z.infer<typeof ClientCreateRequestSchema>;

export const ClientDeleteRequestSchema = z.object({
  client: z.string().min(1),
  force: z.boolean().optional(),
});
export type ClientDeleteRequest = z.infer<typeof ClientDeleteRequestSchema>;

// Payload HTTP (UI -> API) pour list clients
export const ClientListRequestSchema = z.object({
  search: z.string().optional(),
});
export type ClientListRequest = z.infer<typeof ClientListRequestSchema>;
