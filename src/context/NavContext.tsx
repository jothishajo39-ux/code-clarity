import { createContext, useContext, useState, type ReactNode } from "react";

type Page =
  | { name: "landing" }
  | { name: "login" }
  | { name: "signup" }
  | { name: "dashboard" }
  | { name: "tool"; tool: "error_decoder" | "project_planner" | "code_review" | "doc_generator" }
  | { name: "history" };

interface NavContextValue {
  page: Page;
  navigate: (page: Page) => void;
}

const NavContext = createContext<NavContextValue | undefined>(undefined);

export function NavProvider({ children }: { children: ReactNode }) {
  const [page, setPage] = useState<Page>({ name: "landing" });

  const navigate = (p: Page) => {
    setPage(p);
    window.scrollTo(0, 0);
  };

  return <NavContext.Provider value={{ page, navigate }}>{children}</NavContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useNav() {
  const ctx = useContext(NavContext);
  if (!ctx) throw new Error("useNav must be used within NavProvider");
  return ctx;
}

export type { Page };
