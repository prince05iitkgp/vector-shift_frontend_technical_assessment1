// nodes/textNode.js
// Part 3: Auto-resize textarea + dynamic handles from {{variable}} syntax

import { useState, useRef, useEffect, useCallback, memo } from 'react';
import BaseNode from './BaseNode';
import { useVariableParser } from '../hooks/useVariableParser';
import { NodeRegistry } from '../domain/NodeRegistry';
import '../styles/nodes.css';

export const TextNode = memo(({ id, data, selected }) => {
  const [currText, setCurrText] = useState(data?.text || '{{input}}');
  const textareaRef = useRef(null);
  const mirrorRef   = useRef(null);

  // Extract unique {{variable}} names from text
  const variables = useVariableParser(currText);

  // Auto-resize: sync textarea dimensions to a hidden mirror div
  const updateSize = useCallback(() => {
    const mirror   = mirrorRef.current;
    const textarea = textareaRef.current;
    if (!mirror || !textarea) return;

    mirror.textContent = currText + '\n'; // +\n prevents collapse on empty line
    const newHeight = Math.max(60, mirror.scrollHeight);
    const newWidth  = Math.max(180, Math.min(400, mirror.scrollWidth + 4));

    textarea.style.height = `${newHeight}px`;
    textarea.style.width  = `${newWidth}px`;
  }, [currText]);

  useEffect(() => {
    updateSize();
  }, [updateSize]);

  const handleChange = useCallback((e) => {
    setCurrText(e.target.value);
  }, []);



  return (
    <BaseNode
      title="Text"
      icon="📝"
      accentColor="#f59e0b"
      category={variables.length > 0 ? 'VARIABLE' : undefined}
      selected={selected}
      inputs={variables.map((varName) => ({
        id: `${id}-${varName}`,
        label: varName,
        className: 'variable-handle'
      }))}
      outputs={[{ id: `${id}-output`, label: 'Output' }]}
    >
      <div className="node-field">
        <label className="node-label">
          Content
          {variables.length > 0 && (
            <span style={{ marginLeft: 4, color: '#f59e0b' }}>
              · {variables.map(v => `{{${v}}}`).join(', ')}
            </span>
          )}
        </label>

        {/* Hidden mirror div for measuring text size */}
        <div
          ref={mirrorRef}
          aria-hidden="true"
          style={{
            position: 'absolute',
            visibility: 'hidden',
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word',
            fontFamily: 'var(--font-family)',
            fontSize: '12px',
            lineHeight: '1.5',
            padding: '5px 8px',
            minWidth: '180px',
            maxWidth: '400px',
            pointerEvents: 'none',
          }}
        />

        <textarea
          ref={textareaRef}
          className="node-textarea"
          value={currText}
          onChange={handleChange}
          aria-label="Text node content — use {{variable}} for dynamic inputs"
          placeholder="Type text... use {{variable}} for dynamic inputs"
        />
      </div>
    </BaseNode>
  );
});

NodeRegistry.register({
  id: 'text',
  label: 'Text',
  icon: 'FileText',
  category: 'Inputs',
  color: 'var(--accent-text)',
  version: '1.0.0',
  description: 'Text input with dynamic variable extraction via {{var}}.',
  keywords: ['text', 'string', 'variable', 'template', 'input'],
  inputs: [],
  // Dynamic — generated at runtime from {{variable}} parsing
  outputs: [{ id: 'output', label: 'Output', type: 'text' }],
  component: TextNode,
});
