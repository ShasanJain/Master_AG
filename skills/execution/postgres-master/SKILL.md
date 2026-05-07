# 🐘 PostgreSQL Industrial Master
> **SOP Version**: 5.0.0-Industrial
> **Goal**: Scalable, Secure, and High-Performance Relational Data.

## 🛠️ 1. MCP Tool Orchestration
Use the `postgres-mcp` server tools for direct DB interaction:
- **`query`**: Execute any SQL. **Mandate**: Always use parameterized queries; never concatenate strings.
- **`get_schema`**: Map the database structure before writing complex joins.
- **`analyze_query_performance`**: Run on any query expected to handle >10k rows.

## 📐 2. Schema Integrity (The "Architect" Pass)
- **Primary Keys**: Use `UUID v7` for distributed systems or `BIGINT IDENTITY` for local scaling.
- **Naming**: Strict `snake_case`. Plural tables (`users`), singular columns (`email`).
- **Normalization**: 3NF by default. Use `JSONB` ONLY for dynamic/sparse metadata.

## 🚀 3. Performance Engineering
- **Indexing**:
  - `B-Tree`: Standard.
  - `GIN`: JSONB and Full-Text Search.
  - `GiST`: PostGIS / Geo-data.
- **The Explain Rule**: If a query is slow, you MUST run `EXPLAIN ANALYZE` and identify the scan type (Sequential Scan = Failure).
- **Pooling**: Use port `6543` for serverless/Supabase to prevent connection exhaustion.

## 🛡️ 4. Security (RLS & Armor)
- **RLS Mandatory**: `ALTER TABLE x ENABLE ROW LEVEL SECURITY;`
- **Policy Pattern**: `auth.uid() = user_id` for tenant isolation.
- **Data Types**: Use `TEXT` over `VARCHAR(N)` unless a hard limit is required by business logic.

## ⌨️ Automation Tools
- `Jack /db-audit`: Scans for missing indexes and non-normalized tables.
- `Jack /db-migrate`: Generates a Prisma/SQL migration based on a text description.
- `Jack /db-optimize`: Suggests indexes based on query history.
