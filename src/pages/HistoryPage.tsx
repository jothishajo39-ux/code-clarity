import { useEffect, useState } from "react";
import {
  Bug,
  ClipboardList,
  Code2,
  FileText,
  History as HistoryIcon,
  Trash2,
  Search,
  ArrowRight,
} from "lucide-react";
import { supabase, type HistoryItem, type ToolType } from "@/lib/supabase";
import { TOOL_LABELS } from "@/lib/types";
import { useNav } from "@/context/NavContext";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { ErrorBanner } from "@/components/ui/ErrorBanner";

const toolIcons: Record<ToolType, typeof Bug> = {
  error_decoder: Bug,
  project_planner: ClipboardList,
  code_review: Code2,
  doc_generator: FileText,
};

const toolColors: Record<ToolType, string> = {
  error_decoder: "text-rose-400 bg-rose-500/10",
  project_planner: "text-primary-400 bg-primary-500/10",
  code_review: "text-accent-400 bg-accent-500/10",
  doc_generator: "text-amber-400 bg-amber-500/10",
};

export function HistoryPage() {
  const { navigate } = useNav();
  const [items, setItems] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<ToolType | "all">("all");
  const [search, setSearch] = useState("");

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("analysis_history")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      setError("Failed to load history. Please try again.");
    } else {
      setItems(data ?? []);
    }
    setLoading(false);
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("analysis_history").delete().eq("id", id);
    if (error) {
      setError("Failed to delete item.");
      return;
    }
    setItems(items.filter((item) => item.id !== id));
  };

  const filtered = items.filter((item) => {
    if (filter !== "all" && item.tool_type !== filter) return false;
    if (search && !item.title.toLowerCase().includes(search.toLowerCase()) && !item.input_text.toLowerCase().includes(search.toLowerCase()))
      return false;
    return true;
  });

  const filterOptions: { value: ToolType | "all"; label: string }[] = [
    { value: "all", label: "All" },
    { value: "error_decoder", label: "Error Decoder" },
    { value: "project_planner", label: "Project Planner" },
    { value: "code_review", label: "Code Review" },
    { value: "doc_generator", label: "Doc Generator" },
  ];

  return (
    <div className="mx-auto max-w-4xl animate-fade-in">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-secondary-800 bg-surface-100">
            <HistoryIcon size={22} className="text-primary-400" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white md:text-2xl">History</h1>
            <p className="text-sm text-secondary-400">All your saved analyses in one place</p>
          </div>
        </div>
      </div>

      {error && <div className="mb-4"><ErrorBanner message={error} /></div>}

      {/* Search + filters */}
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary-500" />
          <input
            type="text"
            placeholder="Search history..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-field py-2.5 pl-10 text-sm"
          />
        </div>
        <div className="flex gap-1.5 overflow-x-auto">
          {filterOptions.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setFilter(opt.value)}
              className={`flex-shrink-0 rounded-lg px-3 py-2 text-xs font-medium transition-all ${
                filter === opt.value
                  ? "bg-primary-500/10 text-primary-400"
                  : "text-secondary-400 hover:bg-secondary-800 hover:text-secondary-200"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* List */}
      {loading ? (
        <div className="flex justify-center py-20">
          <LoadingSpinner size={32} />
        </div>
      ) : filtered.length === 0 ? (
        <div className="card flex flex-col items-center justify-center gap-4 py-16 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-surface-200">
            <HistoryIcon size={28} className="text-secondary-600" />
          </div>
          <div>
            <p className="font-medium text-secondary-300">No saved analyses yet</p>
            <p className="mt-1 text-sm text-secondary-500">
              Run a tool and save your results to see them here
            </p>
          </div>
          <button onClick={() => navigate({ name: "dashboard" })} className="btn-primary mt-2">
            Go to tools <ArrowRight size={16} />
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((item) => {
            const Icon = toolIcons[item.tool_type];
            return (
              <div
                key={item.id}
                className="group card flex items-center gap-4 p-4 transition-all hover:border-secondary-700"
              >
                <div className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg ${toolColors[item.tool_type]}`}>
                  <Icon size={20} />
                </div>
                <button
                  onClick={() => navigate({ name: "tool", tool: item.tool_type })}
                  className="flex-1 text-left"
                >
                  <p className="text-sm font-medium text-secondary-200">{item.title}</p>
                  <div className="mt-0.5 flex items-center gap-2 text-xs text-secondary-500">
                    <span>{TOOL_LABELS[item.tool_type]}</span>
                    <span>•</span>
                    <span>{new Date(item.created_at).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" })}</span>
                  </div>
                </button>
                <button
                  onClick={() => handleDelete(item.id)}
                  className="flex-shrink-0 rounded-lg p-2 text-secondary-500 opacity-0 transition-all hover:bg-error-500/10 hover:text-error-500 group-hover:opacity-100"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
