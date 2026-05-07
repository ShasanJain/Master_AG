---
version: 4.1.0-fractal
name: react-modernization
description: Upgrade React applications to latest versions, migrate from class components to hooks, and adopt concurrent features. Use when modernizing React codebases, migrating to React Hooks, or upgrading to latest React versions.
---

# ⚛️ React Modernization & Upgrade Protocol
> **SOP Version**: 5.0.0-Industrial
> **Target**: Zero-latency, Type-safe, React 19+ Architecture.

## 🛠️ 1. React 19 Surgical Upgrade
When modernizing a codebase, you MUST enforce the latest **Core Standards**:
- **Ref as Props**: Remove `forwardRef`. Pass `ref` directly as a prop.
- **The `use` Hook**: Replace complex `useEffect` data fetching with the `use` API for Promises and Context.
- **Action Pattern**: Transition from manual form handling to **React Server Actions** and `useFormStatus`.
- **Cleanup**: Purge all `legacy-peer-deps` and resolve strict type mismatches in `@types/react`.

## 🧬 2. Class-to-Hook Extraction (The SOP)
Follow these steps for every legacy component migration:
1.  **State Mapping**: Map `this.state` to individual `useState` or `useReducer` hooks.
2.  **Lifecycle Mapping**: 
    - `componentDidMount` ➡️ `useEffect(..., [])`
    - `componentWillUnmount` ➡️ `useEffect` return function.
    - `componentDidUpdate` ➡️ `useEffect` with dependency array.
3.  **Refactor Logic**: Move class methods to independent utility functions or custom hooks to decouple UI from logic.

## ⚡ 3. Concurrency & Performance
- **Hydration Optimization**: Use `Selective Hydration` with `Suspense` boundaries for heavy components.
- **Transitions**: Wrap non-urgent state updates in `startTransition` to keep the UI responsive.
- **Compiler Readiness**: Ensure code is "Memo-free" by following rules that align with the **React Compiler (React Forget)**.

## 🛡️ 4. Anti-Patterns (The "Stop" List)
- **❌ Prop Drilling**: Use `Context` or `Zustand` for state shared across >3 levels.
- **❌ Effect Abuse**: Never use `useEffect` to transform data; do it during render.
- **❌ Manual Memoization**: Avoid `useMemo` unless profiling proves a bottleneck (let the compiler handle it).

## ⌨️ Automation Tools
- `Jack /modernize [file]`: Performs a surgical class-to-hook conversion.
- `Jack /react-audit`: Scans for React 19 breaking changes and legacy patterns.
- `Jack /hookify [logic]`: Extracts complex logic into a reusable Custom Hook.
