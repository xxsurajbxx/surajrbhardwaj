"use client";

import { useState } from "react";
import { Panel, Group as PanelGroup, Separator as PanelResizeHandle } from "react-resizable-panels";
import MacWindow from "@/components/MacWindow";
import FileExplorer from "@/components/FileExplorer";
import EditorPanel from "@/components/EditorPanel";
import TerminalPanel from "@/components/TerminalPanel";

type OpenTab = { name: string; path: string };

export default function Home() {
  const [filesOpen, setFilesOpen] = useState(true);
  const defaultTab: OpenTab = { name: "README.md", path: "/content/README.md" };
  const [openTabs, setOpenTabs] = useState<OpenTab[]>([defaultTab]);
  const [activeTab, setActiveTab] = useState<string | null>(defaultTab.path);

  function handleFileOpen(name: string, path: string) {
    if (openTabs.find((t) => t.path === path)) {
      setActiveTab(path);
      return;
    }
    setOpenTabs((prev) => [...prev, { name, path }]);
    setActiveTab(path);
  }

  function handleTabClose(path: string) {
    const remaining = openTabs.filter((t) => t.path !== path);
    setOpenTabs(remaining);
    if (activeTab === path) {
      setActiveTab(remaining.length > 0 ? remaining[remaining.length - 1].path : null);
    }
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
          <PanelGroup orientation="vertical" className="h-full">
            <Panel defaultSize={75} minSize={40}>
              <EditorPanel
                openTabs={openTabs}
                activeTab={activeTab}
                onTabClick={setActiveTab}
                onTabClose={handleTabClose}
              />
            </Panel>
            <PanelResizeHandle className="h-[1px] bg-white/5 hover:bg-white/20 transition-colors cursor-row-resize" />
            <Panel defaultSize={25} minSize={10}>
              <TerminalPanel />
            </Panel>
          </PanelGroup>
        </Panel>
      </PanelGroup>
    </MacWindow>
  );
}
