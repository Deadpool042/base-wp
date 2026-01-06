"use client";

import * as React from "react";
import { ThemeToggle } from "@/components/theme-toggle";
import { TopNav } from "@/components/layout/TopNav";
import { AppBreadcrumbs } from "./AppBreadcrumbs";

export function TopBar() {
  const ref = React.useRef<HTMLElement | null>(null);

  React.useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;

    const update = () => {
      const h = el.getBoundingClientRect().height;
      document.documentElement.style.setProperty("--sf-topbar-h", `${h}px`);
    };

    update();

    const ro = new ResizeObserver(update);
    ro.observe(el);

    return () => {
      ro.disconnect();
    };
  }, []);

  return (
    <header
      ref={ref}
      className="border-b sticky top-0 z-50 bg-background/80 backdrop-blur">
      <div className="mx-auto max-w-6xl px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="font-semibold">Site Factory</div>

          <div className="flex items-center gap-3">
            <TopNav />
            <ThemeToggle />
          </div>
        </div>

        <div className="mt-2 text-xs text-muted-foreground">
          <AppBreadcrumbs />
        </div>
      </div>
    </header>
  );
}
