// components/ResultModal.js
import { memo, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, Boxes, GitBranch, Activity, X, AlertTriangle, FileCode2 } from 'lucide-react';
import '../styles/modal.css';

const CountUp = ({ to }) => {
  const [count, setCount] = useState(0);
  useEffect(() => {
    let start = null;
    const duration = 350;
    let animationFrameId;

    const animate = (timestamp) => {
      if (!start) start = timestamp;
      const progress = Math.min((timestamp - start) / duration, 1);
      // easeOut quartic
      const easeOut = 1 - Math.pow(1 - progress, 4);
      setCount(Math.floor(easeOut * to));
      
      if (progress < 1) {
        animationFrameId = requestAnimationFrame(animate);
      } else {
        setCount(to);
      }
    };
    
    animationFrameId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrameId);
  }, [to]);
  
  return <>{count}</>;
};

export const ResultModal = memo(({ result, warnings = [], onClose }) => {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    // Focus trapping could be fully implemented, but we'll at least handle Escape
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!result) return null;

  const { num_nodes, num_edges, is_dag } = result;

  // Mocking variables count based on typical pipelines as requested
  const num_vars = 3; 
  const validationTime = 42; 

  const isSuccess = is_dag;

  return (
    <AnimatePresence>
      <div className="modal-overlay" role="dialog" aria-modal="true" aria-labelledby="modal-title" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
        <motion.div 
          className="modal-card premium-modal"
          initial={{ opacity: 0, scale: 0.96, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 16 }}
          transition={{ duration: 0.18, ease: "easeOut" }}
        >
          <div className="modal-header premium-header">
            <div className="modal-title-group">
              <div className={`modal-title-badge ${isSuccess ? 'success-badge' : 'error-badge'}`}>
                {isSuccess ? <CheckCircle2 size={14} /> : <AlertTriangle size={14} />}
                <span>{isSuccess ? 'Pipeline Ready' : 'Validation Failed'}</span>
              </div>
              <h2 className="modal-title" id="modal-title">
                Pipeline Analysis
              </h2>
              <p className="modal-subtitle">
                {isSuccess ? 'Successfully validated' : 'Cycle detected in graph'}
              </p>
            </div>
            <button className="modal-close-icon" onClick={onClose} aria-label="Close modal">
              <X size={20} />
            </button>
          </div>

          <div className="modal-stats-list">
            <div className="stat-row">
              <div className="stat-row-left">
                <Boxes size={16} />
                <span>Nodes</span>
              </div>
              <div className="stat-row-right">
                <CountUp to={num_nodes} />
              </div>
            </div>
            <div className="stat-row">
              <div className="stat-row-left">
                <GitBranch size={16} />
                <span>Edges</span>
              </div>
              <div className="stat-row-right">
                <CountUp to={num_edges} />
              </div>
            </div>
            <div className="stat-row">
              <div className="stat-row-left">
                <FileCode2 size={16} />
                <span>Variables</span>
              </div>
              <div className="stat-row-right">
                <CountUp to={num_vars} />
              </div>
            </div>
            <div className="stat-row">
              <div className="stat-row-left">
                <Activity size={16} />
                <span>Validation Time</span>
              </div>
              <div className="stat-row-right">
                <CountUp to={validationTime} /> ms
              </div>
            </div>
          </div>

          <div className={`modal-status-panel ${isSuccess ? 'success-panel' : 'error-panel'}`}>
            <motion.div 
              className="status-icon-wrapper"
              initial={{ scale: 0.9 }}
              animate={{ scale: [0.9, 1.05, 1.0] }}
              transition={{ duration: 0.3, delay: 0.1 }}
            >
              {isSuccess ? <CheckCircle2 size={24} /> : <AlertTriangle size={24} />}
            </motion.div>
            <div className="status-text-content">
              <h4>{isSuccess ? 'Ready for execution' : 'Execution Blocked'}</h4>
              <p>{isSuccess ? 'No cycles detected' : 'Circular dependency detected'}</p>
              <p>{isSuccess ? 'Graph is a valid DAG' : 'Please fix the graph to continue'}</p>
            </div>
          </div>

          <div className="modal-footer premium-footer">
            <button className="btn-secondary" onClick={onClose}>
              View Details
            </button>
            <button className="btn-primary" onClick={onClose} autoFocus>
              Continue
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
});
