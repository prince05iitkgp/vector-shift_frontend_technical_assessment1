import { memo, useCallback } from 'react';
import * as LucideIcons from 'lucide-react';
import './styles/sidebar.css';

export const DraggableNode = memo(({ node }) => {
  const { type, label, icon, color } = node;

  const onDragStart = useCallback((event) => {
    event.dataTransfer.setData(
      'application/reactflow',
      JSON.stringify({ nodeType: type })
    );
    event.dataTransfer.effectAllowed = 'move';
  }, [type]);

  const IconComponent = LucideIcons[icon] || LucideIcons.Box;

  return (
    <div
      className="draggable-node-item"
      style={{ '--node-accent': color }}
      onDragStart={onDragStart}
      onDragEnd={(e) => { e.target.style.opacity = '1'; }}
      draggable
      role="button"
      tabIndex={0}
      title={node.description || label}
      aria-label={`Drag ${label} node onto canvas`}
    >
      <div className="node-item-icon">
        <IconComponent size={16} />
      </div>
      <span className="draggable-node-label">{label}</span>
    </div>
  );
});
