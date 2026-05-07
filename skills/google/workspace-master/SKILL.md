# ☁️ Google Workspace Industrial Master
> **SOP Version**: 5.0.0-Industrial
> **Goal**: 100% automation across Gmail, Docs, Sheets, and Drive.

## 🛠️ 1. Unified CLI Syntax
Every GWS operation follows this surgical pattern:
- **Command**: `gws <service> <resource> <method> --params '{"key": "value"}'`
- **Discovery**: If a parameter is unknown, run `gws schema <service>.<resource>.<method>`.
- **Help**: Run `gws <service> --help` to list all available resources.

## 📧 2. Gmail Mission Protocol (Triage & Comms)
- **Search**: `gws gmail.messages.list --params '{"q": "from:boss@company.com"}'`
- **Read**: `gws gmail.messages.get --params '{"id": "MSG_ID"}'`
- **Reply**: Use `gws gmail.messages.send` with a base64-encoded MIME string.
- **Triage**: Automatically label incoming high-priority items using `gws gmail.threads.modify`.

## 📊 3. Sheets Mission Protocol (Data Analysis)
- **Read Range**: `gws sheets.spreadsheets.values.get --params '{"spreadsheetId": "ID", "range": "Sheet1!A1:Z100"}'`
- **Update**: Use `values.update` with `valueInputOption: "USER_ENTERED"` for automatic formatting.
- **Pivot/Sort**: Prefer performing complex logic in a local Python/NumPy script before uploading the result back to Sheets.

## 📄 4. Docs & Drive Mission Protocol (Artifact Management)
- **Drafting**: Use `docs.documents.create` for new PRDs/Dossiers.
- **Extraction**: Export Docs to Markdown using `drive.files.export --params '{"fileId": "ID", "mimeType": "text/markdown"}'`.
- **Organization**: Use `drive.files.list --params '{"q": "mimeType = \"application/vnd.google-apps.folder\""}'` to map the drive.

## 🛡️ 5. Anti-Patterns
- **❌ Manual Polling**: Never wait for an email manually. Use `gws gmail.watch` for webhook-style updates.
- **❌ Large Exports**: For files > 10MB, use `drive.files.get --params '{"alt": "media"}'` instead of `export`.

## ⌨️ Automation Tools
- `Jack /gws-audit`: Lists all active GWS permissions and recent activity.
- `Jack /gws-sync [topic]`: Harvests all emails and docs related to a specific project.
- `Jack /gws-report`: Generates a weekly 3P update by scanning Sent mail and edited Docs.
