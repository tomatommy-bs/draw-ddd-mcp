import React from "react";

const ENTITY_WIDTH = 240;
const ENTITY_HEADER_HEIGHT = 36;

function getEntityCenter(entity) {
  if (!entity) return { x: 0, y: 0 };
  return {
    x: entity.x + ENTITY_WIDTH / 2,
    y: entity.y + ENTITY_HEADER_HEIGHT / 2,
  };
}

function getEdgePoint(entity, targetCenter) {
  const cx = entity.x + ENTITY_WIDTH / 2;
  const attrCount = Math.max(entity.attributes?.length || 0, 1);
  const totalHeight = ENTITY_HEADER_HEIGHT + 20 + attrCount * 24 + 8;
  const cy = entity.y + totalHeight / 2;
  const hw = ENTITY_WIDTH / 2;
  const hh = totalHeight / 2;

  const dx = targetCenter.x - cx;
  const dy = targetCenter.y - cy;

  if (dx === 0 && dy === 0) return { x: cx, y: cy };

  const absDx = Math.abs(dx);
  const absDy = Math.abs(dy);

  let ex, ey;
  if (absDx / hw > absDy / hh) {
    // Hit left or right edge
    ex = cx + (dx > 0 ? hw : -hw);
    ey = cy + (dy * hw) / absDx;
  } else {
    // Hit top or bottom edge
    ey = cy + (dy > 0 ? hh : -hh);
    ex = cx + (dx * hh) / absDy;
  }

  return { x: ex, y: ey };
}

export default function TMReference({ reference, entities }) {
  const source = entities.find((e) => e.id === reference.sourceEntityId);
  const target = entities.find((e) => e.id === reference.targetEntityId);

  if (!source || !target) return null;

  const sourceCenter = getEntityCenter(source);
  const targetCenter = getEntityCenter(target);

  const start = getEdgePoint(source, targetCenter);
  const end = getEdgePoint(target, sourceCenter);

  const midX = (start.x + end.x) / 2;
  const midY = (start.y + end.y) / 2;

  // Parse cardinality
  const parts = (reference.cardinality || "1:N").split(":");
  const sourceCard = parts[0] || "1";
  const targetCard = parts[1] || "N";

  // Offset labels slightly from endpoints
  const labelOffset = 20;
  const dx = end.x - start.x;
  const dy = end.y - start.y;
  const len = Math.sqrt(dx * dx + dy * dy) || 1;
  const ux = dx / len;
  const uy = dy / len;

  return (
    <g>
      <line
        x1={start.x}
        y1={start.y}
        x2={end.x}
        y2={end.y}
        stroke="#6b7280"
        strokeWidth={1.5}
        markerEnd="url(#arrowhead)"
      />

      {/* Source cardinality label */}
      <text
        x={start.x + ux * labelOffset + uy * 10}
        y={start.y + uy * labelOffset - ux * 10}
        textAnchor="middle"
        dominantBaseline="middle"
        fontSize={11}
        fontWeight={600}
        fill="#374151"
      >
        {sourceCard}
      </text>

      {/* Target cardinality label */}
      <text
        x={end.x - ux * labelOffset + uy * 10}
        y={end.y - uy * labelOffset - ux * 10}
        textAnchor="middle"
        dominantBaseline="middle"
        fontSize={11}
        fontWeight={600}
        fill="#374151"
      >
        {targetCard}
      </text>

      {/* Midpoint label */}
      {reference.label && (
        <>
          <rect
            x={midX - 30}
            y={midY - 9}
            width={60}
            height={18}
            rx={3}
            fill="white"
            stroke="#d1d5db"
            strokeWidth={0.5}
          />
          <text
            x={midX}
            y={midY}
            textAnchor="middle"
            dominantBaseline="middle"
            fontSize={10}
            fill="#6b7280"
          >
            {reference.label}
          </text>
        </>
      )}
    </g>
  );
}
