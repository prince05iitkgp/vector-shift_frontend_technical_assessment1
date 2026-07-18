// domain/PipelineValidator.js
// Client-side validation engine (now includes cycle detection)

/**
 * Validates the pipeline graph and returns structured errors and warnings.
 * Also determines overall DAG validity using Kahn's Algorithm.
 *
 * @param {Array} nodes - ReactFlow nodes array
 * @param {Array} edges - ReactFlow edges array
 * @returns {Object} { isValid, isDag, errors, warnings, status }
 */
export const validatePipeline = (nodes, edges) => {
  const errors = [];
  const warnings = [];

  // --- 1. Structural Validation ---
  if (nodes.length === 0) {
    errors.push({
      code: 'EMPTY_PIPELINE',
      message: 'Add at least one node before submitting.',
    });
    return { isValid: false, isDag: true, errors, warnings, status: 'empty' };
  }

  // --- 2. Connectivity Validation ---
  const connectedNodeIds = new Set(
    edges.flatMap((e) => [e.source, e.target])
  );

  const isolatedNodes = nodes.filter((n) => !connectedNodeIds.has(n.id) && n.type !== 'note');
  isolatedNodes.forEach((n) => {
    warnings.push({
      code: 'ISOLATED_NODE',
      message: `Node is unconnected`,
      nodeId: n.id,
    });
  });

  // --- 3. Edge Integrity ---
  const nodeIds = new Set(nodes.map((n) => n.id));
  const danglingEdges = edges.filter(
    (e) => !nodeIds.has(e.source) || !nodeIds.has(e.target)
  );
  if (danglingEdges.length > 0) {
    errors.push({
      code: 'DANGLING_EDGE',
      message: `Corrupted edges detected.`,
    });
  }

  // --- 4. Cycle Detection (Kahn's Algorithm) ---
  let isDag = true;
  if (nodes.length > 0 && errors.length === 0) {
    const inDegree = {};
    const graph = {};

    nodeIds.forEach(id => {
      inDegree[id] = 0;
      graph[id] = [];
    });

    edges.forEach(edge => {
      if (nodeIds.has(edge.source) && nodeIds.has(edge.target)) {
        graph[edge.source].push(edge.target);
        inDegree[edge.target] += 1;
      }
    });

    const queue = [];
    Object.entries(inDegree).forEach(([id, deg]) => {
      if (deg === 0) queue.push(id);
    });

    let visited = 0;
    while (queue.length > 0) {
      const node = queue.shift();
      visited++;
      graph[node].forEach(neighbor => {
        inDegree[neighbor] -= 1;
        if (inDegree[neighbor] === 0) {
          queue.push(neighbor);
        }
      });
    }

    if (visited !== nodes.length) {
      isDag = false;
      errors.push({
        code: 'CYCLE_DETECTED',
        message: 'Cycle detected. Pipeline must be a DAG.',
      });
    }
  }

  const isValid = errors.length === 0;
  let status = 'valid';
  if (!isValid) status = 'error';
  else if (warnings.length > 0) status = 'warning';

  return {
    isValid,
    isDag,
    errors,
    warnings,
    status, // 'empty' | 'valid' | 'warning' | 'error'
  };
};
