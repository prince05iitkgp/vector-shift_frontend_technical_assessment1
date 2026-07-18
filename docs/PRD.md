# Product Requirements Document

## VectorShift Pipeline Builder — Frontend Technical Assessment

**Author:** Prince Gautam  
**Version:** 1.0  
**Date:** July 2026  
**Status:** Submitted

---

## 1. Overview

### 1.1 Problem Statement

AI/ML engineers building multi-step data pipelines need a visual tool to compose, connect, and validate workflow steps without writing pipeline orchestration code by hand. The pipeline graph should be inspectable, validatable, and serializable for downstream execution.

### 1.2 Goal

Build a browser-based, node-graph editor that enables users to:

1. Compose pipelines by connecting typed nodes on a canvas
2. Configure each node's parameters through a context-sensitive inspector
3. Validate pipeline correctness (connectivity, acyclicity) both client-side and server-side
4. Submit the pipeline to a backend for analysis

---

## 2. Scope

### In Scope

- React-based drag-and-drop canvas (ReactFlow)
- 9 node types (Input, Output, LLM, Text, Math, API Call, Prompt, File Input, Note)
- FastAPI backend for pipeline analysis
- Client-side validation (isolated nodes, cycle detection)
- Full light/dark theme

### Out of Scope

- Live pipeline execution (nodes do not run actual LLM/API calls)
- User authentication and persistence
- Multi-user collaboration
- Cloud deployment

---

## 3. User Stories

| ID    | As a...         | I want to...                              | So that...                                     |
| ----- | --------------- | ----------------------------------------- | ---------------------------------------------- |
| US-01 | Pipeline Author | Drag nodes from a sidebar onto a canvas   | I can visually compose a workflow              |
| US-02 | Pipeline Author | Connect nodes by dragging between handles | I can define data flow between steps           |
| US-03 | Pipeline Author | Configure each node's parameters          | The pipeline step behaves as intended          |
| US-04 | Pipeline Author | See validation errors instantly           | I catch issues before submitting               |
| US-05 | Pipeline Author | Submit a pipeline to the backend          | I can get a formal analysis result             |
| US-06 | Pipeline Author | Delete nodes I no longer need             | I can iterate on my design                     |
| US-07 | Power User      | Use keyboard shortcuts                    | I can work faster without a mouse              |
| US-08 | Power User      | Use the command palette                   | I can add nodes without navigating the sidebar |
| US-09 | Pipeline Author | Rename the pipeline                       | I can identify different pipelines             |
| US-10 | Pipeline Author | Switch between light and dark mode        | I can work comfortably in any environment      |

---

## 4. Functional Requirements

### 4.1 Canvas

- **FR-01**: Users can drag nodes from the left sidebar onto the ReactFlow canvas
- **FR-02**: Nodes snap to a 20×20px grid
- **FR-03**: Users can pan and zoom the canvas freely
- **FR-04**: An empty canvas shows a contextual placeholder hint
- **FR-05**: A minimap provides an overview of the full pipeline

### 4.2 Nodes

- **FR-06**: The Text node automatically creates and removes input handles when `{{variable}}` patterns are added or removed from its content field
- **FR-07**: All nodes display a consistent header (icon, title, category badge, delete button)
- **FR-08**: Clicking the ✕ button on a node deletes it and all its connected edges immediately
- **FR-09**: Each node has typed input and output handles (left = target, right = source)

### 4.3 Inspector (Right Panel)

- **FR-10**: Selecting a node populates the right panel with that node's editable fields
- **FR-11**: Deselecting all nodes shows the Pipeline Summary (node count, edge count, health)
- **FR-12**: The inspector shows live validation warnings (unconnected nodes, DAG status)

### 4.4 Pipeline Submission

- **FR-13**: The Run button serializes all nodes and edges and POSTs to `/pipelines/parse`
- **FR-14**: The response (`num_nodes`, `num_edges`, `is_dag`) is displayed in a modal
- **FR-15**: If the backend is unreachable, a toast notification explains the issue

### 4.5 Productivity Features

- **FR-16**: `Cmd+K`/`Ctrl+K` opens the command palette for adding nodes and toggling theme
- **FR-17**: `Delete`/`Backspace` deletes selected nodes
- **FR-18**: `Ctrl+D`/`Cmd+D` duplicates selected nodes
- **FR-19**: `Esc` deselects all nodes
- **FR-20**: The pipeline name in the header is inline-editable on click

---

## 5. Non-Functional Requirements

| Category        | Requirement                                                                |
| --------------- | -------------------------------------------------------------------------- |
| Performance     | Canvas interactions (drag, connect) must feel instantaneous (< 16ms frame) |
| Accessibility   | All interactive elements have `aria-label` attributes                      |
| Responsiveness  | Application is functional at viewport widths from 1024px to 2560px         |
| Browser Support | Chrome 110+, Firefox 110+, Safari 16+, Edge 110+                           |
| Theme           | Application supports light and dark modes via CSS custom properties        |

---

## 6. Backend API Contract

### POST `/pipelines/parse`

**Request:**

```json
{
  "nodes": [{ "id": "string", "type": "string", "position": {}, "data": {} }],
  "edges": [{ "id": "string", "source": "string", "target": "string" }]
}
```

**Response:**

```json
{
  "num_nodes": 3,
  "num_edges": 2,
  "is_dag": true
}
```

**Validation Rules (Server):**

- `is_dag`: Computed using Kahn's BFS topological sort algorithm
- Only edges where both `source` and `target` exist in the node set are considered

---

## 7. Node Type Catalog

| Node Type  | ID             | Inputs                  | Outputs  | Description                                |
| ---------- | -------------- | ----------------------- | -------- | ------------------------------------------ |
| Input      | `customInput`  | —                       | value    | Named typed pipeline input                 |
| Output     | `customOutput` | value                   | —        | Named typed pipeline output                |
| LLM        | `llm`          | system, prompt          | response | Language model inference                   |
| Text       | `text`         | (dynamic per `{{var}}`) | output   | Templated text with variable interpolation |
| Math       | `math`         | a, b                    | result   | Binary arithmetic operation                |
| API Call   | `api`          | payload                 | response | Outbound HTTP request                      |
| Prompt     | `prompt`       | —                       | output   | Reusable prompt template                   |
| File Input | `fileInput`    | —                       | file     | File upload source                         |
| Note       | `note`         | —                       | —        | Non-executable annotation                  |

---

## 8. Success Metrics

| Metric                                                                | Target |
| --------------------------------------------------------------------- | ------ |
| All 7 assessment requirements pass                                    | 100%   |
| Zero console errors on page load                                      | ✅     |
| Backend `/pipelines/parse` returns correct `is_dag` for cyclic graph  | ✅     |
| Backend `/pipelines/parse` returns correct `is_dag` for acyclic graph | ✅     |
| Text node creates dynamic handles for `{{variable}}` patterns         | ✅     |
