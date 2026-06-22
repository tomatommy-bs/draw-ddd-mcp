import React, { memo } from "react";
import { getBezierPath, Position } from "@xyflow/react";

const LINE_COLOR = "#d4d4d4";
const SYMBOL_COLOR = "#a3a3a3";
const SYMBOL_SIZE = 10;
const CORR_COLOR = "#8b5cf6";

function CardinalitySymbol({ x, y, ux, uy, cardinality, color = SYMBOL_COLOR }) {
  const px = -uy;
  const py = ux;

  if (cardinality === "1") {
    return (
      <line
        x1={x + px * SYMBOL_SIZE}
        y1={y + py * SYMBOL_SIZE}
        x2={x - px * SYMBOL_SIZE}
        y2={y - py * SYMBOL_SIZE}
        stroke={color}
        strokeWidth={1.5}
      />
    );
  }

  if (cardinality === "N") {
    const tipX = x + ux * SYMBOL_SIZE * 1.2;
    const tipY = y + uy * SYMBOL_SIZE * 1.2;
    return (
      <g>
        <line x1={tipX} y1={tipY} x2={x + px * SYMBOL_SIZE} y2={y + py * SYMBOL_SIZE} stroke={color} strokeWidth={1.5} />
        <line x1={tipX} y1={tipY} x2={x} y2={y} stroke={color} strokeWidth={1.5} />
        <line x1={tipX} y1={tipY} x2={x - px * SYMBOL_SIZE} y2={y - py * SYMBOL_SIZE} stroke={color} strokeWidth={1.5} />
      </g>
    );
  }

  return null;
}

function getControlPointOffset(position) {
  const dist = 80;
  switch (position) {
    case Position.Top: return { x: 0, y: -dist };
    case Position.Bottom: return { x: 0, y: dist };
    case Position.Left: return { x: -dist, y: 0 };
    case Position.Right: return { x: dist, y: 0 };
    default: return { x: 0, y: 0 };
  }
}

function bezierMidpoint(sx, sy, sPos, tx, ty, tPos) {
  const sOff = getControlPointOffset(sPos);
  const tOff = getControlPointOffset(tPos);
  const cp1x = sx + sOff.x;
  const cp1y = sy + sOff.y;
  const cp2x = tx + tOff.x;
  const cp2y = ty + tOff.y;

  const t = 0.5;
  const mt = 1 - t;
  const mx = mt * mt * mt * sx + 3 * mt * mt * t * cp1x + 3 * mt * t * t * cp2x + t * t * t * tx;
  const my = mt * mt * mt * sy + 3 * mt * mt * t * cp1y + 3 * mt * t * t * cp2y + t * t * t * ty;
  return { x: mx, y: my };
}

function TMCorrespondenceEdge({ id, sourceX, sourceY, targetX, targetY, sourcePosition, targetPosition, data }) {
  const corrNode = data?.corrNode;
  const ref1 = data?.ref1;
  const ref2 = data?.ref2;

  const [mainPath] = getBezierPath({
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
  });

  const mid = bezierMidpoint(sourceX, sourceY, sourcePosition, targetX, targetY, targetPosition);

  const ref1Parts = (ref1?.cardinality || "N:1").split(":");
  const ref2Parts = (ref2?.cardinality || "N:1").split(":");

  const posVec = {
    [Position.Top]: { ux: 0, uy: -1 },
    [Position.Bottom]: { ux: 0, uy: 1 },
    [Position.Left]: { ux: -1, uy: 0 },
    [Position.Right]: { ux: 1, uy: 0 },
  };
  const srcVec = posVec[sourcePosition] || { ux: 1, uy: 0 };
  const tgtVec = posVec[targetPosition] || { ux: -1, uy: 0 };

  return (
    <g>
      <path
        d={mainPath}
        fill="none"
        stroke={LINE_COLOR}
        strokeWidth={1}
      />

      {corrNode && (
        <>
          <line
            x1={mid.x}
            y1={mid.y}
            x2={corrNode.x}
            y2={corrNode.y}
            stroke={CORR_COLOR}
            strokeWidth={1.5}
          />
          <circle
            cx={mid.x}
            cy={mid.y}
            r={4}
            fill={CORR_COLOR}
          />
        </>
      )}

      <CardinalitySymbol
        x={sourceX + srcVec.ux * 4}
        y={sourceY + srcVec.uy * 4}
        ux={srcVec.ux}
        uy={srcVec.uy}
        cardinality={ref1Parts[1] || "1"}
      />
      <CardinalitySymbol
        x={targetX + tgtVec.ux * 4}
        y={targetY + tgtVec.uy * 4}
        ux={tgtVec.ux}
        uy={tgtVec.uy}
        cardinality={ref2Parts[1] || "1"}
      />
    </g>
  );
}

export default memo(TMCorrespondenceEdge);
