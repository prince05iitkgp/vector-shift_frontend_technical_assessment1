/**
 * App.js — Root application component
 *
 * Responsibilities:
 *   1. Side-effect imports to trigger NodeRegistry self-registration for all node types
 *   2. Global layout (Header → Sidebar + Canvas + Inspector)
 *   3. Right-panel drag-to-resize logic
 *   4. Global keyboard shortcuts (Delete, Esc, Ctrl+D)
 *   5. Light/dark theme toggle via data-theme attribute on <html>
 *
 * Note: Node imports at the top must come before any NodeRegistry.getNodeTypes() call
 * in ui.js. JavaScript module evaluation order guarantees this as long as App.js
 * is evaluated before ui.js renders.
 */

// ── Node side-effect imports (trigger NodeRegistry.register() in each file) ──
import './nodes/inputNode';
import './nodes/llmNode';
import './nodes/outputNode';
import './nodes/textNode';
import './nodes/fileInputNode';
import './nodes/promptNode';
import './nodes/mathNode';
import './nodes/noteNode';
import './nodes/apiNode';

import './styles/index.css';

import { useEffect, useState, useCallback, useRef } from 'react';
import { Header }         from './Header';
import { Sidebar }        from './Sidebar';
import { PipelineUI }     from './ui';
import { RightPanel }     from './RightPanel';
import { CommandPalette } from './CommandPalette';
import { useStore }       from './store';

// Right panel width constraints (pixels)
const RIGHT_PANEL_MIN     = 220;
const RIGHT_PANEL_MAX     = 420;
const RIGHT_PANEL_DEFAULT = 260;

function App() {
  const [, setIsLight] = useState(false);
  const [rightWidth, setRightWidth] = useState(RIGHT_PANEL_DEFAULT);

  // Refs for the resize drag state — using refs instead of state
  // because mid-drag updates should not trigger a re-render.
  const isDragging  = useRef(false);
  const startX      = useRef(0);
  const startWidth  = useRef(0);

  // Subscribe to only the store slices this component needs
  const nodes        = useStore((s) => s.nodes);
  const deleteNode   = useStore((s) => s.deleteNode);
  const duplicateNode = useStore((s) => s.duplicateNode);
  const onNodesChange = useStore((s) => s.onNodesChange);

  // ── Theme toggle ─────────────────────────────────────────────────────────
  // Setting data-theme="light" on <html> activates the [data-theme="light"]
  // CSS variable overrides in index.css without any inline style injection.
  const toggleTheme = useCallback(() => {
    setIsLight((prev) => {
      const next = !prev;
      if (next) {
        document.documentElement.setAttribute('data-theme', 'light');
      } else {
        document.documentElement.removeAttribute('data-theme');
      }
      return next;
    });
  }, []);

  // ── Right-panel resize ───────────────────────────────────────────────────
  // The resize handle sits between the canvas and the inspector.
  // We use window-level listeners (not element-level) so that dragging
  // quickly outside the handle boundary still works correctly.
  const onResizeMouseDown = useCallback((e) => {
    e.preventDefault();
    isDragging.current  = true;
    startX.current      = e.clientX;
    startWidth.current  = rightWidth;
    document.body.style.cursor     = 'col-resize';
    document.body.style.userSelect = 'none';
  }, [rightWidth]);

  useEffect(() => {
    const onMouseMove = (e) => {
      if (!isDragging.current) return;
      // Moving the mouse left increases the panel width; right decreases it.
      const delta    = startX.current - e.clientX;
      const newWidth = Math.min(RIGHT_PANEL_MAX, Math.max(RIGHT_PANEL_MIN, startWidth.current + delta));
      setRightWidth(newWidth);
    };

    const onMouseUp = () => {
      if (!isDragging.current) return;
      isDragging.current         = false;
      document.body.style.cursor     = '';
      document.body.style.userSelect = '';
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup',   onMouseUp);
    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup',   onMouseUp);
    };
  }, []);

  // ── Global keyboard shortcuts ────────────────────────────────────────────
  // Guard: skip if the user is typing in an input field.
  useEffect(() => {
    const handle = (e) => {
      const tag = document.activeElement?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;

      const selected = nodes.filter((n) => n.selected);

      // Delete / Backspace — remove all selected nodes
      if ((e.key === 'Delete' || e.key === 'Backspace') && selected.length > 0) {
        e.preventDefault();
        selected.forEach((n) => deleteNode(n.id));
      }

      // Escape — deselect all nodes
      if (e.key === 'Escape' && selected.length > 0) {
        onNodesChange(selected.map((n) => ({ id: n.id, type: 'select', selected: false })));
      }

      // Ctrl+D / Cmd+D — duplicate selected nodes
      if ((e.metaKey || e.ctrlKey) && e.key === 'd' && selected.length > 0) {
        e.preventDefault();
        selected.forEach((n) => duplicateNode(n.id));
      }
    };

    window.addEventListener('keydown', handle);
    return () => window.removeEventListener('keydown', handle);
  }, [nodes, deleteNode, duplicateNode, onNodesChange]);

  return (
    <div className="app-layout">
      <Header />

      <div className="app-main">
        <Sidebar />

        <div className="app-canvas-area">
          <PipelineUI />
        </div>

        {/* Drag handle between canvas and inspector */}
        <div
          className="right-resize-handle"
          onMouseDown={onResizeMouseDown}
          title="Drag to resize inspector"
          aria-label="Resize right panel"
        />

        {/* Inspector panel — width controlled by drag state */}
        <div style={{ width: rightWidth, flexShrink: 0, display: 'flex', flexDirection: 'column' }}>
          <RightPanel />
        </div>
      </div>

      {/* Command palette — ⌘K / Ctrl+K to open */}
      <CommandPalette onToggleTheme={toggleTheme} />
    </div>
  );
}

export default App;
