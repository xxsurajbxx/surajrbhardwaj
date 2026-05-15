"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import filesData from "@/data/files.json";

interface FileNode {
  name: string;
  type: "file" | "folder";
  path?: string;
  children?: FileNode[];
}

interface TerminalPanelProps {
  onFileOpen: (name: string, path: string) => void;
  minimized: boolean;
  onExit: () => void;
  onHeaderClick: () => void;
}

type HistoryEntry = { command: string; output: string[] };

function cwdToPath(cwd: string): string[] {
  const segments = cwd.replace("~/", "").split("/").filter(Boolean);
  return segments.slice(1);
}

function getNode(pathParts: string[]): FileNode | null {
  let node: FileNode = filesData as FileNode;
  for (const part of pathParts) {
    if (!node.children) return null;
    const child = node.children.find((c) => c.name === part);
    if (!child) return null;
    node = child;
  }
  return node;
}

export default function TerminalPanel({ onFileOpen, minimized, onExit, onHeaderClick }: TerminalPanelProps) {
  const [history, setHistory] = useState<HistoryEntry[]>([
    { command: "", output: ["Welcome to the terminal.", "Type 'help' to see available commands."] },
  ]);
  const [cwd, setCwd] = useState("~/portfolio");
  const [input, setInput] = useState("");
  const [cmdHistory, setCmdHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [history]);

  const runCommand = useCallback(
    (raw: string): HistoryEntry => {
      const parts = raw.trim().split(/\s+/);
      const cmd = parts[0];
      const arg = parts.slice(1).join(" ");

      switch (cmd) {
        case "ls": {
          const target = arg ? [...cwdToPath(cwd), arg] : cwdToPath(cwd);
          const node = getNode(target);
          if (!node) return { command: raw, output: [`ls: ${arg}: No such file or directory`] };
          if (node.type !== "folder") return { command: raw, output: [node.name] };
          return { command: raw, output: node.children?.map((c) => c.name) ?? [] };
        }
        case "cd": {
          if (!arg || arg === "~" || arg === "/") {
            setCwd("~/portfolio");
            return { command: raw, output: [] };
          }
          if (arg === "..") {
            const pathParts = cwdToPath(cwd);
            if (pathParts.length === 0) return { command: raw, output: [] };
            const parent = pathParts.slice(0, -1);
            setCwd(parent.length === 0 ? "~/portfolio" : "~/portfolio/" + parent.join("/"));
            return { command: raw, output: [] };
          }
          if (arg.includes("..")) return { command: raw, output: [`cd: ${arg}: No such directory`] };
          const target = [...cwdToPath(cwd), arg];
          const node = getNode(target);
          if (!node || node.type !== "folder") return { command: raw, output: [`cd: ${arg}: No such directory`] };
          setCwd("~/portfolio/" + target.join("/"));
          return { command: raw, output: [] };
        }
        case "cat": {
          const node = getNode(cwdToPath(cwd));
          const file = node?.children?.find((c) => c.name === arg && c.type === "file");
          if (!file || !file.path) return { command: raw, output: [`cat: ${arg}: No such file`] };
          onFileOpen(file.name, file.path);
          return { command: raw, output: [`Opening ${arg} in editor...`] };
        }
        case "pwd":
          return { command: raw, output: [cwd] };
        case "whoami":
          return { command: raw, output: ["Suraj Rajesh Bhardwaj — Software Engineer · Systems, ML & Quantitative Development"] };
        case "resume": {
          const a = document.createElement("a");
          a.href = "/resume.pdf";
          a.download = "Suraj_Bhardwaj_Resume.pdf";
          a.click();
          return { command: raw, output: ["Downloading resume..."] };
        }
        case "sudo":
          return { command: raw, output: ["Nice try. You don't have root privileges here."] };
        case "mkdir":
        case "rm":
        case "touch":
        case "mv":
        case "cp":
          return { command: raw, output: [`${cmd}: Read-only file system`] };
        case "clear":
          setHistory([]);
          return { command: "", output: [] };
        case "exit":
          setHistory([]);
          onExit();
          return { command: "", output: [] };
        case "help":
          return {
            command: raw,
            output: [
              "Available commands:",
              "  ls              List files in current directory",
              "  cd <folder>     Change directory",
              "  cd ..           Go up one level",
              "  cat <file>      Open a file in the editor",
              "  pwd             Print working directory",
              "  whoami          Who is this?",
              "  sudo            Nice try.",
              "  clear           Clear terminal",
              "  exit            Minimize the terminal",
              "  resume          Download a copy of my resume",
              "  help            Show this message",
            ],
          };
        default:
          return { command: raw, output: [`${cmd}: command not found`] };
      }
    },
    [cwd, onExit, onFileOpen]
  );

  function handleTabComplete() {
    const parts = input.split(/\s+/);
    const cmd = parts[0];
    const arg = parts.slice(1).join(" ");

    if (!["ls", "cd", "cat"].includes(cmd) || parts.length < 2) return;

    const argParts = arg.split("/");
    const prefix = argParts[argParts.length - 1];
    const parentParts = argParts.slice(0, -1);

    const lookupPath = [...cwdToPath(cwd), ...parentParts].filter(Boolean);
    const parentNode = getNode(lookupPath);
    if (!parentNode || !parentNode.children) return;

    const matches = parentNode.children
      .filter((c) => c.name.toLowerCase().startsWith(prefix.toLowerCase()))
      .map((c) => c.name);

    if (matches.length === 1) {
      setInput(`${cmd} ${[...parentParts, matches[0]].join("/")}`);
    } else if (matches.length > 1) {
      setHistory((prev) => [...prev, { command: input, output: matches }]);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Tab") {
      e.preventDefault();
      handleTabComplete();
      return;
    }
    if (e.key === "ArrowUp") {
      e.preventDefault();
      if (cmdHistory.length === 0) return;
      const next = historyIndex === -1 ? cmdHistory.length - 1 : Math.max(0, historyIndex - 1);
      setHistoryIndex(next);
      setInput(cmdHistory[next]);
      return;
    }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      if (historyIndex === -1) return;
      const next = historyIndex + 1;
      if (next >= cmdHistory.length) {
        setHistoryIndex(-1);
        setInput("");
      } else {
        setHistoryIndex(next);
        setInput(cmdHistory[next]);
      }
      return;
    }
    if (e.key !== "Enter" || !input.trim()) return;
    const trimmed = input.trim();
    const entry = runCommand(trimmed);
    if (trimmed !== "clear") {
      setHistory((prev) => [...prev, entry]);
    }
    setCmdHistory((prev) => [...prev, trimmed]);
    setHistoryIndex(-1);
    setInput("");
  }

  return (
    <div
      className="flex flex-col h-full"
      style={{ backgroundColor: "#181818" }}
      onClick={() => inputRef.current?.focus()}
    >
      {/* Header */}
      <div
        className="flex items-end shrink-0 h-[28px] px-2 gap-1"
        style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}
      >
        <button
          onClick={(e) => {
            e.stopPropagation();
            if (minimized) onHeaderClick();
          }}
          className="px-3 h-full text-[11px] font-medium tracking-wide select-none cursor-pointer"
          style={{ color: "#ffffff", borderBottom: "1px solid #007acc" }}
        >
          TERMINAL
        </button>
      </div>

      {/* Output area */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto px-3 py-2 font-mono text-xs"
        style={{ backgroundColor: "#181818" }}
      >
        {history.map((entry, i) => (
          <div key={i}>
            {entry.command && (
              <div className="flex gap-2">
                <span className="text-green-400 shrink-0">→</span>
                <span className="text-zinc-400 shrink-0">{cwd}</span>
                <span className="text-zinc-300">{entry.command}</span>
              </div>
            )}
            {entry.output.map((line, j) => (
              <div key={j} className="text-zinc-300 pl-4 whitespace-pre">{line}</div>
            ))}
          </div>
        ))}

        {/* Live input line */}
        <div className="flex items-center gap-2">
          <span className="text-green-400 shrink-0">→</span>
          <span className="text-zinc-400 shrink-0">{cwd}</span>
          <input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            className="flex-1 bg-transparent outline-none text-zinc-300 caret-zinc-300"
            autoComplete="off"
            spellCheck={false}
            autoFocus
          />
        </div>
      </div>
    </div>
  );
}
