// nodes/noteNode.js
import { useState, memo } from 'react';
import BaseNode from './BaseNode';
import { NodeRegistry } from '../domain/NodeRegistry';
import '../styles/nodes.css';

export const NoteNode = memo(({ selected }) => {
  const [note, setNote] = useState('Add a note...');
  return (
    <BaseNode
      title="Note"
      icon="📝"
      accentColor="#f97316"
      category="NOTE"
      selected={selected}
    >
      <div className="node-field">
        <textarea
          className="node-textarea"
          value={note}
          onChange={e => setNote(e.target.value)}
          placeholder="Business rule:&#10;&#10;Only candidates with&#10;5+ years&#10;should proceed."
          style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', fontStyle: 'italic', minHeight: '80px', width: '100%' }}
          aria-label="Note content"
        />
      </div>
    </BaseNode>
  );
});

NodeRegistry.register({
  id: 'note',
  label: 'Note',
  icon: 'StickyNote',
  category: 'Utility',
  color: 'var(--accent-utility)',
  version: '1.0.0',
  description: 'Add a sticky note to your pipeline.',
  keywords: ['note', 'comment', 'text', 'sticky'],
  inputs: [],
  outputs: [],
  component: NoteNode,
});
