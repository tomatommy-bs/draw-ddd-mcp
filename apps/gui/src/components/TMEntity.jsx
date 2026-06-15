import React, { useRef, useCallback, useState } from "react";
import { useDiagram } from "../context/DiagramContext";

const ENTITY_WIDTH = 240;
const HEADER_HEIGHT = 36;
const ATTR_HEIGHT = 24;
const SUBTYPE_TAG_HEIGHT = 20;

export default function TMEntity({ entity }) {
  const { selectedId, setSelectedId, updateEntity } = useDiagram();
  const isSelected = selectedId === entity.id;
  const dragRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);

  const totalHeight =
    HEADER_HEIGHT +
    SUBTYPE_TAG_HEIGHT +
    Math.max(entity.attributes.length, 1) * ATTR_HEIGHT +
    8;

  const borderRadius = entity.type === "resource" ? 10 : 3;

  const handleMouseDown = useCallback(
    (e) => {
      e.stopPropagation();
      setSelectedId(entity.id);
      dragRef.current = {
        startX: e.clientX,
        startY: e.clientY,
        origX: entity.x,
        origY: entity.y,
      };
      setIsDragging(true);

      const handleMouseMove = (ev) => {
        if (!dragRef.current) return;
        const dx = ev.clientX - dragRef.current.startX;
        const dy = ev.clientY - dragRef.current.startY;
        updateEntity(entity.id, {
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
    [entity.id, entity.x, entity.y, setSelectedId, updateEntity]
  );

  return (
    <g transform={`translate(${entity.x}, ${entity.y})`}>
      {/* Selection border */}
      {isSelected && (
        <rect
          x={-3}
          y={-3}
          width={ENTITY_WIDTH + 6}
          height={totalHeight + 6}
          rx={borderRadius + 2}
          ry={borderRadius + 2}
          fill="none"
          stroke="#2563eb"
          strokeWidth={2}
          strokeDasharray="6 3"
        />
      )}

      <foreignObject
        width={ENTITY_WIDTH}
        height={totalHeight}
        onMouseDown={handleMouseDown}
        style={{ cursor: isDragging ? "grabbing" : "grab" }}
      >
        <div
          xmlns="http://www.w3.org/1999/xhtml"
          style={{
            width: ENTITY_WIDTH,
            height: totalHeight,
            borderRadius: borderRadius,
            overflow: "hidden",
            boxShadow: "0 1px 4px rgba(0,0,0,0.15)",
            backgroundColor: "#ffffff",
            border: "1px solid #e5e7eb",
            userSelect: "none",
            fontSize: "12px",
            fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
          }}
        >
          {/* Color strip + header */}
          <div
            style={{
              height: HEADER_HEIGHT,
              backgroundColor: entity.color || "#3b82f6",
              display: "flex",
              alignItems: "center",
              padding: "0 8px",
              color: "#ffffff",
              fontWeight: 600,
            }}
          >
            <span
              style={{
                backgroundColor: "rgba(255,255,255,0.3)",
                borderRadius: 3,
                padding: "1px 5px",
                marginRight: 6,
                fontSize: "10px",
                fontWeight: 700,
              }}
            >
              {entity.type === "resource" ? "R" : "E"}
            </span>
            <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {entity.name}
            </span>
          </div>

          {/* Subtype tag */}
          <div
            style={{
              height: SUBTYPE_TAG_HEIGHT,
              display: "flex",
              alignItems: "center",
              padding: "0 8px",
              backgroundColor: "#f9fafb",
              borderBottom: "1px solid #e5e7eb",
            }}
          >
            <span
              style={{
                fontSize: "9px",
                color: "#6b7280",
                backgroundColor: "#e5e7eb",
                borderRadius: 3,
                padding: "1px 6px",
                textTransform: "uppercase",
                fontWeight: 500,
                letterSpacing: "0.05em",
              }}
            >
              {entity.subtype}
            </span>
          </div>

          {/* Attributes */}
          <div style={{ padding: "4px 0" }}>
            {entity.attributes.length === 0 ? (
              <div
                style={{
                  height: ATTR_HEIGHT,
                  display: "flex",
                  alignItems: "center",
                  padding: "0 8px",
                  color: "#9ca3af",
                  fontStyle: "italic",
                }}
              >
                No attributes
              </div>
            ) : (
              entity.attributes.map((attr) => (
                <div
                  key={attr.id}
                  style={{
                    height: ATTR_HEIGHT,
                    display: "flex",
                    alignItems: "center",
                    padding: "0 8px",
                    gap: 4,
                    borderBottom: "1px solid #f3f4f6",
                  }}
                >
                  {attr.isIdentifier && (
                    <span style={{ color: "#eab308", fontSize: "11px" }} title="Identifier">
                      ★
                    </span>
                  )}
                  <span
                    style={{
                      fontWeight: attr.isIdentifier ? 600 : 400,
                      color: "#111827",
                      flex: 1,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {attr.name}
                  </span>
                  <span style={{ color: "#9ca3af", fontSize: "10px", flexShrink: 0 }}>
                    {attr.dataType}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </foreignObject>
    </g>
  );
}
