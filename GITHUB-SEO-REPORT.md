# GitHub SEO Report

- Repository: `Stanestane/game-design-skills-bundle`
- Generated (UTC): `2026-07-01T11:57:23+00:00`
- Provider mode: `auto`
- Overall score: `61.0`
- Verified findings: `17` (raw: `22`, dropped: `0`)

## Score Components

| Component | Score |
|-----------|-------|
| repo_audit | 52 |
| readme_lint | 61 |
| community_health | 70 |

## Script Status

| Script | Status |
|--------|--------|
| repo_audit | ok |
| readme_lint | ok |
| community_health | ok |
| traffic_archiver | ok |
| search_benchmark | ok |
| competitor_research | ok |

## Query Discovery

- Mode: `auto-derived`
- Source: `repo slug + metadata + title analysis`
- Queries: `game design skills bundle; game design skills bundle agent; agent skills; clawhub; design tools; ftue`

## Limitations

- repo_audit: Local filesystem checks skipped because target repo does not match current working repository.
- search_benchmark: no explicit query supplied; using auto-derived repo-specific benchmark queries.
- community_health: Local filesystem checks skipped because target repo does not match current working repository.
- traffic_archiver: views endpoint failed: All provider attempts failed. api(token): Bad credentials | api(public): Requires authentication (status: None)
- traffic_archiver: clones endpoint failed: All provider attempts failed. api(token): Bad credentials | api(public): Requires authentication (status: None)
- traffic_archiver: referrers endpoint failed: All provider attempts failed. api(token): Bad credentials | api(public): Requires authentication (status: None)
- traffic_archiver: paths endpoint failed: All provider attempts failed. api(token): Bad credentials | api(public): Requires authentication (status: None)

## Prioritized Findings

| Severity | Source | Finding | Evidence | Fix |
|----------|--------|---------|----------|-----|
| Critical | readme_lint | Installation/quickstart section is missing. | No install or getting-started heading detected. | Add a dedicated install section with copy-paste commands and prerequisites. |
| Warning | repo_audit | Community health score is below recommended baseline. | GitHub community health is 28%. | Complete missing governance files and contribution docs to raise score. |
| Warning | repo_audit, community_health | Missing community profile component: code_of_conduct. | GitHub community profile `files.code_of_conduct` is missing. | Add the missing `code_of_conduct` file/template in repository root or `.github/`. |
| Warning | repo_audit, community_health | Missing community profile component: contributing. | GitHub community profile `files.contributing` is missing. | Add the missing `contributing` file/template in repository root or `.github/`. |
| Warning | repo_audit, community_health | Missing community profile component: issue_template. | GitHub community profile `files.issue_template` is missing. | Add the missing `issue_template` file/template in repository root or `.github/`. |
| Warning | repo_audit, community_health | Missing community profile component: pull_request_template. | GitHub community profile `files.pull_request_template` is missing. | Add the missing `pull_request_template` file/template in repository root or `.github/`. |
| Warning | repo_audit, community_health | Missing community profile component: license. | GitHub community profile `files.license` is missing. | Add the missing `license` file/template in repository root or `.github/`. |
| Warning | readme_lint | README lacks explicit proof/results section. | No heading found for examples, reports, screenshots, or outputs. | Add evidence sections with sample outputs or screenshots. |
| Warning | readme_lint | License reference is missing or unclear in README. | No explicit license mention detected. | Add a short license section linking to LICENSE file. |
| Warning | readme_lint | README has weak contribution/support call-to-action coverage. | Detected 0 CTA marker(s) from contribution/support keyword set. | Add clear paths for contributing, opening issues, and support requests. |
| Warning | community_health | GitHub community profile health is below baseline target. | health_percentage=28 | Add missing governance artifacts until health percentage reaches >=85. |
| Warning | competitor_research | High-frequency competitor topics are missing from target repo. | Missing topic examples: claude-code, directory, skill, animations, awesome | Add relevant missing topics (without exceeding 20 total) based on actual repository scope. |
| Info | repo_audit | Repository title can be better aligned to search intent keywords. | Suggested slug: `game-design-skills-bundle-agent` / Suggested title: `Game Design Skills Bundle Agent` | Consider renaming repository slug and updating description/topics to reflect the suggested intent keywords. |
| Info | readme_lint | README is short for a discoverability-oriented project page. | Word count is 225. | Expand with concise sections for install, proof, and contribution paths. |
| Info | competitor_research | Competitors frequently include `install` sections. | 5 competitor repos include this pattern. | Ensure README has a clear `install` section near the top-level navigation flow. |
| Info | competitor_research | Competitors frequently include `usage/examples` sections. | 5 competitor repos include this pattern. | Ensure README has a clear `usage/examples` section near the top-level navigation flow. |
| Info | competitor_research | Competitors frequently include `contributing` sections. | 4 competitor repos include this pattern. | Ensure README has a clear `contributing` section near the top-level navigation flow. |

## Query Benchmark

| Query | Rank | Sampled | Total Results |
|-------|------|---------|---------------|
| game design skills bundle | 1 | 4 | 4 |
| game design skills bundle agent | Not found | 0 | 0 |
| agent skills | Not found | 100 | 79674 |
| clawhub | 78 | 100 | 1128 |
| design tools | Not found | 100 | 86362 |
| ftue | 8 | 50 | 52 |

## Competitor Research

- Competitors analyzed: `6` across `6` queries

| Competitor | Seen Queries | Best Rank | Stars | Topics |
|------------|--------------|-----------|-------|--------|
| anthropics/skills | 1 | 1 | 157200 | 1 |
| openclaw/clawhub | 1 | 1 | 9079 | 2 |
| goabstract/Awesome-Design-Tools | 1 | 1 | 40436 | 8 |
| Zhuinden/jetpack-navigation-ftue-sample | 1 | 1 | 234 | 0 |
| huseyininnc/flame-game-dev | 1 | 2 | 0 | 8 |
| addyosmani/agent-skills | 1 | 2 | 68309 | 6 |

### Topic Gaps

- `claude-code` (covered by 2 competitors)
- `directory` (covered by 1 competitors)
- `skill` (covered by 1 competitors)
- `animations` (covered by 1 competitors)
- `awesome` (covered by 1 competitors)
- `awesome-list` (covered by 1 competitors)
- `design` (covered by 1 competitors)
- `design-systems` (covered by 1 competitors)
- `font-awesome` (covered by 1 competitors)
- `ui-design` (covered by 1 competitors)

### Competitor Opportunities

- [Warning] High-frequency competitor topics are missing from target repo.
  Evidence: Missing topic examples: claude-code, directory, skill, animations, awesome
  Fix: Add relevant missing topics (without exceeding 20 total) based on actual repository scope.
- [Info] Competitors frequently include `install` sections.
  Evidence: 5 competitor repos include this pattern.
  Fix: Ensure README has a clear `install` section near the top-level navigation flow.
- [Info] Competitors frequently include `usage/examples` sections.
  Evidence: 5 competitor repos include this pattern.
  Fix: Ensure README has a clear `usage/examples` section near the top-level navigation flow.
- [Info] Competitors frequently include `contributing` sections.
  Evidence: 4 competitor repos include this pattern.
  Fix: Ensure README has a clear `contributing` section near the top-level navigation flow.

## Traffic Snapshot

- Views: `None` (unique: `None`)
- Clones: `None` (unique: `None`)
- Archive history: `.github-seo-data\traffic_history.jsonl`
- Latest snapshot: `.github-seo-data\latest_traffic_snapshot.json`

## Title Optimization

- Current name: `game-design-skills-bundle`
- Recommended slug: `game-design-skills-bundle-agent`
- Recommended title: `Game Design Skills Bundle Agent`
- Intent keywords: `game, design, skills, bundle, agent, clawhub, tools, ftue, dev, development, indie, games`

## Backlink Distribution Plan

- Target repo URL: `https://github.com/Stanestane/game-design-skills-bundle`

### Suggested Post Titles

- How I Built Game Design Skills Bundle Agent for SEO Automation
- GitHub SEO Playbook: Improving Discoverability for Game Design Skills Bundle Agent
- Game Design Skills Bundle Agent: From Idea to Open-Source SEO Workflow
- Open-Source Guide: game, design, skills with Game Design Skills Bundle Agent

### Channels

| Channel | Content Type | Cadence | CTA |
|---------|--------------|---------|-----|
| Medium | Technical case study | 1 post per major release | Link to repo + install quickstart + release notes |
| Dev.to | Tutorial / launch post | 1 launch post + update posts quarterly | Link to GitHub repo and usage examples |
| Hashnode | Deep-dive engineering write-up | Bi-monthly | Link to architecture docs and scripts |
| Personal/Company Blog | Canonical long-form article | Monthly | Link to repo, docs, and comparison pages |
| LinkedIn Article | Problem/solution summary for practitioners | Per release | Link to repo and demo outputs |
| Reddit (relevant subreddits) | Show-and-tell with value-first context | Selective (major feature drops) | Share repo only after explaining workflow and results |

### Anchor Guidance

- Exact-match anchor cap: `10%`
- Brand anchors (repo/owner name)
- Partial-match anchors (e.g., 'agentic SEO skill')
- Generic anchors ('GitHub repo', 'source code')
- Naked URL anchors
