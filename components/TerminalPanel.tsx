"use client";

import { useState } from "react";

const TABS = ["TERMINAL"] as const;
type Tab = (typeof TABS)[number];

export default function TerminalPanel() {
  const [activeTab, setActiveTab] = useState<Tab>("TERMINAL");

  return (
    <div className="flex flex-col h-full" style={{ backgroundColor: "#181818" }}>
      {/* Header */}
      <div
        className="flex items-end shrink-0 h-[28px] px-2 gap-1"
        style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}
      >
        {TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className="relative px-3 h-full text-[11px] font-medium tracking-wide select-none transition-colors"
            style={{
              color: activeTab === tab ? "#ffffff" : "#6b7280",
              borderBottom: activeTab === tab ? "1px solid #007acc" : "1px solid transparent",
            }}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Terminal Body */}
      <div className="flex-1 px-3 py-2 font-mono text-xs overflow-auto" style={{ backgroundColor: "#181818" }}>
        <div className="flex items-center gap-2">
          <span className="text-green-400">→</span>
          <span className="text-zinc-300">portfolio</span>
          <span className="animate-pulse text-zinc-500">▋</span>
        </div>
      </div>
    </div>
  );
}
