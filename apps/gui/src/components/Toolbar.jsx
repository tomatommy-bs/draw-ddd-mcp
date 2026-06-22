import React from "react";
import { useDiagram } from "../context/DiagramContext";
import useRemoteControl from "../hooks/useRemoteControl";
import PromptModal from "./PromptModal";

export default function Toolbar({ onToggleDebug, showDebug, onToggleGlossary, showGlossary }) {
  const { addEntity, addNote, autoLayout } = useDiagram();
  const enabled =
    import.meta.env.VITE_REMOTE_CONTROL_ENABLED === "true" ||
    import.meta.env.VITE_REMOTE_CONTROL_ENABLED === true;
  const { isConnected, pendingPrompt, respondToPrompt } = useRemoteControl(enabled);

  const handleAddResource = () => {
    addEntity({ type: "resource", name: "NewResource", color: "#3b82f6" });
  };

  const handleAddEvent = () => {
    addEntity({ type: "event", name: "NewEvent", color: "#f59e0b" });
  };

  const handleAddNote = () => {
    addNote({ content: "New note" });
  };

  const handleAutoLayout = () => {
    autoLayout();
  };

  return (
    <div
      className="flex items-center justify-between px-4 py-2 z-10"
      style={{
        backgroundColor: 'var(--bg-surface)',
        borderBottom: '1px solid var(--border-default)',
      }}
    >
      <div className="flex items-center gap-5">
        <div className="flex items-center gap-2 select-none">
          <div
            className="w-6 h-6 rounded-md flex items-center justify-center"
            style={{ backgroundColor: 'var(--accent-brand)', color: '#fff' }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 3v18M3 12h18" />
            </svg>
          </div>
          <span className="text-sm font-semibold tracking-tight" style={{ color: 'var(--text-primary)' }}>
            draw-ddd
          </span>
        </div>

        <div
          className="w-px h-5"
          style={{ backgroundColor: 'var(--border-default)' }}
        />

        <div className="flex items-center gap-1.5">
          <ToolbarButton
            onClick={handleAddResource}
            accentColor="var(--accent-resource)"
            accentBg="var(--accent-resource-muted)"
          >
            <CircleIcon size={8} color="var(--accent-resource)" />
            Resource
          </ToolbarButton>
          <ToolbarButton
            onClick={handleAddEvent}
            accentColor="var(--accent-event)"
            accentBg="var(--accent-event-muted)"
          >
            <DiamondIcon size={8} color="var(--accent-event)" />
            Event
          </ToolbarButton>
          <ToolbarButton
            onClick={handleAddNote}
            accentColor="var(--text-secondary)"
            accentBg="var(--bg-muted)"
          >
            Note
          </ToolbarButton>

          <div
            className="w-px h-4 mx-0.5"
            style={{ backgroundColor: 'var(--border-default)' }}
          />

          <ToolbarButton
            onClick={handleAutoLayout}
            accentColor="var(--text-secondary)"
            accentBg="var(--bg-muted)"
          >
            <GridIcon size={12} />
            Layout
          </ToolbarButton>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <ToolbarToggle
          active={showGlossary}
          onClick={onToggleGlossary}
          title="Glossary"
        >
          <BookIcon size={14} />
        </ToolbarToggle>
        <ToolbarToggle
          active={showDebug}
          onClick={onToggleDebug}
          title="Debug"
        >
          <TerminalIcon size={14} />
        </ToolbarToggle>

        <div
          className="w-px h-4 mx-1"
          style={{ backgroundColor: 'var(--border-default)' }}
        />

        <div className="flex items-center gap-1.5 text-xs" style={{ color: 'var(--text-muted)' }}>
          <span
            className="inline-block w-2 h-2 rounded-full"
            style={{
              backgroundColor: isConnected ? 'var(--accent-brand)' : 'var(--accent-danger)',
              boxShadow: isConnected
                ? '0 0 6px rgba(16,185,129,0.4)'
                : '0 0 6px rgba(239,68,68,0.4)',
            }}
          />
          <span style={{ color: isConnected ? 'var(--accent-brand)' : 'var(--text-muted)' }}>
            {isConnected ? "Connected" : "Disconnected"}
          </span>
        </div>
      </div>

      {pendingPrompt && (
        <PromptModal prompt={pendingPrompt} onRespond={respondToPrompt} />
      )}
    </div>
  );
}

function ToolbarButton({ onClick, children, accentColor, accentBg }) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-md transition-all duration-150"
      style={{
        color: accentColor || 'var(--text-secondary)',
        backgroundColor: 'transparent',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor = accentBg || 'var(--bg-muted)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = 'transparent';
      }}
    >
      {children}
    </button>
  );
}

function ToolbarToggle({ active, onClick, title, children }) {
  return (
    <button
      onClick={onClick}
      title={title}
      className="flex items-center justify-center w-8 h-8 rounded-md transition-all duration-150"
      style={{
        color: active ? 'var(--accent-brand)' : 'var(--text-muted)',
        backgroundColor: active ? 'var(--accent-brand-muted)' : 'transparent',
      }}
      onMouseEnter={(e) => {
        if (!active) e.currentTarget.style.backgroundColor = 'var(--bg-muted)';
      }}
      onMouseLeave={(e) => {
        if (!active) e.currentTarget.style.backgroundColor = 'transparent';
      }}
    >
      {children}
    </button>
  );
}

function CircleIcon({ size = 8, color = 'currentColor' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 8 8">
      <circle cx="4" cy="4" r="3.5" fill={color} />
    </svg>
  );
}

function DiamondIcon({ size = 8, color = 'currentColor' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 8 8">
      <rect x="1" y="1" width="6" height="6" rx="1" fill={color} transform="rotate(45 4 4)" />
    </svg>
  );
}

function GridIcon({ size = 12 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7" />
      <rect x="14" y="3" width="7" height="7" />
      <rect x="3" y="14" width="7" height="7" />
      <rect x="14" y="14" width="7" height="7" />
    </svg>
  );
}

function BookIcon({ size = 14 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
    </svg>
  );
}

function TerminalIcon({ size = 14 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="4 17 10 11 4 5" />
      <line x1="12" y1="19" x2="20" y2="19" />
    </svg>
  );
}
