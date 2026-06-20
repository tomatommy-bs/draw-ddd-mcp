import React from "react";
import { useDiagram } from "../context/DiagramContext";

const REF_PATTERN = /\[\[(R|E):([^\]]+)\]\]/g;

export default function DefinitionText({ text, onEntityClick }) {
  const { entities } = useDiagram();

  if (!text) return null;

  const parts = [];
  let lastIndex = 0;
  let match;
  const re = new RegExp(REF_PATTERN.source, "g");

  while ((match = re.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push({ type: "text", value: text.slice(lastIndex, match.index) });
    }

    const entityType = match[1] === "R" ? "resource" : "event";
    const entityName = match[2];
    const entity = entities.find(
      (e) => e.name === entityName && e.type === entityType,
    );

    parts.push({
      type: "ref",
      entityType,
      entityName,
      entity,
      raw: match[0],
    });

    lastIndex = re.lastIndex;
  }

  if (lastIndex < text.length) {
    parts.push({ type: "text", value: text.slice(lastIndex) });
  }

  return (
    <span>
      {parts.map((part, i) => {
        if (part.type === "text") {
          return <span key={i}>{part.value}</span>;
        }

        const isBroken = !part.entity;
        const colorClass =
          part.entityType === "resource"
            ? "text-blue-500"
            : "text-amber-500";

        return (
          <button
            key={i}
            onClick={() => !isBroken && onEntityClick?.(part.entity.id)}
            className={`inline font-medium underline decoration-dotted ${
              isBroken
                ? "text-red-500 line-through cursor-default"
                : `${colorClass} hover:opacity-70 cursor-pointer`
            }`}
            disabled={isBroken}
            title={
              isBroken
                ? `${part.entityType === "resource" ? "R" : "E"}:${part.entityName} (not found)`
                : `${part.entityType === "resource" ? "Resource" : "Event"}: ${part.entityName}`
            }
          >
            {part.entityName}
          </button>
        );
      })}
    </span>
  );
}
