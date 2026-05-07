# 🌐 Polyglot Industrial Master
> **SOP Version**: 5.0.0-Industrial
> **Goal**: Elite Execution across All Major Programming Paradigms.

## 🛠️ 1. Systems & Low-Level (C, C++, Rust, Go)
- **C/C++**: Focus on memory ownership (`malloc`/`free`, smart pointers). Always compile with `-Wall -Wextra -Werror`. Use Valgrind for leak detection.
- **Rust**: Follow the Borrow Checker strictly. Prefer `Safe Rust`; justify any `unsafe` block with a technical comment. Use `clippy` for idiomatic linting.
- **Go**: Prioritize `channels` and `select` for concurrency. Keep interfaces small. Check all error return values explicitly.

## 🌐 2. Web & Scripting (JS, TS, Python, Ruby, PHP)
- **TypeScript/JS**: Use strict typing. Prefer `async/await` over promise chains. Optimize bundle size for browser; use native Node.js APIs for backend.
- **Python**: Follow **The Vectorization Rule** (NumPy/Pandas) for data. Use Type Hints (`Mypy`). Manage dependencies via `uv` or `poetry`.
- **Ruby**: Use idiomatic metaprogramming (modules/mixins). Follow Rails conventions (MVC).

## 🧮 3. Functional & Data (Haskell, Elixir, Scala, Julia)
- **Haskell**: Use expressive types (GADTs, Type Families). Isolate IO to pure boundaries.
- **Elixir**: Design for fault tolerance (Supervisors). Use OTP patterns for concurrency.
- **Julia**: Optimize for multiple dispatch and type stability.

## 🏢 4. Enterprise & Database (Java, C#, SQL)
- **Java/C#**: Use modern versions (Java 21+, C# 12+). Follow SOLID principles. Use Dependency Injection (Spring/Dotnet).
- **SQL**: Optimize via `EXPLAIN ANALYZE`. Index all foreign keys. Use CTEs for readability.

## 🛡️ 5. Language Anti-Patterns
- **❌ Memory Blindness**: Never ignore memory lifecycle in C/C++/Rust.
- **❌ Type Slop**: Avoid `any` in TS or `Object` in Java/C#.
- **❌ Callback Hell**: Use modern async primitives in all supported languages.

## ⌨️ Automation Tools
- `Jack /lint`: Detects the language and runs the appropriate ecosystem linter.
- `Jack /refactor [language]`: Modernizes legacy code to the latest language standards.
- `Jack /polyglot-test`: Runs a cross-language sanity check (e.g. verifying a Python backend against a TS frontend).
