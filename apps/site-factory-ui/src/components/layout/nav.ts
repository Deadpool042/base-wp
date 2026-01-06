export type AppSection = "dashboard" | "projects" | "clients";

export type NavItem = {
  section: AppSection;
  href: string;
  label: string;
  // optionnel : pour cacher des entrées temporairement
  hidden?: boolean;
};

export type ActionRoute = "projects/new" | "clients/new";

export const NAV_ITEMS: NavItem[] = [
  { section: "dashboard", href: "/", label: "Tableau de bord" },
  { section: "clients", href: "/clients", label: "Clients" },
  // { section: "settings", href: "/settings", label: "Settings", hidden: false },
];

export const ROUTE_LABEL: Record<ActionRoute, string> = {
  "projects/new": "Nouveau projet",
  "clients/new": "Nouveau client",
} as const;

export const SECTION_LABEL: Record<AppSection, string> = {
  dashboard: "Tableau de bord",
  projects: "Projets",
  clients: "Clients",
  // settings: "Settings",
};

export const SECTION_HREF: Record<AppSection, string> = {
  dashboard: "/",
  projects: "/projects",
  clients: "/clients",
  // settings: "/settings",
} as const;
