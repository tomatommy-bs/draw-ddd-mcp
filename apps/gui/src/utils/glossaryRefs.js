const REF_PATTERN = /\[\[(R|E):([^\]]+)\]\]/g;

export function parseRefs(text) {
  const refs = [];
  let match;
  while ((match = REF_PATTERN.exec(text)) !== null) {
    refs.push({
      type: match[1] === "R" ? "resource" : "event",
      name: match[2],
      raw: match[0],
      index: match.index,
    });
  }
  return refs;
}

export function resolveRef(ref, entities) {
  return entities.find(
    (e) => e.name === ref.name && e.type === ref.type,
  ) ?? null;
}
