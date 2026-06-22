import React, { useMemo, useCallback, useEffect, useState, useRef } from "react";
import { ReactFlow, Background, BackgroundVariant, applyNodeChanges } from "@xyflow/react";
import { useDiagram } from "../context/DiagramContext";
import TMEntityNode, { ENTITY_WIDTH } from "./nodes/TMEntityNode";
import TMNoteNode from "./nodes/TMNoteNode";
import TMReferenceEdge from "./edges/TMReferenceEdge";

const nodeTypes = { tmEntity: TMEntityNode, tmNote: TMNoteNode };
const edgeTypes = { tmReference: TMReferenceEdge };

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

function deriveNodes(entities, notes, selectedId) {
  return [
    ...entities.map((e) => ({
      id: e.id,
      type: "tmEntity",
      position: { x: e.x, y: e.y },
      data: e,
      selected: e.id === selectedId,
    })),
    ...notes.map((n) => ({
      id: n.id,
      type: "tmNote",
      position: { x: n.x, y: n.y },
      data: n,
      selected: n.id === selectedId,
    })),
  ];
}

function deriveEdges(references, nodeMap) {
  return references.map((r) => {
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
      data: r,
    };
  });
}

function buildNodeMap(nodes) {
  const map = new Map();
  for (const n of nodes) {
    map.set(n.id, n);
  }
  return map;
}

export default function Canvas() {
  const { entities, references, notes, selectedId, setSelectedId, updateEntity, updateNote } =
    useDiagram();

  const [nodes, setNodes] = useState(() => deriveNodes(entities, notes, selectedId));
  const nodesRef = useRef(nodes);

  useEffect(() => {
    const next = deriveNodes(entities, notes, selectedId);
    setNodes(next);
    nodesRef.current = next;
  }, [entities, notes, selectedId]);

  const [edges, setEdges] = useState(() => deriveEdges(references, buildNodeMap(nodes)));

  useEffect(() => {
    setEdges(deriveEdges(references, buildNodeMap(nodesRef.current)));
  }, [references]);

  const recalcEdges = useCallback(
    (currentNodes) => {
      setEdges(deriveEdges(references, buildNodeMap(currentNodes)));
    },
    [references],
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
