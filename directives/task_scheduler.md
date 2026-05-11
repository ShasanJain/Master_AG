# 🕒 Task Scheduler (Industrial Cron) Directive

## 🛡️ 1. Engine Control
- **Start**: Run `python execution/scheduler_engine.py` in a dedicated terminal.
- **Stop**: Use `Ctrl+C` or terminate the process.
- **Logs**: Monitor `logs/scheduler.log` for execution history.

## 🏗️ 2. Configuration (`config/schedule.json`)
The scheduler follows a strict JSON schema:
```json
{
  "tasks": [
    {
      "id": "unique-id",
      "command": "/jack-command",
      "schedule": "HH:MM",
      "last_run": "ISO-TIMESTAMP",
      "enabled": true
    }
  ]
}
```

## ⌨️ 3. Jack Commands (Standardized)
1. **List Tasks**: Read `config/schedule.json`.
2. **Add Task**: Append a new entry to `config/schedule.json`.
3. **Audit**: Verify `last_run` timestamps against the expected schedule.

## 🧪 4. Verification
- Verify `schedule` library is present.
- Ensure `logs/` directory is writable.
- Restart engine after manual config edits (or wait 1 hour for auto-reload).
