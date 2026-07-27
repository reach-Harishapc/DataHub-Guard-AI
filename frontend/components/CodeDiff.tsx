"use client";

interface CodeDiffProps {
  originalCode?: string;
  newCode: string;
}

export default function CodeDiff({ originalCode, newCode }: CodeDiffProps) {
  return (
    <div className="rounded-md border border-slate-200 overflow-hidden text-sm bg-slate-900 text-slate-50">
      <div className="flex bg-slate-800 px-4 py-2 border-b border-slate-700">
        <span className="font-mono text-xs text-slate-400">LLM Generated Fix</span>
      </div>
      <div className="p-4 overflow-x-auto whitespace-pre-wrap font-mono">
        {newCode}
      </div>
    </div>
  );
}
