import React, { useState, useMemo, useEffect, useRef } from 'react';
import { NodeRegistry } from './domain/NodeRegistry';
import { DraggableNode } from './draggableNode';
import { Search, ChevronDown, ChevronRight, Star } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import './styles/sidebar.css';

const CATEGORIES = [
  { id: 'inputs', label: 'INPUTS' },
  { id: 'ai', label: 'AI' },
  { id: 'logic', label: 'LOGIC' },
  { id: 'output', label: 'OUTPUT' },
  { id: 'utility', label: 'UTILITY' }
];

export const Sidebar = () => {
  const [search, setSearch] = useState('');
  const searchInputRef = useRef(null);
  const [expanded, setExpanded] = useState({
    recent: true,
    inputs: true,
    ai: true,
    logic: true,
    output: true,
    utility: true
  });

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        searchInputRef.current?.focus();
      } else if (e.key === '/' && document.activeElement !== searchInputRef.current) {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const allNodes = NodeRegistry.getToolbarNodes();

  const toggleCategory = (id) => {
    setExpanded(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const filteredNodes = useMemo(() => {
    if (!search) return null;
    const lower = search.toLowerCase();
    return allNodes.filter(node => 
      node.label.toLowerCase().includes(lower) || 
      (node.keywords && node.keywords.some(k => k.toLowerCase().includes(lower)))
    );
  }, [search, allNodes]);

  return (
    <aside className="left-sidebar">
      <div className="sidebar-search">
        <Search size={14} className="search-icon" />
        <input 
          ref={searchInputRef}
          type="text" 
          placeholder="Search nodes..." 
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <div className="search-shortcut">
          <kbd>⌘</kbd> <kbd>K</kbd>
        </div>
      </div>

      <div className="sidebar-scroll">
        {search ? (
          <div className="search-results">
            {filteredNodes.length > 0 ? (
              filteredNodes.map(node => <DraggableNode key={node.type} node={node} />)
            ) : (
              <div className="empty-search">
                <p>No matching nodes</p>
                <div className="empty-hint">
                  Try searching for:
                  <ul>
                    <li>LLM</li>
                    <li>Input</li>
                    <li>Prompt</li>
                  </ul>
                </div>
              </div>
            )}
          </div>
        ) : (
          <>
            {/* Favorites / Recent (Mocked for UI) */}
            <div className="sidebar-group">
              <div 
                className="group-header"
                onClick={() => toggleCategory('recent')}
              >
                {expanded.recent ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                <Star size={12} className="group-icon-accent" />
                <span>FAVORITES</span>
              </div>
              <AnimatePresence initial={false}>
                {expanded.recent && (
                  <motion.div 
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.15, ease: 'easeOut' }}
                    className="group-content"
                  >
                    {allNodes.filter(n => ['llm', 'prompt', 'customOutput'].includes(n.type)).map(node => (
                      <DraggableNode key={node.type} node={node} />
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="sidebar-divider" />

            {/* Categories */}
            {CATEGORIES.map(cat => {
              const nodesInCat = allNodes.filter(n => n.category.toLowerCase() === cat.id);
              if (nodesInCat.length === 0) return null;

              return (
                <div key={cat.id} className="sidebar-group">
                  <div 
                    className="group-header"
                    onClick={() => toggleCategory(cat.id)}
                  >
                    {expanded[cat.id] ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                    <span>{cat.label}</span>
                  </div>
                  <AnimatePresence initial={false}>
                    {expanded[cat.id] && (
                      <motion.div 
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.15, ease: 'easeOut' }}
                        className="group-content"
                      >
                        {nodesInCat.map(node => (
                          <DraggableNode key={node.type} node={node} />
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </>
        )}
      </div>
    </aside>
  );
};
