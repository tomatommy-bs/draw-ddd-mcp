import React, { useRef, useCallback, useState } from "react";
import { useDiagram } from "../context/DiagramContext";

export const ENTITY_WIDTH = 280;
const HEADER_HEIGHT = 36;
const ROW_HEIGHT = 28;
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

  const isResource = entity.type === "resource";
  const accentColor = isResource ? '#3b82f6' : '#f59e0b';
  const accentMuted = isResource
    ? 'rgba(59,130,246,0.06)'
    : 'rgba(245,158,11,0.06)';

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
          padding: "0 10px",
          fontWeight: 500,
          color: '#171717',
          overflow: "hidden",
          whiteSpace: "nowrap",
          textOverflow: "ellipsis",
          fontFamily: "'JetBrains Mono', 'SF Mono', monospace",
          fontSize: '11px',
          letterSpacing: '0.01em',
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
          padding: "0 10px",
          color: '#525252',
          overflow: "hidden",
          whiteSpace: "nowrap",
          textOverflow: "ellipsis",
          fontFamily: "'JetBrains Mono', 'SF Mono', monospace",
          fontSize: '11px',
          letterSpacing: '0.01em',
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
          x={-2}
          y={-2}
          width={ENTITY_WIDTH + 4}
          height={totalHeight + 4}
          rx={10}
          ry={10}
          fill="none"
          stroke={accentColor}
          strokeWidth={1.5}
          opacity={0.5}
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
            border: `1px solid ${isSelected ? accentColor : '#e5e5e5'}`,
            borderRadius: '8px',
            userSelect: "none",
            fontSize: "12px",
            fontFamily: "'Inter', -apple-system, sans-serif",
            backgroundColor: '#ffffff',
            boxShadow: isSelected
              ? `0 0 0 3px ${isResource ? 'rgba(59,130,246,0.12)' : 'rgba(245,158,11,0.12)'}, 0 4px 12px rgba(0,0,0,0.08)`
              : '0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)',
            transition: 'border-color 0.15s, box-shadow 0.15s',
          }}
        >
          <div
            style={{
              height: HEADER_HEIGHT,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "0 12px",
              borderBottom: '1px solid #e5e5e5',
              background: `linear-gradient(135deg, ${accentMuted} 0%, transparent 60%)`,
            }}
          >
            <span
              style={{
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
                flex: 1,
                fontWeight: 600,
                fontSize: '13px',
                color: '#171717',
                letterSpacing: '-0.01em',
              }}
            >
              {entity.name}
            </span>
            <span
              style={{
                fontSize: '10px',
                fontWeight: 600,
                marginLeft: 8,
                flexShrink: 0,
                padding: '2px 6px',
                borderRadius: '4px',
                backgroundColor: isResource
                  ? 'rgba(59,130,246,0.1)'
                  : 'rgba(245,158,11,0.1)',
                color: accentColor,
                fontFamily: "'JetBrains Mono', monospace",
                letterSpacing: '0.05em',
              }}
            >
              {isResource ? "R" : "E"}
            </span>
          </div>

          <div
            style={{
              display: "flex",
              height: bodyHeight,
            }}
          >
            <div
              style={{
                width: ID_COL_WIDTH,
                borderRight: '1px solid #e5e5e5',
                overflow: "hidden",
                backgroundColor: accentMuted,
              }}
            >
              {Array.from({ length: rowCount }, (_, i) =>
                renderIdCell(identifiers[i], i)
              )}
            </div>

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
