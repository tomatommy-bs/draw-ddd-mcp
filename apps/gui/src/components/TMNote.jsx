import React, { useRef, useState, useCallback } from "react";
import { useDiagram } from "../context/DiagramContext";

export default function TMNote({ note }) {
  const { selectedId, setSelectedId, updateNote } = useDiagram();
  const isSelected = selectedId === note.id;
  const dragRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleMouseDown = useCallback(
    (e) => {
      e.stopPropagation();
      setSelectedId(note.id);
      dragRef.current = {
        startX: e.clientX,
        startY: e.clientY,
        origX: note.x,
        origY: note.y,
      };
      setIsDragging(true);

      const handleMouseMove = (ev) => {
        if (!dragRef.current) return;
        const dx = ev.clientX - dragRef.current.startX;
        const dy = ev.clientY - dragRef.current.startY;
        updateNote(note.id, {
          x: dragRef.current.origX + dx,
          y: dragRef.current.origY + dy,
        });
      };

      const handleMouseUp = () => {
        dragRef.current = null;
        setIsDragging(false);
        window.removeEventListener("mousemove", handleMouseMove);
        window.removeEventListener("mouseup", handleMouseUp);
      };

      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
    },
    [note.id, note.x, note.y, setSelectedId, updateNote]
  );

  return (
    <g transform={`translate(${note.x}, ${note.y})`}>
      {isSelected && (
        <rect
          x={-2}
          y={-2}
          width={(note.width || 200) + 4}
          height={(note.height || 120) + 4}
          rx={10}
          fill="none"
          stroke="#10b981"
          strokeWidth={1.5}
          opacity={0.5}
        />
      )}

      <foreignObject
        width={note.width || 200}
        height={note.height || 120}
        onMouseDown={handleMouseDown}
        style={{ cursor: isDragging ? "grabbing" : "grab" }}
      >
        <div
          xmlns="http://www.w3.org/1999/xhtml"
          style={{
            width: "100%",
            height: "100%",
            backgroundColor: '#fffbeb',
            border: '1px solid #fde68a',
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
            boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
          }}
        >
          {note.content || "Empty note"}
        </div>
      </foreignObject>
    </g>
  );
}
