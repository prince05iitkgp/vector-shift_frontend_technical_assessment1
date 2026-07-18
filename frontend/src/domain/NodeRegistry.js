// domain/NodeRegistry.js
// Single source of truth for all node types.
// Nodes self-register on import — no central list to maintain.

const registry = new Map();

export const NodeRegistry = {
  /**
   * Register a node type with its full metadata.
   * Called once per node file at module load time.
   */
  register(metadata) {
    if (registry.has(metadata.id)) {
      console.warn(`NodeRegistry: '${metadata.id}' is already registered.`);
      return;
    }
    registry.set(metadata.id, metadata);
  },

  /**
   * Returns the ReactFlow nodeTypes map.
   * e.g. { customInput: InputNode, llm: LLMNode, ... }
   */
  getNodeTypes() {
    return Object.fromEntries(
      [...registry.entries()].map(([id, meta]) => [id, meta.component])
    );
  },

  /**
   * Returns toolbar items — auto-generated from registry.
   * Grouped by category for future toolbar organization.
   */
  getToolbarNodes() {
    return [...registry.values()].map(({ id, label, icon, category, color, keywords }) => ({
      type: id,
      label,
      icon,
      category,
      color,
      keywords: keywords || [],
    }));
  },

  /**
   * Returns full execution metadata for a specific node type.
   */
  getExecutionMetadata(nodeType) {
    return registry.get(nodeType) ?? null;
  },

  /**
   * Returns the validation schema for a specific node type.
   */
  getSchema(nodeType) {
    return registry.get(nodeType)?.validation ?? {};
  },

  /**
   * Returns all registered node IDs.
   */
  getAllTypes() {
    return [...registry.keys()];
  },
};
