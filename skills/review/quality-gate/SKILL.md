# 🛡️ Quality Gate: The Industrial Auditor
> **SOP Version**: 5.0.0-Industrial
> **Goal**: Zero-Error Deliverables via Systematic Verification.

## ⚖️ 1. The Mandatory Verification Gate
You MUST NOT complete a task until these three gates are passed:
1.  **LINT**: Run `npm run lint`, `eslint`, or `pylint` and fix ALL errors.
2.  **BUILD**: Run `npm run build` or equivalent. If it fails, the task is NOT complete.
3.  **TEST**: Run relevant unit/integration tests (`jest`, `pytest`).

## 🚀 2. Performance Engineering (The "Efficiency" Gate)
- **Bottleneck ID**: Use profiling tools (Chrome DevTools, `cProfile`) to identify slow paths.
- **Resource Audit**: Check for memory leaks (unclosed listeners, large closures) and excessive re-renders.
- **Payload Audit**: Ensure all assets are optimized (WebP, Tree-shaking, Gzip/Brotli).

## 📐 3. Web Design Guidelines (The "Aesthetic" Gate)
- **Consistency**: Verify spacing (8px grid), typography (system fonts/Google Fonts), and color palettes match the project theme.
- **Accessibility**: Use `design-quality-gate` for a full A11y audit.
- **Responsiveness**: Test on mobile, tablet, and desktop breakpoints.

## 🛡️ 4. Anti-Patterns
- **❌ "Ship it anyway"**: Never ignore a lint warning. If a rule is bad, fix the config; don't ignore the error.
- **❌ Manual Verification Only**: Prefer automated tests over manual browser clicking.
- **❌ Bloated Payloads**: Never import a massive library for a single function.

## ⌨️ Automation Tools
- `Jack /verify`: Runs the full LINT + BUILD + TEST suite.
- `Jack /audit-perf`: Profiles the current application for bottlenecks.
- `Jack /audit-design`: Checks for spacing and color consistency.
