import React, { memo } from "react";
import { Handle, Position } from "@xyflow/react";

const handleStyle = { opacity: 0, width: 1, height: 1, border: 'none', background: 'transparent' };

function TMNoteNode({ data, selected }) {
  const note = data;

  return (
    <>
      <Handle type="target" position={Position.Top} id="top" style={handleStyle} />
      <Handle type="source" position={Position.Bottom} id="bottom" style={handleStyle} />

      <div
        style={{
          width: note.width || 200,
          height: note.height || 120,
          backgroundColor: '#fffbeb',
          border: `1px solid ${selected ? '#10b981' : '#fde68a'}`,
          borderRadius: '8px',
          padding: "10px 12px",
          fontSize: "12px",
          fontFamily: "'Inter', -apple-system, sans-serif",
          color: '#525252',
          overflow: "hidden",
          userSelect: "none",
          whiteSpace: "pre-wrap",
          wordBreak: "break-word",
          lineHeight: 1.5,
          boxShadow: selected
            ? '0 0 0 3px rgba(16,185,129,0.12), 0 4px 12px rgba(0,0,0,0.08)'
            : '0 1px 3px rgba(0,0,0,0.04)',
          transition: 'border-color 0.15s, box-shadow 0.15s',
        }}
      >
        {note.content || "Empty note"}
      </div>
    </>
  );
}

export default memo(TMNoteNode);
