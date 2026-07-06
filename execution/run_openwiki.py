import os
import sys
import argparse
import subprocess
from pathlib import Path

def get_openwiki_env_path():
    home = Path.home()
    return home / ".openwiki" / ".env"

def configure_env(provider, api_key, model_id=None, base_url=None, langsmith_key=None):
    env_path = get_openwiki_env_path()
    env_path.parent.mkdir(parents=True, exist_ok=True)
    
    # Read existing env lines
    env_lines = []
    if env_path.exists():
        with open(env_path, "r", encoding="utf-8") as f:
            env_lines = f.readlines()
            
    # Parse existing keys
    env_dict = {}
    for line in env_lines:
        line = line.strip()
        if line and not line.startswith("#") and "=" in line:
            k, v = line.split("=", 1)
            env_dict[k.strip()] = v.strip()
            
    # Update keys
    env_dict["OPENWIKI_PROVIDER"] = provider
    
    # Map provider key
    if provider == "openai":
        env_dict["OPENAI_API_KEY"] = api_key
    elif provider == "anthropic":
        env_dict["ANTHROPIC_API_KEY"] = api_key
    elif provider == "openrouter":
        env_dict["OPENROUTER_API_KEY"] = api_key
    elif provider == "fireworks":
        env_dict["FIREWORKS_API_KEY"] = api_key
    elif provider == "openai-compatible":
        env_dict["OPENAI_COMPATIBLE_API_KEY"] = api_key
        
    if model_id:
        env_dict["OPENWIKI_MODEL_ID"] = model_id
        
    if base_url:
        if provider == "anthropic":
            env_dict["ANTHROPIC_BASE_URL"] = base_url
        elif provider == "openai-compatible":
            env_dict["OPENAI_COMPATIBLE_BASE_URL"] = base_url
            
    if langsmith_key:
        env_dict["LANGCHAIN_TRACING_V2"] = "true"
        env_dict["LANGCHAIN_API_KEY"] = langsmith_key
        env_dict["LANGCHAIN_PROJECT"] = "openwiki"
        
    # Write back to file
    with open(env_path, "w", encoding="utf-8") as f:
        for k, v in env_dict.items():
            f.write(f"{k}={v}\n")
            
    print(f"[OpenWiki Runner] Configured {env_path}")

def run_cli(command_args):
    openwiki_dir = Path(__file__).parent.parent / "openwiki"
    cmd = ["cmd.exe", "/c", "npx", "tsx", "src/cli.tsx"] + command_args
    print(f"[OpenWiki Runner] Executing: {' '.join(cmd)} in {openwiki_dir}")
    
    # Run process and stream logs
    process = subprocess.Popen(
        cmd,
        cwd=str(openwiki_dir),
        stdout=subprocess.PIPE,
        stderr=subprocess.STDOUT,
        text=True,
        bufsize=1,
        universal_newlines=True
    )
    
    # Stream output to console
    while True:
        output = process.stdout.readline()
        if output == '' and process.poll() is not None:
            break
        if output:
            print(output.strip(), flush=True)
            
    rc = process.poll()
    if rc != 0:
        print(f"[OpenWiki Runner] Failed with exit code {rc}")
        sys.exit(rc)
    else:
        print("[OpenWiki Runner] Execution completed successfully.")

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Configure and Run OpenWiki")
    parser.add_argument("--provider", type=str, required=True, help="LLM Provider to use")
    parser.add_argument("--api-key", type=str, required=True, help="API Key for the provider")
    parser.add_argument("--model-id", type=str, help="Specific model ID to use")
    parser.add_argument("--base-url", type=str, help="Custom base URL for the provider")
    parser.add_argument("--langsmith-key", type=str, help="LangSmith API key for tracing")
    parser.add_argument("--update", action="store_true", help="Run update rather than print summary")
    parser.add_argument("--prompt", type=str, help="Custom run prompt")
    
    args = parser.parse_args()
    
    configure_env(args.provider, args.api_key, args.model_id, args.base_url, args.langsmith_key)
    
    # Determine the CLI arguments
    cli_args = []
    if args.update:
        cli_args.append("--update")
        if args.prompt:
            cli_args.append(args.prompt)
    else:
        # Default one-shot print
        cli_args.append("-p")
        cli_args.append(args.prompt or "Generate documentation for this repository")
        
    run_cli(cli_args)
