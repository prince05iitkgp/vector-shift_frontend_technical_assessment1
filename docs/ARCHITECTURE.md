# Technical Architecture
## VectorShift Pipeline Builder

---

## 1. System Overview

```
┌─────────────────────────────────────────────────────────┐
│                    Browser (React SPA)                   │
│                                                          │
│  ┌──────────┐   ┌────────────────────┐   ┌───────────┐  │
│  │  Sidebar  │   │  ReactFlow Canvas  │   │  Inspector │  │
│  │ (registry)│   │   (nodes + edges)  │   │  (right    │  │
│  └──────────┘   └────────────────────┘   │   panel)  │  │
│       │                  │                └───────────┘  │
│       └──────────────────┼──────────────────────┘        │
│                          │                               │
│              ┌───────────▼───────────┐                  │
│              │    Zustand Store       │                  │
│              │  (nodes, edges, name)  │                  │
│              └───────────────────────┘                  │
└───────────────────────────┬─────────────────────────────┘
                            │ POST /pipelines/parse
                            ▼
               ┌─────────────────────────┐
               │   FastAPI Backend        │
               │   (DAG analysis)         │
               └─────────────────────────┘
```

---

## 2. Frontend Architecture

### 2.1 Component Hierarchy

```
App
├── Header              — pipeline name, run button, theme toggle, shortcuts hint
├── Sidebar             — searchable, grouped node palette
│   └── DraggableNode   — individual draggable node item
├── PipelineUI (ui.js)  — ReactFlow canvas with Background, Controls, MiniMap
│   └── [NodeComponent] — one per node type, rendered by ReactFlow
├── RightPanel          — context-aware inspector (empty state / node config)
│   └── LiveValidation  — health badge (DAG valid / warnings)
└── CommandPalette      — ⌘K overlay with fuzzy-searchable actions
    └── ResultModal     — pipeline analysis result modal
```

### 2.2 State Management (Zustand)

All application state lives in a single flat Zustand store (`store.js`):

```
Store {
  nodes:          ReactFlow Node[]       — canvas nodes
  edges:          ReactFlow Edge[]       — canvas edges
  pipelineName:   string                 — editable pipeline title
  nodeIDs:        Record<string, number> — per-type ID counters

  // Actions
  getNodeID(type)       → string         — generates unique "type-N" IDs
  addNode(node)         → void
  onNodesChange(changes)→ void           — delegates to ReactFlow applyNodeChanges
  onEdgesChange(changes)→ void
  onConnect(connection) → void           — wraps addEdge with edge style
  updateNodeField(...)  → void           — updates a single field in node.data
  deleteNode(nodeId)    → void           — removes node + all its edges
  duplicateNode(nodeId) → void           — clones node at offset position
  clearCanvas()         → void
  setPipelineName(name) → void
}
```

**Performance Optimization**: To prevent React 18 maximum update depth errors, `PipelineUI` avoids destructuring the entire state object. Instead, it utilizes strict, individual atomic selectors (e.g., `useStore(s => s.nodes)`). This guarantees that ReactFlow only triggers re-renders when the exact slice of state it cares about actually changes, ensuring high performance even with complex, dense graphs.

### 2.3 Node Self-Registration Pattern

Rather than maintaining a central registry file that must be updated every time a new node is added, each node file registers itself at module load time:

```js
// In every node file (e.g., llmNode.js):
NodeRegistry.register({
  id:        'llm',
  label:     'LLM',
  component: LLMNode,
  category:  'AI',
  // ...
});
```

`App.js` imports each node file at the top (side-effect imports). This triggers registration before `NodeRegistry.getNodeTypes()` is called in `ui.js`.

**Trade-off**: Requires all node files to be imported in `App.js`. Alternative: dynamic import with `require.context` (webpack-specific).

### 2.4 Text Node Variable Interpolation

The Text node is the most complex: its content field accepts `{{variable}}` syntax, and it dynamically generates ReactFlow input handles for each unique variable.

```
User types: "Hello {{name}}, your score is {{score}}"
                        ↓
         useVariableParser hook (regex: /\{\{([a-zA-Z_]\w*)\}\}/g)
                        ↓
         variables = ['name', 'score']
                        ↓
         Two <Handle> components rendered on the left side
         Two edges can now connect to 'name' and 'score' inputs
```

This is a real-time reactive pattern: as the user types, handles appear/disappear automatically.

---

## 3. Validation Architecture

Validation runs at two layers:

### 3.1 Client-Side (PipelineValidator.js)

Runs on every render in the `RightPanel` component (via `useMemo`):

1. **Empty check** — no nodes → error
2. **Isolation check** — nodes with no edges → warning (note nodes excluded)
3. **Edge integrity** — edges referencing non-existent nodes → error
4. **Cycle detection** — Kahn's BFS topological sort → error if not a DAG

The right panel inspector shows the health status in real time.

### 3.2 Server-Side (main.py)

Runs when the user clicks **Run**:

1. Serializes the full `nodes` and `edges` arrays from Zustand state
2. POSTs to `POST /pipelines/parse`
3. Backend re-runs `is_dag()` using the same Kahn's Algorithm
4. Response is displayed in the `ResultModal`

**Why both layers?** Client-side validation gives instant feedback. Server-side validation is the authoritative check (no client-side bypass).

---

## 4. Kahn's Algorithm (DAG Detection)

Both the frontend and backend use the same algorithm:

```
Given: nodes N, edges E

1. Build adjacency list graph[u] = [v1, v2, ...]
2. Compute in-degree[v] = count of edges pointing to v
3. Initialize queue with all nodes where in-degree == 0
4. BFS:
   - Pop a node from the queue
   - For each neighbor, decrement in-degree
   - If neighbor's in-degree reaches 0, add to queue
5. Count visited nodes
6. If visited == |N| → no cycle (valid DAG)
   If visited <  |N| → cycle exists (not a DAG)
```

**Time complexity**: O(V + E)  
**Space complexity**: O(V + E)

---

## 5. Data Flow: Pipeline Submission

```
User clicks "Run"
       │
       ▼
submit.js: reads nodes + edges from Zustand store
       │
       ▼
fetch POST http://localhost:8000/pipelines/parse
  Body: { nodes: [...], edges: [...] }
       │
       ▼
FastAPI: validates body with Pydantic (Pipeline model)
       │
       ▼
is_dag() — Kahn's Algorithm on the graph
       │
       ▼
Response: { num_nodes, num_edges, is_dag }
       │
       ▼
ResultModal: renders analysis with CountUp animations
```

**Cross-Origin Resource Sharing (CORS)**:
Because the frontend (`localhost:3000`) and backend (`localhost:8000`) operate on different ports during development, the FastAPI backend explicitly configures `CORSMiddleware`. This allows `http://localhost:3000` origins, ensuring seamless cross-origin communication without preflight `OPTIONS` errors.

---

## 6. CSS Architecture

### Design Tokens

All visual constants are CSS custom properties defined in `index.css`:

```css
:root {
  --bg-primary:    #0B1220;   /* Canvas background  */
  --bg-surface:    #111827;   /* Panel backgrounds  */
  --text-primary:  #F9FAFB;   /* Primary text       */
  --accent-llm:    #8B5CF6;   /* LLM node color     */
  --space-4:       16px;      /* Base spacing unit  */
  --radius-lg:     8px;       /* Card border radius */
}
```

### Theme Switching

Dark mode is the default (`:root`). Light mode is an attribute override:

```css
[data-theme="light"] {
  --bg-primary:   #F3F4F6;
  --text-primary: #111827;
  /* ... */
}
```

`App.js` toggles `document.documentElement.setAttribute('data-theme', 'light')`.

### Edge Colors

ReactFlow's SVG edges required CSS overrides with `!important` because React inline `style` props cannot override ReactFlow's internal stylesheet:

```css
.react-flow__edge-path { stroke: rgba(255,255,255,0.7) !important; }
[data-theme='light'] .react-flow__edge-path { stroke: rgba(30,41,59,0.7) !important; }
```

---

## 7. Technology Choices

| Technology | Reason |
|------------|--------|
| **React 18** | Component model fits naturally with the node graph abstraction |
| **ReactFlow 11** | Production-grade graph library; handles pan/zoom, handles, edges |
| **Zustand 5** | Minimal boilerplate state management; optimized atomic state selectors |
| **Framer Motion** | Smooth, spring-physics animations for the command palette |
| **FastAPI** | Auto-generated OpenAPI docs; Pydantic models ensure type safety |
| **Lucide React** | Consistent, lightweight icon set |
| **CSS Variables** | Native theming without a CSS-in-JS runtime |

---

## 8. Future Roadmap & Enhancements

1. **Persistence Layer** — Sync pipeline state to `localStorage` or a database for seamless session recovery.
2. **Undo/Redo History** — Implement a time-travel state wrapper in Zustand for native `Ctrl+Z` support.
3. **Multi-select & Grouping** — Allow dragging and organizing multiple nodes simultaneously.
4. **Dynamic Integrations** — Fetch LLM model lists dynamically from an API rather than relying on hardcoded dropdowns.
