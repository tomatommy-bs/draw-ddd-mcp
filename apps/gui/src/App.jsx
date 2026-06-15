import React from "react";
import { DiagramProvider } from "./context/DiagramContext";
import Toolbar from "./components/Toolbar";
import Canvas from "./components/Canvas";
import SidePanel from "./components/SidePanel";

export default function App() {
  return (
    <DiagramProvider>
      <div className="flex flex-col w-full h-full">
        <Toolbar />
        <div className="flex flex-1 overflow-hidden">
          <Canvas />
          <SidePanel />
        </div>
      </div>
    </DiagramProvider>
  );
}
