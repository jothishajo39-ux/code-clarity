import {
  Bug,
  ClipboardList,
  Code2,
  FileText,
  ArrowRight,
  Zap,
  CheckCircle2,
  Layers,
  Sparkles,
} from "lucide-react";
import { useNav } from "@/context/NavContext";
import { Logo } from "@/components/ui/Logo";
import { useAuth } from "@/context/AuthContext";

export function LandingPage() {
  const { navigate } = useNav();
  const { user } = useAuth();

  const tools = [
    {
      icon: Bug,
      title: "Error Decoder",
      description: "Paste any error or stack trace. Get a plain-English explanation, likely causes, and a code snippet to fix it.",
      color: "from-rose-500 to-orange-500",
    },
    {
      icon: ClipboardList,
      title: "Project Planner",
      description: "Describe your project idea. Get a structured breakdown with features, tech stack, milestones, and a file structure.",
      color: "from-primary-500 to-blue-500",
    },
    {
      icon: Code2,
      title: "Code Review Assistant",
      description: "Paste a code snippet. Get feedback on bugs, readability, and best practices with a quality score.",
      color: "from-accent-500 to-teal-500",
    },
    {
      icon: FileText,
      title: "Doc Generator",
      description: "Paste your code or functions. Auto-generate clean, README-style documentation in seconds.",
      color: "from-amber-500 to-yellow-500",
    },
  ];

  const problems = [
    "Wasting hours deciphering cryptic error messages",
    "Staring at a blank screen, unsure how to start a new project",
    "Wondering if your code follows best practices",
    "Dreading writing documentation for your functions",
  ];

  const handleCta = () => {
    if (user) {
      navigate({ name: "dashboard" });
    } else {
      navigate({ name: "signup" });
    }
  };

  return (
    <div className="min-h-screen bg-surface-400">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 border-b border-secondary-800/50 bg-surface-400/80 backdrop-blur-lg">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Logo />
          <div className="flex items-center gap-3">
            <button onClick={() => navigate({ name: "login" })} className="btn-ghost">
              Log in
            </button>
            <button onClick={() => navigate({ name: "signup" })} className="btn-primary">
              Get started free
            </button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-primary-950/20 via-surface-400 to-surface-400" />
        <div className="absolute left-1/2 top-0 h-[400px] w-[600px] -translate-x-1/2 rounded-full bg-primary-500/10 blur-[120px]" />

        <div className="relative mx-auto max-w-4xl px-6 pt-20 pb-24 text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-secondary-800 bg-surface-100/50 px-4 py-1.5 text-sm text-secondary-400 animate-fade-in">
            <Sparkles size={16} className="text-primary-400" />
            AI-powered developer productivity
          </div>

          <h1 className="text-5xl font-bold leading-tight tracking-tight text-white md:text-6xl animate-slide-up">
            Stop fighting your code.
            <br />
            <span className="gradient-text">Start understanding it.</span>
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-lg text-secondary-400 animate-slide-up" style={{ animationDelay: "0.1s" }}>
            CodeClarity brings four essential developer tools into one unified workflow — decode errors,
            plan projects, review code, and generate docs, all powered by AI.
          </p>

          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row animate-slide-up" style={{ animationDelay: "0.2s" }}>
            <button onClick={handleCta} className="btn-primary px-6 py-3 text-base">
              Start building smarter
              <ArrowRight size={18} />
            </button>
            <button onClick={() => navigate({ name: "login" })} className="btn-secondary px-6 py-3 text-base">
              I already have an account
            </button>
          </div>
        </div>
      </section>

      {/* Problem section */}
      <section className="mx-auto max-w-4xl px-6 py-20">
        <div className="text-center">
          <span className="badge bg-error-500/10 text-error-500">The Problem</span>
          <h2 className="mt-4 text-3xl font-bold text-white">Beginners waste time juggling separate tools</h2>
          <p className="mt-4 text-secondary-400">
            Every developer knows the frustration. You hit a wall and spend more time context-switching
            between tools than actually writing code.
          </p>
        </div>

        <div className="mt-12 grid gap-4 sm:grid-cols-2">
          {problems.map((problem, i) => (
            <div
              key={i}
              className="flex items-start gap-3 rounded-lg border border-secondary-800 bg-surface-100/50 p-5 animate-slide-up"
              style={{ animationDelay: `${i * 0.1}s` }}
            >
              <div className="mt-0.5 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-error-500/10">
                <span className="text-sm text-error-500">✕</span>
              </div>
              <p className="text-secondary-300">{problem}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Solution section */}
      <section className="border-y border-secondary-800/50 bg-surface-300/30">
        <div className="mx-auto max-w-5xl px-6 py-20">
          <div className="text-center">
            <span className="badge bg-accent-500/10 text-accent-400">The Solution</span>
            <h2 className="mt-4 text-3xl font-bold text-white">One unified AI workflow</h2>
            <p className="mt-4 text-secondary-400">
              Four powerful tools. One clean interface. Everything you need to go from confused to confident.
            </p>
          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-2">
            {tools.map((tool, i) => (
              <div
                key={i}
                className="group card p-6 transition-all hover:border-secondary-700 hover:shadow-xl hover:shadow-primary-500/5 animate-slide-up"
                style={{ animationDelay: `${i * 0.1}s` }}
              >
                <div className={`mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${tool.color} shadow-lg`}>
                  <tool.icon size={24} className="text-white" />
                </div>
                <h3 className="text-lg font-semibold text-white">{tool.title}</h3>
                <p className="mt-2 text-sm text-secondary-400">{tool.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="mx-auto max-w-4xl px-6 py-20">
        <div className="text-center">
          <span className="badge bg-primary-500/10 text-primary-400">How It Works</span>
          <h2 className="mt-4 text-3xl font-bold text-white">Simple as paste, click, understand</h2>
        </div>

        <div className="mt-12 grid gap-8 md:grid-cols-3">
          {[
            { icon: Layers, step: "1", title: "Paste your input", desc: "Error message, project idea, code snippet, or functions" },
            { icon: Zap, step: "2", title: "Click analyze", desc: "AI processes your input and structures the output" },
            { icon: CheckCircle2, step: "3", title: "Get clarity", desc: "Read the formatted results and apply the insights" },
          ].map((item, i) => (
            <div key={i} className="relative text-center animate-slide-up" style={{ animationDelay: `${i * 0.15}s` }}>
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl border border-secondary-800 bg-surface-100">
                <item.icon size={28} className="text-primary-400" />
              </div>
              <div className="mb-2 text-xs font-bold text-primary-400">STEP {item.step}</div>
              <h3 className="font-semibold text-white">{item.title}</h3>
              <p className="mt-1 text-sm text-secondary-400">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-4xl px-6 py-20">
        <div className="card relative overflow-hidden p-10 text-center md:p-16">
          <div className="absolute inset-0 bg-gradient-to-br from-primary-500/10 to-accent-500/10" />
          <div className="relative">
            <h2 className="text-3xl font-bold text-white">Ready to code with clarity?</h2>
            <p className="mt-4 text-secondary-400">
              Join CodeClarity and turn your development struggles into structured solutions.
            </p>
            <button onClick={handleCta} className="mt-8 btn-primary px-8 py-3 text-base">
              Get started free
              <ArrowRight size={18} />
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-secondary-800/50">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-8">
          <Logo size="sm" />
          <p className="text-sm text-secondary-500">AI-powered developer productivity</p>
        </div>
      </footer>
    </div>
  );
}
