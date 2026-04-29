---
name: postgres
description: Comprehensive PostgreSQL rules covering core DBA tasks, advanced query optimization, pgvector AI search, and Business Intelligence (BI) patterns.
---

# PostgreSQL Master Rules

When working with PostgreSQL, strictly follow these rules across Schema Design, Optimization, AI/Vector Search, and DBA Health Checks.

## 1. Schema & Performance Fundamentals
- **Primary Keys:** ALWAYS use `UUID v4` or `BIGSERIAL`.
- **Timestamps:** ALWAYS use `TIMESTAMPTZ`.
- **JSON:** ALWAYS use `JSONB`.
- **No `SELECT *`:** Explicitly name columns.
- **Explain Analyze:** ALWAYS request `EXPLAIN (ANALYZE, BUFFERS)` before optimizing.
- **Pagination:** Use keyset pagination (`WHERE id > last_id`) for large datasets.

## 2. AI & Vector Search (pgvector)
Use `pgvector` for similarity search and RAG applications.
- **Data Type:** Use `halfvec(N)` for 50% smaller storage with minimal precision loss.
- **Indexes:** Use **HNSW** by default (`m=16, ef_construction=64`). Use IVFFlat only for write-heavy/memory-bound workloads.
- **Distance:** Use **Cosine Distance** (`<=>`) by default.
- **Quantization:** For datasets >10M vectors, use **Binary Quantization** (`bit(N)`) with re-ranking.
- **Iterative Scan:** Enable `SET hnsw.iterative_scan = relaxed_order` for filtered vector searches to prevent early termination.

## 3. DBA Health & Activity Monitoring
Run these checks to maintain database health:
- **Invalid Indexes:** `SELECT * FROM pg_class c, pg_index i WHERE c.oid = i.indexrelid AND NOT i.indisvalid;`
- **XID Wraparound Risk:** Monitor `age(datfrozenxid)`. Alert if >70% of 2 billion.
- **Blocking Locks:** Identify sessions holding locks that others are waiting for.
- **Cache Hit Rate:** Target >99% for OLTP. Monitor `blks_hit` vs `blks_read` in `pg_stat_database`.
- **Bloat Analysis:** Estimate wasted space in tables/indexes using `pgstattuple` or standard bloat queries.

## 4. Business Intelligence (BI) & Analytical Patterns
Use these patterns for generating insights:
- **Metadata Discovery:** Scan `information_schema.tables` and `referential_constraints` to map the business graph.
- **Revenue Trends:** Use `DATE_TRUNC` and window functions for MoM/YoY growth.
- **Retention:** Use Cohort Analysis patterns (group by `first_purchase_month`).
- **Operational Efficiency:** Calculate `avg_fulfillment_time` using `EXTRACT(EPOCH FROM ...)` for latency metrics.

## 5. Multi-modal Data (Deep Lake)
- For multi-modal AI (images, audio), store **pointers/URIs** in Postgres and use Deep Lake for the heavy tensor storage.
- Keep the embedding in a `halfvec` column in Postgres for fast filtering and initial retrieval.

## 6. Anti-Slop (Humanizer)
- **Terse Output:** Do NOT use "Delve", "Testament", or "Pivotal".
- **Factual:** Do not simulate "excitement" about query plans.
- **Direct:** Provide the SQL command first, explanation second.
