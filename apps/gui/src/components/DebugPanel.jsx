import React, { useState } from "react";
import { useDiagram } from "../context/DiagramContext";

export default function DebugPanel({ onClose }) {
  const { entities, references, notes } = useDiagram();
  const [tab, setTab] = useState("diagram");

  const diagram = { entities, references, notes };

  const tabs = [
    { id: "diagram", label: "Diagram" },
    ...entities.map((e) => ({ id: e.id, label: e.name || e.id.slice(0, 8) })),
  ];

  const getContent = () => {
    if (tab === "diagram") return diagram;
    const entity = entities.find((e) => e.id === tab);
    if (!entity) return null;
    const relatedRefs = references.filter(
      (r) => r.sourceEntityId === entity.id || r.targetEntityId === entity.id
    );
    return { ...entity, _references: relatedRefs };
  };

  const content = getContent();

  return (
    <div className="fixed bottom-0 left-0 right-0 h-72 bg-gray-900 text-green-400 border-t-2 border-green-500 flex flex-col z-50 font-mono text-xs">
      <div className="flex items-center justify-between px-3 py-1.5 bg-gray-800 border-b border-gray-700 shrink-0">
        <div className="flex items-center gap-1 overflow-x-auto">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`px-2 py-0.5 rounded whitespace-nowrap ${
                tab === t.id
                  ? "bg-green-700 text-white"
                  : "text-gray-400 hover:text-gray-200 hover:bg-gray-700"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-white ml-2 text-lg leading-none shrink-0"
        >
          &times;
        </button>
      </div>
      <pre className="flex-1 overflow-auto p-3 leading-tight">
        {content ? JSON.stringify(content, null, 2) : "Not found"}
      </pre>
    </div>
  );
}
