import React, { useState } from "react";
import { ReactFlowProvider } from "@xyflow/react";
import { DiagramProvider } from "./context/DiagramContext";
import Toolbar from "./components/Toolbar";
import Canvas from "./components/Canvas";
import SidePanel from "./components/SidePanel";
import GlossaryPanel from "./components/GlossaryPanel";
import DebugPanel from "./components/DebugPanel";

export default function App() {
  const [showDebug, setShowDebug] = useState(false);
  const [showGlossary, setShowGlossary] = useState(false);

  return (
    <DiagramProvider>
      <ReactFlowProvider>
      <div className="flex flex-col w-full h-full">
        <Toolbar
          onToggleDebug={() => setShowDebug((v) => !v)}
          showDebug={showDebug}
          onToggleGlossary={() => setShowGlossary((v) => !v)}
          showGlossary={showGlossary}
        />
        <div className="flex flex-1 overflow-hidden">
          <Canvas />
          <SidePanel />
          {showGlossary && <GlossaryPanel />}
        </div>
        {showDebug && <DebugPanel onClose={() => setShowDebug(false)} />}
      </div>
      </ReactFlowProvider>
    </DiagramProvider>
  );
}
