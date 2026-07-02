import os
import sys
import json
import argparse
from datetime import datetime

# Add the local directory to python path just in case
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

try:
    from tradingagents.default_config import DEFAULT_CONFIG
    from tradingagents.graph.trading_graph import TradingAgentsGraph
except ImportError as e:
    print(f"Error importing tradingagents: {e}")
    sys.exit(1)

def run_simulation(ticker: str, provider: str, rounds: int, date_str: str):
    print(f"[Brain Quant] Initializing simulation graph...")
    print(f"[Brain Quant] Target Asset: {ticker} | Provider: {provider} | Max Rounds: {rounds}")
    
    # Configure the DEFAULT_CONFIG mapping
    config = DEFAULT_CONFIG.copy()
    config["llm_provider"] = provider
    config["max_debate_rounds"] = rounds
    
    # Fallback to avoid missing API key errors on FRED if not set
    if not os.getenv("FRED_API_KEY"):
        config["macro_data"] = None
        print("[Brain Quant] WARNING: FRED_API_KEY is not set. Disabling FRED macro data tools.")

    try:
        # Initialize graph
        ta = TradingAgentsGraph(debug=True, config=config)
        
        # Propagate the graph
        print(f"[Brain Quant] Propagating swarm graph for {ticker} on date {date_str}...")
        state, decision = ta.propagate(ticker, date_str)
        
        # Output decision to a temporary file for the dashboard API to read
        result = {
            "success": True,
            "action": decision.get("action", "HOLD"),
            "confidence": decision.get("confidence", "50%"),
            "details": decision.get("reasoning", "Consensus reached holding the current position.")
        }
        
        output_file = "./scratch/trading_agents_output.json"
        with open(output_file, "w", encoding="utf-8") as f:
            json.dump(result, f, indent=2)
            
        print(f"[Brain Quant] Swarm Decision: {result['action']} with {result['confidence']} confidence.")
        print(f"[Brain Quant] Output saved to {output_file}")
        
    except Exception as e:
        print(f"[Brain Quant] Error executing simulation: {e}")
        # Write error output
        error_result = {
            "success": False,
            "error": str(e)
        }
        with open("./scratch/trading_agents_output.json", "w", encoding="utf-8") as f:
            json.dump(error_result, f, indent=2)
        sys.exit(1)

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Run Trading Agents Multi-Agent Swarm Backtest")
    parser.add_argument("--ticker", type=str, default="AAPL", help="Stock ticker to simulate.")
    parser.add_argument("--provider", type=str, default="ollama", help="LLM Provider to use.")
    parser.add_argument("--rounds", type=int, default=2, help="Number of debate rounds.")
    parser.add_argument("--date", type=str, default=datetime.today().strftime('%Y-%m-%d'), help="Historical execution date.")
    
    args = parser.parse_args()
    run_simulation(args.ticker, args.provider, args.rounds, args.date)
