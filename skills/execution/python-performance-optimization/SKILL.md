---
version: 4.1.0-fractal
name: python-performance-optimization
description: Profile and optimize Python code using cProfile, memory profilers, and performance best practices. Use when debugging slow Python code, optimizing bottlenecks, or improving application performance.
---

# 🐍 Python Performance & Acceleration Protocol
> **SOP Version**: 5.0.0-Industrial
> **Goal**: 10x-100x speedup via algorithmic surgical strikes.

## 📈 1. The Vectorization Rule
If data is numeric or tabular, you MUST avoid native Python loops.
- **Requirement**: Use **NumPy/Pandas** vectorized operations.
- **Example**: Replace `[x*2 for x in list]` with `arr * 2` (NumPy).
- **Impact**: Leverages C-level SIMD instructions, bypassing the GIL.

## ⚙️ 2. Concurrency Triage (I/O vs CPU)
Choose the correct execution model based on the bottleneck:
- **I/O Bound (Network/Disk)**: Use `asyncio` or `threading`. 
- **CPU Bound (Computation)**: Use `multiprocessing` to bypass the GIL.
- **Hybrid**: Use `ProcessPoolExecutor` for heavy math and `ThreadPoolExecutor` for API calls.

## 🧠 3. Memory Armor (Anti-Bloat)
- **Generators**: Use `yield` and generator expressions instead of list comprehensions for large datasets.
- **Slots**: Use `__slots__` in high-instantiation classes to reduce memory overhead by 40-70%.
- **Weakref**: Use `weakref` for caches to prevent garbage collection leaks.

## 🛠️ 4. Surgical Profiling SOP
Never optimize blindly. Follow the **Audit Sequence**:
1.  **Macro**: `cProfile` to find the bottleneck function.
2.  **Micro**: `@profile` (line_profiler) to find the bottleneck line.
3.  **Memory**: `memory_profiler` to trace heap growth.
4.  **Visualize**: Use `Snakeviz` for flame graphs.

## ⌨️ Automation Tools
- `Jack /profile [script]`: Runs the full profiling SOP and identifies bottlenecks.
- `Jack /vectorize [block]`: Rewrites a Python loop into optimized NumPy logic.
- `Jack /asyncify [function]`: Converts synchronous I/O to non-blocking `asyncio`.
