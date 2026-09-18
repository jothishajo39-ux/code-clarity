import { useState, type FormEvent } from "react";
import { ArrowLeft, Mail, Lock, User } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useNav } from "@/context/NavContext";
import { Logo } from "@/components/ui/Logo";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { ErrorBanner } from "@/components/ui/ErrorBanner";

type Mode = "login" | "signup";

export function AuthPage({ mode }: { mode: Mode }) {
  const { signIn, signUp } = useAuth();
  const { navigate } = useNav();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const isSignup = mode === "signup";

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);
    setLoading(true);

    if (password.length < 6) {
      setError("Password must be at least 6 characters long.");
      setLoading(false);
      return;
    }

    if (isSignup) {
      const { error } = await signUp(email, password);
      if (error) {
        setError(error);
      } else {
        setSuccessMsg("Account created! You can now log in.");
        setTimeout(() => navigate({ name: "login" }), 1500);
      }
    } else {
      const { error } = await signIn(email, password);
      if (error) {
        setError(error);
      } else {
        navigate({ name: "dashboard" });
      }
    }

    setLoading(false);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-surface-400 px-6">
      {/* Background glow */}
      <div className="absolute left-1/2 top-1/4 h-[400px] w-[500px] -translate-x-1/2 rounded-full bg-primary-500/10 blur-[120px]" />

      <div className="relative w-full max-w-md animate-slide-up">
        <button
          onClick={() => navigate({ name: "landing" })}
          className="mb-6 flex items-center gap-2 text-sm text-secondary-500 transition-colors hover:text-secondary-300"
        >
          <ArrowLeft size={16} /> Back to home
        </button>

        <div className="card p-8">
          <div className="mb-8 flex flex-col items-center">
            <Logo size="lg" />
            <h1 className="mt-6 text-2xl font-bold text-white">
              {isSignup ? "Create your account" : "Welcome back"}
            </h1>
            <p className="mt-2 text-sm text-secondary-400">
              {isSignup
                ? "Start coding with clarity today"
                : "Log in to access your tools and history"}
            </p>
          </div>

          {error && <div className="mb-4"><ErrorBanner message={error} /></div>}
          {successMsg && (
            <div className="mb-4 rounded-lg border border-accent-500/30 bg-accent-500/10 px-4 py-3 text-sm text-accent-400 animate-fade-in">
              {successMsg}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-secondary-300">Email</label>
              <div className="relative">
                <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary-500" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="input-field pl-10"
                />
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-secondary-300">Password</label>
              <div className="relative">
                <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary-500" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  className="input-field pl-10"
                />
              </div>
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full py-3">
              {loading ? (
                <LoadingSpinner size={20} />
              ) : (
                <>
                  {isSignup ? (
                    <>
                      <User size={18} /> Create account
                    </>
                  ) : (
                    <>
                      <Lock size={18} /> Log in
                    </>
                  )}
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-secondary-400">
            {isSignup ? (
              <>
                Already have an account?{" "}
                <button
                  onClick={() => navigate({ name: "login" })}
                  className="font-medium text-primary-400 hover:text-primary-300"
                >
                  Log in
                </button>
              </>
            ) : (
              <>
                Don't have an account?{" "}
                <button
                  onClick={() => navigate({ name: "signup" })}
                  className="font-medium text-primary-400 hover:text-primary-300"
                >
                  Sign up free
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
