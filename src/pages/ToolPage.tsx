import { useState, useEffect } from "react";
import { Bug, ClipboardList, Code2, FileText, Sparkles, Save, Trash2 } from "lucide-react";
import type { ToolType } from "@/lib/supabase";
import { supabase, type HistoryItem } from "@/lib/supabase";
import { analyze } from "@/lib/aiEngine";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { ErrorBanner } from "@/components/ui/ErrorBanner";
import { ErrorDecoderOutput } from "@/components/outputs/ErrorDecoderOutput";
import { ProjectPlannerOutput } from "@/components/outputs/ProjectPlannerOutput";
import { CodeReviewOutput } from "@/components/outputs/CodeReviewOutput";
import { DocGeneratorOutput } from "@/components/outputs/DocGeneratorOutput";
import { useAuth } from "@/context/AuthContext";

interface ToolConfig {
  icon: typeof Bug;
  title: string;
  subtitle: string;
  placeholder: string;
  buttonText: string;
  inputLanguage: string;
  example: string;
}

const TOOL_CONFIGS: Record<ToolType, ToolConfig> = {
  error_decoder: {
    icon: Bug,
    title: "Error Decoder",
    subtitle: "Paste an error message or stack trace to get a clear explanation and fix.",
    placeholder: "Paste your error message or stack trace here...\n\nExample:\nTypeError: Cannot read properties of undefined (reading 'map')\n    at renderList (App.js:12)\n    at App (App.js:5)",
    buttonText: "Decode Error",
    inputLanguage: "text",
    example: "TypeError: Cannot read properties of undefined (reading 'name')\n    at UserProfile (Profile.js:23)",
  },
  project_planner: {
    icon: ClipboardList,
    title: "Project Planner",
    subtitle: "Describe your project idea and get a structured plan with features, tech stack, and milestones.",
    placeholder: "Describe your project idea here...\n\nExample:\nA task management app where users can create projects, add tasks, set deadlines, and track progress with a kanban board.",
    buttonText: "Generate Plan",
    inputLanguage: "text",
    example: "A recipe sharing platform where users can post recipes, search by ingredients, and save favorites.",
  },
  code_review: {
    icon: Code2,
    title: "Code Review Assistant",
    subtitle: "Paste a code snippet to get feedback on bugs, readability, and best practices.",
    placeholder: "Paste your code here...\n\nfunction getUserData(id) {\n  var data = fetch('/api/users/' + id);\n  return data.json();\n}",
    buttonText: "Review Code",
    inputLanguage: "javascript",
    example: "function getTotal(items) {\n  var total = 0;\n  for (var i = 0; i < items.length; i++) {\n    total = total + items[i].price;\n  }\n  return total;\n}",
  },
  doc_generator: {
    icon: FileText,
    title: "Doc Generator",
    subtitle: "Paste your code or functions to auto-generate README-style documentation.",
    placeholder: "Paste your code or functions here...\n\nfunction calculateTax(amount, rate) {\n  return amount * (rate / 100);\n}\n\nfunction formatPrice(price) {\n  return '$' + price.toFixed(2);\n}",
    buttonText: "Generate Docs",
    inputLanguage: "javascript",
    example: "def calculate_discount(price, discount_percent):\n    discount = price * (discount_percent / 100)\n    return price - discount\n\ndef apply_coupon(price, coupon_code):\n    if coupon_code == 'SAVE10':\n        return price * 0.9\n    return price",
  },
};

export function ToolPage({ tool }: { tool: ToolType }) {
  const config = TOOL_CONFIGS[tool];
  const { user } = useAuth();

  const [input, setInput] = useState("");
  const [result, setResult] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [savedId, setSavedId] = useState<string | null>(null);
  const [loadedFromHistory, setLoadedFromHistory] = useState<HistoryItem | null>(null);

  // Reset state when tool changes
  useEffect(() => {
    setInput("");
    setResult(null);
    setError(null);
    setSaved(false);
    setSavedId(null);
    setLoadedFromHistory(null);
  }, [tool]);

  const handleAnalyze = async () => {
    if (!input.trim()) {
      setError("Please enter some text to analyze.");
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);
    setSaved(false);
    setSavedId(null);

    try {
      const data = await analyze(tool, input);
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleLoadExample = () => {
    setInput(config.example);
  };

  const handleSave = async () => {
    if (!result || !user) return;

    // Derive a short title from the input
    const r = result as Record<string, unknown>;
    const title =
      tool === "error_decoder"
        ? (r.errorType as string) || input.slice(0, 50)
        : tool === "project_planner"
          ? (r.projectTitle as string) || input.slice(0, 50)
          : tool === "code_review"
            ? `Code Review (Score: ${r.overallScore as number})`
            : (r.title as string) || input.slice(0, 50);

    // If loaded from history, update the existing record; otherwise insert
    if (loadedFromHistory) {
      const { error: updateErr } = await supabase
        .from("analysis_history")
        .update({ input_text: input, output_data: result, title })
        .eq("id", loadedFromHistory.id);
      if (updateErr) {
        setError("Failed to save. Please try again.");
        return;
      }
      setSavedId(loadedFromHistory.id);
    } else {
      const { data, error: insertErr } = await supabase
        .from("analysis_history")
        .insert({
          tool_type: tool,
          input_text: input,
          output_data: result,
          title,
        })
        .select("id")
        .single();

      if (insertErr) {
        setError("Failed to save. Please try again.");
        return;
      }
      setSavedId(data.id);
    }

    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const handleDelete = async () => {
    if (!savedId) return;
    await supabase.from("analysis_history").delete().eq("id", savedId);
    setSavedId(null);
    setSaved(false);
  };

  const renderResult = () => {
    if (!result) return null;

    switch (tool) {
      case "error_decoder":
        return <ErrorDecoderOutput data={result as unknown as Parameters<typeof ErrorDecoderOutput>[0]["data"]} />;
      case "project_planner":
        return <ProjectPlannerOutput data={result as unknown as Parameters<typeof ProjectPlannerOutput>[0]["data"]} />;
      case "code_review":
        return <CodeReviewOutput data={result as unknown as Parameters<typeof CodeReviewOutput>[0]["data"]} />;
      case "doc_generator":
        return <DocGeneratorOutput data={result as unknown as Parameters<typeof DocGeneratorOutput>[0]["data"]} />;
      default:
        return null;
    }
  };

  return (
    <div className="mx-auto max-w-4xl animate-fade-in">
      {/* Tool header */}
      <div className="mb-6">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-secondary-800 bg-surface-100">
            <config.icon size={22} className="text-primary-400" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white md:text-2xl">{config.title}</h1>
            <p className="text-sm text-secondary-400">{config.subtitle}</p>
          </div>
        </div>
      </div>

      {/* Input section */}
      <div className="card mb-6 p-5">
        <div className="mb-3 flex items-center justify-between">
          <label className="text-sm font-medium text-secondary-300">Your Input</label>
          <button onClick={handleLoadExample} className="text-xs text-primary-400 hover:text-primary-300">
            Load example
          </button>
        </div>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={config.placeholder}
          rows={10}
          className="input-field resize-y font-mono text-sm"
          disabled={loading}
        />
        <div className="mt-4 flex items-center justify-between">
          <p className="text-xs text-secondary-500">
            {input.length > 0 ? `${input.length} characters` : "Paste your text above to begin"}
          </p>
          <button onClick={handleAnalyze} disabled={loading || !input.trim()} className="btn-primary">
            {loading ? (
              <>
                <LoadingSpinner size={18} /> Analyzing...
              </>
            ) : (
              <>
                <Sparkles size={18} /> {config.buttonText}
              </>
            )}
          </button>
        </div>
      </div>

      {/* Error */}
      {error && <div className="mb-6"><ErrorBanner message={error} /></div>}

      {/* Loading skeleton */}
      {loading && (
        <div className="card flex flex-col items-center justify-center gap-4 p-12 animate-fade-in">
          <LoadingSpinner size={36} />
          <div className="text-center">
            <p className="text-sm font-medium text-secondary-300">AI is analyzing your input...</p>
            <p className="mt-1 text-xs text-secondary-500">This usually takes a few seconds</p>
          </div>
        </div>
      )}

      {/* Result */}
      {result && !loading && (
        <>
          {/* Save bar */}
          {user && (
            <div className="mb-4 flex items-center justify-between rounded-lg border border-secondary-800 bg-surface-100/50 px-4 py-2.5">
              <p className="text-xs text-secondary-400">
                {savedId ? "Saved to your history" : "Save this analysis to review later"}
              </p>
              <div className="flex items-center gap-2">
                {savedId && (
                  <button onClick={handleDelete} className="btn-ghost text-xs text-error-500 hover:bg-error-500/10">
                    <Trash2 size={14} /> Remove
                  </button>
                )}
                <button onClick={handleSave} className="btn-secondary text-xs py-2" disabled={saved && !loadedFromHistory}>
                  <Save size={14} /> {saved ? "Saved!" : savedId ? "Update" : "Save"}
                </button>
              </div>
            </div>
          )}
          {renderResult()}
        </>
      )}
    </div>
  );
}
