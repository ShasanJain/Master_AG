---
version: 2.0.0
name: vector-memory-v2
description: "Persistent semantic memory engine for Jack using OpenMemory SDK. Stores facts, events, and procedures across sessions."
---

# 🧠 Vector Memory v2 (Cognitive Memory Engine)

Persistent long-term memory for Jack powered by OpenMemory. Stores and retrieves context using multi-sector semantic search (episodic, semantic, procedural).

## 🛡️ Industrial Protocol
1. **Orchestration**: Jack uses this skill to persist and recall context across sessions.
2. **Execution**: `execution/vector_memory.py` handles all memory operations.
3. **Persistence**: SQLite via OpenMemory (`openmemory.db`), config at `config/memory_config.json`.

## ⌨️ Integrated Commands
| Command | Action |
| :--- | :--- |
| `/remember [text]` | Store a memory (semantic sector). |
| `/remember [text] --sector episodic` | Store as event/session memory. |
| `/recall [query]` | Semantic search across all memories. |
| `/memories` | List all stored memories. |
| `/forget [id]` | Delete a specific memory by ID. |

## 🔄 Auto-Capture
When enabled (`auto_capture: true` in config), Jack auto-stores session summaries at session end using `auto-capture` command. Also triggers when user shares plans via `/remember`.

## 🧪 Verification
```bash
python execution/vector_memory.py store "test memory" --sector semantic
python execution/vector_memory.py recall "test"
python execution/vector_memory.py list
python execution/vector_memory.py forget <id>
```

## 📐 Memory Sectors
| Sector | Purpose | Example |
| :--- | :--- | :--- |
| `semantic` | Facts, preferences, knowledge | "Jack prefers TypeScript" |
| `episodic` | Events, sessions, history | "Session: Fixed UI theme bugs" |
| `procedural` | Patterns, workflows, how-to | "Dashboard uses Next.js + Tailwind v4" |
