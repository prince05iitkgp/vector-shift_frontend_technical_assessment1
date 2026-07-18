// submit.js — Part 4: Full backend integration with error handling

import { useState, useCallback, useMemo } from 'react';
import { useStore } from './store';
import { validatePipeline } from './domain/PipelineValidator';
import { ResultModal } from './components/ResultModal';

import { Play } from 'lucide-react';
import './styles/modal.css';

const BACKEND_URL = 'http://localhost:8000';

// Structured logging helper
const log = (event, data = {}) => {
  if (process.env.NODE_ENV === 'development') {
    console.log(JSON.stringify({ ts: Date.now(), event, ...data }));
  }
};

export const SubmitButton = () => {
  // Subscribe to nodes and edges to compute live validation
  const nodes = useStore((state) => state.nodes);
  const edges = useStore((state) => state.edges);

  const [loading,  setLoading]  = useState(false);
  const [result,   setResult]   = useState(null);
  const [warnings, setWarnings] = useState([]);
  const [error,    setError]    = useState(null);
  const [success,  setSuccess]  = useState(null);

  // Compute validation live
  const liveValidation = useMemo(() => validatePipeline(nodes, edges), [nodes, edges]);

  const handleSubmit = useCallback(async () => {
    // Client-side validation before hitting the network
    if (!liveValidation.isValid) {
      setError(liveValidation.errors[0]?.message || 'Pipeline validation failed.');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    log('pipeline.submit', { numNodes: nodes.length, numEdges: edges.length });

    try {
      const start    = Date.now();
      const response = await fetch(`${BACKEND_URL}/pipelines/parse`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ nodes, edges }),
        signal:  AbortSignal.timeout(10000), // 10s timeout
      });

      if (!response.ok) {
        throw new Error(`Server responded with ${response.status}`);
      }

      const data      = await response.json();
      const latencyMs = Date.now() - start;

      log('pipeline.result', { isDAG: data.is_dag, latencyMs });

      setWarnings(liveValidation.warnings);
      setResult(data);
      if (data.is_dag) {
        setSuccess('Pipeline validated successfully!');
        setTimeout(() => setSuccess(null), 3000);
      }
    } catch (err) {
      const isTimeout = err.name === 'TimeoutError' || err.name === 'AbortError';
      const message   = isTimeout
        ? 'Request timed out. Is the backend running? Run: uvicorn main:app --reload'
        : `Backend unreachable. Run: uvicorn main:app --reload (Error: ${err.message})`;

      log('error.network', { message: err.message });
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [liveValidation, nodes, edges]);

  return (
    <>
      <button 
        className="primary-btn run-btn" 
        onClick={handleSubmit} 
        disabled={loading || liveValidation.status === 'error' || liveValidation.status === 'empty'}
        aria-label="Run pipeline"
        aria-busy={loading}
        title={liveValidation.status === 'error' ? liveValidation.errors[0]?.message : 'Run pipeline'}
      >
        <Play size={14} className={loading ? "spin" : ""} />
        {loading ? 'Running...' : 'Run'}
      </button>

      {/* Error/Success toasts */}
      <div className="toast-container" role="alert" aria-live="assertive">
        {error && (
          <div className="toast error">
            ⚠️ {error}
            <button
              onClick={() => setError(null)}
              style={{ marginLeft: 12, background: 'none', border: 'none', color: 'inherit', cursor: 'pointer', fontSize: 14 }}
              aria-label="Dismiss error"
            >
              ✕
            </button>
          </div>
        )}
        {success && (
          <div className="toast success" style={{ background: 'var(--success)', color: 'black' }}>
            ✅ {success}
          </div>
        )}
      </div>

      {/* Result modal */}
      {result && (
        <ResultModal
          result={result}
          warnings={warnings}
          onClose={() => { setResult(null); setWarnings([]); }}
        />
      )}
    </>
  );
};
