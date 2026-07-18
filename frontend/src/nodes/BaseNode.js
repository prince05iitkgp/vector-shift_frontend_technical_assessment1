import React, { memo } from 'react';
import { Handle, Position, useNodeId } from 'reactflow';
import { useStore } from '../store';
import '../styles/nodes.css';

const BaseNode = ({
  title,
  icon,
  accentColor,
  category,
  inputs = [],
  outputs = [],
  selected = false,
  children,
}) => {
  const nodeId = useNodeId();
  const deleteNode = useStore((state) => state.deleteNode);

  const handleSpacing = (index, total) => {
    if (total === 1) return '50%';
    const step = 100 / (total + 1);
    return `${step * (index + 1)}%`;
  };

  return (
    <div
      className={`node-wrapper${selected ? ' selected' : ''}`}
      style={{ '--node-accent': accentColor }}
    >
      {/* Accent top bar */}
      <div className="node-accent-bar" />

      {/* Input handles (left) */}
      {inputs.map((handle, i) => (
        <Handle
          key={handle.id}
          type="target"
          position={Position.Left}
          id={handle.id}
          className={handle.className || ''}
          style={{
            top: handleSpacing(i, inputs.length),
            ...handle.style,
          }}
          aria-label={`Input: ${handle.label || handle.id}`}
        />
      ))}

      {/* Header */}
      <div className="node-header">
        <span className="node-icon" aria-hidden="true">{icon}</span>
        <span className="node-title">{title}</span>
        {category && <span className="node-badge">{category}</span>}
        {nodeId && (
          <button
            onPointerDown={(e) => {
              e.stopPropagation();
              e.preventDefault();
            }}
            onClick={(e) => {
              e.stopPropagation();
              e.preventDefault();
              deleteNode(nodeId);
            }}
            className="node-delete-btn nodrag nopan"
            title="Delete node"
            aria-label="Delete node"
          >
            ✕
          </button>
        )}
      </div>

      {/* Body */}
      <div className="node-body">
        {children}
      </div>

      {/* Output handles (right) */}
      {outputs.map((handle, i) => (
        <Handle
          key={handle.id}
          type="source"
          position={Position.Right}
          id={handle.id}
          className={handle.className || ''}
          style={{
            top: handleSpacing(i, outputs.length),
            ...handle.style,
          }}
          aria-label={`Output: ${handle.label || handle.id}`}
        />
      ))}
    </div>
  );
};

export default memo(BaseNode);
