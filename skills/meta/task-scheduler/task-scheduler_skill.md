---
version: 1.0.0
name: task-scheduler
description: "Industrial Cron: Automates Jack commands via a Python background engine."
---

# 🕒 Task Scheduler (Industrial Cron)

This skill enables Jack to manage persistent background automation.

## 🛡️ Industrial Protocol
1.  **Orchestration**: Jack uses `directives/task_scheduler.md` to control the engine.
2.  **Execution**: `execution/scheduler_engine.py` handles the timeline.
3.  **Persistence**: `config/schedule.json`.

## ⌨️ Integrated Commands
| Command | Action |
| :--- | :--- |
| `/schedule-add [id] [cmd] [time]` | Add task to JSON. |
| `/schedule-list` | Display active tasks. |
| `/schedule-start` | Trigger background engine. |

## 🧪 Verification
- Run `python execution/scheduler_engine.py` and check `logs/scheduler.log`.
