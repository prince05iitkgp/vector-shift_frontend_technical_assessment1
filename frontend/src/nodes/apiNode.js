// nodes/apiNode.js
import { useState, memo } from 'react';
import BaseNode from './BaseNode';
import { NodeRegistry } from '../domain/NodeRegistry';

export const APINode = memo(({ id, selected }) => {
  const [method, setMethod] = useState('GET');
  const [url, setUrl] = useState('https://api.weather.com');
  return (
    <BaseNode
      title="API Call"
      icon="🌐"
      accentColor="#6366f1"
      category="Tool"
      selected={selected}
      inputs={[
        { id: `${id}-endpoint`, label: 'Endpoint' },
        { id: `${id}-payload`,  label: 'Payload' },
      ]}
      outputs={[{ id: `${id}-response`, label: 'Response' }]}
    >
      <div className="node-field">
        <label className="node-label">Method</label>
        <select className="node-select" value={method} onChange={e => setMethod(e.target.value)} aria-label="HTTP method">
          <option>GET</option>
          <option>POST</option>
          <option>PUT</option>
          <option>DELETE</option>
        </select>
      </div>
      <div className="node-field">
        <label className="node-label">URL</label>
        <input
          className="node-input"
          type="text"
          value={url}
          onChange={e => setUrl(e.target.value)}
          aria-label="API endpoint URL"
          style={{ fontSize: 10 }}
        />
      </div>
    </BaseNode>
  );
});

NodeRegistry.register({
  id: 'api',
  label: 'API Request',
  icon: 'Globe',
  category: 'Logic',
  color: 'var(--accent-logic)',
  version: '1.0.0',
  description: 'Make an external HTTP request.',
  keywords: ['api', 'http', 'request', 'fetch', 'webhook'],
  inputs: [
    { id: 'endpoint', label: 'Endpoint', type: 'text', required: false },
    { id: 'payload',  label: 'Payload',  type: 'json', required: false },
  ],
  outputs: [{ id: 'response', label: 'Response', type: 'json' }],
  component: APINode,
});
