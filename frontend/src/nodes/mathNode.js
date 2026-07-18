// nodes/mathNode.js
import { useState, memo } from 'react';
import BaseNode from './BaseNode';
import { NodeRegistry } from '../domain/NodeRegistry';

export const MathNode = memo(({ id, selected }) => {
  const [operation, setOperation] = useState('add');
  return (
    <BaseNode
      title="Math"
      icon="🔢"
      accentColor="#84cc16"
      category="Tool"
      selected={selected}
      inputs={[
        { id: `${id}-a`, label: 'A' },
        { id: `${id}-b`, label: 'B' },
      ]}
      outputs={[{ id: `${id}-result`, label: 'Result' }]}
    >
      <div className="node-field">
        <label className="node-label">Operation</label>
        <select className="node-select" value={operation} onChange={e => setOperation(e.target.value)} aria-label="Math operation">
          <option value="add">A + B (Add)</option>
          <option value="subtract">A − B (Subtract)</option>
          <option value="multiply">A × B (Multiply)</option>
          <option value="divide">A ÷ B (Divide)</option>
          <option value="average">Average (A, B)</option>
          <option value="maximum">Maximum (A, B)</option>
          <option value="minimum">Minimum (A, B)</option>
        </select>
      </div>
    </BaseNode>
  );
});

NodeRegistry.register({
  id: 'math',
  label: 'Math Operation',
  icon: 'Calculator',
  category: 'Utility',
  color: 'var(--accent-utility)',
  version: '1.0.0',
  description: 'Performs basic mathematical operations.',
  keywords: ['math', 'calculator', 'add', 'multiply', 'logic'],
  inputs: [
    { id: 'a', label: 'A', type: 'number', required: true },
    { id: 'b', label: 'B', type: 'number', required: true },
  ],
  outputs: [{ id: 'result', label: 'Result', type: 'number' }],
  component: MathNode,
});
