import { getCapabilities } from "@/lib/capabilities";

export type CapabilitiesStack = "wordpress" | "next";
export type CapabilitiesHostingType = "mutualise" | "dedie";
export type CapabilitiesProfile = "local" | "prodlike";
export type CapabilitiesStage = "staging" | "production";

export type AllowedServiceId = "mail" | "redis" | "grafana" | "loki";

export type AllowedService = {
  id: AllowedServiceId;
  label: string;
  purpose: string;
  requiredEnvVars: string[];
  visible: boolean;
  enabled: boolean;
  disabledReason?: string;
};

export type CapabilitiesInput = {
  stack: CapabilitiesStack;
  hostingType: CapabilitiesHostingType;
  profile: CapabilitiesProfile;
  stage: CapabilitiesStage;
};

export type CapabilitiesResult = {
  services: AllowedService[];
};

/**
 * Compat Step 30.
 *
 * Step 31: la source unique de vérité est dans src/lib/capabilities.ts.
 * Ce fichier reste un wrapper temporaire pour éviter de casser d’éventuels imports.
 */
export function resolveCapabilities(input: CapabilitiesInput): CapabilitiesResult {
  const caps = getCapabilities({
    stack: input.stack === "next" ? "next" : "wordpress",
    hostingType: input.hostingType,
    dockerProfile: input.profile,
    stage: input.stage,
  });

  return {
    services: [
      {
        id: "mail",
        label: "Mail",
        purpose: "Capture des emails en dev (Mailpit) ou envoi via provider.",
        requiredEnvVars: caps.services.mail.requiredEnvVars,
        visible: caps.services.mail.visible,
        enabled: caps.services.mail.enabled,
      },
      {
        id: "redis",
        label: "Redis",
        purpose: "Cache / objets (optionnel).",
        requiredEnvVars: caps.services.redis.requiredEnvVars,
        visible: caps.services.redis.visible,
        enabled: caps.services.redis.enabled,
        disabledReason: caps.services.redis.disabledReason,
      },
      {
        id: "grafana",
        label: "Grafana",
        purpose: "Monitoring (catalogue).",
        requiredEnvVars: caps.services.grafana.requiredEnvVars,
        visible: caps.services.grafana.visible,
        enabled: caps.services.grafana.enabled,
        disabledReason: caps.services.grafana.disabledReason,
      },
      {
        id: "loki",
        label: "Loki",
        purpose: "Logs (catalogue).",
        requiredEnvVars: caps.services.loki.requiredEnvVars,
        visible: caps.services.loki.visible,
        enabled: caps.services.loki.enabled,
        disabledReason: caps.services.loki.disabledReason,
      },
    ],
  };
}
