import os
import json
import time
import argparse
import random

BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
LOGS_PATH = os.path.join(BASE_DIR, "data", "mission_logs.json")

def get_logs():
    if not os.path.exists(LOGS_PATH):
        return []
    try:
        with open(LOGS_PATH, 'r', encoding='utf-8') as f:
            return json.load(f)
    except Exception:
        return []

def write_log(payload_str):
    try:
        new_log = json.loads(payload_str)
        logs = get_logs()
        
        # Generate ID and timestamp if not provided
        log_entry = {
            "id": new_log.get("id", f"0x{hex(random.randint(0, 65535))[2:].upper().zfill(4)}"),
            "timestamp": new_log.get("timestamp", time.strftime('%Y-%m-%dT%H:%M:%S.000Z', time.gmtime())),
            **new_log
        }
        
        logs.append(log_entry)
        
        os.makedirs(os.path.dirname(LOGS_PATH), exist_ok=True)
        with open(LOGS_PATH, 'w', encoding='utf-8') as f:
            json.dump(logs, f, indent=2)
            
        return log_entry
    except Exception as e:
        return {"error": str(e)}

def format_terminal():
    logs = get_logs()
    
    # Simulate raw terminal trace from JSON data
    terminal_output = "Jack-Prime OS v2.0.4 [Terminal Emulation]\n==============================================\n"
    
    # Show first 15 logs (oldest first or newest first depending on how you slice it)
    # The Next.js API sliced 0-15 and displayed them
    for log in logs[:15]:
        timestamp = log.get("timestamp", "")
        agent = log.get("agent", "SYSTEM")
        skill = log.get("skill", "UNKNOWN")
        status = log.get("status", "OK")
        
        terminal_output += f"[{timestamp}] [{agent}] EXEC {skill} -> {status}\n"
        
        details = log.get("details", "")
        if details:
            try:
                # Try to parse details if it's a JSON string
                det = json.loads(details)
                if isinstance(det, dict):
                    for k, v in det.items():
                        terminal_output += f"  ├─ {k}: {v}\n"
                else:
                    terminal_output += f"  ├─ {details}\n"
            except:
                terminal_output += f"  ├─ {details}\n"
                
    terminal_output += "\n[Awaiting next instruction...]\n"
    return {"output": terminal_output}

if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--mode", choices=["read", "write", "terminal"], required=True, help="Mode of operation")
    parser.add_argument("--payload", type=str, help="JSON payload for write mode")
    
    args = parser.parse_args()
    
    if args.mode == "read":
        # The Next.js API reversed the logs (newest first)
        logs = get_logs()
        logs.reverse()
        print(json.dumps(logs))
        
    elif args.mode == "write":
        if not args.payload:
            print(json.dumps({"error": "Missing payload"}))
        else:
            res = write_log(args.payload)
            print(json.dumps(res))
            
    elif args.mode == "terminal":
        res = format_terminal()
        print(json.dumps(res))
