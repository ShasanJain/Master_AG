---
name: neki
description: High-performance architecture rules for Neki (Sharded Postgres by PlanetScale). Includes sharding-readiness logic, VSchema design patterns, and cross-shard query optimization rules.
version: 5.0
---

# Neki: Sharded Postgres Architecture

Neki industrializes Postgres scaling by applying Vitess horizontal sharding principles to the Postgres ecosystem. This skill enforces strict design patterns for sharded and shard-ready environments.

## 1. Sharding Readiness Logic (Pre-Sharding)

### Shard Key (Primary Vindex) Selection
- **Immutability**: Choose a high-cardinality, immutable key (e.g., `tenant_id`, `org_id`, `user_id`). 
- **Placement**: Every sharded table MUST contain the shard key.
- **Data Types**: Standardize on `BIGINT` or `UUIDv7` for shard keys to ensure cross-table compatibility.

### Primary Keys & Indexes
- **Composite PKs**: Child tables MUST lead with the shard key in the Primary Key: `PRIMARY KEY (shard_key, local_id)`.
- **Leading Indexes**: All secondary indexes on sharded tables SHOULD lead with the shard key to enable targeted routing.
- **Global Uniqueness**: Use UUIDs or KSUIDs to avoid ID collisions across shards without global coordination.

### Join & Query Constraints
- **Co-location**: Joins MUST be performed on the shard key to stay shard-local.
- **Targeted Routing**: Every `SELECT`, `UPDATE`, `DELETE` MUST include the shard key in the `WHERE` clause.
- **Scatter Prevention**: Avoid queries without the shard key (e.g., `SELECT * FROM orders WHERE status = 'pending'`) as they trigger expensive scatter-gather operations.

## 2. VSchema Design Patterns

Neki utilizes a VSchema (Vitess Schema) to manage data distribution.

| Table Type | Description | Usage |
| :--- | :--- | :--- |
| **Sharded** | Partitioned across shards using a Vindex. | Large transactional tables (orders, logs). |
| **Reference** | Replicated to ALL shards (Full copy). | Small lookup tables (countries, currencies). |
| **Singleton** | Resides on a single primary shard. | Metadata, global configurations. |

## 3. Implementation Rules

### Transactions & FKs
- **Shard-Local Transactions**: Limit transactions to a single shard key value.
- **FK Restrictions**: Foreign Keys are only enforced WITHIN a shard. Cross-shard FKs must be enforced at the application layer.
- **Aggregation**: Global `COUNT` or `SUM` across shards should be handled via async rollups or specialized BI query patterns (see `postgres_skill.md`).

### Shard-Ready SQL Patterns
```sql
-- GOOD: Shard-local composite PK
CREATE TABLE order_items (
  tenant_id BIGINT NOT NULL,
  order_id BIGINT NOT NULL,
  item_id UUID DEFAULT gen_random_uuid(),
  PRIMARY KEY (tenant_id, order_id, item_id)
);

-- GOOD: Targeted join
SELECT o.id, oi.product_id 
FROM orders o
JOIN order_items oi ON oi.tenant_id = o.tenant_id AND oi.order_id = o.id
WHERE o.tenant_id = $1;
```

## 4. Sharding-Readiness Checklist
1. [ ] Shard key present and leading in all PKs/Indexes.
2. [ ] All queries contain the shard key filter.
3. [ ] Cross-shard FKs identified and moved to App logic.
4. [ ] Transactions scoped to single shard key value.
5. [ ] Rollup strategy implemented for global aggregations.

