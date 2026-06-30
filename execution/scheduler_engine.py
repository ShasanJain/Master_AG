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
        import shlex
        if isinstance(command, str):
            cmd_args = shlex.split(command, posix=False)
        else:
            cmd_args = command
        result = subprocess.run(cmd_args, capture_output=True, text=True)
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

def check_one_off_tasks():
    config = load_config()
    tasks = config.get("tasks", [])
    now = datetime.datetime.now()
    changed = False
    
    for task in tasks:
        if task.get("enabled", True) and task.get("type") == "once":
            time_str = task.get("schedule")
            task_id = task.get("id")
            command = task.get("command")
            if not time_str or not task_id or not command:
                continue
            try:
                scheduled_time = None
                # Support common datetime formats
                for fmt in ("%Y-%m-%d %H:%M:%S", "%Y-%m-%d %H:%M", "%Y-%m-%dT%H:%M:%S", "%Y-%m-%dT%H:%M"):
                    try:
                        scheduled_time = datetime.datetime.strptime(time_str, fmt)
                        break
                    except ValueError:
                        continue
                
                if scheduled_time and now >= scheduled_time:
                    logging.info(f"Triggering one-off task [{task_id}] scheduled at {time_str}")
                    task["enabled"] = False
                    task["last_run"] = now.isoformat()
                    changed = True
                    save_config(config)
                    execute_task(task_id, command)
                    # reload config to get the latest updated tasks list
                    config = load_config()
            except Exception as e:
                logging.error(f"Error executing one-off task [{task_id}]: {e}")

def setup_scheduler():
    schedule.clear()
    config = load_config()
    tasks = config.get("tasks", [])
    
    # Schedule the one-off check to run every 10 seconds
    schedule.every(10).seconds.do(check_one_off_tasks)
    
    for task in tasks:
        if not task.get("enabled", True) or task.get("type") == "once":
            continue
            
        time_str = task.get("schedule")
        task_id = task.get("id")
        command = task.get("command")
        
        if time_str and task_id:
            if time_str.endswith("m") and time_str[:-1].isdigit():
                minutes = int(time_str[:-1])
                schedule.every(minutes).minutes.do(execute_task, task_id, command)
                logging.info(f"Scheduled Task [{task_id}] every {minutes} minutes")
            elif time_str.endswith("h") and time_str[:-1].isdigit():
                hours = int(time_str[:-1])
                schedule.every(hours).hours.do(execute_task, task_id, command)
                logging.info(f"Scheduled Task [{task_id}] every {hours} hours")
            else:
                try:
                    schedule.every().day.at(time_str).do(execute_task, task_id, command)
                    logging.info(f"Scheduled Task [{task_id}] at {time_str}")
                except Exception as e:
                    logging.error(f"Failed to schedule daily task [{task_id}] at [{time_str}]: {e}")

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
