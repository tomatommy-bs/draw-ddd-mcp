import React, { useRef, useCallback, useState } from "react";
import { useDiagram } from "../context/DiagramContext";

export const ENTITY_WIDTH = 280;
const HEADER_HEIGHT = 32;
const ROW_HEIGHT = 24;
const MIN_ROWS = 1;
const ID_COL_RATIO = 0.4;
const ID_COL_WIDTH = Math.floor(ENTITY_WIDTH * ID_COL_RATIO);
const ATTR_COL_WIDTH = ENTITY_WIDTH - ID_COL_WIDTH;

export default function TMEntity({ entity }) {
  const { selectedId, setSelectedId, updateEntity } = useDiagram();
  const isSelected = selectedId === entity.id;
  const dragRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);

  const identifiers = entity.attributes.filter((a) => a.isIdentifier);
  const attributes = entity.attributes.filter((a) => !a.isIdentifier);
  const rowCount = Math.max(identifiers.length, attributes.length, MIN_ROWS);
  const bodyHeight = rowCount * ROW_HEIGHT;
  const totalHeight = HEADER_HEIGHT + bodyHeight;

  const headerColor = entity.color || (entity.type === "resource" ? "#3b82f6" : "#eab308");
  const bodyBg = entity.type === "resource" ? "#f0f7ff" : "#fffbeb";

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

  const renderIdCell = (attr, idx) => {
    if (!attr) return <div key={`id-empty-${idx}`} style={{ height: ROW_HEIGHT }} />;
    const label =
      attr.identifierType === "reference" ? `${attr.name}(R)` : attr.name;
    return (
      <div
        key={attr.id}
        style={{
          height: ROW_HEIGHT,
          display: "flex",
          alignItems: "center",
          padding: "0 6px",
          fontWeight: 600,
          color: "#111827",
          overflow: "hidden",
          whiteSpace: "nowrap",
          textOverflow: "ellipsis",
        }}
      >
        {label}
      </div>
    );
  };

  const renderAttrCell = (attr, idx) => {
    if (!attr) return <div key={`attr-empty-${idx}`} style={{ height: ROW_HEIGHT }} />;
    return (
      <div
        key={attr.id}
        style={{
          height: ROW_HEIGHT,
          display: "flex",
          alignItems: "center",
          padding: "0 6px",
          color: "#374151",
          overflow: "hidden",
          whiteSpace: "nowrap",
          textOverflow: "ellipsis",
        }}
      >
        {attr.name}
      </div>
    );
  };

  return (
    <g transform={`translate(${entity.x}, ${entity.y})`}>
      {isSelected && (
        <rect
          x={-3}
          y={-3}
          width={ENTITY_WIDTH + 6}
          height={totalHeight + 6}
          rx={2}
          ry={2}
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
            overflow: "hidden",
            border: "2px solid #1f2937",
            userSelect: "none",
            fontSize: "12px",
            fontFamily: "'Noto Sans JP', 'Hiragino Sans', -apple-system, sans-serif",
          }}
        >
          {/* Header: name left, R/E badge right */}
          <div
            style={{
              height: HEADER_HEIGHT,
              backgroundColor: headerColor,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "0 8px",
              color: "#ffffff",
              fontWeight: 700,
              borderBottom: "2px solid #1f2937",
            }}
          >
            <span
              style={{
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
                flex: 1,
              }}
            >
              {entity.name}
            </span>
            <span
              style={{
                fontSize: "11px",
                fontWeight: 800,
                marginLeft: 8,
                flexShrink: 0,
              }}
            >
              {entity.type === "resource" ? "R" : "E"}
            </span>
          </div>

          {/* Body: two-column T-shaped layout */}
          <div
            style={{
              display: "flex",
              height: bodyHeight,
              backgroundColor: bodyBg,
            }}
          >
            {/* Left column: identifiers */}
            <div
              style={{
                width: ID_COL_WIDTH,
                borderRight: "2px solid #1f2937",
                overflow: "hidden",
              }}
            >
              {Array.from({ length: rowCount }, (_, i) =>
                renderIdCell(identifiers[i], i)
              )}
            </div>

            {/* Right column: general attributes */}
            <div
              style={{
                width: ATTR_COL_WIDTH,
                overflow: "hidden",
              }}
            >
              {Array.from({ length: rowCount }, (_, i) =>
                renderAttrCell(attributes[i], i)
              )}
            </div>
          </div>
        </div>
      </foreignObject>
    </g>
  );
}
