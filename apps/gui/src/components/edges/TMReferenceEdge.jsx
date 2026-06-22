import React, { memo } from "react";
import { BaseEdge, getSmoothStepPath } from "@xyflow/react";

const LINE_COLOR = "#d4d4d4";
const SYMBOL_COLOR = "#a3a3a3";
const SYMBOL_SIZE = 10;

const positionToVector = {
  top: { ux: 0, uy: -1 },
  bottom: { ux: 0, uy: 1 },
  left: { ux: -1, uy: 0 },
  right: { ux: 1, uy: 0 },
};

function CardinalitySymbol({ x, y, ux, uy, cardinality }) {
  const px = -uy;
  const py = ux;

  if (cardinality === "1") {
    return (
      <line
        x1={x + px * SYMBOL_SIZE}
        y1={y + py * SYMBOL_SIZE}
        x2={x - px * SYMBOL_SIZE}
        y2={y - py * SYMBOL_SIZE}
        stroke={SYMBOL_COLOR}
        strokeWidth={1.5}
      />
    );
  }

  if (cardinality === "N") {
    const tipX = x + ux * SYMBOL_SIZE * 1.2;
    const tipY = y + uy * SYMBOL_SIZE * 1.2;
    return (
      <g>
        <line x1={tipX} y1={tipY} x2={x + px * SYMBOL_SIZE} y2={y + py * SYMBOL_SIZE} stroke={SYMBOL_COLOR} strokeWidth={1.5} />
        <line x1={tipX} y1={tipY} x2={x} y2={y} stroke={SYMBOL_COLOR} strokeWidth={1.5} />
        <line x1={tipX} y1={tipY} x2={x - px * SYMBOL_SIZE} y2={y - py * SYMBOL_SIZE} stroke={SYMBOL_COLOR} strokeWidth={1.5} />
      </g>
    );
  }

  return null;
}

function TMReferenceEdge({ id, sourceX, sourceY, targetX, targetY, sourcePosition, targetPosition, data }) {
  const [edgePath, labelX, labelY] = getSmoothStepPath({
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
    borderRadius: 8,
  });

  const parts = (data?.cardinality || "1:N").split(":");
  const sourceCard = parts[0] || "1";
  const targetCard = parts[1] || "N";

  const srcVec = positionToVector[sourcePosition] || { ux: 0, uy: 1 };
  const tgtVec = positionToVector[targetPosition] || { ux: 0, uy: -1 };

  const srcSymX = sourceX + srcVec.ux * 4;
  const srcSymY = sourceY + srcVec.uy * 4;
  const tgtSymX = targetX + tgtVec.ux * 4;
  const tgtSymY = targetY + tgtVec.uy * 4;

  return (
    <>
      <BaseEdge id={id} path={edgePath} style={{ stroke: LINE_COLOR, strokeWidth: 1 }} />

      <CardinalitySymbol x={srcSymX} y={srcSymY} ux={srcVec.ux} uy={srcVec.uy} cardinality={sourceCard} />
      <CardinalitySymbol x={tgtSymX} y={tgtSymY} ux={tgtVec.ux} uy={tgtVec.uy} cardinality={targetCard} />

      {data?.label && (
        <>
          <rect
            x={labelX - 30}
            y={labelY - 10}
            width={60}
            height={20}
            rx={4}
            fill="#ffffff"
            stroke="#e5e5e5"
            strokeWidth={1}
          />
          <text
            x={labelX}
            y={labelY}
            textAnchor="middle"
            dominantBaseline="middle"
            fontSize={10}
            fontFamily="'JetBrains Mono', monospace"
            fill="#a3a3a3"
          >
            {data.label}
          </text>
        </>
      )}
    </>
  );
}

export default memo(TMReferenceEdge);
