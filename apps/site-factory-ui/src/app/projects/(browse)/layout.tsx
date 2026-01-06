// app/projects/layout.tsx
import { ProjectsHero } from "@/features/projects/components/ProjectsHero";
import { ProjectsProvider } from "@/features/projects/ProjectsProvider";

export default function ProjectsLayout({
  list,
  details,
}: {
  list: React.ReactNode;
  details: React.ReactNode;
}) {
  return (
    <>
    {/* <ProjectsProvider> */}
      <div className="-my-6 py-6 flex flex-col gap-6 h-[calc(100svh-var(--sf-topbar-h,0px))] overflow-hidden">
        <ProjectsHero />

        <div className="grid grid-cols-1 gap-6 md:grid-cols-[380px_1fr] grid-rows-[minmax(0,1fr)] flex-1 min-h-0">
          <aside className="min-w-0 min-h-0 h-full">{list}</aside>
          <section className="min-w-0 min-h-0 h-full">{details}</section>
        </div>
      </div>
      {/* </ProjectsProvider> */}
    </>
  );
}
