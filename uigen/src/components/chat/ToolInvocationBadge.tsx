import { Loader2 } from "lucide-react";
import type { ToolInvocation } from "ai";

interface ToolInvocationBadgeProps {
  toolInvocation: ToolInvocation;
}

function fileName(path: string): string {
  return path.split("/").pop() || path;
}

export function getToolLabel(toolInvocation: ToolInvocation): string {
  const args = toolInvocation.args as Record<string, string>;

  if (toolInvocation.toolName === "str_replace_editor") {
    const file = args.path ? fileName(args.path) : "";
    switch (args.command) {
      case "create":
        return `Creating ${file}`;
      case "str_replace":
      case "insert":
        return `Editing ${file}`;
      case "view":
        return `Viewing ${file}`;
      default:
        return `Editing ${file}`;
    }
  }

  if (toolInvocation.toolName === "file_manager") {
    const file = args.path ? fileName(args.path) : "";
    switch (args.command) {
      case "delete":
        return `Deleting ${file}`;
      case "rename":
        const newFile = args.new_path ? fileName(args.new_path) : "";
        return `Renaming ${file} → ${newFile}`;
    }
  }

  return toolInvocation.toolName;
}

export function ToolInvocationBadge({ toolInvocation }: ToolInvocationBadgeProps) {
  const isDone = toolInvocation.state === "result" && toolInvocation.result != null;
  const label = getToolLabel(toolInvocation);

  return (
    <div className="inline-flex items-center gap-2 mt-2 px-3 py-1.5 bg-neutral-50 rounded-lg text-xs font-mono border border-neutral-200">
      {isDone ? (
        <div className="w-2 h-2 rounded-full bg-emerald-500" />
      ) : (
        <Loader2 className="w-3 h-3 animate-spin text-blue-600" />
      )}
      <span className="text-neutral-700">{label}</span>
    </div>
  );
}
