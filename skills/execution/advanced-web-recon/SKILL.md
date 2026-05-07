# 🌐 Advanced Web Recon & Intelligence Suite
> **SOP Version**: 5.0.0-Industrial
> **Components**: Exa Semantic, Firecrawl Scraper, Context7 Docs, Tavily Search.

## 🔎 0. Real-Time Search (Tavily API)
- **Use Case**: General web search for latest news, documentation, and public data.
- **Mandate**: Prefer Tavily for broad queries; use Exa for niche/semantic research.
- **Configuration**: Ensure `TAVILY_API_KEY` is set.

## 🕵️ 1. Semantic Intelligence (Exa API)
When standard search (Google/Tavily) fails to find niche technical content:
- **Protocol**: Use embedding-based search to find "Similar to [URL]" or "Research Paper on [Topic]".
- **Configuration**: Ensure `EXA_API_KEY` is set in `.env`.
- **Logic**: Prefer `contents: true` to pull full markdown instead of just snippets.

## 🕸️ 2. Deep Web Scraping (Firecrawl)
For complex, JS-heavy, or multi-page targets:
- **Scrape SOP**: Trigger `scrape` for single pages; `crawl` for full domains.
- **Visual Recon**: Use `screenshot: true` if the UI layout is critical for the task.
- **PDF/Doc Parsing**: Use Firecrawl's native parsing for whitepapers and technical specs.

## 📚 3. Live Documentation Sync (Context7)
When asking about volatile frameworks (Next.js 15, React 19):
- **Mandate**: ALWAYS sync latest docs via Context7 before writing implementation code.
- **Target**: React, Next.js, Prisma, Tailwind, and Shadcn.

## 🛡️ 4. Tool Integration Protocols (MCP)
To use these tools, Jack MUST verify the following in `config.json`:
- `exa`: `npx -y @exa/mcp-server`
- `firecrawl`: `npx -y @mendable/firecrawl-mcp-server`

## ⌨️ Automation Tools
- `Jack /recon [query]`: Triggers a 3-tool simultaneous reconnaissance swarm.
- `Jack /scrape [url]`: High-density markdown extraction via Firecrawl.
- `Jack /similar [url]`: Finds competitor/alternative tech via Exa.
