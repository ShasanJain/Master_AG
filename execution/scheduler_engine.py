import os
import json
import time
import schedule
import logging
import datetime
import subprocess
from pathlib import Path

# Configuration
BASE_DIR = Path(__file__).parent.parent
CONFIG_FILE = BASE_DIR / "config" / "schedule.json"
LOG_FILE = BASE_DIR / "logs" / "scheduler.log"

# Setup logging
os.makedirs(LOG_FILE.parent, exist_ok=True)
logging.basicConfig(
    filename=LOG_FILE,
    level=logging.INFO,
    format='%(asctime)s [%(levelname)s] %(message)s',
    datefmt='%Y-%m-%d %H:%M:%S'
)

def load_config():
    try:
        with open(CONFIG_FILE, 'r') as f:
            return json.load(f)
    except Exception as e:
        logging.error(f"Failed to load config: {e}")
        return {"tasks": []}

def save_config(config):
    try:
        with open(CONFIG_FILE, 'w') as f:
            json.dump(config, f, indent=2)
    except Exception as e:
        logging.error(f"Failed to save config: {e}")

def execute_task(task_id, command):
    logging.info(f"Triggering Task [{task_id}]: {command}")
    
    try:
        result = subprocess.run(command, shell=True, capture_output=True, text=True)
        if result.returncode == 0:
            logging.info(f"Task [{task_id}] SUCCESS. Output: {result.stdout.strip()}")
        else:
            logging.error(f"Task [{task_id}] FAILED. Error: {result.stderr.strip()}")
    except Exception as e:
        logging.error(f"Task [{task_id}] EXCEPTION: {str(e)}")
    
    # Update last_run
    config = load_config()
    for task in config.get("tasks", []):
        if task["id"] == task_id:
            task["last_run"] = datetime.datetime.now().isoformat()
            break
    save_config(config)
    logging.info(f"Task [{task_id}] marked as run.")

def setup_scheduler():
    schedule.clear()
    config = load_config()
    tasks = config.get("tasks", [])
    
    for task in tasks:
        if not task.get("enabled", True):
            continue
            
        time_str = task.get("schedule")
        task_id = task.get("id")
        command = task.get("command")
        
        if time_str and task_id:
            schedule.every().day.at(time_str).do(execute_task, task_id, command)
            logging.info(f"Scheduled Task [{task_id}] at {time_str}")

def main():
    logging.info("Industrial Scheduler Engine Started.")
    setup_scheduler()
    
    # Reload config every hour to pick up changes
    schedule.every().hour.do(setup_scheduler)
    
    try:
        while True:
            schedule.run_pending()
            time.sleep(1)
    except KeyboardInterrupt:
        logging.info("Industrial Scheduler Engine Stopped by User.")

if __name__ == "__main__":
    main()
