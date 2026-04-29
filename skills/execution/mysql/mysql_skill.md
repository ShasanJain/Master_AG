---
name: mysql
description: MySQL Master Rules covering schema design, PlanetScale/Vitess sharding, query optimization, DBA health checks, and BI patterns.
---

# MySQL Master Rules

Strictly follow these rules across Schema Design, Optimization, PlanetScale/Vitess integration, and DBA Health Checks.

## 1. Schema & Performance Fundamentals
- **Primary Keys:** ALWAYS use `BIGINT UNSIGNED AUTO_INCREMENT` (monotonic) for OLTP. Avoid random UUIDs as clustered keys.
- **Character Sets:** ALWAYS use `utf8mb4` with `utf8mb4_0900_ai_ci`.
- **Timestamps:** Prefer `DATETIME` over `TIMESTAMP` for wider range and timezone independence in app logic.
- **Nullability:** Prefer `NOT NULL` with sensible defaults to avoid 3-valued logic overhead.
- **No `SELECT *`:** Explicitly name columns to minimize I/O and facilitate covering indexes.
- **Explain Analyze:** ALWAYS run `EXPLAIN ANALYZE` (MySQL 8.0+) to see actual execution costs and row counts.
- **Pagination:** ALWAYS use cursor-based pagination (`WHERE id > last_id`) for large datasets. NEVER use `OFFSET`.

## 2. PlanetScale & Vitess Rules
When hosting on PlanetScale or using Vitess:
- **Sharding:** Filter by the **Vindex** column (sharding key) to ensure single-shard routing.
- **Sequences:** Use **Vitess Sequences** for global IDs in sharded keyspaces to prevent collisions.
- **Deploy Requests:** Use PlanetScale branches and deploy requests for non-blocking schema changes.
- **Foreign Keys:** Avoid physical foreign keys in sharded keyspaces; enforce referential integrity at the application level.
- **Online DDL:** Use `ddl_strategy='vitess'` for zero-downtime migrations.

## 3. DBA Health & Activity Monitoring
Run these queries to audit database health:
- **Long Running Queries:**
  ```sql
  SELECT * FROM information_schema.processlist WHERE command != 'Sleep' AND time > 10;
  ```
- **Lock Wait Analysis:**
  ```sql
  SELECT * FROM sys.innodb_lock_waits;
  ```
- **Buffer Pool Hit Rate:**
  ```sql
  SELECT (1 - (innodb_buffer_pool_reads / innodb_buffer_pool_read_requests)) * 100 AS hit_rate;
  ```
- **Index Usage Audit:**
  ```sql
  SELECT object_schema, object_name, index_name FROM performance_schema.table_io_waits_summary_by_index_usage WHERE count_read = 0;
  ```

## 4. Business Intelligence (BI) & Analytical Patterns
- **JSON Pathing:** Use `JSON_EXTRACT()` or `->>` to query document data efficiently.
- **Window Functions:** Use `ROW_NUMBER()`, `RANK()`, and `SUM(...) OVER(...)` for MoM growth and cohort analysis.
- **Common Table Expressions:** Use recursive CTEs for hierarchical data (org charts, nested categories).
- **Date Truncation:** Use `DATE_FORMAT(dt, '%Y-%m-01')` for monthly aggregations.

## 5. Optimization Guardrails
- **Composite Indexes:** Follow the "Equality -> Sort -> Range" order (leftmost prefix rule).
- **Batching:** Use multi-row `INSERT` (500–5000 rows) for high-throughput writes.
- **Deadlocks:** Ensure consistent row access order. Retry transaction error 1213 with exponential backoff.
- **Online DDL:** ALWAYS prefer `ALGORITHM=INPLACE` for schema modifications to keep tables writable.

## 6. Anti-Slop (Humanizer)
- **Terse Output:** Do NOT use "Delve", "Tapestry", "Pivotal", or "Robust".
- **Factual:** Avoid simulated excitement. Report query costs and lock metrics directly.
- **Direct:** Provide the SQL command first, explanation second.

---

## References
- [Primary Keys](file:///c:/Users/swaya/OneDrive/Desktop/Master-AG/skills/execution/mysql/references/primary-keys.md) | [Data Types](file:///c:/Users/swaya/OneDrive/Desktop/Master-AG/skills/execution/mysql/references/data-types.md)
- [Composite Indexes](file:///c:/Users/swaya/OneDrive/Desktop/Master-AG/skills/execution/mysql/references/composite-indexes.md) | [Explain Analyze](file:///c:/Users/swaya/OneDrive/Desktop/Master-AG/skills/execution/mysql/references/explain-analysis.md)
- [Online DDL](file:///c:/Users/swaya/OneDrive/Desktop/Master-AG/skills/execution/mysql/references/online-ddl.md) | [Deadlocks](file:///c:/Users/swaya/OneDrive/Desktop/Master-AG/skills/execution/mysql/references/deadlocks.md)
- [JSON Patterns](file:///c:/Users/swaya/OneDrive/Desktop/Master-AG/skills/execution/mysql/references/json-column-patterns.md)

