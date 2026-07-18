import React, { useState, useEffect, useRef } from 'react';
import { CheckCircle2, Moon, Sun, HelpCircle, Edit3 } from 'lucide-react';
import { SubmitButton } from './submit';
import { useStore } from './store';
import './styles/header.css';

export const Header = () => {
  const [isLight, setIsLight] = useState(false);
  const [editing, setEditing] = useState(false);
  const pipelineName = useStore((s) => s.pipelineName);
  const setPipelineName = useStore((s) => s.setPipelineName);
  const [draft, setDraft] = useState(pipelineName);
  const nameRef = useRef(null);

  useEffect(() => {
    if (isLight) {
      document.documentElement.setAttribute('data-theme', 'light');
    } else {
      document.documentElement.removeAttribute('data-theme');
    }
  }, [isLight]);

  const startEdit = () => {
    setDraft(pipelineName);
    setEditing(true);
    setTimeout(() => nameRef.current?.select(), 10);
  };

  const commitEdit = () => {
    const trimmed = draft.trim();
    setPipelineName(trimmed || 'Untitled Pipeline');
    setEditing(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') commitEdit();
    if (e.key === 'Escape') setEditing(false);
  };

  return (
    <header className="enterprise-header">
      <div className="header-brand">
        <div className="brand-text">
          <span className="brand-name">
            <span style={{ color: 'var(--text-primary)' }}>Vector</span>
            <span style={{ color: '#8A6A45' }}>Shift</span>
          </span>
        </div>
      </div>

      <div className="header-divider" />

      <div className="header-pipeline-info">
        <div className="pipeline-name-wrap">
          {editing ? (
            <input
              ref={nameRef}
              className="pipeline-name-input"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onBlur={commitEdit}
              onKeyDown={handleKeyDown}
              maxLength={48}
              aria-label="Pipeline name"
            />
          ) : (
            <button className="pipeline-name-btn" onClick={startEdit} title="Click to rename">
              <span className="pipeline-name">{pipelineName}</span>
              <Edit3 size={12} className="pipeline-name-edit-icon" />
            </button>
          )}
        </div>
        <div className="status-indicator">
          <div className="status-dot" />
          <span className="status-text">Connected</span>
        </div>
      </div>

      <div className="header-actions">
        <button
          className="palette-trigger"
          onClick={() => window.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', ctrlKey: true, bubbles: true }))}
          title="Open command palette (⌘K)"
          aria-label="Open command palette"
        >
          <span>⌘K</span>
        </button>

        <div className="auto-save">
          <CheckCircle2 size={14} />
          <span>Auto Save</span>
        </div>

        <button
          className="icon-btn"
          onClick={() => setIsLight(!isLight)}
          title="Toggle Theme"
          aria-label="Toggle light/dark theme"
        >
          {isLight ? <Moon size={16} /> : <Sun size={16} />}
        </button>

        <button className="icon-btn" title="Help" aria-label="Help">
          <HelpCircle size={16} />
        </button>

        <SubmitButton />
      </div>
    </header>
  );
};
