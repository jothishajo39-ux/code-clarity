import { Loader2 } from "lucide-react";

export function LoadingSpinner({ size = 24 }: { size?: number }) {
  return <Loader2 size={size} className="animate-spin text-primary-400" />;
}

export function FullPageLoader() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-surface-400">
      <div className="flex flex-col items-center gap-4">
        <LoadingSpinner size={40} />
        <p className="text-sm text-secondary-500">Loading...</p>
      </div>
    </div>
  );
}
