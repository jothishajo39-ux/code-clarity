import { useState, type ReactNode } from "react";
import {
  Bug,
  ClipboardList,
  Code2,
  FileText,
  History,
  LayoutDashboard,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import { useNav, type Page } from "@/context/NavContext";
import { useAuth } from "@/context/AuthContext";
import { Logo } from "@/components/ui/Logo";
import type { ToolType } from "@/lib/supabase";

interface SidebarItem {
  label: string;
  icon: typeof Bug;
  page: Page;
  toolType?: ToolType;
}

const NAV_ITEMS: SidebarItem[] = [
  { label: "Dashboard", icon: LayoutDashboard, page: { name: "dashboard" } },
  { label: "Error Decoder", icon: Bug, page: { name: "tool", tool: "error_decoder" }, toolType: "error_decoder" },
  { label: "Project Planner", icon: ClipboardList, page: { name: "tool", tool: "project_planner" }, toolType: "project_planner" },
  { label: "Code Review", icon: Code2, page: { name: "tool", tool: "code_review" }, toolType: "code_review" },
  { label: "Doc Generator", icon: FileText, page: { name: "tool", tool: "doc_generator" }, toolType: "doc_generator" },
  { label: "History", icon: History, page: { name: "history" } },
];

export function DashboardLayout({ children }: { children: ReactNode }) {
  const { page, navigate } = useNav();
  const { user, signOut } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const isActive = (item: SidebarItem) => {
    if (item.page.name === "dashboard" && page.name === "dashboard") return true;
    if (item.page.name === "tool" && page.name === "tool") return page.tool === item.page.tool;
    if (item.page.name === "history" && page.name === "history") return true;
    return false;
  };

  const handleSignOut = async () => {
    await signOut();
    navigate({ name: "landing" });
  };

  const handleNavigate = (p: Page) => {
    navigate(p);
    setSidebarOpen(false);
  };

  return (
    <div className="flex min-h-screen bg-surface-400">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 backdrop-blur-sm md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 z-40 flex h-screen w-64 flex-col border-r border-secondary-800 bg-surface-300 transition-transform duration-300 md:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between border-b border-secondary-800 px-5 py-4">
          <button onClick={() => handleNavigate({ name: "dashboard" })}>
            <Logo size="sm" />
          </button>
          <button
            onClick={() => setSidebarOpen(false)}
            className="text-secondary-500 hover:text-secondary-300 md:hidden"
          >
            <X size={20} />
          </button>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
          {NAV_ITEMS.map((item) => {
            const active = isActive(item);
            return (
              <button
                key={item.label}
                onClick={() => handleNavigate(item.page)}
                className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all ${
                  active
                    ? "bg-primary-500/10 text-primary-400"
                    : "text-secondary-400 hover:bg-secondary-800 hover:text-secondary-200"
                }`}
              >
                <item.icon size={20} className={active ? "text-primary-400" : "text-secondary-500"} />
                {item.label}
                {active && <div className="ml-auto h-1.5 w-1.5 rounded-full bg-primary-400" />}
              </button>
            );
          })}
        </nav>

        <div className="border-t border-secondary-800 p-3">
          <div className="mb-2 flex items-center gap-3 rounded-lg px-3 py-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-primary-500 to-accent-500 text-sm font-semibold text-white">
              {user?.email?.charAt(0).toUpperCase() ?? "U"}
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="truncate text-xs font-medium text-secondary-300">{user?.email}</p>
              <p className="text-xs text-secondary-500">Free plan</p>
            </div>
          </div>
          <button
            onClick={handleSignOut}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-secondary-400 transition-all hover:bg-error-500/10 hover:text-error-500"
          >
            <LogOut size={20} />
            Sign out
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 md:ml-64">
        {/* Mobile header */}
        <header className="sticky top-0 z-20 flex items-center justify-between border-b border-secondary-800 bg-surface-400/80 px-4 py-3 backdrop-blur-lg md:hidden">
          <button onClick={() => setSidebarOpen(true)} className="text-secondary-300">
            <Menu size={24} />
          </button>
          <Logo size="sm" />
        </header>

        <main className="min-h-screen p-4 md:p-8">{children}</main>
      </div>
    </div>
  );
}
