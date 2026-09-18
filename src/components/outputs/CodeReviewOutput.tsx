import { Bug, BookOpen, ThumbsUp, TrendingUp, AlertCircle } from "lucide-react";
import type { CodeReview } from "@/lib/types";

const severityColors: Record<string, string> = {
  High: "bg-rose-500/10 text-rose-400 border-rose-500/20",
  Medium: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  Low: "bg-primary-500/10 text-primary-400 border-primary-500/20",
};

const statusColors: Record<string, string> = {
  Good: "text-accent-400",
  "Needs Work": "text-amber-400",
};

export function CodeReviewOutput({ data }: { data: CodeReview }) {
  const scoreColor =
    data.overallScore >= 80 ? "text-accent-400" : data.overallScore >= 50 ? "text-amber-400" : "text-rose-400";
  const scoreBg =
    data.overallScore >= 80 ? "from-accent-500/20 to-accent-500/5" : data.overallScore >= 50 ? "from-amber-500/20 to-amber-500/5" : "from-rose-500/20 to-rose-500/5";

  return (
    <div className="space-y-5 animate-slide-up">
      {/* Score + Summary */}
      <div className={`card bg-gradient-to-br ${scoreBg} p-5`}>
        <div className="flex items-center gap-5">
          {/* Score circle */}
          <div className="relative flex h-20 w-20 flex-shrink-0 items-center justify-center">
            <svg className="h-20 w-20 -rotate-90" viewBox="0 0 80 80">
              <circle cx="40" cy="40" r="34" fill="none" stroke="currentColor" strokeWidth="6" className="text-secondary-800" />
              <circle
                cx="40"
                cy="40"
                r="34"
                fill="none"
                stroke="currentColor"
                strokeWidth="6"
                strokeLinecap="round"
                className={scoreColor}
                strokeDasharray={`${(data.overallScore / 100) * 213.6} 213.6`}
              />
            </svg>
            <span className={`absolute text-xl font-bold ${scoreColor}`}>{data.overallScore}</span>
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <TrendingUp size={18} className={scoreColor} />
              <h3 className="font-semibold text-white">Code Quality Score</h3>
            </div>
            <p className="mt-1 text-sm text-secondary-300">{data.summary}</p>
          </div>
        </div>
      </div>

      {/* Bugs */}
      {data.bugs.length > 0 && (
        <div className="card p-5">
          <div className="mb-4 flex items-center gap-2">
            <Bug size={18} className="text-rose-400" />
            <h3 className="font-semibold text-white">Issues Found ({data.bugs.length})</h3>
          </div>
          <div className="space-y-3">
            {data.bugs.map((bug, i) => (
              <div key={i} className={`rounded-lg border p-3 ${severityColors[bug.severity]}`}>
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-medium text-secondary-200">{bug.description}</p>
                  <span className="badge flex-shrink-0 bg-transparent text-xs">{bug.severity}</span>
                </div>
                {bug.line && <p className="mt-1 text-xs text-secondary-500">Line: {bug.line}</p>}
                <p className="mt-2 text-xs text-secondary-400">
                  <span className="font-medium text-secondary-300">Fix: </span>
                  {bug.suggestion}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Readability */}
      {data.readability.length > 0 && (
        <div className="card p-5">
          <div className="mb-4 flex items-center gap-2">
            <BookOpen size={18} className="text-primary-400" />
            <h3 className="font-semibold text-white">Readability Notes</h3>
          </div>
          <div className="space-y-3">
            {data.readability.map((item, i) => (
              <div key={i} className="rounded-lg border border-secondary-800 bg-surface-200/50 p-3">
                <p className="text-sm text-secondary-200">{item.issue}</p>
                <p className="mt-1 text-xs text-secondary-400">
                  <span className="font-medium text-secondary-300">Suggestion: </span>
                  {item.suggestion}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Best Practices */}
      <div className="card p-5">
        <div className="mb-4 flex items-center gap-2">
          <ThumbsUp size={18} className="text-accent-400" />
          <h3 className="font-semibold text-white">Best Practices Checklist</h3>
        </div>
        <div className="space-y-2">
          {data.bestPractices.map((bp, i) => (
            <div key={i} className="flex items-center justify-between gap-3 rounded-lg border border-secondary-800 bg-surface-200/50 px-3 py-2.5">
              <div className="flex-1">
                <p className="text-sm text-secondary-200">{bp.practice}</p>
                <p className="mt-0.5 text-xs text-secondary-400">{bp.note}</p>
              </div>
              <span className={`badge flex-shrink-0 text-xs ${statusColors[bp.status]}`}>{bp.status}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Improvements */}
      <div className="card border-primary-500/20 bg-primary-500/5 p-5">
        <div className="mb-3 flex items-center gap-2">
          <AlertCircle size={18} className="text-primary-400" />
          <h3 className="font-semibold text-white">Recommended Improvements</h3>
        </div>
        <ul className="space-y-2">
          {data.improvements.map((imp, i) => (
            <li key={i} className="flex items-start gap-2.5 text-sm text-secondary-300">
              <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-primary-400" />
              {imp}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
