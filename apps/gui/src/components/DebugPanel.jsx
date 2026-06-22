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
    <div
      className="fixed bottom-0 left-0 right-0 h-72 flex flex-col z-50 text-xs"
      style={{
        backgroundColor: '#1e1e1e',
        borderTop: '2px solid var(--accent-brand)',
        fontFamily: "'JetBrains Mono', monospace",
      }}
    >
      <div
        className="flex items-center justify-between px-3 py-1.5 shrink-0"
        style={{ backgroundColor: '#171717', borderBottom: '1px solid #333' }}
      >
        <div className="flex items-center gap-1 overflow-x-auto">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className="px-2 py-0.5 rounded whitespace-nowrap transition-colors"
              style={{
                backgroundColor: tab === t.id ? 'rgba(16,185,129,0.15)' : 'transparent',
                color: tab === t.id ? '#10b981' : '#666',
              }}
            >
              {t.label}
            </button>
          ))}
        </div>
        <button
          onClick={onClose}
          className="ml-2 text-lg leading-none shrink-0 transition-colors"
          style={{ color: '#666' }}
          onMouseEnter={(e) => { e.currentTarget.style.color = '#ededed'; }}
          onMouseLeave={(e) => { e.currentTarget.style.color = '#666'; }}
        >
          &times;
        </button>
      </div>
      <pre
        className="flex-1 overflow-auto p-3 leading-tight"
        style={{ color: '#10b981' }}
      >
        {content ? JSON.stringify(content, null, 2) : "Not found"}
      </pre>
    </div>
  );
}
