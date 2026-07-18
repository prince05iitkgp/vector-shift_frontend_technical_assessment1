/**
 * ui.js — ReactFlow canvas
 *
 * Wraps the ReactFlow component with:
 *   - Drag-and-drop node creation (from sidebar → canvas)
 *   - Snap-to-grid layout (20×20px)
 *   - Background dot grid, zoom controls, and a color-coded minimap
 *
 * The nodeTypes map is built automatically from NodeRegistry, which is
 * populated by the side-effect imports in App.js.
 */

import { useState, useRef, useCallback }            from 'react';
import ReactFlow, { Controls, Background, MiniMap } from 'reactflow';
import { useStore }      from './store';

import { NodeRegistry }  from './domain/NodeRegistry';
import 'reactflow/dist/style.css';

const GRID_SIZE  = 20;
const PRO_OPTIONS = { hideAttribution: true };

// Built once at module load time — all nodes have registered by this point
// because App.js imported every node file before rendering PipelineUI.
const nodeTypes = NodeRegistry.getNodeTypes();

// Zustand selectors — subscribe to only what the canvas needs.

// Maps node types to their accent colors for the minimap.
// These must be hex/rgba values — CSS variables don't resolve inside <canvas>.
const MINIMAP_COLORS = {
  customInput:  '#4f8ef7', // blue
  customOutput: '#10b981', // teal
  llm:          '#8b5cf6', // purple
  text:         '#f59e0b', // amber
  math:         '#84cc16', // lime
  api:          '#6366f1', // indigo
  note:         '#f97316', // orange
  prompt:       '#ec4899', // pink
  fileInput:    '#06b6d4', // cyan
};

export const PipelineUI = () => {
  const reactFlowWrapper   = useRef(null);
  const [reactFlowInstance, setReactFlowInstance] = useState(null);

  const nodes = useStore((s) => s.nodes);
  const edges = useStore((s) => s.edges);
  const getNodeID = useStore((s) => s.getNodeID);
  const addNode = useStore((s) => s.addNode);
  const onNodesChange = useStore((s) => s.onNodesChange);
  const onEdgesChange = useStore((s) => s.onEdgesChange);
  const onConnect = useStore((s) => s.onConnect);

  /**
   * Builds the initial data payload for a newly dropped node.
   * The id and nodeType are sufficient for all node components to initialize
   * their local state from defaults.
   */
  const getInitNodeData = useCallback((nodeID, type) => ({
    id:       nodeID,
    nodeType: type,
  }), []);

  /**
   * Handles a node being dropped from the sidebar onto the canvas.
   *
   * Flow:
   *   1. Read the node type from the drag event's dataTransfer payload
   *   2. Convert the drop position from screen coordinates to canvas coordinates
   *   3. Generate a unique ID and add the node to the store
   */
  const onDrop = useCallback(
    (event) => {
      event.preventDefault();
      if (!reactFlowInstance || !reactFlowWrapper.current) return;

      const rawData = event?.dataTransfer?.getData('application/reactflow');
      if (!rawData) return;

      const appData = JSON.parse(rawData);
      const type    = appData?.nodeType;
      if (!type) return;

      // project() converts browser-space coordinates to ReactFlow's canvas space,
      // accounting for current pan and zoom level.
      const bounds   = reactFlowWrapper.current.getBoundingClientRect();
      const position = reactFlowInstance.project({
        x: event.clientX - bounds.left,
        y: event.clientY - bounds.top,
      });

      const nodeID  = getNodeID(type);
      const newNode = {
        id:       nodeID,
        type,
        position,
        data:     getInitNodeData(nodeID, type),
      };

      addNode(newNode);
    },
    [reactFlowInstance, getNodeID, addNode, getInitNodeData]
  );

  const onDragOver = useCallback((event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  return (
    <div
      ref={reactFlowWrapper}
      style={{ width: '100%', height: '100%', flex: 1, position: 'relative' }}
    >
      {/* Empty state hint — only shown when the canvas has no nodes */}
      {nodes.length === 0 && (
        <div style={{
          position:  'absolute', top: '50%', left: '50%',
          transform: 'translate(-50%, -50%)',
          zIndex:    10,
          color:     'var(--text-muted)',
          fontSize:  13,
          fontWeight: 500,
          background:   'var(--bg-surface)',
          padding:      '12px 24px',
          borderRadius: 8,
          border:       '1px dashed var(--border-node)',
          display:      'flex',
          alignItems:   'center',
          gap:          8,
        }}>
          <span style={{ fontSize: 16 }}>☝️</span>
          Drag nodes from the left sidebar to build your pipeline
        </div>
      )}

      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onDrop={onDrop}
        onDragOver={onDragOver}
        onInit={setReactFlowInstance}
        nodeTypes={nodeTypes}
        proOptions={PRO_OPTIONS}
        snapGrid={[GRID_SIZE, GRID_SIZE]}
        snapToGrid
        connectionLineType="smoothstep"
        fitView
        deleteKeyCode={['Backspace', 'Delete']}
        aria-label="Pipeline canvas"
      >
        <Background
          color="rgba(255,255,255,0.07)"
          gap={GRID_SIZE}
          size={1}
          variant="dots"
        />
        <Controls />
        <MiniMap
          nodeColor={(node) => MINIMAP_COLORS[node.type] ?? '#94a3b8'}
          maskColor="rgba(13, 17, 23, 0.75)"
          style={{
            background:   'rgba(13, 17, 23, 0.6)',
            border:       '1px solid rgba(255,255,255,0.06)',
            borderRadius: 10,
          }}
        />
      </ReactFlow>
    </div>
  );
};
