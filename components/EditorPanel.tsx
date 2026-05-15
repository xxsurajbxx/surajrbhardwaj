"use client";

import { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import { FileText, X } from "lucide-react";

interface OpenTab {
  name: string;
  path: string;
}

interface EditorPanelProps {
  openTabs: OpenTab[];
  activeTab: string | null;
  onTabClick: (path: string) => void;
  onTabClose: (path: string) => void;
}

export default function EditorPanel({ openTabs, activeTab, onTabClick, onTabClose }: EditorPanelProps) {
  const [cache, setCache] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!activeTab || cache[activeTab] !== undefined) return;
    const path = activeTab;
    fetch(path)
      .then((r) => r.text())
      .then((text) => setCache((prev) => ({ ...prev, [path]: text })))
      .catch(() => setCache((prev) => ({ ...prev, [path]: "# Error\nCould not load this file." })));
  }, [activeTab, cache]);

  const content = activeTab ? (cache[activeTab] ?? "") : "";
  const loading = !!activeTab && cache[activeTab] === undefined;

  return (
    <div className="flex flex-col h-full" style={{ backgroundColor: "#1e1e1e" }}>
      {/* Tab Bar */}
      <div
        className="flex items-end shrink-0 h-[35px] overflow-x-auto tab-bar"
        style={{ backgroundColor: "#191a1b", borderBottom: "1px solid rgba(255,255,255,0.08)" }}
      >
        {openTabs.length === 0 ? (
          <div className="h-full" />
        ) : (
          openTabs.map((tab) => {
            const isActive = tab.path === activeTab;
            return (
              <div
                key={tab.path}
                onClick={() => onTabClick(tab.path)}
                className="flex items-center gap-1.5 px-3 h-full cursor-pointer select-none shrink-0 group"
                style={{
                  backgroundColor: isActive ? "#1e1e1e" : "#191a1b",
                  borderTop: isActive ? "1px solid #007acc" : "1px solid transparent",
                  borderRight: "1px solid rgba(255,255,255,0.08)",
                }}
              >
                <FileText size={13} className="text-zinc-400 shrink-0" />
                <span className={`text-xs ${isActive ? "text-zinc-300" : "text-zinc-500 group-hover:text-zinc-300"}`}>
                  {tab.name}
                </span>
                <button
                  aria-label="Close tab"
                  onClick={(e) => { e.stopPropagation(); onTabClose(tab.path); }}
                  className="ml-1 text-zinc-600 hover:text-zinc-200 rounded p-0.5 cursor-pointer"
                >
                  <X size={11} />
                </button>
              </div>
            );
          })
        )}
      </div>

      {/* Editor Body */}
      <div className="flex-1 overflow-y-auto px-8 py-6" style={{ backgroundColor: "#1e1e1e" }}>
        {!activeTab ? (
          <div className="h-full flex items-center justify-center">
            <span className="text-zinc-600 text-sm select-none">
              Double-click a file in the explorer to open it
            </span>
          </div>
        ) : loading ? (
          <div className="h-full flex items-center justify-center">
            <span className="text-zinc-600 text-sm select-none">Loading...</span>
          </div>
        ) : (
          <div className="max-w-3xl">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              rehypePlugins={[rehypeRaw]}
              components={{
                h1: ({ children, style }) => <h1 className="text-2xl font-bold text-zinc-100 mb-4 mt-6" style={style}>{children}</h1>,
                h2: ({ children }) => <h2 className="text-xl font-semibold text-zinc-100 mb-3 mt-6">{children}</h2>,
                h3: ({ children }) => <h3 className="text-lg font-semibold text-zinc-200 mb-2 mt-4">{children}</h3>,
                p: ({ children, style }) => <p className={`text-zinc-300 text-sm leading-relaxed${style ? "" : " mb-4"}`} style={style}>{children}</p>,
                a: ({ href, children }) => <a href={href} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">{children}</a>,
                ul: ({ children }) => <ul className="list-disc list-outside pl-5 mb-4 space-y-1 text-zinc-300 text-sm">{children}</ul>,
                ol: ({ children }) => <ol className="list-decimal list-outside pl-5 mb-4 space-y-1 text-zinc-300 text-sm">{children}</ol>,
                li: ({ children }) => <li className="leading-relaxed">{children}</li>,
                code: ({ children, className }) => {
                  const isBlock = className?.includes("language-");
                  return isBlock
                    ? <code className="block bg-zinc-800 text-green-300 font-mono text-xs rounded p-4 mb-4 overflow-x-auto">{children}</code>
                    : <code className="bg-zinc-800 text-green-300 font-mono text-xs rounded px-1.5 py-0.5">{children}</code>;
                },
                pre: ({ children }) => <pre className="mb-4">{children}</pre>,
                blockquote: ({ children }) => <blockquote className="border-l-4 border-zinc-600 pl-4 text-zinc-400 italic mb-4">{children}</blockquote>,
                hr: () => <hr className="border-zinc-700 my-6" />,
                strong: ({ children }) => <strong className="text-zinc-100 font-semibold">{children}</strong>,
                em: ({ children }) => <em className="text-zinc-300 italic">{children}</em>,
                table: ({ children }) => <table className="w-full text-sm text-zinc-300 mb-4 border-collapse">{children}</table>,
                th: ({ children }) => <th className="text-left px-3 py-2 text-zinc-100 font-semibold border-b border-zinc-700">{children}</th>,
                td: ({ children }) => <td className="px-3 py-2 border-b border-zinc-800">{children}</td>,
              }}
            >
              {content}
            </ReactMarkdown>
          </div>
        )}
      </div>
    </div>
  );
}
