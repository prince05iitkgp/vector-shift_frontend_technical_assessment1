// nodes/outputNode.js
import { useState, memo } from 'react';
import BaseNode from './BaseNode';
import { NodeRegistry } from '../domain/NodeRegistry';

export const OutputNode = memo(({ id, data, selected }) => {
  const [currName, setCurrName] = useState(
    data?.outputName || id.replace('customOutput-', 'output_')
  );
  const [outputType, setOutputType] = useState(data?.outputType || 'Text');

  return (
    <BaseNode
      title="Output"
      icon="📤"
      accentColor="#10b981"
      category="I/O"
      selected={selected}
      inputs={[{ id: `${id}-value`, label: 'Value' }]}
    >
      <div className="node-field">
        <label className="node-label">Name</label>
        <input
          className="node-input"
          type="text"
          value={currName}
          onChange={(e) => setCurrName(e.target.value)}
          placeholder="e.g. analysis_result"
          aria-label="Output node name"
        />
      </div>
      <div className="node-field">
        <label className="node-label">Type</label>
        <select
          className="node-select"
          value={outputType}
          onChange={(e) => setOutputType(e.target.value)}
          aria-label="Output node type"
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
  id: 'customOutput',
  label: 'Output',
  icon: 'DownloadCloud',
  category: 'Output',
  color: 'var(--accent-output)',
  version: '1.0.0',
  description: 'Exit point for data flowing out of the pipeline.',
  keywords: ['output', 'end', 'result', 'data'],
  inputs: [{ id: 'value', label: 'Value', type: 'text', required: true }],
  outputs: [],
  component: OutputNode,
});
