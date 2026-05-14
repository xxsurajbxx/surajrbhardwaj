import MacWindow from "@/components/MacWindow";

export default function Home() {
  return (
    <MacWindow>
      {/* Phase 2: resizable panels (Sidebar, Editor, Terminal) will go here */}
      <div className="flex h-full items-center justify-center">
        <span className="text-zinc-500 text-sm select-none">
          Editor panels coming in Phase 2
        </span>
      </div>
    </MacWindow>
  );
}
