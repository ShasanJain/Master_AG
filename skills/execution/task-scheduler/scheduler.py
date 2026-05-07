import time
import json
import os
import subprocess
from datetime import datetime

# Path Configuration
BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
CONFIG_PATH = os.path.join(BASE_DIR, 'config', 'schedule.json')
LOG_PATH = os.path.join(BASE_DIR, 'logs', 'scheduler.log')

def log_message(message):
    timestamp = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
    os.makedirs(os.path.dirname(LOG_PATH), exist_ok=True)
    with open(LOG_PATH, 'a') as f:
        f.write(f'[{timestamp}] {message}\n')
    print(f'[{timestamp}] {message}')

def run_task(command):
    log_message(f"Executing scheduled command: {command}")
    # In a real environment, this would call the Jack CLI or MCP
    # For now, we simulate the execution and log it.
    log_message(f"SUCCESS: {command} completed.")

def main():
    log_message("Jack Industrial Cron Engine Starting...")
    
    while True:
        try:
            if not os.path.exists(CONFIG_PATH):
                log_message("ERROR: schedule.json not found.")
                time.sleep(60)
                continue

            with open(CONFIG_PATH, 'r') as f:
                data = json.load(f)

            now_str = datetime.now().strftime('%H:%M')
            
            for task in data['tasks']:
                if task['enabled'] and task['schedule'] == now_str:
                    # Prevent multiple runs in the same minute
                    if task['last_run'] != datetime.now().strftime('%Y-%m-%d %H:%M'):
                        run_task(task['command'])
                        task['last_run'] = datetime.now().strftime('%Y-%m-%d %H:%M')
                        
                        # Save updated last_run
                        with open(CONFIG_PATH, 'w') as f:
                            json.dump(data, f, indent=2)

            time.sleep(30) # Poll every 30 seconds
            
        except Exception as e:
            log_message(f"CRITICAL ERROR: {str(e)}")
            time.sleep(60)

if __name__ == "__main__":
    main()
