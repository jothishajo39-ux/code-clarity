import { FileText, Download, Package, FunctionSquare, Lightbulb, List } from "lucide-react";
import type { GeneratedDocs } from "@/lib/types";
import { CodeBlock } from "@/components/ui/CodeBlock";
import { useState } from "react";

export function DocGeneratorOutput({ data }: { data: GeneratedDocs }) {
  const [copiedAll, setCopiedAll] = useState(false);

  // Build a markdown version for download/copy
  const buildMarkdown = () => {
    let md = `# ${data.title}\n\n`;
    md += `## Description\n\n${data.description}\n\n`;
    md += `## Installation\n\n\`\`\`bash\n${data.installation}\n\`\`\`\n\n`;
    md += `## Usage\n\n\`\`\`\n${data.usage}\n\`\`\`\n\n`;

    if (data.functions.length > 0) {
      md += `## Functions\n\n`;
      data.functions.forEach((fn) => {
        md += `### \`${fn.name}()\`\n\n`;
        md += `${fn.description}\n\n`;
        if (fn.params.length > 0) {
          md += `**Parameters:**\n\n`;
          fn.params.forEach((p) => {
            md += `- \`${p.name}\` (\`${p.type}\`): ${p.description}\n`;
          });
          md += `\n`;
        }
        md += `**Returns:** ${fn.returns}\n\n`;
        md += `**Example:**\n\`\`\`\n${fn.example}\n\`\`\`\n\n`;
      });
    }

    md += `## Code Structure\n\n${data.codeStructure}\n\n`;

    if (data.dependencies.length > 0) {
      md += `## Dependencies\n\n`;
      data.dependencies.forEach((dep) => {
        md += `- ${dep}\n`;
      });
      md += `\n`;
    }

    md += `## Notes\n\n`;
    data.notes.forEach((note) => {
      md += `- ${note}\n`;
    });

    return md;
  };

  const handleCopyMarkdown = async () => {
    await navigator.clipboard.writeText(buildMarkdown());
    setCopiedAll(true);
    setTimeout(() => setCopiedAll(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([buildMarkdown()], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "README.md";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-5 animate-slide-up">
      {/* Action bar */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <FileText size={18} className="text-amber-400" />
          <h3 className="font-semibold text-white">{data.title}</h3>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={handleCopyMarkdown} className="btn-ghost text-xs">
            {copiedAll ? "Copied!" : "Copy MD"}
          </button>
          <button onClick={handleDownload} className="btn-secondary text-xs py-2">
            <Download size={14} /> Download
          </button>
        </div>
      </div>

      {/* Description */}
      <div className="card p-5">
        <h4 className="mb-2 text-sm font-semibold text-secondary-300">Description</h4>
        <p className="text-sm leading-relaxed text-secondary-400">{data.description}</p>
      </div>

      {/* Installation */}
      <div className="card p-5">
        <div className="mb-3 flex items-center gap-2">
          <Package size={16} className="text-primary-400" />
          <h4 className="text-sm font-semibold text-secondary-300">Installation</h4>
        </div>
        <CodeBlock code={data.installation} language="bash" />
      </div>

      {/* Usage */}
      <div className="card p-5">
        <h4 className="mb-3 text-sm font-semibold text-secondary-300">Usage</h4>
        <CodeBlock code={data.usage} language="javascript" />
      </div>

      {/* Functions */}
      {data.functions.length > 0 && (
        <div className="card p-5">
          <div className="mb-4 flex items-center gap-2">
            <FunctionSquare size={16} className="text-accent-400" />
            <h4 className="text-sm font-semibold text-secondary-300">Functions & API</h4>
          </div>
          <div className="space-y-4">
            {data.functions.map((fn, i) => (
              <div key={i} className="rounded-lg border border-secondary-800 bg-surface-200/50 p-4">
                <p className="font-mono text-sm font-semibold text-primary-400">{fn.name}()</p>
                <p className="mt-2 text-sm text-secondary-400">{fn.description}</p>

                {fn.params.length > 0 && (
                  <div className="mt-3">
                    <p className="mb-1.5 text-xs font-medium uppercase tracking-wide text-secondary-500">Parameters</p>
                    <div className="space-y-1.5">
                      {fn.params.map((param, j) => (
                        <div key={j} className="flex items-baseline gap-2 text-xs">
                          <code className="rounded bg-surface-300 px-1.5 py-0.5 font-mono text-primary-400">{param.name}</code>
                          <span className="font-mono text-secondary-500">{param.type}</span>
                          <span className="text-secondary-400">— {param.description}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="mt-3 flex items-baseline gap-2 text-xs">
                  <span className="font-medium text-secondary-500">Returns:</span>
                  <span className="text-secondary-300">{fn.returns}</span>
                </div>

                <div className="mt-3">
                  <p className="mb-1.5 text-xs font-medium uppercase tracking-wide text-secondary-500">Example</p>
                  <CodeBlock code={fn.example} language="javascript" showCopy={false} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Code structure */}
      <div className="card p-5">
        <div className="mb-2 flex items-center gap-2">
          <List size={16} className="text-secondary-500" />
          <h4 className="text-sm font-semibold text-secondary-300">Code Structure</h4>
        </div>
        <p className="text-sm text-secondary-400">{data.codeStructure}</p>
      </div>

      {/* Dependencies */}
      {data.dependencies.length > 0 && (
        <div className="card p-5">
          <h4 className="mb-3 text-sm font-semibold text-secondary-300">Dependencies</h4>
          <div className="flex flex-wrap gap-2">
            {data.dependencies.map((dep, i) => (
              <span key={i} className="badge bg-surface-300 font-mono text-secondary-300">
                {dep}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Notes */}
      <div className="card border-amber-500/20 bg-amber-500/5 p-5">
        <div className="mb-3 flex items-center gap-2">
          <Lightbulb size={16} className="text-amber-400" />
          <h4 className="text-sm font-semibold text-secondary-300">Notes</h4>
        </div>
        <ul className="space-y-2">
          {data.notes.map((note, i) => (
            <li key={i} className="flex items-start gap-2.5 text-sm text-secondary-400">
              <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-amber-400" />
              {note}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
