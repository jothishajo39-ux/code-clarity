import {
  Bug,
  ClipboardList,
  Code2,
  FileText,
  ArrowRight,
  History,
  Zap,
  TrendingUp,
} from "lucide-react";
import { useNav } from "@/context/NavContext";
import { useAuth } from "@/context/AuthContext";
import type { ToolType } from "@/lib/supabase";
import { useEffect, useState } from "react";
import { supabase, type HistoryItem } from "@/lib/supabase";
import { TOOL_LABELS } from "@/lib/types";

interface ToolCard {
  tool: ToolType;
  icon: typeof Bug;
  title: string;
  description: string;
  color: string;
  bgColor: string;
}

const TOOLS: ToolCard[] = [
  {
    tool: "error_decoder",
    icon: Bug,
    title: "Error Decoder",
    description: "Paste an error or stack trace to get a plain-English explanation and fix.",
    color: "text-rose-400",
    bgColor: "from-rose-500/20 to-orange-500/10",
  },
  {
    tool: "project_planner",
    icon: ClipboardList,
    title: "Project Planner",
    description: "Describe your idea and get a structured plan with features and milestones.",
    color: "text-primary-400",
    bgColor: "from-primary-500/20 to-blue-500/10",
  },
  {
    tool: "code_review",
    icon: Code2,
    title: "Code Review",
    description: "Get instant feedback on bugs, readability, and best practices.",
    color: "text-accent-400",
    bgColor: "from-accent-500/20 to-teal-500/10",
  },
  {
    tool: "doc_generator",
    icon: FileText,
    title: "Doc Generator",
    description: "Turn your code into clean, README-style documentation instantly.",
    color: "text-amber-400",
    bgColor: "from-amber-500/20 to-yellow-500/10",
  },
];

export function DashboardPage() {
  const { navigate } = useNav();
  const { user } = useAuth();
  const [recentItems, setRecentItems] = useState<HistoryItem[]>([]);
  const [loadingRecent, setLoadingRecent] = useState(true);

  useEffect(() => {
    async function loadRecent() {
      const { data } = await supabase
        .from("analysis_history")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(5);

      setRecentItems(data ?? []);
      setLoadingRecent(false);
    }
    loadRecent();
  }, []);

  const firstName = user?.email?.split("@")[0] ?? "Developer";

  return (
    <div className="mx-auto max-w-5xl animate-fade-in">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white md:text-3xl">
          Welcome back, <span className="gradient-text">{firstName}</span>
        </h1>
        <p className="mt-2 text-secondary-400">Pick a tool below to get started, or jump back into a recent analysis.</p>
      </div>

      {/* Stats */}
      <div className="mb-8 grid gap-4 sm:grid-cols-3">
        <div className="card p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-500/10">
              <Zap size={20} className="text-primary-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">4</p>
              <p className="text-xs text-secondary-500">AI Tools</p>
            </div>
          </div>
        </div>
        <div className="card p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent-500/10">
              <TrendingUp size={20} className="text-accent-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{loadingRecent ? "—" : recentItems.length}</p>
              <p className="text-xs text-secondary-500">Recent Analyses</p>
            </div>
          </div>
        </div>
        <div className="card p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-500/10">
              <History size={20} className="text-amber-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">∞</p>
              <p className="text-xs text-secondary-500">Saved History</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tool cards */}
      <h2 className="mb-4 text-lg font-semibold text-white">Your Tools</h2>
      <div className="grid gap-5 md:grid-cols-2">
        {TOOLS.map((tool) => (
          <button
            key={tool.tool}
            onClick={() => navigate({ name: "tool", tool: tool.tool })}
            className="group card relative overflow-hidden p-6 text-left transition-all hover:border-secondary-700 hover:shadow-xl hover:shadow-primary-500/5"
          >
            <div className={`absolute inset-0 bg-gradient-to-br ${tool.bgColor} opacity-0 transition-opacity group-hover:opacity-100`} />
            <div className="relative">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl border border-secondary-800 bg-surface-200">
                <tool.icon size={24} className={tool.color} />
              </div>
              <h3 className="text-lg font-semibold text-white">{tool.title}</h3>
              <p className="mt-2 text-sm text-secondary-400">{tool.description}</p>
              <div className="mt-4 flex items-center gap-1.5 text-sm font-medium text-primary-400 transition-transform group-hover:gap-2.5">
                Open tool <ArrowRight size={16} />
              </div>
            </div>
          </button>
        ))}
      </div>

      {/* Recent history */}
      {recentItems.length > 0 && (
        <div className="mt-10">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-white">Recent Activity</h2>
            <button
              onClick={() => navigate({ name: "history" })}
              className="text-sm text-primary-400 hover:text-primary-300"
            >
              View all
            </button>
          </div>
          <div className="card divide-y divide-secondary-800">
            {recentItems.map((item) => (
              <button
                key={item.id}
                onClick={() => navigate({ name: "tool", tool: item.tool_type })}
                className="flex w-full items-center justify-between px-5 py-3.5 text-left transition-colors hover:bg-secondary-800/50"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-surface-200">
                    {item.tool_type === "error_decoder" && <Bug size={16} className="text-rose-400" />}
                    {item.tool_type === "project_planner" && <ClipboardList size={16} className="text-primary-400" />}
                    {item.tool_type === "code_review" && <Code2 size={16} className="text-accent-400" />}
                    {item.tool_type === "doc_generator" && <FileText size={16} className="text-amber-400" />}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-secondary-200">{item.title}</p>
                    <p className="text-xs text-secondary-500">{TOOL_LABELS[item.tool_type]}</p>
                  </div>
                </div>
                <span className="text-xs text-secondary-500">
                  {new Date(item.created_at).toLocaleDateString()}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
