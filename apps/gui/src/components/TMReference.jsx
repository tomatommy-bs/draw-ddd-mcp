import React from "react";
import { ENTITY_WIDTH } from "./TMEntity";

const HEADER_HEIGHT = 36;
const ROW_HEIGHT = 28;

function getEntityTotalHeight(entity) {
  const identifiers = (entity.attributes || []).filter((a) => a.isIdentifier);
  const attributes = (entity.attributes || []).filter((a) => !a.isIdentifier);
  const rowCount = Math.max(identifiers.length, attributes.length, 1);
  return HEADER_HEIGHT + rowCount * ROW_HEIGHT;
}

function getEntityCenter(entity) {
  if (!entity) return { x: 0, y: 0 };
  const totalHeight = getEntityTotalHeight(entity);
  return {
    x: entity.x + ENTITY_WIDTH / 2,
    y: entity.y + totalHeight / 2,
  };
}

function getEdgePoint(entity, targetCenter) {
  const cx = entity.x + ENTITY_WIDTH / 2;
  const totalHeight = getEntityTotalHeight(entity);
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
    ex = cx + (dx > 0 ? hw : -hw);
    ey = cy + (dy * hw) / absDx;
  } else {
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

  const parts = (reference.cardinality || "1:N").split(":");
  const sourceCard = parts[0] || "1";
  const targetCard = parts[1] || "N";

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
        stroke="#d4d4d4"
        strokeWidth={1}
        markerEnd="url(#arrowhead)"
      />

      <text
        x={start.x + ux * labelOffset + uy * 10}
        y={start.y + uy * labelOffset - ux * 10}
        textAnchor="middle"
        dominantBaseline="middle"
        fontSize={10}
        fontWeight={500}
        fontFamily="'JetBrains Mono', monospace"
        fill="#a3a3a3"
      >
        {sourceCard}
      </text>

      <text
        x={end.x - ux * labelOffset + uy * 10}
        y={end.y - uy * labelOffset - ux * 10}
        textAnchor="middle"
        dominantBaseline="middle"
        fontSize={10}
        fontWeight={500}
        fontFamily="'JetBrains Mono', monospace"
        fill="#a3a3a3"
      >
        {targetCard}
      </text>

      {reference.label && (
        <>
          <rect
            x={midX - 30}
            y={midY - 10}
            width={60}
            height={20}
            rx={4}
            fill="#ffffff"
            stroke="#e5e5e5"
            strokeWidth={1}
          />
          <text
            x={midX}
            y={midY}
            textAnchor="middle"
            dominantBaseline="middle"
            fontSize={10}
            fontFamily="'JetBrains Mono', monospace"
            fill="#a3a3a3"
          >
            {reference.label}
          </text>
        </>
      )}
    </g>
  );
}
