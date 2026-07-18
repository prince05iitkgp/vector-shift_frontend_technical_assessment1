# Backend API Reference
## VectorShift Pipeline API

Base URL: `http://localhost:8000`

---

## Endpoints

### GET `/`
Health check.

**Response 200:**
```json
{
  "status": "healthy",
  "service": "VectorShift Pipeline API",
  "version": "1.0.0"
}
```

---

### POST `/pipelines/parse`
Analyzes a pipeline graph and returns node count, edge count, and DAG validity.

**Request Headers:**
```
Content-Type: application/json
```

**Request Body:**
```json
{
  "nodes": [
    {
      "id": "customInput-1",
      "type": "customInput",
      "position": { "x": 50, "y": 100 },
      "data": { "inputName": "prompt", "inputType": "Text" }
    }
  ],
  "edges": [
    {
      "id": "edge-1",
      "source": "customInput-1",
      "sourceHandle": "customInput-1-value",
      "target": "llm-1",
      "targetHandle": "llm-1-prompt"
    }
  ]
}
```

**Response 200 — Valid DAG:**
```json
{
  "num_nodes": 3,
  "num_edges": 2,
  "is_dag": true
}
```

**Response 200 — Cycle Detected:**
```json
{
  "num_nodes": 2,
  "num_edges": 2,
  "is_dag": false
}
```

**Response 422 — Validation Error (malformed body):**
```json
{
  "detail": [{ "loc": ["body", "nodes"], "msg": "field required", "type": "value_error.missing" }]
}
```

---

## Data Models

### Node
Only `id` is required for graph analysis. All other fields are passed through.

| Field | Type | Description |
|-------|------|-------------|
| `id` | `string` | Unique node identifier |
| `type` | `string` | Node type (e.g., `customInput`, `llm`) |
| `position` | `object` | Canvas position `{ x, y }` |
| `data` | `object` | Node-specific configuration |

### Edge
Only `source` and `target` are used for graph analysis.

| Field | Type | Description |
|-------|------|-------------|
| `id` | `string` | Unique edge identifier |
| `source` | `string` | ID of the source node |
| `target` | `string` | ID of the target node |
| `sourceHandle` | `string` | (optional) Specific output handle |
| `targetHandle` | `string` | (optional) Specific input handle |

---

## Algorithm

### DAG Detection — Kahn's Algorithm (BFS)

```python
def is_dag(nodes, edges):
    node_ids  = {node["id"] for node in nodes}
    in_degree = {nid: 0 for nid in node_ids}
    graph     = defaultdict(list)

    for edge in edges:
        src, tgt = edge["source"], edge["target"]
        if src in node_ids and tgt in node_ids:
            graph[src].append(tgt)
            in_degree[tgt] += 1

    queue   = deque(nid for nid, deg in in_degree.items() if deg == 0)
    visited = 0

    while queue:
        node = queue.popleft()
        visited += 1
        for neighbor in graph[node]:
            in_degree[neighbor] -= 1
            if in_degree[neighbor] == 0:
                queue.append(neighbor)

    return visited == len(nodes)
```

**Edge cases:**
- Empty graph → `True` (vacuously a DAG)
- Single node, no edges → `True`
- Self-loop → `False`
- Disconnected graph with no cycles → `True`

---

## Running the Backend

```bash
cd backend
pip install fastapi uvicorn
uvicorn main:app --reload
```

Interactive API docs: [http://localhost:8000/docs](http://localhost:8000/docs)  
OpenAPI schema: [http://localhost:8000/openapi.json](http://localhost:8000/openapi.json)

---

## CORS Configuration

The backend allows requests from:
- `http://localhost:3000` (React dev server)
- `http://127.0.0.1:3000`

Allowed methods: `GET`, `POST`  
Allowed headers: `*`
