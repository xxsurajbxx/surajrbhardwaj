"use client";

import { useState, useEffect } from "react";
import { Panel, Group as PanelGroup, Separator as PanelResizeHandle, useGroupRef } from "react-resizable-panels";
import MacWindow from "@/components/MacWindow";
import FileExplorer from "@/components/FileExplorer";
import EditorPanel from "@/components/EditorPanel";
import TerminalPanel from "@/components/TerminalPanel";

type OpenTab = { name: string; path: string };

const TERMINAL_PANEL_ID = "terminal";
const EDITOR_PANEL_ID = "editor";
const COLLAPSED_SIZE = 3.8;
const EXPANDED_SIZE = 35;
const DEFAULT_TAB: OpenTab = { name: "README.md", path: "/content/README.md" };

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 768px)");
    setIsMobile(mq.matches);
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);
  return isMobile;
}

export default function Home() {
  const isMobile = useIsMobile();
  const verticalGroupRef = useGroupRef();
  const [terminalMinimized, setTerminalMinimized] = useState(false);
  const [filesOpen, setFilesOpen] = useState(false);
  const [openTabs, setOpenTabs] = useState<OpenTab[]>([DEFAULT_TAB]);
  const [activeTab, setActiveTab] = useState<string | null>(DEFAULT_TAB.path);

  useEffect(() => {
    setFilesOpen(!window.matchMedia("(max-width: 768px)").matches);
  }, []);

  function handleFileOpen(name: string, path: string) {
    setOpenTabs((prev) => {
      if (prev.find((t) => t.path === path)) return prev;
      return [...prev, { name, path }];
    });
    setActiveTab(path);
  }

  function handleTabClose(path: string) {
    setOpenTabs((prev) => {
      const remaining = prev.filter((t) => t.path !== path);
      if (activeTab === path) {
        setActiveTab(remaining.length > 0 ? remaining[remaining.length - 1].path : null);
      }
      return remaining;
    });
  }

  function collapseTerminal() {
    verticalGroupRef.current?.setLayout({
      [EDITOR_PANEL_ID]: 100 - COLLAPSED_SIZE,
      [TERMINAL_PANEL_ID]: COLLAPSED_SIZE,
    });
    setTerminalMinimized(true);
  }

  function expandTerminal() {
    verticalGroupRef.current?.setLayout({
      [EDITOR_PANEL_ID]: 100 - EXPANDED_SIZE,
      [TERMINAL_PANEL_ID]: EXPANDED_SIZE,
    });
    setTerminalMinimized(false);
  }

  if (isMobile) {
    return (
      <MacWindow filesOpen={filesOpen} onFilesClick={() => setFilesOpen((o) => !o)}>
        <div className="relative h-full overflow-hidden">
          <div className="h-full">
            <EditorPanel
              openTabs={openTabs}
              activeTab={activeTab}
              onTabClick={setActiveTab}
              onTabClose={handleTabClose}
            />
          </div>
          {filesOpen && (
            <div className="absolute inset-0 z-10" style={{ backgroundColor: "#191a1b" }}>
              <FileExplorer
                singleClick
                onFileOpen={(name, path) => {
                  handleFileOpen(name, path);
                  setFilesOpen(false);
                }}
              />
            </div>
          )}
        </div>
      </MacWindow>
    );
  }

  return (
    <MacWindow filesOpen={filesOpen} onFilesClick={() => setFilesOpen((o) => !o)}>
      <PanelGroup orientation="horizontal" className="h-full">
        {filesOpen && (
          <>
            <Panel defaultSize={150} minSize={15}>
              <FileExplorer onFileOpen={handleFileOpen} />
            </Panel>
            <PanelResizeHandle className="w-[1px] bg-white/5 hover:bg-white/20 transition-colors cursor-col-resize" />
          </>
        )}
        <Panel>
          <PanelGroup orientation="vertical" className="h-full" groupRef={verticalGroupRef}>
            <Panel id={EDITOR_PANEL_ID} defaultSize={100 - EXPANDED_SIZE} minSize={40}>
              <EditorPanel
                openTabs={openTabs}
                activeTab={activeTab}
                onTabClick={setActiveTab}
                onTabClose={handleTabClose}
              />
            </Panel>
            <PanelResizeHandle className="h-[1px] bg-white/5 hover:bg-white/20 transition-colors cursor-row-resize" />
            <Panel id={TERMINAL_PANEL_ID} defaultSize={EXPANDED_SIZE} minSize={COLLAPSED_SIZE}>
              <TerminalPanel
                onFileOpen={handleFileOpen}
                minimized={terminalMinimized}
                onExit={collapseTerminal}
                onHeaderClick={expandTerminal}
              />
            </Panel>
          </PanelGroup>
        </Panel>
      </PanelGroup>
    </MacWindow>
  );
}
