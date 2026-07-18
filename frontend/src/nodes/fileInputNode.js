// nodes/fileInputNode.js
import { useState, memo } from 'react';
import BaseNode from './BaseNode';
import { NodeRegistry } from '../domain/NodeRegistry';

export const FileInputNode = memo(({ id, selected }) => {
  const [fileType, setFileType] = useState('PDF');
  return (
    <BaseNode
      title="File Input"
      icon="📎"
      accentColor="#06b6d4"
      category="I/O"
      selected={selected}
      outputs={[{ id: `${id}-file`, label: 'File' }]}
    >
      <div className="node-field">
        <label className="node-label">File Type</label>
        <select className="node-select" value={fileType} onChange={e => setFileType(e.target.value)}>
          <option>PDF</option>
          <option>CSV</option>
          <option>TXT</option>
          <option>JSON</option>
          <option>Any</option>
        </select>
      </div>
      <div className="node-field">
        <div
          style={{
            border: '1px dashed rgba(6,182,212,0.3)',
            borderRadius: 6,
            padding: '8px 10px',
            textAlign: 'center',
            fontSize: 11,
            color: 'var(--text-muted)',
            cursor: 'pointer',
          }}
        >
          Drop file or click to browse
        </div>
      </div>
    </BaseNode>
  );
});

NodeRegistry.register({
  id: 'fileInput',
  label: 'File Input',
  icon: 'File',
  category: 'Inputs',
  color: 'var(--accent-input)',
  version: '1.0.0',
  description: 'Upload a file and parse its contents.',
  keywords: ['file', 'upload', 'document', 'pdf', 'csv', 'txt'],
  inputs: [],

  outputs: [{ id: 'file', label: 'File', type: 'file' }],
  component: FileInputNode,
});
