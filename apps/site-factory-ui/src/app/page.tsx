import type { ReactNode } from "react";

export default function Home({
  projects,
  health,
  activity,
}: {
  projects: ReactNode;
  health: ReactNode;
  activity: ReactNode;
}) {
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold">Tableau de bord</h1>
        <p className="text-sm text-muted-foreground">Vue globale (projets, services, activité).</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {projects}
        {health}
      </div>

      <div>{activity}</div>
    </div>
  );
}
