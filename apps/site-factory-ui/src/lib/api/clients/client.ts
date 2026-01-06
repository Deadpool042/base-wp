import {
  ClientCreateEvt,
  ClientCreateEvtSchema,
  ClientDeleteEvt,
  ClientDeleteEvtSchema,
  type ClientItem,
  type ClientListEvt,
  ClientListEvtSchema,
  ClientShowEvt,
  ClientShowEvtSchema,
} from "@sf/shared/clients";
import { ndjsonLines, parseNDJSONLine } from "@sf/shared/ndjson";
import { ProjectItem } from "@sf/shared/projects";

export type ClientMeta = {
  metaFile?: string;
  id?: string;
  slug?: string;
  name?: string;
  contact?: { email?: string; phone?: string };
  company?: { legalName?: string; country?: string; timezone?: string };
  createdAt?: string;
  updatedAt?: string;
};

export async function apiClientsRename(from: string, to: string) {
  const res = await fetch("/api/clients/rename", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ from, to }),
  });

  if (!res.ok || !res.body) {
    const txt = await res.text().catch(() => "");
    throw new Error(txt || `HTTP ${res.status}`);
  }

  // On renvoie le reader pour que la modal consomme le flux
  return res.body.getReader();
}

function toNumber(v: unknown): number | undefined {
  if (typeof v === "number" && Number.isFinite(v)) return v;
  if (typeof v === "string" && v.trim() !== "") {
    const n = Number(v);
    return Number.isFinite(n) ? n : undefined;
  }
  return undefined;
}

export async function apiClientsList(): Promise<ClientItem[]> {
  const res = await fetch("/api/clients/list", { cache: "no-store" });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  if (!res.body) throw new Error("Flux NDJSON manquant");

  const items: ClientItem[] = [];

  for await (const line of ndjsonLines(res.body)) {
    const base = parseNDJSONLine(line);
    if (!base) continue;

    const parsed = ClientListEvtSchema.safeParse(base);
    if (!parsed.success) continue;

    const evt: ClientListEvt = parsed.data;

    if (evt.type === "error") throw new Error(evt.message);

    if (evt.type === "client") {
      items.push({
        name: evt.name,
        projectsCount: toNumber(evt.projectsCount),
      });
    }
  }

  items.sort((a, b) => a.name.localeCompare(b.name));
  return items;
}

export async function apiClientShow(client: string): Promise<{
  projects: ProjectItem[];
  meta?: ClientMeta;
}> {
  const res = await fetch(`/api/clients/show/${encodeURIComponent(client)}`, { cache: "no-store" });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  if (!res.body) throw new Error("Flux NDJSON manquant");

  const projects: ProjectItem[] = [];
  let meta: ClientMeta | undefined;

  for await (const line of ndjsonLines(res.body)) {
    const base = parseNDJSONLine(line);
    if (!base) continue;

    const parsed = ClientShowEvtSchema.safeParse(base);
    if (!parsed.success) continue;

    const evt: ClientShowEvt = parsed.data;
    if (evt.type === "error") throw new Error(evt.message);

    if (evt.type === "meta") {
      meta = {
        metaFile: evt.meta_file,
        id: evt.id,
        slug: evt.slug,
        name: evt.name,
        contact: {
          email: evt.contact_email,
          phone: evt.contact_phone,
        },
        company: {
          legalName: evt.company_legalName,
          country: evt.company_country,
          timezone: evt.company_timezone,
        },
        createdAt: evt.createdAt,
        updatedAt: evt.updatedAt,
      };
    }

    if (evt.type === "project") {
      // on garantit le format ProjectItem (id/slug/client/site)
      if (evt.id && evt.slug && evt.client && evt.site) {
        projects.push({ id: evt.id, slug: evt.slug, client: evt.client, site: evt.site });
      }
    }
  }

  projects.sort((a, b) => a.site.localeCompare(b.site));
  return { projects, meta };
}

export async function apiClientMeta(client: string): Promise<ClientMeta | undefined> {
  const res = await apiClientShow(client);
  return res.meta;
}

export async function apiClientProjects(client: string): Promise<ProjectItem[]> {
  const res = await apiClientShow(client);
  return res.projects;
}

type CreatedInfo = { client?: string; path?: string };
export type ClientCreateResult = { ok: true; created?: CreatedInfo } | { ok: false; error: string };

export async function apiClientCreate(
  client: string,
  set?: Record<string, string>
): Promise<{
  ok: boolean;
  events: ClientCreateEvt[];
  created?: CreatedInfo;
  error?: string;
}>;

export async function apiClientCreate(
  client: string,
  set?: Record<string, string>
): Promise<{
  ok: boolean;
  events: ClientCreateEvt[];
  created?: CreatedInfo;
  error?: string;
}> {
  const res = await fetch("/api/clients/create", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ client, set }),
  });

  if (!res.ok) {
    const txt = await res.text().catch(() => "");
    return { ok: false, events: [], error: txt || `HTTP ${res.status}` };
  }
  if (!res.body) {
    return { ok: true, events: [] };
  }

  const events: ClientCreateEvt[] = [];
  let created: CreatedInfo | undefined;
  let lastError: string | undefined;

  for await (const line of ndjsonLines(res.body)) {
    const base = parseNDJSONLine(line);
    if (!base) continue;

    const parsed = ClientCreateEvtSchema.safeParse(base);
    if (!parsed.success) continue;

    const evt = parsed.data;
    events.push(evt);

    if (evt.type === "created") created = { client: evt.client, path: evt.path };
    if (evt.type === "error") lastError = evt.message;
  }

  if (lastError) return { ok: false, events, error: lastError };
  return { ok: true, events, created };
}

export async function apiClientsDelete(
  client: string,
  opts?: { force?: boolean; onEvent?: (evt: ClientDeleteEvt) => void }
): Promise<ClientDeleteEvt[]> {
  const res = await fetch("/api/clients/delete", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ client, force: !!opts?.force }),
  });

  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  if (!res.body) throw new Error("Flux NDJSON manquant");

  const events: ClientDeleteEvt[] = [];

  for await (const line of ndjsonLines(res.body)) {
    const base = parseNDJSONLine(line);
    if (!base) continue;

    const parsed = ClientDeleteEvtSchema.safeParse(base);
    if (!parsed.success) continue;

    const evt = parsed.data;

    opts?.onEvent?.(evt);
    events.push(evt);

    if (evt.type === "error") throw new Error(evt.message);
  }

  return events;
}
