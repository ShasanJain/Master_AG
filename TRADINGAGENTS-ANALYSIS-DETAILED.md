# Repository Analysis: TradingAgents

## 1. What it does
TradingAgents is a multi-agent financial trading framework that simulates the decision-making process of a real-world quant trading firm. By deploying specialized agents—Analyst Team (Fundamentals, Sentiment, News, Technical), Researcher Team (Bullish/Bearish debating nodes), Trader Agent (deciding size/timing), and Risk/Portfolio Managers (order validation and simulated exchange execution)—it collaboratively researches market conditions and outputs structured trading strategies.

## 2. Compatibility & Resources
-   **OS/Hardware:** Cross-platform (Windows, macOS, Linux). Lightweight CPU execution; scales based on backend LLM configuration.
-   **Dependencies:** Python >= 3.12, `yfinance` for stock prices, `requests` for web fetching, `pandas` and `numpy` for dataframes, and standard LLM clients (OpenAI, Gemini, Anthropic, Bedrock, Ollama).
-   **Feasibility:** High. Easy local package setup via pip / poetry, or instant deployment using Docker (`docker-compose`).

## 3. Skills Integration
-   **Existing Skills:** Overlaps with `fincept` (our finance cockpit) which provides real-time market overviews, tickers, and stock feeds.
-   **Recommendation:** Create a new standalone skill `trading-agents` to run multi-agent trading simulations and backtests.
-   **Global Subfolder:** `skills/financial-intelligence/trading-agents`
-   **Proposed Use Case:** Trigger agent debates and risk assessments on any ticker from the cockpit to receive structured buy/sell action plans.

## 4. Architecture & Data Flow
*   **Directory Structure**:
    *   `cli/main.py`: Interactive CLI dashboard entrypoint.
    *   `tradingagents/agents/`: Directory containing agent prompts, system instructions, and tool definitions (fundamentals, sentiment, technical indicators).
    *   `tradingagents/dataflows/`: Handlers for API data feeds (Yahoo Finance, FRED macro data, Polymarket sentiment).
    *   `tradingagents/graph/`: Orchestration flow (e.g. Analyst -> Debate -> Trader -> Portfolio Manager).
*   **Execution Timeline**:
    1.  User inputs target stock ticker (e.g. `AAPL`) and analysis date.
    2.  Data vendors pull stock metrics (YFinance), economic trends (FRED), and sentiment (Polymarket).
    3.  Specialized Analyst Agents compile evaluation reports.
    4.  Bull/Bear Researcher Agents debate findings.
    5.  Trader Agent proposes transactions; Risk/Portfolio Manager approves/rejects orders.

## 5. Implementation Roadmap
-   **Phase 1 (Setup & Validation):** Run local installation, configure free endpoints (Ollama/Gemini), and verify the CLI interface loads.
-   **Phase 2 (Porting / Integration):** Package the execution graph as a deterministic script `execution/run_trading_simulation.py`.
-   **Phase 3 (Testing & Automation):** Connect outputs directly to the `Fincept` dashboard for real-time portfolio tracking.

## 6. Risks & Limitations
### API Requirements Analysis:
1.  **FRED API Key (`FRED_API_KEY`)**:
    *   *Purpose*: Macroeconomic indicators (real GDP, inflation, fed funds rate).
    *   *Cost*: **100% Free** (Get key at: https://fred.stlouisfed.org/docs/api/api_key.html).
    *   *Can we do without?*: Yes, by setting `"macro_data": null` in configurations to disable economic indicator tools.
2.  **LLM Provider API Key (OpenAI, Anthropic, etc.)**:
    *   *Purpose*: Power agent reasoning and debate steps.
    *   *Cost*: Varies (Paid).
    *   *Can we do without?*: Yes, by utilizing **Ollama** or **LM Studio** for local models (100% free), or using the **Google Gemini free tier** (using `GOOGLE_API_KEY`).
3.  **Yahoo Finance & Polymarket**:
    *   *Purpose*: Market data feeds and sentiment indicators.
    *   *Cost*: **100% Free** (No keys required; accessed via public APIs).
