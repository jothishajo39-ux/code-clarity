import {
  AlertTriangle,
  Lightbulb,
  Bug,
  CheckCircle2,
  Shield,
  Code2,
} from "lucide-react";
import type { ErrorExplanation } from "@/lib/types";
import { CodeBlock } from "@/components/ui/CodeBlock";

export function ErrorDecoderOutput({ data }: { data: ErrorExplanation }) {
  return (
    <div className="space-y-5 animate-slide-up">
      {/* Summary */}
      <div className="card border-rose-500/20 bg-rose-500/5 p-5">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-rose-500/10">
            <Bug size={20} className="text-rose-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-white">{data.errorType}</h3>
              <span className="badge bg-rose-500/10 text-rose-400">Error Detected</span>
            </div>
            <p className="mt-1 text-sm text-secondary-300">{data.summary}</p>
          </div>
        </div>
      </div>

      {/* Plain English */}
      <div className="card p-5">
        <div className="mb-3 flex items-center gap-2">
          <Lightbulb size={18} className="text-primary-400" />
          <h3 className="font-semibold text-white">What this means in plain English</h3>
        </div>
        <p className="text-sm leading-relaxed text-secondary-300">{data.plainEnglish}</p>
      </div>

      {/* Likely causes */}
      <div className="card p-5">
        <div className="mb-3 flex items-center gap-2">
          <AlertTriangle size={18} className="text-amber-400" />
          <h3 className="font-semibold text-white">Likely Causes</h3>
        </div>
        <ul className="space-y-2">
          {data.likelyCauses.map((cause, i) => (
            <li key={i} className="flex items-start gap-2.5 text-sm text-secondary-300">
              <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-amber-400" />
              {cause}
            </li>
          ))}
        </ul>
      </div>

      {/* Suggested fix */}
      <div className="card p-5">
        <div className="mb-3 flex items-center gap-2">
          <CheckCircle2 size={18} className="text-accent-400" />
          <h3 className="font-semibold text-white">Suggested Fix</h3>
        </div>
        <p className="mb-4 text-sm leading-relaxed text-secondary-300">{data.suggestedFix}</p>
        <div className="flex items-center gap-2 mb-2">
          <Code2 size={14} className="text-secondary-500" />
          <span className="text-xs font-medium text-secondary-500">Code Example</span>
        </div>
        <CodeBlock code={data.codeSnippet} language={data.language} />
      </div>

      {/* Prevention */}
      <div className="card p-5">
        <div className="mb-3 flex items-center gap-2">
          <Shield size={18} className="text-primary-400" />
          <h3 className="font-semibold text-white">How to prevent this in the future</h3>
        </div>
        <ul className="space-y-2">
          {data.prevention.map((tip, i) => (
            <li key={i} className="flex items-start gap-2.5 text-sm text-secondary-300">
              <CheckCircle2 size={16} className="mt-0.5 flex-shrink-0 text-accent-400" />
              {tip}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
