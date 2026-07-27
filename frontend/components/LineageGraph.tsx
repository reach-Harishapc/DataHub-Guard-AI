"use client";

import { useMemo } from "react";
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  MarkerType,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";

interface LineageGraphProps {
  datasetUrn: string;
  upstream: string[];
  downstream: string[];
}

export default function LineageGraph({ datasetUrn, upstream, downstream }: LineageGraphProps) {
  // Simple layout: upstream left, main center, downstream right
  const initialNodes = useMemo(() => {
    const nodes = [];
    
    // Main Node
    nodes.push({
      id: datasetUrn,
      position: { x: 300, y: 150 },
      data: { label: datasetUrn.split(",")[1] || datasetUrn },
      style: { backgroundColor: "#fee2e2", border: "1px solid #ef4444", borderRadius: "8px", padding: "10px", fontWeight: "bold" }
    });

    // Upstream Nodes
    upstream.forEach((urn, idx) => {
      nodes.push({
        id: urn,
        position: { x: 50, y: 50 + (idx * 80) },
        data: { label: urn.split(",")[1] || urn },
        style: { borderRadius: "8px", padding: "10px", border: "1px solid #cbd5e1" }
      });
    });

    // Downstream Nodes
    downstream.forEach((urn, idx) => {
      nodes.push({
        id: urn,
        position: { x: 550, y: 50 + (idx * 80) },
        data: { label: urn.split(",")[1] || urn },
        style: { borderRadius: "8px", padding: "10px", border: "1px solid #f59e0b", backgroundColor: "#fef3c7" }
      });
    });

    return nodes;
  }, [datasetUrn, upstream, downstream]);

  const initialEdges = useMemo(() => {
    const edges: any[] = [];
    
    upstream.forEach((urn) => {
      edges.push({
        id: `e-${urn}-${datasetUrn}`,
        source: urn,
        target: datasetUrn,
        animated: true,
        markerEnd: { type: MarkerType.ArrowClosed },
      });
    });

    downstream.forEach((urn) => {
      edges.push({
        id: `e-${datasetUrn}-${urn}`,
        source: datasetUrn,
        target: urn,
        animated: true,
        style: { stroke: "#f59e0b", strokeWidth: 2 },
        markerEnd: { type: MarkerType.ArrowClosed, color: "#f59e0b" },
      });
    });

    return edges;
  }, [datasetUrn, upstream, downstream]);

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  return (
    <div style={{ height: "400px", width: "100%", border: "1px solid #e2e8f0", borderRadius: "12px", background: "white" }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        fitView
      >
        <Controls />
        <MiniMap />
        <Background gap={12} size={1} />
      </ReactFlow>
    </div>
  );
}
