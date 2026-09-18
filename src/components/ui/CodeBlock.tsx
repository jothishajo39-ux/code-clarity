import { Check, Copy } from "lucide-react";
import { useState } from "react";

interface CodeBlockProps {
  code: string;
  language?: string;
  showCopy?: boolean;
}

export function CodeBlock({ code, language, showCopy = true }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="group relative">
      {language && (
        <div className="flex items-center justify-between rounded-t-lg border border-b-0 border-secondary-800 bg-surface-200 px-4 py-2">
          <span className="font-mono text-xs text-secondary-500">{language}</span>
          {showCopy && (
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 text-xs text-secondary-500 transition-colors hover:text-primary-400"
            >
              {copied ? (
                <>
                  <Check size={14} /> Copied
                </>
              ) : (
                <>
                  <Copy size={14} /> Copy
                </>
              )}
            </button>
          )}
        </div>
      )}
      <div
        className={`code-block ${language ? "rounded-t-none border-t-0" : ""} ${showCopy && !language ? "pr-12" : ""}`}
      >
        <pre>{code}</pre>
      </div>
      {showCopy && !language && (
        <button
          onClick={handleCopy}
          className="absolute right-3 top-3 flex items-center gap-1.5 rounded-md bg-surface-200 px-2 py-1 text-xs text-secondary-500 opacity-0 transition-all hover:text-primary-400 group-hover:opacity-100"
        >
          {copied ? (
            <>
              <Check size={14} /> Copied
            </>
          ) : (
            <>
              <Copy size={14} /> Copy
            </>
          )}
        </button>
      )}
    </div>
  );
}
