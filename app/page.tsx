"use client";

import { useState } from "react";
import { Panel, Group as PanelGroup, Separator as PanelResizeHandle } from "react-resizable-panels";
import MacWindow from "@/components/MacWindow";
import FileExplorer from "@/components/FileExplorer";
import EditorPanel from "@/components/EditorPanel";
import TerminalPanel from "@/components/TerminalPanel";

export default function Home() {
  const [filesOpen, setFilesOpen] = useState(true);

  return (
    <MacWindow filesOpen={filesOpen} onFilesClick={() => setFilesOpen((o) => !o)}>
      <PanelGroup orientation="horizontal" className="h-full">
        {/* Sidebar — conditionally rendered */}
        {filesOpen && (
          <>
            <Panel defaultSize={150} minSize={15}>
              <FileExplorer />
            </Panel>
            <PanelResizeHandle className="w-[1px] bg-white/5 hover:bg-white/20 transition-colors cursor-col-resize" />
          </>
        )}

        {/* Right side: Editor + Terminal stacked */}
        <Panel>
          <PanelGroup orientation="vertical" className="h-full">
            <Panel defaultSize={75} minSize={40}>
              <EditorPanel />
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
