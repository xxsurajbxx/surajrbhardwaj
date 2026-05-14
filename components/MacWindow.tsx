"use client";

import { ReactNode } from "react";
import {
  Files,
  Search,
  GitBranch,
  Play,
  LayoutGrid,
  FlaskConical,
  Zap,
  FileCode,
  UserCircle,
  Settings,
  ChevronLeft,
  ChevronRight,
  CircleX,
  TriangleAlert,
  Bell,
  Bot,
  Columns3,
} from "lucide-react";

interface MacWindowProps {
  children?: ReactNode;
  filesOpen?: boolean;
  onFilesClick?: () => void;
}

function ActivityBarIcon({
  icon: Icon,
  badge,
  active = false,
  label,
  onClick,
}: {
  icon: React.ElementType;
  badge?: string;
  active?: boolean;
  label: string;
  onClick?: () => void;
}) {
  return (
    <button
      aria-label={label}
      onClick={onClick}
      className={`relative flex items-center justify-center w-full h-10 group ${onClick ? "cursor-pointer" : "cursor-default"} ${
        active ? "text-white" : "text-zinc-500 hover:text-zinc-300"
      }`}
    >
      {active && (
        <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[2px] h-6 bg-white rounded-r" />
      )}
      <Icon size={22} strokeWidth={1.5} />
      {badge && (
        <span className="absolute top-1 right-1.5 flex items-center justify-center w-4 h-4 rounded-full bg-blue-500 text-white text-[9px] font-bold leading-none">
          {badge}
        </span>
      )}
    </button>
  );
}

export default function MacWindow({ children, filesOpen = true, onFilesClick }: MacWindowProps) {
  return (
    <div className="flex flex-col w-full h-screen overflow-hidden" style={{ backgroundColor: "#191a1b" }}>

      {/* ── Title Bar ── */}
      <div
        className="flex items-center shrink-0 h-[38px] px-3 gap-2"
        style={{ backgroundColor: "#191a1b", borderBottom: "1px solid rgba(255,255,255,0.05)" }}
      >
        {/* Traffic Lights */}
        <div className="group/traffic flex items-center gap-[6px]">
          <button
            className="relative w-3 h-3 rounded-full flex items-center justify-center"
            style={{ backgroundColor: "#ff5f57" }}
            aria-label="Close"
          >
            <span className="hidden group-hover/traffic:block text-[#820005] leading-none" style={{ fontSize: "9px", fontWeight: 700, lineHeight: 1 }}>✕</span>
          </button>
          <button
            className="relative w-3 h-3 rounded-full flex items-center justify-center"
            style={{ backgroundColor: "#febc2e" }}
            aria-label="Minimize"
          >
            <span className="hidden group-hover/traffic:block text-[#7d5000] leading-none" style={{ fontSize: "15px", fontWeight: 700, lineHeight: 1 }}>−</span>
          </button>
          <button
            className="relative w-3 h-3 rounded-full flex items-center justify-center"
            style={{ backgroundColor: "#28c840" }}
            aria-label="Fullscreen"
          >
            <span className="hidden group-hover/traffic:block text-[#006500] leading-none select-none" style={{ fontSize: "15px", fontWeight: 900, lineHeight: 1 }}>⤡</span>
          </button>
        </div>

        {/* Search Bar + flanking arrows — centered as a group */}
        <div className="flex-1 flex items-center justify-center gap-1">
          <button
            aria-label="Back"
            className="text-zinc-500 hover:text-zinc-200 p-0.5 rounded shrink-0"
          >
            <ChevronLeft size={18} strokeWidth={1.5} />
          </button>
          <button
            aria-label="Forward"
            className="text-zinc-500 hover:text-zinc-200 p-0.5 rounded shrink-0"
          >
            <ChevronRight size={18} strokeWidth={1.5} />
          </button>

          <div
            className="flex items-center gap-2 rounded px-3 h-[26px] cursor-pointer select-none"
            style={{
              backgroundColor: "#2b2d30",
              width: "35%",
              minWidth: "200px",
              maxWidth: "480px",
            }}
          >
            <Search size={12} className="text-zinc-500 shrink-0" />
            <span className="text-zinc-400 text-xs truncate">surajrbhardwaj</span>
          </div>
        </div>

        {/* Right controls */}
        <div className="flex items-center gap-1 shrink-0">
          <button aria-label="Toggle layout" className="text-zinc-500 hover:text-zinc-200 p-1 rounded">
            <Columns3 size={16} strokeWidth={1.5} />
          </button>
        </div>
      </div>

      {/* ── Body (Activity Bar + Content) ── */}
      <div className="flex flex-1 overflow-hidden">

        {/* Activity Bar */}
        <div
          className="flex flex-col items-center shrink-0 w-12 py-1"
          style={{ backgroundColor: "#191a1b", borderRight: "1px solid rgba(255,255,255,0.05)" }}
        >
          {/* Top icons */}
          <div className="flex flex-col items-center w-full flex-1">
            <ActivityBarIcon icon={Files} label="Explorer" active={filesOpen} onClick={onFilesClick} />
            <ActivityBarIcon icon={Search} label="Search" />
            <ActivityBarIcon icon={GitBranch} label="Source Control" />
            <ActivityBarIcon icon={Play} label="Run and Debug" />
            <ActivityBarIcon icon={LayoutGrid} label="Extensions" />
            <ActivityBarIcon icon={FlaskConical} label="Testing" />
            <ActivityBarIcon icon={Zap} label="Lightning" />
            <ActivityBarIcon icon={FileCode} label="File Code" />
          </div>

          {/* Bottom icons */}
          <div className="flex flex-col items-center w-full pb-1">
            <ActivityBarIcon icon={UserCircle} label="Profile" />
            <ActivityBarIcon icon={Settings} label="Settings" />
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-hidden" style={{ backgroundColor: "#191a1b" }}>
          {children}
        </div>
      </div>

      {/* ── Status Bar ── */}
      <div
        className="flex items-center shrink-0 h-[22px] px-2 gap-0 text-white text-xs select-none"
        style={{ backgroundColor: "#007acc", borderTop: "1px solid rgba(255,255,255,0.05)" }}
      >
        {/* Left side */}
        <div className="flex items-center">
          {/* Remote indicator */}
          <button className="flex items-center gap-1 px-2 h-full hover:bg-white/5 font-mono font-semibold text-zinc-300">
            &gt;&lt;
          </button>
          {/* Git branch */}
          <button className="flex items-center gap-1 px-2 h-full hover:bg-white/10 text-white">
            <GitBranch size={12} />
            <span>main*</span>
          </button>
          {/* Errors */}
          <button className="flex items-center gap-1 px-2 h-full hover:bg-white/10 text-white">
            <CircleX size={12} />
            <span>0</span>
          </button>
          {/* Warnings */}
          <button className="flex items-center gap-1 px-2 h-full hover:bg-white/10 text-white">
            <TriangleAlert size={12} />
            <span>0</span>
          </button>
        </div>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Right side */}
        <div className="flex items-center">
          <button className="flex items-center gap-1 px-2 h-full hover:bg-white/10 text-white">
            <Bot size={13} />
            <span>Copilot</span>
          </button>
          <button className="flex items-center gap-1 px-2 h-full hover:bg-white/10 text-white">
            <Bell size={12} />
          </button>
        </div>
      </div>
    </div>
  );
}
