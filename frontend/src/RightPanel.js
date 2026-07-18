// RightPanel.js — Rich Node Inspector
// Shows editable fields for the selected node; falls back to pipeline stats.

import React from 'react';
import { useStore } from './store';
import {
  CheckCircle2, AlertTriangle,
  LayoutTemplate, Link, Trash2,
} from 'lucide-react';
import { validatePipeline } from './domain/PipelineValidator';
import './styles/rightPanel.css';

// ── Per-type inspector panels ────────────────────────────────────────────────

function LLMInspector({ id, data, update }) {
  return (
    <>
      <div className="inspector-field">
        <label className="inspector-label">Model</label>
        <select
          className="inspector-select"
          value={data?.model || 'GPT-4o'}
          onChange={(e) => update(id, 'model', e.target.value)}
        >
          <option>GPT-4o</option>
          <option>GPT-4o mini</option>
          <option>Claude Sonnet 4</option>
          <option>Gemini 2.5 Pro</option>
          <option>Llama 3.3</option>
          <option>Mistral Large</option>
        </select>
      </div>
      <div className="inspector-field">
        <label className="inspector-label">Temperature</label>
        <div className="inspector-slider-row">
          <input
            type="range" min="0" max="2" step="0.1"
            className="inspector-slider"
            value={data?.temperature ?? 0.7}
            onChange={(e) => update(id, 'temperature', parseFloat(e.target.value))}
          />
          <span className="inspector-slider-val">{data?.temperature ?? 0.7}</span>
        </div>
      </div>
      <div className="inspector-field">
        <label className="inspector-label">Max Tokens</label>
        <input
          type="number" className="inspector-input"
          value={data?.maxTokens ?? 4096} min="1" max="128000" step="256"
          onChange={(e) => update(id, 'maxTokens', parseInt(e.target.value))}
        />
      </div>
      <div className="inspector-field">
        <label className="inspector-label">Output Fields</label>
        <div className="inspector-output-tags">
          {['response', 'tokens_used', 'latency'].map((f) => (
            <span key={f} className="inspector-tag">{f}</span>
          ))}
        </div>
      </div>
    </>
  );
}

function InputInspector({ id, data, update }) {
  return (
    <>
      <div className="inspector-field">
        <label className="inspector-label">Name</label>
        <input
          className="inspector-input"
          value={data?.inputName || ''}
          onChange={(e) => update(id, 'inputName', e.target.value)}
          placeholder="e.g. customer_question"
        />
      </div>
      <div className="inspector-field">
        <label className="inspector-label">Type</label>
        <select
          className="inspector-select"
          value={data?.inputType || 'Text'}
          onChange={(e) => update(id, 'inputType', e.target.value)}
        >
          <option value="Text">📝 Text</option>
          <option value="Number">🔢 Number</option>
          <option value="Boolean">☑ Boolean</option>
          <option value="JSON">{'{}'} JSON</option>
          <option value="File">📄 File</option>
          <option value="Any">🌐 Any</option>
        </select>
      </div>
      <div className="inspector-field">
        <label className="inspector-label">Required</label>
        <div className="inspector-toggle-row">
          <span className="inspector-toggle-label">
            {data?.required !== false ? 'Yes' : 'No'}
          </span>
          <label className="toggle-switch">
            <input
              type="checkbox"
              checked={data?.required !== false}
              onChange={(e) => update(id, 'required', e.target.checked)}
            />
            <span className="toggle-knob" />
          </label>
        </div>
      </div>
    </>
  );
}

function OutputInspector({ id, data, update }) {
  return (
    <>
      <div className="inspector-field">
        <label className="inspector-label">Name</label>
        <input
          className="inspector-input"
          value={data?.outputName || ''}
          onChange={(e) => update(id, 'outputName', e.target.value)}
          placeholder="e.g. analysis_result"
        />
      </div>
      <div className="inspector-field">
        <label className="inspector-label">Type</label>
        <select
          className="inspector-select"
          value={data?.outputType || 'Text'}
          onChange={(e) => update(id, 'outputType', e.target.value)}
        >
          <option value="Text">📝 Text</option>
          <option value="Number">🔢 Number</option>
          <option value="Boolean">☑ Boolean</option>
          <option value="JSON">{'{}'} JSON</option>
          <option value="File">📄 File</option>
          <option value="Any">🌐 Any</option>
        </select>
      </div>
    </>
  );
}

function MathInspector({ id, data, update }) {
  return (
    <>
      <div className="inspector-field">
        <label className="inspector-label">Operation</label>
        <select
          className="inspector-select"
          value={data?.operation || 'add'}
          onChange={(e) => update(id, 'operation', e.target.value)}
        >
          <option value="add">A + B (Add)</option>
          <option value="subtract">A − B (Subtract)</option>
          <option value="multiply">A × B (Multiply)</option>
          <option value="divide">A ÷ B (Divide)</option>
          <option value="average">Average (A, B)</option>
          <option value="maximum">Maximum (A, B)</option>
          <option value="minimum">Minimum (A, B)</option>
        </select>
      </div>
      <div className="inspector-field">
        <label className="inspector-label">Precision (Decimals)</label>
        <input
          type="number" className="inspector-input"
          value={data?.precision ?? 2} min="0" max="10"
          onChange={(e) => update(id, 'precision', parseInt(e.target.value))}
        />
      </div>
    </>
  );
}

function APIInspector({ id, data, update }) {
  return (
    <>
      <div className="inspector-field">
        <label className="inspector-label">Method</label>
        <select
          className="inspector-select"
          value={data?.method || 'GET'}
          onChange={(e) => update(id, 'method', e.target.value)}
        >
          <option>GET</option>
          <option>POST</option>
          <option>PUT</option>
          <option>DELETE</option>
          <option>PATCH</option>
        </select>
      </div>
      <div className="inspector-field">
        <label className="inspector-label">URL</label>
        <input
          className="inspector-input"
          value={data?.url || ''}
          onChange={(e) => update(id, 'url', e.target.value)}
          placeholder="https://api.example.com"
        />
      </div>
      <div className="inspector-field">
        <label className="inspector-label">Auth Header</label>
        <input
          className="inspector-input"
          value={data?.authHeader || ''}
          onChange={(e) => update(id, 'authHeader', e.target.value)}
          placeholder="Bearer {{token}}"
        />
      </div>
    </>
  );
}

function TextInspector({ id, data, update }) {
  return (
    <div className="inspector-field">
      <label className="inspector-label">Content</label>
      <textarea
        className="inspector-textarea"
        value={data?.text || ''}
        onChange={(e) => update(id, 'text', e.target.value)}
        placeholder="Type text... use {{variable}} for dynamic inputs"
        rows={5}
      />
    </div>
  );
}

function GenericInspector({ nodeType }) {
  return (
    <div className="inspector-placeholder">
      <p className="inspector-placeholder-text">
        Select a field in the <strong>{nodeType}</strong> node on the canvas to edit it here.
      </p>
    </div>
  );
}

// ── Inspector router ─────────────────────────────────────────────────────────
function NodeInspector({ node, update, deleteNode }) {
  const { id, type, data } = node;
  const LABEL = {
    customInput: 'Input',
    customOutput: 'Output',
    llm: 'LLM',
    text: 'Text',
    math: 'Math',
    api: 'API Request',
    note: 'Note',
    prompt: 'Prompt',
    fileInput: 'File Input',
  };

  const COLOR = {
    customInput: '#10B981',
    customOutput: '#EF4444',
    llm: '#8B5CF6',
    text: '#F59E0B',
    math: '#84CC16',
    api: '#6366F1',
    note: '#E07B34',
    prompt: '#3B82F6',
    fileInput: '#10B981',
  };

  return (
    <div className="inspector-node">
      <div className="inspector-node-header" style={{ '--node-color': COLOR[type] || 'var(--primary)' }}>
        <div className="inspector-node-accent" />
        <div className="inspector-node-title-row">
          <span className="inspector-node-label">{LABEL[type] || type}</span>
          <span className="inspector-node-id">{id}</span>
        </div>
      </div>

      <div className="inspector-fields">
        {type === 'llm'         && <LLMInspector    id={id} data={data} update={update} />}
        {type === 'customInput' && <InputInspector   id={id} data={data} update={update} />}
        {type === 'customOutput'&& <OutputInspector  id={id} data={data} update={update} />}
        {type === 'math'        && <MathInspector    id={id} data={data} update={update} />}
        {type === 'api'         && <APIInspector     id={id} data={data} update={update} />}
        {type === 'text'        && <TextInspector    id={id} data={data} update={update} />}
        {(type === 'note' || type === 'prompt' || type === 'fileInput') && (
          <GenericInspector nodeType={LABEL[type] || type} />
        )}
      </div>

      <button
        className="inspector-delete-btn"
        onClick={() => {
          if (window.confirm(`Delete the ${LABEL[type] || type} node?`)) deleteNode(id);
        }}
      >
        <Trash2 size={13} />
        <span>Delete Node</span>
      </button>
    </div>
  );
}

// ── Pipeline health panel ────────────────────────────────────────────────────
function PipelineHealth({ nodes, edges, isDag }) {
  const unconnected = nodes.filter((n) => {
    const hasEdge = edges.some((e) => e.source === n.id || e.target === n.id);
    return !hasEdge;
  });

  const checks = [
    { label: 'DAG Valid', ok: isDag, warnMsg: 'Cycle detected' },
    { label: 'All nodes connected', ok: unconnected.length === 0, warnMsg: `${unconnected.length} unconnected node(s)` },
    { label: 'Ready to run', ok: isDag && unconnected.length === 0, warnMsg: 'Fix issues above' },
  ];

  return (
    <>
      <div className="panel-section">
        <h3 className="section-title">Pipeline</h3>
        <div className="stats-list">
          <div className="stat-item">
            <div className="stat-label-wrap">
              <LayoutTemplate size={14} className="stat-icon" />
              <span className="stat-label">Nodes</span>
            </div>
            <span className="stat-value">{nodes.length}</span>
          </div>
          <div className="stat-item">
            <div className="stat-label-wrap">
              <Link size={14} className="stat-icon" />
              <span className="stat-label">Edges</span>
            </div>
            <span className="stat-value">{edges.length}</span>
          </div>
        </div>
      </div>

      <div className="panel-divider" />

      <div className="panel-section">
        <h3 className="section-title">Pipeline Health</h3>
        <div className="health-list">
          {checks.map((c) => (
            <div key={c.label} className={`health-item ${c.ok ? 'ok' : 'warn'}`}>
              <span className="health-icon">
                {c.ok ? <CheckCircle2 size={13} /> : <AlertTriangle size={13} />}
              </span>
              <span className="health-label">{c.ok ? c.label : c.warnMsg}</span>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

// ── Main export ──────────────────────────────────────────────────────────────
export const RightPanel = () => {
  const nodes = useStore((s) => s.nodes);
  const edges = useStore((s) => s.edges);
  const updateNodeField = useStore((s) => s.updateNodeField);
  const deleteNode = useStore((s) => s.deleteNode);

  const { isDag } = validatePipeline(nodes, edges);
  const selectedNode = nodes.find((n) => n.selected);

  return (
    <aside className="right-panel">
      {selectedNode ? (
        <>
          <h3 className="section-title" style={{ padding: '0 0 var(--space-3) 0' }}>
            Selected Node
          </h3>
          <NodeInspector
            node={selectedNode}
            update={updateNodeField}
            deleteNode={deleteNode}
          />
          <div className="panel-divider" style={{ margin: 'var(--space-4) 0' }} />
          <PipelineHealth nodes={nodes} edges={edges} isDag={isDag} />
        </>
      ) : (
        <PipelineHealth nodes={nodes} edges={edges} isDag={isDag} />
      )}

      <div className="panel-spacer" />
      <div className="panel-footer">
        <div className="keyboard-hint">
          <span>Del</span> delete · <span>⌘D</span> duplicate
        </div>
      </div>
    </aside>
  );
};
