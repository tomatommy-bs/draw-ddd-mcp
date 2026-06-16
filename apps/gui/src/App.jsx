import React, { useState } from "react";
import { DiagramProvider } from "./context/DiagramContext";
import Toolbar from "./components/Toolbar";
import Canvas from "./components/Canvas";
import SidePanel from "./components/SidePanel";
import DebugPanel from "./components/DebugPanel";

export default function App() {
  const [showDebug, setShowDebug] = useState(false);

  return (
    <DiagramProvider>
      <div className="flex flex-col w-full h-full">
        <Toolbar onToggleDebug={() => setShowDebug((v) => !v)} showDebug={showDebug} />
        <div className="flex flex-1 overflow-hidden">
          <Canvas />
          <SidePanel />
        </div>
        {showDebug && <DebugPanel onClose={() => setShowDebug(false)} />}
      </div>
    </DiagramProvider>
  );
}
