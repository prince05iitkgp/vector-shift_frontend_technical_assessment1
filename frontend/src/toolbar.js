import { useState, useEffect } from 'react';
import { NodeRegistry } from './domain/NodeRegistry';
import { DraggableNode } from './draggableNode';
import './styles/toolbar.css';

// Category groups — order and labels match VectorShift's pattern
const GROUPS = [
  {
    label: 'Inputs',
    types: ['customInput', 'fileInput'],
  },
  {
    label: 'AI',
    types: ['llm', 'prompt'],
  },
  {
    label: 'Tools',
    types: ['math', 'api'],
  },
  {
    label: 'Template',
    types: ['text'],
  },
  {
    label: 'Utility',
    types: ['note', 'customOutput'],
  },
];

export const PipelineToolbar = () => {
  const allNodes = NodeRegistry.getToolbarNodes();
  const nodeMap  = Object.fromEntries(allNodes.map((n) => [n.type, n]));

  // Theme toggle state
  const [isLight, setIsLight] = useState(false);

  useEffect(() => {
    if (isLight) {
      document.documentElement.setAttribute('data-theme', 'light');
    } else {
      document.documentElement.removeAttribute('data-theme');
    }
  }, [isLight]);

  return (
    <header
      className="pipeline-toolbar"
      role="toolbar"
      aria-label="Pipeline node palette"
    >
      {/* Brand */}
      <div className="toolbar-brand">
        <div className="toolbar-brand-icon" aria-hidden="true">⚡</div>
        <span className="toolbar-brand-name">VectorShift</span>
        
        {/* Theme Toggle Button */}
        <button
          onClick={() => setIsLight(!isLight)}
          style={{
            background: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid var(--border-subtle)',
            color: 'var(--text-muted)',
            borderRadius: '6px',
            padding: '2px 6px',
            marginLeft: '8px',
            fontSize: '12px',
            cursor: 'pointer',
          }}
          aria-label="Toggle theme"
        >
          {isLight ? '🌙' : '☀️'}
        </button>
      </div>

      <div className="toolbar-divider" aria-hidden="true" />

      {/* Grouped node chips */}
      {GROUPS.map((group, gi) => (
        <span key={group.label} style={{ display: 'contents' }}>
          {gi > 0 && <div className="toolbar-divider" aria-hidden="true" />}
          <span className="toolbar-group-label">{group.label}</span>
          <div className="toolbar-group" role="group" aria-label={group.label}>
            {group.types.map((type) => {
              const node = nodeMap[type];
              if (!node) return null;
              return (
                <DraggableNode
                  key={type}
                  type={type}
                  label={node.label}
                  icon={node.icon}
                  color={node.color}
                />
              );
            })}
          </div>
        </span>
      ))}
    </header>
  );
};
