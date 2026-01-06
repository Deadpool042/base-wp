export type Stage = "staging" | "production";
export type HostingType = "mutualise" | "dedie";
export type DockerProfile = "local" | "prodlike";

// Doit rester aligné avec project_meta.json (stack.tech).
export type Stack = "wordpress" | "next";

export function normalizeStage(input?: string): Stage {
  if (input === "staging") return "staging";
  if (input === "production") return "production";
  if (input === "prod") return "production";
  return "staging";
}

export type ServiceCapability = {
  visible: boolean;
  enabled: boolean;
  disabledReason?: string;
  requiredEnvVars: string[];
};

export type CapabilitiesContext = {
  stack: Stack;
  hostingType: HostingType;
  dockerProfile: DockerProfile;
  stage: Stage;
};

export type Capabilities = {
  services: {
    mail: ServiceCapability;
    redis: ServiceCapability;
    grafana: ServiceCapability;
    loki: ServiceCapability;
  };
};

/**
 * Source unique de vérité UI pour les services/toggles autorisés.
 *
 * Contraintes:
 * - pas de back-end / API (UI-only)
 * - env vars minimales: MAILPIT_ENABLED, REDIS_ENABLED
 */
export function getCapabilities(ctx: CapabilitiesContext): Capabilities {
  const mail: ServiceCapability = {
    visible: true,
    enabled: true,
    requiredEnvVars: ["MAILPIT_ENABLED"],
  };

  const redisVisible = ctx.stack === "wordpress";
  const redisAllowed = redisVisible && ctx.hostingType === "dedie";
  const redis: ServiceCapability = {
    visible: redisVisible,
    enabled: redisAllowed,
    disabledReason: redisAllowed
      ? undefined
      : "Redis est disponible uniquement pour WordPress en hébergement dédié.",
    requiredEnvVars: ["REDIS_ENABLED"],
  };

  // Catalogue (statuts): on expose la capacité même si non câblée dans les templates.
  const grafanaAllowed = ctx.hostingType === "dedie";
  const grafana: ServiceCapability = {
    visible: grafanaAllowed,
    enabled: false,
    disabledReason: "Templates Docker Grafana/Loki non disponibles (catalogue uniquement).",
    requiredEnvVars: [],
  };

  const lokiAllowed = ctx.hostingType === "dedie";
  const loki: ServiceCapability = {
    visible: lokiAllowed,
    enabled: false,
    disabledReason: "Templates Docker Grafana/Loki non disponibles (catalogue uniquement).",
    requiredEnvVars: [],
  };

  return { services: { mail, redis, grafana, loki } };
}
