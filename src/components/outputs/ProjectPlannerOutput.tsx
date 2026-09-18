import { Folder, Layers, Target, ListChecks, ArrowRight, Rocket } from "lucide-react";
import type { ProjectPlan } from "@/lib/types";
import { CodeBlock } from "@/components/ui/CodeBlock";

const priorityColors: Record<string, string> = {
  High: "bg-rose-500/10 text-rose-400",
  Medium: "bg-amber-500/10 text-amber-400",
  Low: "bg-primary-500/10 text-primary-400",
};

export function ProjectPlannerOutput({ data }: { data: ProjectPlan }) {
  return (
    <div className="space-y-5 animate-slide-up">
      {/* Title + Summary */}
      <div className="card p-5">
        <div className="mb-3 flex items-center gap-2">
          <Rocket size={18} className="text-primary-400" />
          <h3 className="font-semibold text-white">{data.projectTitle}</h3>
        </div>
        <p className="text-sm leading-relaxed text-secondary-300">{data.summary}</p>
      </div>

      {/* Features */}
      <div className="card p-5">
        <div className="mb-4 flex items-center gap-2">
          <ListChecks size={18} className="text-accent-400" />
          <h3 className="font-semibold text-white">Recommended Features</h3>
        </div>
        <div className="space-y-3">
          {data.features.map((feature, i) => (
            <div
              key={i}
              className="flex items-start justify-between gap-4 rounded-lg border border-secondary-800 bg-surface-200/50 p-3"
            >
              <div className="flex-1">
                <p className="text-sm font-medium text-secondary-200">{feature.name}</p>
                <p className="mt-0.5 text-xs text-secondary-400">{feature.description}</p>
              </div>
              <span className={`badge flex-shrink-0 ${priorityColors[feature.priority]}`}>{feature.priority}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Tech Stack */}
      <div className="card p-5">
        <div className="mb-4 flex items-center gap-2">
          <Layers size={18} className="text-primary-400" />
          <h3 className="font-semibold text-white">Recommended Tech Stack</h3>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          {data.techStack.map((tech, i) => (
            <div key={i} className="rounded-lg border border-secondary-800 bg-surface-200/50 p-3">
              <p className="text-xs font-medium uppercase tracking-wide text-secondary-500">{tech.category}</p>
              <p className="mt-1 text-sm font-semibold text-primary-400">{tech.recommendation}</p>
              <p className="mt-1 text-xs text-secondary-400">{tech.reason}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Milestones */}
      <div className="card p-5">
        <div className="mb-4 flex items-center gap-2">
          <Target size={18} className="text-amber-400" />
          <h3 className="font-semibold text-white">Milestones</h3>
        </div>
        <div className="space-y-4">
          {data.milestones.map((milestone, i) => (
            <div key={i} className="relative pl-6">
              {/* Timeline line */}
              {i < data.milestones.length - 1 && (
                <div className="absolute left-2 top-6 h-full w-px bg-secondary-700" />
              )}
              <div className="absolute left-0 top-1 h-4 w-4 rounded-full border-2 border-primary-500 bg-surface-400" />
              <div className="flex items-center gap-2">
                <h4 className="text-sm font-semibold text-white">{milestone.name}</h4>
                <span className="badge bg-secondary-800 text-secondary-400">{milestone.duration}</span>
              </div>
              <ul className="mt-2 space-y-1.5">
                {milestone.tasks.map((task, j) => (
                  <li key={j} className="flex items-start gap-2 text-xs text-secondary-300">
                    <ArrowRight size={12} className="mt-1 flex-shrink-0 text-secondary-600" />
                    {task}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* File structure */}
      <div className="card p-5">
        <div className="mb-3 flex items-center gap-2">
          <Folder size={18} className="text-accent-400" />
          <h3 className="font-semibold text-white">Suggested File Structure</h3>
        </div>
        <CodeBlock code={data.fileStructure.join("\n")} language="text" />
      </div>

      {/* Next steps */}
      <div className="card border-primary-500/20 bg-primary-500/5 p-5">
        <h3 className="mb-3 font-semibold text-white">Your Next Steps</h3>
        <ol className="space-y-2">
          {data.nextSteps.map((step, i) => (
            <li key={i} className="flex items-start gap-3 text-sm text-secondary-300">
              <span className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-primary-500/20 text-xs font-bold text-primary-400">
                {i + 1}
              </span>
              {step}
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}
