import { Code2 } from "lucide-react";

export function Logo({ size = "default" }: { size?: "sm" | "default" | "lg" }) {
  const iconSize = size === "sm" ? 20 : size === "lg" ? 32 : 24;
  const textSize = size === "sm" ? "text-lg" : size === "lg" ? "text-2xl" : "text-xl";

  return (
    <div className="flex items-center gap-2.5">
      <div className="relative">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-primary-500 to-accent-500 shadow-lg shadow-primary-500/20">
          <Code2 size={iconSize} className="text-white" />
        </div>
      </div>
      <span className={`font-bold ${textSize} text-white tracking-tight`}>
        Code<span className="gradient-text">Clarity</span>
      </span>
    </div>
  );
}
