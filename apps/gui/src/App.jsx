import React, { useState } from "react";
import { ReactFlowProvider } from "@xyflow/react";
import { DiagramProvider } from "./context/DiagramContext";
import Toolbar from "./components/Toolbar";
import Canvas from "./components/Canvas";
import SidePanel from "./components/SidePanel";
import GlossaryPanel from "./components/GlossaryPanel";
import UsecasePanel from "./components/UsecasePanel";
import DebugPanel from "./components/DebugPanel";

export default function App() {
  const [showDebug, setShowDebug] = useState(false);
  const [showGlossary, setShowGlossary] = useState(false);
  const [showUsecases, setShowUsecases] = useState(false);

  return (
    <DiagramProvider>
      <ReactFlowProvider>
      <div className="flex flex-col w-full h-full">
        <Toolbar
          onToggleDebug={() => setShowDebug((v) => !v)}
          showDebug={showDebug}
          onToggleGlossary={() => setShowGlossary((v) => !v)}
          showGlossary={showGlossary}
          onToggleUsecases={() => setShowUsecases((v) => !v)}
          showUsecases={showUsecases}
        />
        <div className="flex flex-1 overflow-hidden">
          <Canvas />
          <SidePanel />
          {showUsecases && <UsecasePanel />}
          {showGlossary && <GlossaryPanel />}
        </div>
        {showDebug && <DebugPanel onClose={() => setShowDebug(false)} />}
      </div>
      </ReactFlowProvider>
    </DiagramProvider>
  );
}
