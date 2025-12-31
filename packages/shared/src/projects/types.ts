export type ProjectItem = {
  id: string;
  slug: string;
  client: string;
  site: string;
};

type Meta = {
  id: string;
  created_at: string;
  updated_at: string;
};

type ProjectSchemaVersion = number;

type ProjectIdentity = {
  client: string;
  site_name: string;
};

type ProjectParams = {
  slug: string;
};

export type ProjectMeta = {
  schema_version: ProjectSchemaVersion;
  meta: Meta;
  identity: ProjectIdentity;
  params: ProjectParams;
};
