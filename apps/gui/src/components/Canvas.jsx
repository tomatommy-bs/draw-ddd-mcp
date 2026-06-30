import React, { useMemo, useCallback, useEffect, useState, useRef } from "react";
import { ReactFlow, Background, BackgroundVariant, applyNodeChanges } from "@xyflow/react";
import { useDiagram } from "../context/DiagramContext";
import TMEntityNode, { ENTITY_WIDTH } from "./nodes/TMEntityNode";
import TMNoteNode from "./nodes/TMNoteNode";
import TMReferenceEdge from "./edges/TMReferenceEdge";
import TMCorrespondenceEdge from "./edges/TMCorrespondenceEdge";

const nodeTypes = { tmEntity: TMEntityNode, tmNote: TMNoteNode };
const edgeTypes = { tmReference: TMReferenceEdge, tmCorrespondence: TMCorrespondenceEdge };

const HEADER_HEIGHT = 36;
const ROW_HEIGHT = 28;

function getNodeSize(nodeData, nodeType) {
  if (nodeType === "tmEntity") {
    const ids = nodeData.attributes.filter((a) => a.isIdentifier).length;
    const attrs = nodeData.attributes.filter((a) => !a.isIdentifier).length;
    const rows = Math.max(ids, attrs, 1);
    return { w: ENTITY_WIDTH, h: HEADER_HEIGHT + rows * ROW_HEIGHT };
  }
  return { w: nodeData.width || 200, h: nodeData.height || 120 };
}

function bestSide(srcPos, srcData, srcType, tgtPos, tgtData, tgtType) {
  const srcSize = getNodeSize(srcData, srcType);
  const tgtSize = getNodeSize(tgtData, tgtType);

  const scx = srcPos.x + srcSize.w / 2;
  const scy = srcPos.y + srcSize.h / 2;
  const tcx = tgtPos.x + tgtSize.w / 2;
  const tcy = tgtPos.y + tgtSize.h / 2;

  const dx = tcx - scx;
  const dy = tcy - scy;

  if (Math.abs(dx) > Math.abs(dy)) {
    return {
      sourceHandle: dx > 0 ? "right-src" : "left-src",
      targetHandle: dx > 0 ? "left" : "right",
    };
  }
  return {
    sourceHandle: dy > 0 ? "bottom-src" : "top-src",
    targetHandle: dy > 0 ? "top" : "bottom",
  };
}

function deriveNodes(entities, notes, selectedId, entityViolations, highlight) {
  const highlightMap = {};
  if (highlight?.targets) {
    for (const t of highlight.targets) {
      highlightMap[t.entityId] = t.attributeIds || null;
    }
  }
  return [
    ...entities.map((e) => {
      const hl = highlightMap[e.id];
      return {
        id: e.id,
        type: "tmEntity",
        position: { x: e.x, y: e.y },
        data: {
          ...e,
          violations: entityViolations[e.id] || [],
          highlight: hl !== undefined ? (hl === null ? 'entity' : hl) : null,
          highlightUsecase: highlight?.usecaseName || null,
        },
        selected: e.id === selectedId,
      };
    }),
    ...notes.map((n) => ({
      id: n.id,
      type: "tmNote",
      position: { x: n.x, y: n.y },
      data: n,
      selected: n.id === selectedId,
    })),
  ];
}

function findCorrespondencePatterns(references, nodeMap) {
  const corrEdges = [];
  const consumedRefIds = new Set();

  const corrNodes = [...nodeMap.values()].filter(
    (n) => n.type === "tmEntity" && n.data.subtype === "correspondence",
  );

  for (const corrNode of corrNodes) {
    const outRefs = references.filter((r) => r.sourceEntityId === corrNode.id);
    const resourceRefs = outRefs.filter((r) => {
      const tgt = nodeMap.get(r.targetEntityId);
      return tgt && tgt.data.type === "resource";
    });

    if (resourceRefs.length === 2) {
      const [ref1, ref2] = resourceRefs;
      const r1Node = nodeMap.get(ref1.targetEntityId);
      const r2Node = nodeMap.get(ref2.targetEntityId);

      if (r1Node && r2Node) {
        const sides = bestSide(
          r1Node.position, r1Node.data, r1Node.type,
          r2Node.position, r2Node.data, r2Node.type,
        );

        const corrSize = getNodeSize(corrNode.data, corrNode.type);
        const corrCenterX = corrNode.position.x + corrSize.w / 2;
        const corrCenterY = corrNode.position.y + 0;

        corrEdges.push({
          id: `corr-${corrNode.id}`,
          type: "tmCorrespondence",
          source: ref1.targetEntityId,
          target: ref2.targetEntityId,
          sourceHandle: sides.sourceHandle,
          targetHandle: sides.targetHandle,
          data: {
            corrNode: { x: corrCenterX, y: corrCenterY },
            corrEntityId: corrNode.id,
            ref1,
            ref2,
          },
        });

        consumedRefIds.add(ref1.id);
        consumedRefIds.add(ref2.id);
      }
    }
  }

  return { corrEdges, consumedRefIds };
}

function deriveEdges(references, nodeMap, referenceViolations) {
  const { corrEdges, consumedRefIds } = findCorrespondencePatterns(references, nodeMap);

  const normalEdges = references
    .filter((r) => !consumedRefIds.has(r.id))
    .map((r) => {
      const src = nodeMap.get(r.sourceEntityId);
      const tgt = nodeMap.get(r.targetEntityId);

      let sourceHandle = "bottom-src";
      let targetHandle = "top";

      if (src && tgt) {
        const sides = bestSide(src.position, src.data, src.type, tgt.position, tgt.data, tgt.type);
        sourceHandle = sides.sourceHandle;
        targetHandle = sides.targetHandle;
      }

      return {
        id: r.id,
        type: "tmReference",
        source: r.sourceEntityId,
        target: r.targetEntityId,
        sourceHandle,
        targetHandle,
        data: { ...r, violations: referenceViolations[r.id] || [] },
      };
    });

  return [...normalEdges, ...corrEdges];
}

function buildNodeMap(nodes) {
  const map = new Map();
  for (const n of nodes) {
    map.set(n.id, n);
  }
  return map;
}

export default function Canvas() {
  const { entities, references, notes, selectedId, setSelectedId, updateEntity, updateNote, violations, highlight } =
    useDiagram();

  const [nodes, setNodes] = useState(() => deriveNodes(entities, notes, selectedId, violations.entityViolations, highlight));
  const nodesRef = useRef(nodes);

  useEffect(() => {
    const next = deriveNodes(entities, notes, selectedId, violations.entityViolations, highlight);
    setNodes(next);
    nodesRef.current = next;
  }, [entities, notes, selectedId, violations, highlight]);

  const [edges, setEdges] = useState(() => deriveEdges(references, buildNodeMap(nodes), violations.referenceViolations));

  useEffect(() => {
    setEdges(deriveEdges(references, buildNodeMap(nodesRef.current), violations.referenceViolations));
  }, [references, violations]);

  const recalcEdges = useCallback(
    (currentNodes) => {
      setEdges(deriveEdges(references, buildNodeMap(currentNodes), violations.referenceViolations));
    },
    [references, violations],
  );

  const onNodesChange = useCallback(
    (changes) => {
      setNodes((nds) => {
        const next = applyNodeChanges(changes, nds);
        nodesRef.current = next;
        return next;
      });
    },
    [],
  );

  const onNodeDrag = useCallback(
    () => {
      recalcEdges(nodesRef.current);
    },
    [recalcEdges],
  );

  const onNodeDragStop = useCallback(
    (_event, node) => {
      const { x, y } = node.position;
      if (node.type === "tmEntity") updateEntity(node.id, { x, y });
      else if (node.type === "tmNote") updateNote(node.id, { x, y });
    },
    [updateEntity, updateNote],
  );

  const onPaneClick = useCallback(() => setSelectedId(null), [setSelectedId]);

  const onNodeClick = useCallback(
    (_event, node) => setSelectedId(node.id),
    [setSelectedId],
  );

  return (
    <div className="flex-1" style={{ backgroundColor: "var(--bg-root)" }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        onNodeDrag={onNodeDrag}
        onNodeDragStop={onNodeDragStop}
        onPaneClick={onPaneClick}
        onNodeClick={onNodeClick}
        minZoom={0.2}
        maxZoom={3}
        defaultViewport={{ x: 0, y: 0, zoom: 1 }}
        proOptions={{ hideAttribution: true }}
        fitView={false}
        selectNodesOnDrag={false}
        elementsSelectable
        nodesDraggable
        nodesConnectable={false}
      >
        <Background variant={BackgroundVariant.Dots} gap={24} size={1} color="#d4d4d4" />
      </ReactFlow>
    </div>
  );
}
