"use client";

import { FileText, X } from "lucide-react";

export default function EditorPanel() {
  return (
    <div className="flex flex-col h-full" style={{ backgroundColor: "#1e1e1e" }}>
      {/* Tab Bar */}
      <div
        className="flex items-end shrink-0 h-[35px]"
        style={{ backgroundColor: "#191a1b", borderBottom: "1px solid rgba(255,255,255,0.08)" }}
      >
        {/* Active tab */}
        <div
          className="flex items-center gap-1.5 px-3 h-full cursor-pointer select-none"
          style={{
            backgroundColor: "#1e1e1e",
            borderTop: "1px solid #007acc",
            borderRight: "1px solid rgba(255,255,255,0.08)",
          }}
        >
          <FileText size={13} className="text-zinc-400 shrink-0" />
          <span className="text-zinc-300 text-xs">README.md</span>
          <button
            aria-label="Close tab"
            className="ml-1 text-zinc-500 hover:text-zinc-200 rounded p-0.5"
          >
            <X size={11} />
          </button>
        </div>
      </div>

      {/* Editor Body */}
      <div className="flex-1 flex items-center justify-center" style={{ backgroundColor: "#1e1e1e" }}>
        <span className="text-zinc-600 text-sm select-none">
          Select a file to view its contents
        </span>
      </div>
    </div>
  );
}
