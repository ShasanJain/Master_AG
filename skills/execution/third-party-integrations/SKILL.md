# 🔌 Third-Party Integrations Master
> **SOP Version**: 5.0.0-Industrial
> **Goal**: Rapid, Secure Connection to External Vendor Ecosystems.

## 🟠 1. HubSpot (CRM & Sales)
- **Auth**: Always prefer **Private App Tokens** for server-to-server or OAuth for multi-tenant.
- **Batching**: Use the `/batch` endpoints for any operation > 10 objects to avoid rate limits.
- **Object Mapping**: Map custom properties to `snake_case` in local state; convert to HubSpot's required schema during sync.

## 🛍️ 2. Shopify (Commerce & Retail)
- **APIs**: Use **Storefront API** (GraphQL) for customer-facing and **Admin API** for backend management.
- **Webhooks**: Always verify the `X-Shopify-Hmac-Sha256` header.
- **Rate Limits**: Respect the "Leaky Bucket" algorithm (standard is 2 requests per second).

## 📒 3. Notion (Knowledge & Workspace)
- **MCP Tool**: Use the `notion-mcp` for searching pages and updating databases.
- **Structure**: Treat Notion as a **Block Tree**. When writing, prioritize readability and nesting.
- **Querying**: Use filters and sorts at the database level to minimize payload size.

## 💳 4. Plaid & Stripe (Fintech & Payments)
- **Safety**: NEVER store raw credit card data or PII. Use tokens/IDs.
- **Webhooks**: Mandatory for handling asynchronous events (e.g., `payment_intent.succeeded`).
- **Idempotency**: Always send an `Idempotency-Key` for write operations to prevent double-charging.

## 🛡️ 5. Integration Anti-Patterns
- **❌ Individual Syncs**: Never loop over individual API calls; use Batch/Bulk endpoints.
- **❌ Polling**: Never poll an API for changes; set up Webhooks.
- **❌ Hardcoded Keys**: Use `.env` and secret managers.

## ⌨️ Automation Tools
- `Jack /test-webhook [url]`: Simulates a vendor webhook to test local handling.
- `Jack /sync-schema [vendor]`: Maps a local DB schema to a vendor's API schema.
