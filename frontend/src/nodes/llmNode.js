// nodes/llmNode.js
import { memo } from 'react';
import BaseNode from './BaseNode';
import { NodeRegistry } from '../domain/NodeRegistry';

export const LLMNode = memo(({ id, selected }) => (
  <BaseNode
    title="LLM"
    icon="🤖"
    accentColor="#8b5cf6"
    category="Model"
    selected={selected}
    inputs={[
      { id: `${id}-system`, label: 'System' },
      { id: `${id}-prompt`, label: 'Prompt' },
    ]}
    outputs={[{ id: `${id}-response`, label: 'Response' }]}
  >
    <div className="node-field">
      <span className="node-label">Language Model</span>
      <select className="node-select" aria-label="LLM model selection">
        <option>GPT-4o</option>
        <option>Claude Sonnet 4</option>
        <option>Gemini 2.5 Pro</option>
        <option>Llama 3.3</option>
        <option>Mistral Large</option>
      </select>
    </div>
  </BaseNode>
));

NodeRegistry.register({
  id: 'llm',
  label: 'LLM',
  icon: 'Brain',
  category: 'AI',
  color: 'var(--accent-llm)',
  version: '1.0.0',
  description: 'Language model processing unit.',
  keywords: ['llm', 'ai', 'generate', 'chat', 'model'],
  inputs: [
    { id: 'system', label: 'System', type: 'text', required: false },
    { id: 'prompt', label: 'Prompt', type: 'text', required: true },
  ],
  outputs: [{ id: 'response', label: 'Response', type: 'text' }],
  component: LLMNode,
});
