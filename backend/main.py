"""
VectorShift Pipeline API
========================

Analyzes AI pipeline graphs submitted from the frontend editor.

Endpoints:
  GET  /                 — Health check
  POST /pipelines/parse  — Accepts a pipeline graph, returns node/edge counts
                           and DAG validity.

DAG detection uses Kahn's Algorithm (BFS topological sort).

Run locally:
  uvicorn main:app --reload
  
Interactive API docs: http://localhost:8000/docs
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from collections import defaultdict, deque
from typing import Any
import logging
import json
import time


# ── Logging ───────────────────────────────────────────────────────────────────
logging.basicConfig(level=logging.INFO, format="%(message)s")
logger = logging.getLogger("vectorshift.pipeline")


# ── FastAPI app ───────────────────────────────────────────────────────────────
app = FastAPI(
    title="VectorShift Pipeline API",
    description="Analyzes pipeline graphs: node/edge counts and DAG validation.",
    version="1.0.0",
)

# CORS — allow requests from the React dev server (localhost:3000).
# Without this, the browser blocks cross-origin fetch calls.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_methods=["GET", "POST"],
    allow_headers=["*"],
)


# ── Pydantic models ───────────────────────────────────────────────────────────
class Pipeline(BaseModel):
    """
    Represents a serialized pipeline graph from the frontend.

    Only `id` is required on each node/edge for graph analysis.
    Extra fields (position, data, type) are accepted but ignored.
    """
    nodes: list[dict[str, Any]]
    edges: list[dict[str, Any]]


# ── DAG detection ─────────────────────────────────────────────────────────────
def is_dag(nodes: list, edges: list) -> bool:
    """
    Determines whether the graph is a Directed Acyclic Graph (DAG)
    using Kahn's Algorithm (BFS topological sort).

    A pipeline must be a DAG — any cycle would cause infinite execution.

    Algorithm:
      1. Build an adjacency list and in-degree map
      2. Initialize a queue with all source nodes (in-degree == 0)
      3. Process nodes BFS-style: decrement neighbors' in-degrees
      4. If all nodes are visited → no cycle → valid DAG

    Complexity: O(V + E)

    Edge cases:
      - Empty graph        → True  (vacuously a DAG)
      - Single node        → True
      - Self-loop          → False (in-degree never reaches 0)
      - Disconnected graph → True  (if neither component has a cycle)
    """
    if not nodes:
        return True

    node_ids  = {node["id"] for node in nodes}
    in_degree = {nid: 0 for nid in node_ids}
    graph     = defaultdict(list)

    for edge in edges:
        src = edge.get("source")
        tgt = edge.get("target")
        # Skip edges that reference nodes not in this pipeline
        if src in node_ids and tgt in node_ids:
            graph[src].append(tgt)
            in_degree[tgt] += 1

    # Start BFS from all source nodes (nothing pointing to them)
    queue   = deque(nid for nid, deg in in_degree.items() if deg == 0)
    visited = 0

    while queue:
        node = queue.popleft()
        visited += 1
        for neighbor in graph[node]:
            in_degree[neighbor] -= 1
            if in_degree[neighbor] == 0:
                queue.append(neighbor)

    # If visited count equals total nodes, all nodes were reachable
    # in topological order → no cycle exists
    return visited == len(nodes)


# ── Routes ────────────────────────────────────────────────────────────────────
@app.get("/")
def health_check():
    """Returns service health status. Use this to confirm the server is up."""
    return {
        "status":  "healthy",
        "service": "VectorShift Pipeline API",
        "version": "1.0.0",
    }


@app.post("/pipelines/parse")
def parse_pipeline(pipeline: Pipeline):
    """
    Analyzes a pipeline graph and returns structural statistics.

    - num_nodes: total node count
    - num_edges: total edge count  
    - is_dag: True if the graph has no cycles, False otherwise
    """
    start = time.time()

    result = {
        "num_nodes": len(pipeline.nodes),
        "num_edges": len(pipeline.edges),
        "is_dag":    is_dag(pipeline.nodes, pipeline.edges),
    }

    latency_ms = round((time.time() - start) * 1000, 2)

    # Structured log for observability
    logger.info(json.dumps({
        "event":      "pipeline.parsed",
        "num_nodes":  result["num_nodes"],
        "num_edges":  result["num_edges"],
        "is_dag":     result["is_dag"],
        "latency_ms": latency_ms,
    }))

    return result
