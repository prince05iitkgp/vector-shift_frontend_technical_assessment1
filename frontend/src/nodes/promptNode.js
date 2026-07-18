// nodes/promptNode.js
import { useState, memo } from 'react';
import BaseNode from './BaseNode';
import { NodeRegistry } from '../domain/NodeRegistry';

export const PromptNode = memo(({ id, selected }) => {
  const [template, setTemplate] = useState('You are a helpful assistant.\n\nContext: {{context}}');
  return (
    <BaseNode
      title="Prompt"
      icon="✍️"
      accentColor="#ec4899"
      category="LLM"
      selected={selected}
      inputs={[{ id: `${id}-context`, label: 'Context' }]}
      outputs={[{ id: `${id}-prompt`, label: 'Prompt' }]}
    >
      <div className="node-field">
        <label className="node-label">System Prompt Template</label>
        <textarea
          className="node-textarea"
          value={template}
          onChange={e => setTemplate(e.target.value)}
          rows={3}
          style={{ resize: 'vertical', minHeight: 60 }}
          aria-label="Prompt template"
        />
      </div>
    </BaseNode>
  );
});

NodeRegistry.register({
  id: 'prompt',
  label: 'Prompt',
  icon: 'TerminalSquare',
  category: 'AI',
  color: 'var(--accent-llm)',
  version: '1.0.0',
  description: 'Design a prompt for an LLM.',
  keywords: ['prompt', 'text', 'template', 'ai', 'generate'],
  inputs: [
{ id: 'context', label: 'Context', type: 'text', required: false }],
  outputs: [{ id: 'prompt', label: 'Prompt', type: 'text' }],
  component: PromptNode,
});
