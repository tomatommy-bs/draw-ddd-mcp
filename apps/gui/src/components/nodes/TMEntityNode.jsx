import React, { memo } from "react";
import { Handle, Position } from "@xyflow/react";

export const ENTITY_WIDTH = 280;
const HEADER_HEIGHT = 36;
const ROW_HEIGHT = 28;
const MIN_ROWS = 1;
const ID_COL_RATIO = 0.4;
const ID_COL_WIDTH = Math.floor(ENTITY_WIDTH * ID_COL_RATIO);
const ATTR_COL_WIDTH = ENTITY_WIDTH - ID_COL_WIDTH;

const handleStyle = { opacity: 0, width: 1, height: 1, border: 'none', background: 'transparent' };

function TMEntityNode({ data, selected }) {
  const entity = data;
  const identifiers = entity.attributes.filter((a) => a.isIdentifier);
  const attributes = entity.attributes.filter((a) => !a.isIdentifier);
  const rowCount = Math.max(identifiers.length, attributes.length, MIN_ROWS);
  const bodyHeight = rowCount * ROW_HEIGHT;
  const totalHeight = HEADER_HEIGHT + bodyHeight;

  const entityViolations = entity.violations || [];
  const hasViolation = entityViolations.length > 0;

  const isResource = entity.type === "resource";
  const accentColor = isResource ? '#3b82f6' : '#f59e0b';
  const accentMuted = isResource
    ? 'rgba(59,130,246,0.06)'
    : 'rgba(245,158,11,0.06)';

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
    <>
      <Handle type="target" position={Position.Top} id="top" style={handleStyle} />
      <Handle type="source" position={Position.Top} id="top-src" style={handleStyle} />
      <Handle type="target" position={Position.Bottom} id="bottom" style={handleStyle} />
      <Handle type="source" position={Position.Bottom} id="bottom-src" style={handleStyle} />
      <Handle type="target" position={Position.Left} id="left" style={handleStyle} />
      <Handle type="source" position={Position.Left} id="left-src" style={handleStyle} />
      <Handle type="target" position={Position.Right} id="right" style={handleStyle} />
      <Handle type="source" position={Position.Right} id="right-src" style={handleStyle} />

      <div
        style={{
          width: ENTITY_WIDTH,
          height: totalHeight,
          overflow: "hidden",
          border: `1px solid ${hasViolation ? '#ef4444' : selected ? accentColor : '#e5e5e5'}`,
          borderRadius: '8px',
          userSelect: "none",
          fontSize: "12px",
          fontFamily: "'Inter', -apple-system, sans-serif",
          backgroundColor: '#ffffff',
          boxShadow: hasViolation
            ? '0 0 0 3px rgba(239,68,68,0.12), 0 4px 12px rgba(239,68,68,0.08)'
            : selected
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
          {hasViolation && (
            <span
              title={entityViolations.map((v) => v.message).join('\n')}
              style={{
                fontSize: '9px',
                fontWeight: 700,
                marginLeft: 4,
                flexShrink: 0,
                width: 16,
                height: 16,
                borderRadius: '50%',
                backgroundColor: '#ef4444',
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                lineHeight: 1,
              }}
            >
              {entityViolations.length}
            </span>
          )}
        </div>

        <div style={{ display: "flex", height: bodyHeight }}>
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

          <div style={{ width: ATTR_COL_WIDTH, overflow: "hidden" }}>
            {Array.from({ length: rowCount }, (_, i) =>
              renderAttrCell(attributes[i], i)
            )}
          </div>
        </div>
      </div>
    </>
  );
}

export default memo(TMEntityNode);
