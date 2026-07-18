// nodes/inputNode.js
import { useState, memo } from 'react';
import BaseNode from './BaseNode';
import { NodeRegistry } from '../domain/NodeRegistry';

export const InputNode = memo(({ id, data, selected }) => {
  const [currName, setCurrName] = useState(
    data?.inputName || id.replace('customInput-', 'input_')
  );
  const [inputType, setInputType] = useState(data?.inputType || 'Text');

  return (
    <BaseNode
      title="Input"
      icon="📥"
      accentColor="#4f8ef7"
      category="I/O"
      selected={selected}
      outputs={[{ id: `${id}-value`, label: 'Value' }]}
    >
      <div className="node-field">
        <label className="node-label">Name</label>
        <input
          className="node-input"
          type="text"
          value={currName}
          onChange={(e) => setCurrName(e.target.value)}
          placeholder="e.g. customer_question"
          aria-label="Input node name"
        />
      </div>
      <div className="node-field">
        <label className="node-label">Type</label>
        <select
          className="node-select"
          value={inputType}
          onChange={(e) => setInputType(e.target.value)}
          aria-label="Input node type"
        >
          <option value="Text">📝 Text</option>
          <option value="Number">🔢 Number</option>
          <option value="Boolean">☑ Boolean</option>
          <option value="JSON">{`{}`} JSON</option>
          <option value="File">📄 File</option>
          <option value="Any">🌐 Any</option>
        </select>
      </div>
    </BaseNode>
  );
});

NodeRegistry.register({
  id: 'customInput',
  label: 'Input',
  icon: 'UploadCloud',
  category: 'Inputs',
  color: 'var(--accent-input)',
  version: '1.0.0',
  description: 'Entry point for data flowing into the pipeline.',
  keywords: ['input', 'start', 'trigger', 'data'],
  inputs: [],
  outputs: [{ id: 'value', label: 'Value', type: 'text' }],
  component: InputNode,
});
