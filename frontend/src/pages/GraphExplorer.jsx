import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import ReactFlow, { 
  MiniMap, 
  Controls, 
  Background, 
  useNodesState, 
  useEdgesState,
  MarkerType
} from 'reactflow';
import 'reactflow/dist/style.css';
import { getFullGraph, getJobGraph, getSkillGraph } from '../lib/api';
import { Network, RefreshCw } from 'lucide-react';
import dagre from 'dagre';

const dagreGraph = new dagre.graphlib.Graph();
dagreGraph.setDefaultEdgeLabel(() => ({}));

const getLayoutedElements = (nodes, edges, direction = 'TB') => {
  const isHorizontal = direction === 'LR';
  dagreGraph.setGraph({ rankdir: direction });

  nodes.forEach((node) => {
    dagreGraph.setNode(node.id, { width: 180, height: 60 });
  });

  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target);
  });

  dagre.layout(dagreGraph);

  nodes.forEach((node) => {
    const nodeWithPosition = dagreGraph.node(node.id);
    node.targetPosition = isHorizontal ? 'left' : 'top';
    node.sourcePosition = isHorizontal ? 'right' : 'bottom';
    
    // Slight offset to center
    node.position = {
      x: nodeWithPosition.x - 90,
      y: nodeWithPosition.y - 30,
    };

    return node;
  });

  return { nodes, edges };
};

// Node colors based on label
const getColor = (label) => {
  switch (label) {
    case 'Job': return '#6366F1'; // primary
    case 'Skill': return '#22C55E'; // success
    case 'Company': return '#F59E0B'; // warning
    case 'Person': return '#E879F9'; // purple
    default: return '#94A3B8'; // secondary
  }
};

export default function GraphExplorer() {
  const [searchParams, setSearchParams] = useSearchParams();
  const jobId = searchParams.get('jobId');
  const skillId = searchParams.get('skillId');

  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchGraphData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      let res;
      if (jobId) {
        res = await getJobGraph(jobId);
      } else if (skillId) {
        res = await getSkillGraph(skillId);
      } else {
        res = await getFullGraph();
      }

      const initialNodes = res.data.nodes.map(n => ({
        id: n.id,
        data: { 
          label: (
            <div className="flex flex-col items-center">
              <span className="text-[10px] uppercase opacity-70 mb-1">{n.label}</span>
              <span className="font-bold">{n.properties.title || n.properties.name}</span>
            </div>
          ) 
        },
        style: {
          background: '#121821', // cards
          color: '#F8FAFC',
          border: `2px solid ${getColor(n.label)}`,
          borderRadius: '8px',
          padding: '10px',
          width: 180,
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.5)'
        }
      }));

      const initialEdges = res.data.edges.map(e => ({
        id: e.id,
        source: e.source,
        target: e.target,
        label: e.type,
        labelStyle: { fill: '#F8FAFC', fontWeight: 500, fontSize: 10 },
        labelBgStyle: { fill: '#0B0F14' },
        style: { stroke: '#64748B', strokeWidth: 1.5 },
        markerEnd: {
          type: MarkerType.ArrowClosed,
          color: '#64748B',
        },
      }));

      const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(
        initialNodes,
        initialEdges
      );

      setNodes(layoutedNodes);
      setEdges(layoutedEdges);
    } catch (err) {
      console.error(err);
      setError('Unable to load graph data.');
    } finally {
      setLoading(false);
    }
  }, [jobId, skillId, setNodes, setEdges]);

  useEffect(() => {
    fetchGraphData();
  }, [fetchGraphData]);

  const handleReset = () => {
    setSearchParams({});
  };

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] animate-in fade-in duration-500">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-text mb-2 flex items-center gap-3">
            <Network className="text-primary" /> Graph Explorer
          </h1>
          <p className="text-secondary">Visually explore relationships between jobs, skills, and companies.</p>
        </div>
        
        <div className="flex gap-4">
          {(jobId || skillId) && (
            <button 
              onClick={handleReset}
              className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-text transition-colors"
            >
              Show Full Graph
            </button>
          )}
          <button 
            onClick={fetchGraphData}
            className="flex items-center gap-2 p-2 bg-primary/20 text-primary hover:bg-primary/30 rounded-lg transition-colors"
            title="Refresh Graph"
          >
            <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      <div className="flex-1 glass-card overflow-hidden relative rounded-xl border border-white/10">
        {loading && nodes.length === 0 ? (
          <div className="absolute inset-0 flex items-center justify-center bg-background/50 z-10">
            <div className="flex flex-col items-center">
              <RefreshCw className="w-8 h-8 text-primary animate-spin mb-4" />
              <p className="text-text font-medium">Loading career graph...</p>
            </div>
          </div>
        ) : error ? (
          <div className="absolute inset-0 flex items-center justify-center text-center p-6">
            <div>
              <Network className="w-16 h-16 text-warning mx-auto mb-4 opacity-50" />
              <h2 className="text-xl font-bold text-text mb-2">Something went wrong</h2>
              <p className="text-secondary mb-6">{error}</p>
              <button 
                onClick={fetchGraphData}
                className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
              >
                Retry
              </button>
            </div>
          </div>
        ) : (
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            fitView
            attributionPosition="bottom-right"
            className="bg-background"
          >
            <Controls className="bg-cards border border-white/10 fill-text" />
            <MiniMap 
              nodeColor={n => getColor(n.data.label?.props?.children[0]?.props?.children)}
              maskColor="rgba(11, 15, 20, 0.7)"
              className="bg-cards border border-white/10" 
            />
            <Background color="#ffffff" gap={16} opacity={0.05} />
          </ReactFlow>
        )}
        
        {/* Legend */}
        <div className="absolute bottom-6 left-6 glass-card p-4 flex flex-col gap-2 z-10">
          <h4 className="text-xs font-bold uppercase text-secondary mb-1 tracking-wider">Legend</h4>
          <div className="flex items-center gap-2 text-sm"><div className="w-3 h-3 rounded-full" style={{backgroundColor: '#6366F1'}}></div> Job</div>
          <div className="flex items-center gap-2 text-sm"><div className="w-3 h-3 rounded-full" style={{backgroundColor: '#22C55E'}}></div> Skill</div>
          <div className="flex items-center gap-2 text-sm"><div className="w-3 h-3 rounded-full" style={{backgroundColor: '#F59E0B'}}></div> Company</div>
          <div className="flex items-center gap-2 text-sm"><div className="w-3 h-3 rounded-full" style={{backgroundColor: '#E879F9'}}></div> Person</div>
        </div>
      </div>
    </div>
  );
}
