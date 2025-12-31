// apps/site-factory-ui/src/app/projects/layout.tsx
import type { ReactNode } from "react";

import { ProjectsProvider } from "@/features/projects/ProjectsProvider";
import { ProjectsSelectionProvider } from "@/features/projects/ProjectsSelectionProvider";

export default function ProjectsLayout({
  children,
  list,
  details,
}: {
  children: ReactNode;
  list: ReactNode;
  details: ReactNode;
}) {
  return (
    <ProjectsProvider>
      <ProjectsSelectionProvider>
        <div className="space-y-6">
          {children}

          <div className="grid gap-6 md:grid-cols-2">
            {list}
            {details}
          </div>
        </div>
      </ProjectsSelectionProvider>
    </ProjectsProvider>
  );
}
