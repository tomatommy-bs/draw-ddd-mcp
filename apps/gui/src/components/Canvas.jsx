import React, { useState, useCallback, useRef } from "react";
import { useDiagram } from "../context/DiagramContext";
import TMEntity from "./TMEntity";
import TMReference from "./TMReference";
import TMNote from "./TMNote";

const MIN_ZOOM = 0.2;
const MAX_ZOOM = 3;

export default function Canvas() {
  const { entities, references, notes, setSelectedId } = useDiagram();
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const isPanning = useRef(false);
  const panStart = useRef({ x: 0, y: 0 });
  const svgRef = useRef(null);

  const handleWheel = useCallback((e) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    setZoom((prev) => Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, prev * delta)));
  }, []);

  const handleMouseDown = useCallback(
    (e) => {
      // Only pan on background click (directly on svg or the background rect)
      if (e.target === svgRef.current || e.target.dataset.background === "true") {
        isPanning.current = true;
        panStart.current = { x: e.clientX - pan.x, y: e.clientY - pan.y };
        setSelectedId(null);
      }
    },
    [pan, setSelectedId]
  );

  const handleMouseMove = useCallback(
    (e) => {
      if (!isPanning.current) return;
      setPan({ x: e.clientX - panStart.current.x, y: e.clientY - panStart.current.y });
    },
    []
  );

  const handleMouseUp = useCallback(() => {
    isPanning.current = false;
  }, []);

  return (
    <svg
      ref={svgRef}
      className="flex-1 bg-gray-50 cursor-grab active:cursor-grabbing"
      onWheel={handleWheel}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      <defs>
        <pattern id="dotPattern" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
          <circle cx="1" cy="1" r="1" fill="#d1d5db" />
        </pattern>
        <marker
          id="arrowhead"
          markerWidth="10"
          markerHeight="7"
          refX="10"
          refY="3.5"
          orient="auto"
        >
          <polygon points="0 0, 10 3.5, 0 7" fill="#6b7280" />
        </marker>
      </defs>

      <g transform={`translate(${pan.x}, ${pan.y}) scale(${zoom})`}>
        {/* Background with dot pattern */}
        <rect
          data-background="true"
          x="-5000"
          y="-5000"
          width="10000"
          height="10000"
          fill="url(#dotPattern)"
        />

        {/* References rendered behind entities */}
        {references.map((ref) => (
          <TMReference key={ref.id} reference={ref} entities={entities} />
        ))}

        {/* Notes */}
        {notes.map((note) => (
          <TMNote key={note.id} note={note} />
        ))}

        {/* Entities */}
        {entities.map((entity) => (
          <TMEntity key={entity.id} entity={entity} />
        ))}
      </g>
    </svg>
  );
}
