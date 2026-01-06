import { z } from "zod";

export const DeploymentTargetSchema = z.enum(["mutualized:o2switch", "vps:ovh"]);
export type DeploymentTarget = z.infer<typeof DeploymentTargetSchema>;

export const ProjectStackSchema = z.enum(["wp", "next", "wp-headless"]);
export type ProjectStack = z.infer<typeof ProjectStackSchema>;

export const MailProviderSchema = z.enum(["mailpit", "smtp"]);
export type MailProvider = z.infer<typeof MailProviderSchema>;

export const DbProviderSchema = z.enum(["docker", "managed"]);
export type DbProvider = z.infer<typeof DbProviderSchema>;

export const SmtpConfigSchema = z.object({
  host: z.string().min(1),
  port: z.number().int().min(1).max(65535),
  user: z.string().min(1),
  password: z.string().min(1),
  from: z.string().min(1),
});
export type SmtpConfig = z.infer<typeof SmtpConfigSchema>;

export const ProjectEnvConfigSchema = z.object({
  providers: z.object({
    mail: MailProviderSchema,
    db: DbProviderSchema,
  }),
  smtp: SmtpConfigSchema.optional(),
  services: z
    .object({
      redis: z.boolean().optional(),
    })
    .optional(),
});
export type ProjectEnvConfig = z.infer<typeof ProjectEnvConfigSchema>;

export const ProjectRuntimeConfigSchema = z.object({
  version: z.number().int().min(1),
  stack: ProjectStackSchema,
  deploymentTarget: DeploymentTargetSchema,
  environments: z.object({
    local: ProjectEnvConfigSchema,
    staging: ProjectEnvConfigSchema,
    prod: ProjectEnvConfigSchema,
  }),
});
export type ProjectRuntimeConfig = z.infer<typeof ProjectRuntimeConfigSchema>;
