import { ThemeToggle } from "@/components/theme-toggle";
import { TopNav } from "@/components/layout/TopNav";
import { ProjectBreadcrumbs } from "@/components/layout/ProjectBreadcrumbs";

export function TopBar() {
  return (
    <header className="border-b sticky top-0 z-50 bg-background/80 backdrop-blur">
      <div className="mx-auto max-w-6xl px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="font-semibold">Site Factory</div>

          <div className="flex items-center gap-3">
            <TopNav />
            <ThemeToggle />
          </div>
        </div>

        <div className="mt-2 text-xs text-muted-foreground">
          <ProjectBreadcrumbs />
        </div>
      </div>
    </header>
  );
}
