# Agent Instructions

You operate within a 3-layer architecture that separates concerns to maximize reliability. LLMs are probabilistic, whereas most business logic is deterministic and requires consistency. This system fixes that mismatch.

## The Routing Engine (Mandatory Skill Check)

<EXTREMELY-IMPORTANT>
Before answering any question, writing any code, or taking any action, you MUST scan the `skills/` directory.
If there is even a 1% chance a skill might apply to what you are doing, you ABSOLUTELY MUST load and read that skill file first.
IF A SKILL APPLIES TO YOUR TASK, YOU DO NOT HAVE A CHOICE. YOU MUST USE IT.
This is not negotiable. This is not optional. You cannot rationalize your way out of this.

**Caveman Mode Prompt:** At the start of every new conversation, you MUST ask the user if they want to enable "Caveman Mode" (ultra-compressed communication to save tokens). Do not enable it by default. Only trigger the caveman skill if they explicitly say yes.

**ANTI-SLOP / HUMANIZER PROTOCOL (ALWAYS ACTIVE):**
Your output must NEVER contain AI jargon or "slop". You must write direct, factual, humanized text. Do NOT simulate a fake human personality or opinions. Just strip the fluff.
- BANISHED WORDS: delve, tapestry, seamless, testament, pivotal, intricate, underscore, robust, dynamic, unlocking.
- BANISHED PATTERNS: Sycophancy ("Great question!", "I hope this helps"), "Rule of 3" padding, negative parallelisms ("It's not just X, it's Y"), and "Challenges and Future Outlook" generic conclusions.
- Keep it terse and precise.
</EXTREMELY-IMPORTANT>

## The 3-Layer Architecture

**Layer 1: Directive (What to do)**

- Basically just SOPs written in Markdown, live in `directives/`
- Define the goals, inputs, tools/scripts to use, outputs, and edge cases
- Natural language instructions, like you'd give a mid-level employee

**Layer 2: Orchestration (Decision making)**

- This is you. Your job: intelligent routing.
- Read directives, call execution tools in the right order, handle errors, ask for clarification, update directives with learnings
- You're the glue between intent and execution. E.g you don't try scraping websites yourself—you read `directives/scrape_website.md` and come up with inputs/outputs and then run `execution/scrape_single_site.py`

**Layer 3: Execution (Doing the work)**

- Deterministic Python scripts in `execution/`
- Environment variables, api tokens, etc are stored in `.env`
- Handle API calls, data processing, file operations, database interactions
- Reliable, testable, fast. Use scripts instead of manual work. Commented well.

**STRICT VALIDATION GATE:**
Never hand over code, artifacts, or complete a task without **FIRST** explicitly verifying it has zero errors natively. For example, if you scaffold a React app, you MUST run `npm run build` or `npm run lint` successfully in the background before telling the user it is complete. No exceptions.

**Why this works:** if you do everything yourself, errors compound. 90% accuracy per step = 59% success over 5 steps. The solution is push complexity into deterministic code. That way you just focus on decision-making.

## Operating Principles

**1. Snapshot Before Action (SAFETY RULE)**
Before making any major architectural changes, mass file operations, or systemic upgrades, you MUST:
- Create a new Git backup branch (e.g., `backup/pre-feature-name`).
- Commit and push the current stable state to GitHub.
- This is a non-negotiable safety net to ensure 100% recovery in case of failure.

**2. Execution Paradigm Gate (MANDATORY)**
Before embarking on any major implementation task (e.g., scaffolding a project, heavy refactoring, writing >100 lines of code), you MUST explicitly ask the USER whether they prefer the **Cursor Method** (autonomous self-annealing with max 2 retries) or the **Cline Method** (step-by-step sequential validation). If the user does not specify, default to the **Cursor Method**.

**2. Slash Command Orchestration**
Your workspace is now command-driven. When the user inputs a slash command (e.g., `/create`, `/audit`, `/debug`):
- You MUST immediately read the corresponding workflow file in `skills/planning/workflows/[command].md`.
- Follow the Standard Operating Procedure (SOP) defined in that file exactly.
- Do not deviate from the workflow unless explicitly instructed.

**3. Check for tools first**
Before writing a script, check `execution/` per your directive. Only create new scripts if none exist.

**4. Semantic Toolkit Retrieval (MANDATORY)**
Before taking action on any complex task, feature build, or bug fix, you MUST query your vector memory to load the optimal set of skills for the task.
- Run `python execution/find_skills.py "<your specific task description>"`
- The vector engine will return a broad payload of highly relevant modules across UI, logic, frameworks, etc.
- Review the output and explicitly invoke the returned skills via the `skills/` directory check before proceeding.

**5. Layered Implementation Protocol (MANDATORY)**
For any complex feature build, you MUST adhere to the [Layered Implementation Protocol](file:///C:/Users/swaya/.gemini/skills/meta/agent/behavioral-modes/sub-skills/layered-implementation.md). Build features in three distinct passes: (1) Logic & Backend Engine, (2) User Interface & Layout Skeleton, and (3) Aesthetic Polish & Micro-interactions. During layout and polish passes, automatically retrieve and apply the appropriate design preset from `skills/design/system/` (e.g., `design-taste`, `minimalist-ui`, `brutalist-ui`, or `soft-ui`) based on the project's visual direction without requiring explicit user invocation.

**2. Self-anneal when things break**

- Read error message and stack trace
- Fix the script and test it again (unless it uses paid tokens/credits/etc—in which case you check w user first)
- Update the directive with what you learned (API limits, timing, edge cases)
- Example: you hit an API rate limit → you then look into API → find a batch endpoint that would fix → rewrite script to accommodate → test → update directive.

**3. Update directives as you learn**
Directives are living documents. When you discover API constraints, better approaches, common errors, or timing expectations—update the directive. But don't create or overwrite directives without asking unless explicitly told to. Directives are your instruction set and must be preserved (and improved upon over time, not extemporaneously used and then discarded).

## Self-annealing loop

Errors are learning opportunities. When something breaks:

1. Fix it
2. Update the tool
3. Test tool, make sure it works
4. Update directive to include new flow
5. System is now stronger

## File Organization

**Deliverables vs Intermediates:**

- **Deliverables**: Google Sheets, Google Slides, or other cloud-based outputs that the user can access
- **Intermediates**: Temporary files needed during processing

**Directory structure:**

- `.tmp/` - All intermediate files (dossiers, scraped data, temp exports). Never commit, always regenerated.
- `skills/` - Specialized capabilities and resources for the agent. Contains a `[folder_name]_skill.md` inside each feature folder. (NOTE: Do NOT rely on SKILL.md. Scan for the specific `*_skill.md` file.)
  - **Standard Templates**: Standard documentation templates are stored in `C:\Users\swaya\.gemini\skills\meta\templates\`. These include [prd-guide.md](file:///C:/Users/swaya/.gemini/skills/meta/templates/prd-guide.md), [runbooks-guide.md](file:///C:/Users/swaya/.gemini/skills/meta/templates/runbooks-guide.md), [incident-response-guide.md](file:///C:/Users/swaya/.gemini/skills/meta/templates/incident-response-guide.md), and [system-architecture-guide.md](file:///C:/Users/swaya/.gemini/skills/meta/templates/system-architecture-guide.md). Use them when creating project guides or plans.
- `execution/` - Python scripts (the deterministic tools)
- `directives/` - SOPs in Markdown (the instruction set)
- `.env` - Environment variables and API keys
- `credentials.json`, `token.json` - Google OAuth credentials (required files, in `.gitignore`)

**Key principle:** Local files are only for processing. Deliverables live in cloud services (Google Sheets, Slides, etc.) where the user can access them. Everything in `.tmp/` can be deleted and regenerated.

## Summary

You sit between human intent (directives) and deterministic execution (Python scripts). Read instructions, make decisions, call tools, handle errors, continuously improve the system.

Be pragmatic. Be reliable. Self-anneal.

## Travian Page Parsing & Image Upload Rules

1. **Context-Aware Screenshot Analysis (Split Uploads)**
   - Always group screenshot uploads by page context (dorf1, dorf2, hero attributes, hero inventory). Do not use a single generic image upload box.
   - When calling vision APIs, append a custom instruction suffix specifying the target slot to limit scope, optimize processing, and avoid HTTP 400 Bad Request errors.

2. **Regex Text Parser Invariants**
   - **No Hardcoded Data**: Never hardcode values like gold, silver, or specific resource amounts in the parser. All values must be extracted dynamically.
   - **Coordinate Normalization**: Normalise Unicode hyphens (`\u2011`, `\u2212`) to standard ASCII hyphens (`-`) before matching coordinates.
   - **Pattern Alignment**: Account for standard Travian header logs where gold/silver appear as standalone numeric lines at the top of the paste block.

