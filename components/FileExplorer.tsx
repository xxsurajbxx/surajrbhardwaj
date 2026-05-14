"use client";

import { useState } from "react";
import {
  ChevronRight,
  ChevronDown,
  Folder,
  FolderOpen,
  FileText,
  FileCode,
} from "lucide-react";
import filesData from "@/data/files.json";

interface FileNode {
  name: string;
  type: "file" | "folder";
  path?: string;
  children?: FileNode[];
}

interface FileExplorerProps {
  onFileOpen: (name: string, path: string) => void;
}

function fileIcon(name: string) {
  if (name.endsWith(".tsx") || name.endsWith(".ts") || name.endsWith(".js"))
    return <FileCode size={14} className="text-blue-400 shrink-0" />;
  return <FileText size={14} className="text-zinc-400 shrink-0" />;
}

const BASE_INDENT = 8;
const LEVEL_INDENT = 12;

function TreeNode({
  node,
  depth,
  onFileOpen,
}: {
  node: FileNode;
  depth: number;
  onFileOpen: (name: string, path: string) => void;
}) {
  const [open, setOpen] = useState(depth === 0);
  const indent = BASE_INDENT + depth * LEVEL_INDENT;

  if (node.type === "folder") {
    return (
      <div>
        <button
          onClick={() => setOpen((o) => !o)}
          className="flex items-center gap-1 w-full text-left py-[2px] pr-2 hover:bg-white/5 select-none cursor-pointer"
          style={{ paddingLeft: `${indent}px` }}
        >
          <span className="text-zinc-500 shrink-0">
            {open ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
          </span>
          <span className="text-yellow-500 shrink-0">
            {open ? <FolderOpen size={14} /> : <Folder size={14} />}
          </span>
          <span className="text-zinc-300 text-xs truncate">{node.name}</span>
        </button>
        {open &&
          node.children?.map((child) => (
            <TreeNode key={child.name} node={child} depth={depth + 1} onFileOpen={onFileOpen} />
          ))}
      </div>
    );
  }

  return (
    <button
      className="flex items-center gap-1.5 w-full text-left py-[2px] pr-2 hover:bg-white/5 select-none cursor-pointer"
      style={{ paddingLeft: `${indent + 16}px` }}
      onDoubleClick={() => node.path && onFileOpen(node.name, node.path)}
    >
      {fileIcon(node.name)}
      <span className="text-zinc-300 text-xs truncate">{node.name}</span>
    </button>
  );
}

export default function FileExplorer({ onFileOpen }: FileExplorerProps) {
  const [rootOpen, setRootOpen] = useState(true);

  return (
    <div
      className="flex flex-col h-full"
      style={{ backgroundColor: "#191a1b", borderRight: "1px solid rgba(255,255,255,0.08)" }}
    >
      {/* Explorer header — matches editor tab bar height */}
      <div className="flex items-center shrink-0 h-[35px] px-4">
        <span className="text-[11px] font-medium tracking-wider text-zinc-500 uppercase select-none">
          Explorer
        </span>
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto">
        {/* Project root dropdown */}
        <button
          onClick={() => setRootOpen((o) => !o)}
          className="flex items-center gap-1 w-full py-1 hover:bg-white/5 select-none cursor-pointer"
          style={{ paddingLeft: "4px" }}
        >
          <span className="text-zinc-400 shrink-0">
            {rootOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
          </span>
          <span className="text-[11px] font-bold text-zinc-200 uppercase tracking-wide truncate">
            Raj&apos;s Portfolio
          </span>
        </button>

        {/* File tree — nested under root */}
        {rootOpen && (
          <div>
            {(filesData as FileNode).children?.map((node) => (
              <TreeNode key={node.name} node={node} depth={0} onFileOpen={onFileOpen} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
