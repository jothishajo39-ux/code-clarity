import { AlertCircle } from "lucide-react";

export function ErrorBanner({ message }: { message: string }) {
  return (
    <div className="flex items-start gap-3 rounded-lg border border-error-500/30 bg-error-500/10 px-4 py-3 animate-fade-in">
      <AlertCircle size={20} className="mt-0.5 flex-shrink-0 text-error-500" />
      <div>
        <p className="text-sm font-medium text-error-500">Something went wrong</p>
        <p className="mt-0.5 text-sm text-error-500/80">{message}</p>
      </div>
    </div>
  );
}
