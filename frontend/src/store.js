/**
 * store.js — Zustand global state
 *
 * Single source of truth for:
 *   - nodes / edges (the ReactFlow graph)
 *   - pipelineName (editable in the Header)
 *   - nodeIDs (per-type counters for generating unique IDs)
 *
 * All mutations go through store actions. Components subscribe to
 * only the slices they need via selector functions to minimize re-renders.
 */

import { create }    from 'zustand';
import { addEdge, applyNodeChanges, applyEdgeChanges, MarkerType } from 'reactflow';

// ── Default demo pipeline ────────────────────────────────────────────────────
// Pre-populated so the canvas isn't empty on first load.
// Three pipelines: a calculator, an AI resume reviewer, and an API caller.
const DEFAULT_NODES = [
  // Pipeline 1: Calculator (price × quantity)
  { id: 'customInput-1', type: 'customInput', position: { x: 50,  y: 50  }, data: { inputName: 'price',    inputType: 'Number' } },
  { id: 'customInput-2', type: 'customInput', position: { x: 50,  y: 180 }, data: { inputName: 'quantity', inputType: 'Number' } },
  { id: 'math-1',        type: 'math',        position: { x: 350, y: 100 }, data: {} },
  { id: 'customOutput-1',type: 'customOutput', position: { x: 650, y: 100 }, data: { outputName: 'total_price', outputType: 'Number' } },

  // Pipeline 2: AI Resume Reviewer
  { id: 'customInput-3', type: 'customInput', position: { x: 50,  y: 350 }, data: { inputName: 'resume', inputType: 'File' } },
  { id: 'text-1',        type: 'text',        position: { x: 350, y: 350 }, data: { text: 'You are an expert recruiter.\n\nReview this resume.\n\n{{resume}}' } },
  { id: 'llm-1',         type: 'llm',         position: { x: 650, y: 350 }, data: {} },
  { id: 'customOutput-2',type: 'customOutput', position: { x: 950, y: 350 }, data: { outputName: 'feedback', outputType: 'Text' } },
  { id: 'note-1',        type: 'note',        position: { x: 650, y: 500 }, data: {} },

  // Pipeline 3: Weather API
  { id: 'customInput-4', type: 'customInput', position: { x: 50,  y: 650 }, data: { inputName: 'city', inputType: 'Text' } },
  { id: 'api-1',         type: 'api',         position: { x: 350, y: 650 }, data: {} },
  { id: 'customOutput-3',type: 'customOutput', position: { x: 650, y: 650 }, data: { outputName: 'forecast', outputType: 'JSON' } },
];

// Shared style applied to all edges — animated dashed lines with arrow markers.
// Arrow color must be a hex/rgba value (not a CSS variable) because it is set
// as an SVG attribute, not a CSS property.
const EDGE_STYLE = {
  type: 'smoothstep',
  animated: true,
  markerEnd: {
    type:   MarkerType.ArrowClosed,
    height: 14,
    width:  14,
    color:  'rgba(255,255,255,0.6)',
  },
  style: { stroke: 'rgba(255,255,255,0.55)', strokeWidth: 2 },
};

const DEFAULT_EDGES = [
  // Calculator pipeline
  { id: 'e-math-1', source: 'customInput-1', sourceHandle: 'customInput-1-value', target: 'math-1',        targetHandle: 'math-1-a',            ...EDGE_STYLE },
  { id: 'e-math-2', source: 'customInput-2', sourceHandle: 'customInput-2-value', target: 'math-1',        targetHandle: 'math-1-b',            ...EDGE_STYLE },
  { id: 'e-math-3', source: 'math-1',        sourceHandle: 'math-1-result',       target: 'customOutput-1',targetHandle: 'customOutput-1-value', ...EDGE_STYLE },

  // Resume reviewer pipeline
  { id: 'e-resume-1', source: 'customInput-3', sourceHandle: 'customInput-3-value', target: 'text-1',        targetHandle: 'text-1-resume',       ...EDGE_STYLE },
  { id: 'e-resume-2', source: 'text-1',        sourceHandle: 'text-1-output',        target: 'llm-1',         targetHandle: 'llm-1-prompt',         ...EDGE_STYLE },
  { id: 'e-resume-3', source: 'llm-1',         sourceHandle: 'llm-1-response',       target: 'customOutput-2',targetHandle: 'customOutput-2-value', ...EDGE_STYLE },

  // Weather API pipeline
  { id: 'e-api-1', source: 'customInput-4', sourceHandle: 'customInput-4-value', target: 'api-1',         targetHandle: 'api-1-payload',        ...EDGE_STYLE },
  { id: 'e-api-2', source: 'api-1',         sourceHandle: 'api-1-response',      target: 'customOutput-3',targetHandle: 'customOutput-3-value', ...EDGE_STYLE },
];

// ── Store ─────────────────────────────────────────────────────────────────────
export const useStore = create((set, get) => ({
  nodes:        DEFAULT_NODES,
  edges:        DEFAULT_EDGES,
  pipelineName: 'Untitled Pipeline',

  // Per-type ID counters — incremented each time a node of that type is added.
  // Starts at the count of pre-existing demo nodes so new IDs don't collide.
  nodeIDs: {
    customInput:  4,
    text:         1,
    llm:          1,
    customOutput: 3,
    fileInput:    0,
    note:         1,
    math:         1,
    api:          1,
  },

  // ── Mutations ──────────────────────────────────────────────────────────────

  /** Updates the pipeline's display name (shown in the Header). */
  setPipelineName: (name) => set({ pipelineName: name }),

  /**
   * Generates a unique ID for a new node of the given type.
   * Format: "<type>-<counter>", e.g. "llm-2"
   */
  getNodeID: (type) => {
    const newIDs = { ...get().nodeIDs };
    if (newIDs[type] === undefined) newIDs[type] = 0;
    newIDs[type] += 1;
    set({ nodeIDs: newIDs });
    return `${type}-${newIDs[type]}`;
  },

  /** Appends a new node to the canvas. */
  addNode: (node) => set({ nodes: [...get().nodes, node] }),

  /** Delegates node changes (position, selection, removal) to ReactFlow. */
  onNodesChange: (changes) => set({ nodes: applyNodeChanges(changes, get().nodes) }),

  /** Delegates edge changes to ReactFlow. */
  onEdgesChange: (changes) => set({ edges: applyEdgeChanges(changes, get().edges) }),

  /** Adds a new edge when the user draws a connection between two handles. */
  onConnect: (connection) => {
    set({ edges: addEdge({ ...connection, ...EDGE_STYLE }, get().edges) });
  },

  /**
   * Updates a single field inside a node's data object.
   * Used by node components to sync their form fields back to the store.
   *
   * @param {string} nodeId - ID of the node to update
   * @param {string} fieldName - Key in node.data to update
   * @param {*} fieldValue - New value
   */
  updateNodeField: (nodeId, fieldName, fieldValue) => {
    set({
      nodes: get().nodes.map((node) =>
        node.id === nodeId
          ? { ...node, data: { ...node.data, [fieldName]: fieldValue } }
          : node
      ),
    });
  },

  /**
   * Deletes a node and all edges connected to it.
   * Called by BaseNode's delete button and the keyboard Delete shortcut.
   */
  deleteNode: (nodeId) => {
    set({
      nodes: get().nodes.filter((node) => node.id !== nodeId),
      edges: get().edges.filter((edge) => edge.source !== nodeId && edge.target !== nodeId),
    });
  },

  /**
   * Creates a duplicate of a node, offset by 40px from the original.
   * Called by the Ctrl+D keyboard shortcut.
   */
  duplicateNode: (nodeId) => {
    const node = get().nodes.find((n) => n.id === nodeId);
    if (!node) return;

    const newId   = `${node.type}-dup-${Date.now()}`;
    const newNode = {
      ...node,
      id:       newId,
      position: { x: node.position.x + 40, y: node.position.y + 40 },
      selected: false,
      data:     { ...node.data },
    };
    set({ nodes: [...get().nodes, newNode] });
  },

  /** Removes all nodes and edges from the canvas. */
  clearCanvas: () => set({ nodes: [], edges: [] }),
}));
