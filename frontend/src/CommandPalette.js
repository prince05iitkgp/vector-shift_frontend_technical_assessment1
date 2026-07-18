// CommandPalette.js — Lightweight ⌘K command palette
// Actions: Add node, Clear Canvas, Toggle Theme

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Plus, Trash2, Sun } from 'lucide-react';
import { useStore } from './store';
import { NodeRegistry } from './domain/NodeRegistry';
import './styles/command-palette.css';

const STATIC_ACTIONS = [
  {
    id: 'clear-canvas',
    label: 'Clear Canvas',
    description: 'Remove all nodes and edges',
    icon: <Trash2 size={14} />,
    group: 'Actions',
    danger: true,
  },
  {
    id: 'toggle-theme',
    label: 'Toggle Light / Dark',
    description: 'Switch application theme',
    icon: <Sun size={14} />,
    group: 'Actions',
  },
];

export function CommandPalette({ onToggleTheme }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef(null);

  const addNode = useStore((s) => s.addNode);
  const getNodeID = useStore((s) => s.getNodeID);
  const clearCanvas = useStore((s) => s.clearCanvas);

  // Build node-add actions from registry
  const nodeActions = NodeRegistry.getToolbarNodes().map((n) => ({
    id: `add-${n.type}`,
    label: `Add ${n.label}`,
    description: n.description || '',
    icon: <Plus size={14} />,
    group: 'Add Node',
    nodeType: n.type,
  }));

  const allActions = [...nodeActions, ...STATIC_ACTIONS];

  const filtered = query
    ? allActions.filter(
        (a) =>
          a.label.toLowerCase().includes(query.toLowerCase()) ||
          a.description.toLowerCase().includes(query.toLowerCase())
      )
    : allActions;

  // Open / close
  const handleOpen = useCallback(() => {
    setOpen(true);
    setQuery('');
    setActiveIndex(0);
    setTimeout(() => inputRef.current?.focus(), 10);
  }, []);

  const handleClose = useCallback(() => setOpen(false), []);

  // Global ⌘K listener
  useEffect(() => {
    const onKey = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        open ? handleClose() : handleOpen();
      }
      if (e.key === 'Escape' && open) handleClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, handleOpen, handleClose]);

  // Arrow key navigation
  const onKeyDown = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, filtered.length - 1));
    }
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, 0));
    }
    if (e.key === 'Enter' && filtered[activeIndex]) {
      executeAction(filtered[activeIndex]);
    }
  };

  const executeAction = (action) => {
    handleClose();

    if (action.nodeType) {
      const id = getNodeID(action.nodeType);
      addNode({
        id,
        type: action.nodeType,
        position: { x: 300 + Math.random() * 200, y: 200 + Math.random() * 200 },
        data: {},
      });
      return;
    }

    if (action.id === 'clear-canvas') {
      if (window.confirm('Clear the entire canvas?')) clearCanvas();
    }

    if (action.id === 'toggle-theme') {
      onToggleTheme?.();
    }
  };

  // Group items
  const groups = [...new Set(filtered.map((a) => a.group))];

  return (
    <>
      <AnimatePresence>
        {open && (
          <>
            {/* Backdrop */}
            <motion.div
              className="palette-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.12 }}
              onClick={handleClose}
            />

            {/* Palette card */}
            <motion.div
              className="palette-card"
              initial={{ opacity: 0, scale: 0.96, y: -12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: -12 }}
              transition={{ duration: 0.15, ease: 'easeOut' }}
              role="dialog"
              aria-modal="true"
              aria-label="Command palette"
            >
              <div className="palette-search-row">
                <Search size={15} className="palette-search-icon" />
                <input
                  ref={inputRef}
                  className="palette-input"
                  value={query}
                  onChange={(e) => { setQuery(e.target.value); setActiveIndex(0); }}
                  onKeyDown={onKeyDown}
                  placeholder="Type a command or search..."
                  aria-label="Command search"
                />
                <kbd className="palette-esc-kbd">Esc</kbd>
              </div>

              <div className="palette-results">
                {filtered.length === 0 && (
                  <div className="palette-empty">No commands found for "{query}"</div>
                )}
                {groups.map((group) => (
                  <div key={group} className="palette-group">
                    <div className="palette-group-label">{group}</div>
                    {filtered
                      .filter((a) => a.group === group)
                      .map((action) => {
                        const globalIdx = filtered.indexOf(action);
                        return (
                          <button
                            key={action.id}
                            className={`palette-item${globalIdx === activeIndex ? ' active' : ''}${action.danger ? ' danger' : ''}`}
                            onClick={() => executeAction(action)}
                            onMouseEnter={() => setActiveIndex(globalIdx)}
                          >
                            <span className="palette-item-icon">{action.icon}</span>
                            <span className="palette-item-label">{action.label}</span>
                            {action.description && (
                              <span className="palette-item-desc">{action.description}</span>
                            )}
                          </button>
                        );
                      })}
                  </div>
                ))}
              </div>

              <div className="palette-footer">
                <span><kbd>↑↓</kbd> navigate</span>
                <span><kbd>↵</kbd> select</span>
                <span><kbd>Esc</kbd> close</span>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
