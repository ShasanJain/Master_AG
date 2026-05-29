# Graph Report - Master_AG  (2026-05-28)

## Corpus Check
- 67 files · ~113,636 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 517 nodes · 528 edges · 65 communities (52 shown, 13 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 5 edges (avg confidence: 0.8)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `386c295e`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- [[_COMMUNITY_Community 0|Community 0]]
- [[_COMMUNITY_Community 1|Community 1]]
- [[_COMMUNITY_Community 2|Community 2]]
- [[_COMMUNITY_Community 3|Community 3]]
- [[_COMMUNITY_Community 4|Community 4]]
- [[_COMMUNITY_Community 5|Community 5]]
- [[_COMMUNITY_Community 6|Community 6]]
- [[_COMMUNITY_Community 7|Community 7]]
- [[_COMMUNITY_Community 8|Community 8]]
- [[_COMMUNITY_Community 9|Community 9]]
- [[_COMMUNITY_Community 10|Community 10]]
- [[_COMMUNITY_Community 11|Community 11]]
- [[_COMMUNITY_Community 12|Community 12]]
- [[_COMMUNITY_Community 13|Community 13]]
- [[_COMMUNITY_Community 14|Community 14]]
- [[_COMMUNITY_Community 15|Community 15]]
- [[_COMMUNITY_Community 16|Community 16]]
- [[_COMMUNITY_Community 17|Community 17]]
- [[_COMMUNITY_Community 18|Community 18]]
- [[_COMMUNITY_Community 19|Community 19]]
- [[_COMMUNITY_Community 20|Community 20]]
- [[_COMMUNITY_Community 21|Community 21]]
- [[_COMMUNITY_Community 22|Community 22]]
- [[_COMMUNITY_Community 23|Community 23]]
- [[_COMMUNITY_Community 24|Community 24]]
- [[_COMMUNITY_Community 25|Community 25]]
- [[_COMMUNITY_Community 26|Community 26]]
- [[_COMMUNITY_Community 27|Community 27]]
- [[_COMMUNITY_Community 28|Community 28]]
- [[_COMMUNITY_Community 29|Community 29]]
- [[_COMMUNITY_Community 30|Community 30]]
- [[_COMMUNITY_Community 31|Community 31]]
- [[_COMMUNITY_Community 32|Community 32]]
- [[_COMMUNITY_Community 33|Community 33]]
- [[_COMMUNITY_Community 34|Community 34]]
- [[_COMMUNITY_Community 35|Community 35]]
- [[_COMMUNITY_Community 36|Community 36]]
- [[_COMMUNITY_Community 37|Community 37]]
- [[_COMMUNITY_Community 38|Community 38]]
- [[_COMMUNITY_Community 39|Community 39]]
- [[_COMMUNITY_Community 40|Community 40]]
- [[_COMMUNITY_Community 41|Community 41]]
- [[_COMMUNITY_Community 42|Community 42]]
- [[_COMMUNITY_Community 43|Community 43]]
- [[_COMMUNITY_Community 44|Community 44]]
- [[_COMMUNITY_Community 45|Community 45]]
- [[_COMMUNITY_Community 46|Community 46]]
- [[_COMMUNITY_Community 47|Community 47]]
- [[_COMMUNITY_Community 48|Community 48]]
- [[_COMMUNITY_Community 49|Community 49]]
- [[_COMMUNITY_Community 50|Community 50]]
- [[_COMMUNITY_Community 51|Community 51]]
- [[_COMMUNITY_Community 55|Community 55]]
- [[_COMMUNITY_Community 60|Community 60]]

## God Nodes (most connected - your core abstractions)
1. `compilerOptions` - 16 edges
2. `skills` - 15 edges
3. `get_memory()` - 9 edges
4. `firstdbf9474d461a19e9333c2fd19b46115348f` - 9 edges
5. `StatusBadge()` - 8 edges
6. `tensor_names` - 8 edges
7. `Agent Instructions` - 7 edges
8. `Jack Identity Profile` - 7 edges
9. `search.exclude` - 6 edges
10. `getConfig()` - 6 edges

## Surprising Connections (you probably didn't know these)
- `get_context()` --calls--> `search_vault()`  [INFERRED]
  execution/ollama_inference.py → execution/deep_lake_vault.py
- `MemoryPage()` --calls--> `getConfig()`  [EXTRACTED]
  dashboard/src/app/memory/page.tsx → dashboard/src/app/actions/config.ts
- `migrate_industrial()` --calls--> `init_vault()`  [INFERRED]
  execution/ingest_skills.py → execution/deep_lake_vault.py
- `execute_cognitive_tags()` --calls--> `store_memory()`  [INFERRED]
  execution/ollama_inference.py → execution/vector_memory.py
- `get_context()` --calls--> `get_memory()`  [INFERRED]
  execution/ollama_inference.py → execution/vector_memory.py

## Communities (65 total, 13 thin omitted)

### Community 0 - "Community 0"
Cohesion: 0.07
Nodes (13): metadata, outfit, FloatingJack(), IconDashboard(), IconIncubator(), IconLogs(), IconSettings(), IconSkills() (+5 more)

### Community 1 - "Community 1"
Cohesion: 0.12
Nodes (26): chat_complete(), clean_tags(), execute_cognitive_tags(), get_context(), main(), str, query_ollama(), Simple synchronous prompt-response helper. (+18 more)

### Community 2 - "Community 2"
Cohesion: 0.08
Nodes (25): dependencies, next, react, react-dom, react-force-graph-3d, sqlite, sqlite3, three (+17 more)

### Community 3 - "Community 3"
Cohesion: 0.08
Nodes (24): chunk_compression, dtype, extend, flatten_sequence, extend, flatten_sequence, update, hidden (+16 more)

### Community 4 - "Community 4"
Cohesion: 0.09
Nodes (21): chunk_compression, dtype, hidden, htype, is_link, is_sequence, length, links (+13 more)

### Community 5 - "Community 5"
Cohesion: 0.15
Nodes (7): getChatHistory(), sendLocalMessage(), VM_PATH, getConfig(), updateConfig(), purgeMemory(), MemoryPage()

### Community 6 - "Community 6"
Cohesion: 0.10
Nodes (20): chunk_compression, dtype, hidden, htype, is_link, is_sequence, length, links (+12 more)

### Community 7 - "Community 7"
Cohesion: 0.10
Nodes (19): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+11 more)

### Community 8 - "Community 8"
Cohesion: 0.11
Nodes (17): chunk_compression, dtype, hidden, htype, is_link, is_sequence, length, links (+9 more)

### Community 9 - "Community 9"
Cohesion: 0.11
Nodes (17): chunk_compression, dtype, hidden, htype, is_link, is_sequence, length, links (+9 more)

### Community 10 - "Community 10"
Cohesion: 0.11
Nodes (17): chunk_compression, dtype, hidden, htype, is_link, is_sequence, length, links (+9 more)

### Community 11 - "Community 11"
Cohesion: 0.11
Nodes (17): chunk_compression, dtype, hidden, htype, is_link, is_sequence, length, links (+9 more)

### Community 12 - "Community 12"
Cohesion: 0.12
Nodes (15): editor.codeActionsOnSave, source.fixAll.eslint, editor.formatOnSave, files.exclude, **/*.db, **/.next, **/node_modules, **/.tmp (+7 more)

### Community 13 - "Community 13"
Cohesion: 0.13
Nodes (14): allow_delete, default_index, groups, hidden_tensors, tensor_names, embedding, _embedding_id, _embedding_shape (+6 more)

### Community 14 - "Community 14"
Cohesion: 0.18
Nodes (12): get_embedding(), init_vault(), Get vector embedding from local Ollama node synchronously., Initialize the Deep Lake dataset schema., Search the Deep Lake vault using manual Cosine Similarity (Windows Fallback)., search_vault(), get_embedding_async(), ingest_batch() (+4 more)

### Community 15 - "Community 15"
Cohesion: 0.15
Nodes (12): branches, main, commits, firstdbf9474d461a19e9333c2fd19b46115348f, branch, children, commit_message, commit_time (+4 more)

### Community 16 - "Community 16"
Cohesion: 0.18
Nodes (10): embed_logs, memories, _migrations, sqlite_sequence, stats, temporal_edges, temporal_facts, users (+2 more)

### Community 17 - "Community 17"
Cohesion: 0.22
Nodes (8): 🧬 Behavioral Mode: INSTANT (High Autonomy), ⌨️ Command Orchestration, 🎯 Core Directive: Industrial Excellence, 🤖 Identity: Jack, Jack Identity Profile, 🌐 Language Protocol, 📚 Shared Standards (Auto-Active), 🛡️ Special Protocol: Context Integrity Check

### Community 18 - "Community 18"
Cohesion: 0.25
Nodes (7): Agent Instructions, File Organization, Operating Principles, Self-annealing loop, Summary, The 3-Layer Architecture, The Routing Engine (Mandatory Skill Check)

### Community 19 - "Community 19"
Cohesion: 0.29
Nodes (6): auto_capture, default_user, embedding_provider, engine, notes, sectors

### Community 20 - "Community 20"
Cohesion: 0.29
Nodes (6): 🛡️ 1. Engine Control, 🏗️ 2. Configuration (`config/schedule.json`), ⌨️ 3. Jack Commands (Standardized), 🧪 4. Verification, code:json ({), 🕒 Task Scheduler (Industrial Cron) Directive

### Community 21 - "Community 21"
Cohesion: 0.23
Nodes (9): cosine_similarity(), decode_vector(), generate_graph(), main(), Decode SQLite BLOB vector to numpy array (assumes float32)., Calculate cosine similarity between two vectors., Decode SQLite BLOB vector to numpy array (assumes float32)., Calculate cosine similarity between two vectors. (+1 more)

### Community 22 - "Community 22"
Cohesion: 0.60
Nodes (5): execute_task(), load_config(), main(), save_config(), setup_scheduler()

### Community 23 - "Community 23"
Cohesion: 0.40
Nodes (4): code:bash (npm run dev), Deploy on Vercel, Getting Started, Learn More

### Community 24 - "Community 24"
Cohesion: 0.40
Nodes (4): 🏗️ Architecture: Domain-Centric, 🎬 Clip Engine v2.0, 🛠️ Commands, Master-AG: Industrialized Agentic Engine

### Community 25 - "Community 25"
Cohesion: 0.40
Nodes (5): computedHash, skillPath, source, sourceType, performing-security-code-review

### Community 26 - "Community 26"
Cohesion: 0.40
Nodes (5): computedHash, skillPath, source, sourceType, agent-performance-engineer

### Community 27 - "Community 27"
Cohesion: 0.40
Nodes (5): computedHash, skillPath, source, sourceType, motion-framer

### Community 28 - "Community 28"
Cohesion: 0.40
Nodes (5): computedHash, skillPath, source, sourceType, oracle-dba

### Community 29 - "Community 29"
Cohesion: 0.83
Nodes (3): audit_skill_content(), get_skills_dir(), main()

### Community 31 - "Community 31"
Cohesion: 0.50
Nodes (4): computedHash, source, sourceType, antv-skills-maintainer

### Community 32 - "Community 32"
Cohesion: 0.50
Nodes (4): computedHash, source, sourceType, icon-retrieval

### Community 33 - "Community 33"
Cohesion: 0.50
Nodes (4): computedHash, source, sourceType, narrative-text-visualization

### Community 34 - "Community 34"
Cohesion: 0.50
Nodes (4): computedHash, source, sourceType, antv-s2-expert

### Community 35 - "Community 35"
Cohesion: 0.50
Nodes (4): computedHash, source, sourceType, chart-visualization

### Community 36 - "Community 36"
Cohesion: 0.50
Nodes (4): computedHash, source, sourceType, infographic-creator

### Community 37 - "Community 37"
Cohesion: 0.50
Nodes (4): computedHash, source, sourceType, mysql

### Community 38 - "Community 38"
Cohesion: 0.50
Nodes (4): computedHash, source, sourceType, neki

### Community 39 - "Community 39"
Cohesion: 0.50
Nodes (4): computedHash, source, sourceType, postgres

### Community 40 - "Community 40"
Cohesion: 0.50
Nodes (4): vitess, computedHash, source, sourceType

### Community 60 - "Community 60"
Cohesion: 0.40
Nodes (3): ForceGraph3D, GraphLink, GraphNode

## Knowledge Gaps
- **305 isolated node(s):** `version`, `source`, `sourceType`, `skillPath`, `computedHash` (+300 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **13 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `skills` connect `Community 45` to `Community 32`, `Community 33`, `Community 34`, `Community 35`, `Community 36`, `Community 37`, `Community 38`, `Community 39`, `Community 40`, `Community 25`, `Community 26`, `Community 27`, `Community 28`, `Community 31`?**
  _High betweenness centrality (0.013) - this node is a cross-community bridge._
- **Why does `StatusBadge()` connect `Community 0` to `Community 5`?**
  _High betweenness centrality (0.004) - this node is a cross-community bridge._
- **Why does `get_context()` connect `Community 1` to `Community 14`?**
  _High betweenness centrality (0.004) - this node is a cross-community bridge._
- **What connects `version`, `source`, `sourceType` to the rest of the system?**
  _324 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Community 0` be split into smaller, more focused modules?**
  _Cohesion score 0.07357357357357357 - nodes in this community are weakly interconnected._
- **Should `Community 1` be split into smaller, more focused modules?**
  _Cohesion score 0.12169312169312169 - nodes in this community are weakly interconnected._
- **Should `Community 2` be split into smaller, more focused modules?**
  _Cohesion score 0.07692307692307693 - nodes in this community are weakly interconnected._