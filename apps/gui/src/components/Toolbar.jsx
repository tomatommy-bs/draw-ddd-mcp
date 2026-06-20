import React from "react";
import { useDiagram } from "../context/DiagramContext";
import useRemoteControl from "../hooks/useRemoteControl";
import PromptModal from "./PromptModal";

export default function Toolbar({ onToggleDebug, showDebug }) {
  const { addEntity, addNote, autoLayout } = useDiagram();
  const enabled =
    import.meta.env.VITE_REMOTE_CONTROL_ENABLED === "true" ||
    import.meta.env.VITE_REMOTE_CONTROL_ENABLED === true;
  const { isConnected, pendingPrompt, respondToPrompt } = useRemoteControl(enabled);

  const handleAddResource = () => {
    addEntity({ type: "resource", name: "NewResource", color: "#3b82f6" });
  };

  const handleAddEvent = () => {
    addEntity({ type: "event", name: "NewEvent", color: "#eab308" });
  };

  const handleAddNote = () => {
    addNote({ content: "New note" });
  };

  const handleAutoLayout = () => {
    autoLayout();
  };

  return (
    <div className="flex items-center justify-between px-4 py-2 bg-gray-900 text-white shadow-md z-10">
      <div className="flex items-center gap-4">
        <span className="text-lg font-bold tracking-tight select-none">draw-ddd-mcp</span>
        <div className="flex items-center gap-2 ml-4">
          <button
            onClick={handleAddResource}
            className="px-3 py-1.5 text-sm font-medium rounded text-white hover:opacity-90 transition-opacity"
            style={{ backgroundColor: "#2563eb" }}
          >
            Add Resource
          </button>
          <button
            onClick={handleAddEvent}
            className="px-3 py-1.5 text-sm font-medium rounded text-white hover:opacity-90 transition-opacity"
            style={{ backgroundColor: "#ca8a04" }}
          >
            Add Event
          </button>
          <button
            onClick={handleAddNote}
            className="px-3 py-1.5 text-sm font-medium rounded text-white hover:opacity-90 transition-opacity"
            style={{ backgroundColor: "#f59e0b" }}
          >
            Add Note
          </button>
          <button
            onClick={handleAutoLayout}
            className="px-3 py-1.5 text-sm font-medium rounded bg-gray-600 text-white hover:bg-gray-500 transition-colors"
          >
            Auto Layout
          </button>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleDebug}
          className={`px-3 py-1.5 text-sm font-medium rounded transition-colors ${
            showDebug
              ? "bg-green-600 text-white"
              : "bg-gray-700 text-gray-300 hover:bg-gray-600"
          }`}
        >
          {showDebug ? "Debug ON" : "Debug"}
        </button>
      </div>
      <div className="flex items-center gap-2 text-xs text-gray-400">
        <span
          className="inline-block w-2.5 h-2.5 rounded-full"
          style={{ backgroundColor: isConnected ? "#22c55e" : "#ef4444" }}
        />
        {isConnected ? "Connected" : "Disconnected"}
      </div>
      {pendingPrompt && (
        <PromptModal prompt={pendingPrompt} onRespond={respondToPrompt} />
      )}
    </div>
  );
}
