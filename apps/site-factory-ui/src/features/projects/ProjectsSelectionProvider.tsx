"use client";

import * as React from "react";

type State = {
  selectedSlug: string | null;
  selectSlug: (slug: string | null) => void;
};

const Ctx = React.createContext<State | null>(null);

export function ProjectsSelectionProvider({ children }: { children: React.ReactNode }) {
  const [selectedSlug, setSelectedSlug] = React.useState<string | null>(null);

  const selectSlug = React.useCallback((slug: string | null) => {
    setSelectedSlug(prev => (prev === slug ? prev : slug));
  }, []);

  const value: State = { selectedSlug, selectSlug };
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useProjectsSelection() {
  const ctx = React.useContext(Ctx);
  if (!ctx) throw new Error("useProjectsSelection must be used within ProjectsSelectionProvider");
  return ctx;
}
