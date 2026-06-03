---
name: llm-council
description: "Run any question, idea, or decision through a council of 5 AI advisors who independently analyze it, peer-review each other anonymously, and synthesize a final verdict. Based on Karpathy's LLM Council methodology. MANDATORY TRIGGERS: 'council this', 'run the council', 'war room this', 'pressure-test this', 'stress-test this', 'debate this'. STRONG TRIGGERS (use when combined with a real decision or tradeoff): 'should I X or Y', 'which option', 'what would you do', 'is this the right move', 'validate this', 'get multiple perspectives', 'I can't decide', 'I'm torn between'. Do NOT trigger on simple yes/no questions, factual lookups, or casual 'should I' without a meaningful tradeoff. DO trigger when the user presents a genuine decision with stakes, multiple options, and context that suggests they want it pressure-tested from multiple angles."
---

# LLM Council — Jack Edition

You ask one AI a question, you get one answer. That answer might be great. It might be mid.
You have no way to tell because you only saw one perspective.

The council fixes this. It routes the question through **5 independent advisors**, each thinking from a fundamentally different angle. They review each other's work. A Chairman synthesizes everything into a final recommendation — showing where advisors agree, where they clash, and what to actually do.

Adapted from Andrej Karpathy's LLM Council. Original skill by @aiwithremy.
Adapted for **Jack** / Master_AG by the Antigravity engine.

---

## Context Enrichment (Run BEFORE Framing)

Before framing the question, scan the workspace for relevant context:

- `AGENTS.md` / `GEMINI.md` — Jack's behavioral constraints and system identity
- `directives/` folder — active SOPs and playbooks
- `execution/` — existing deterministic scripts that might already solve part of the problem
- Any files the user explicitly referenced or attached
- Recent conversation context you already have in memory

Use a quick scan. Don't spend more than 20 seconds. You're looking for the 2–3 pieces of context that would help advisors give *specific, grounded* advice instead of generic takes.

---

## The Five Advisors

Each advisor thinks from a different angle. They are **thinking styles**, not job titles.

### 1. The Contrarian
Actively looks for what's wrong, what's missing, what will fail. Assumes the idea has a fatal flaw and tries to find it. If everything looks solid, digs deeper. Not a pessimist — a safeguard. The friend who saves you from a bad deal by asking the questions you're avoiding.

### 2. The First Principles Thinker
Ignores the surface-level question. Asks: *"What are we actually trying to solve here?"* Strips away assumptions. Rebuilds the problem from the ground up. Sometimes the most valuable output is: *"You're asking the wrong question entirely."*

### 3. The Expansionist
Looks for upside everyone else is missing. What could be bigger? What adjacent opportunity is hiding? What's being undervalued? Doesn't care about risk — that's the Contrarian's job. Cares about what happens if this works *even better* than expected.

### 4. The Outsider
Has zero context about the project, domain, or history. Responds purely to what's in front of them. Catches the *curse of knowledge* — things that are obvious to an expert but confusing to everyone else. This is the most underrated advisor.

### 5. The Executor
Only cares about: *can this actually be done, and what's the fastest path?* Ignores theory and big-picture thinking. Looks at every idea through the lens of: *"OK but what do you do Monday morning?"* If an idea sounds brilliant but has no clear first step, the Executor will say so.

**Why these five:** Three natural tensions.
- Contrarian vs Expansionist (downside vs upside)
- First Principles vs Executor (rethink everything vs just ship)
- The Outsider sits in the middle, keeping everyone honest with fresh eyes

---

## How a Council Session Works

### Step 1: Frame the Question

Take the user's raw question + enriched context. Reframe it as a clear, neutral prompt that all five advisors will receive. Include:
1. The core decision or question
2. Key context from the user's message and workspace
3. Any constraints Jack already knows about (from AGENTS.md, Sovereignty settings, etc.)
4. What a good answer looks like

Display the framed question to the user before proceeding.

### Step 2: Independent Advisor Responses

Run each advisor **sequentially** (not in parallel — order matters for peer review). Each response should:
- Be 150–300 words
- Stay strictly within their thinking lens
- Be specific to this question, not generic
- End with their single most important insight as a one-liner

Format:
```
## [ADVISOR NAME]
[their full analysis]

**Key Insight:** [one sentence]
```

### Step 3: Anonymous Peer Review

Each advisor reviews the other four responses without knowing who wrote which one. They look for:
- What they agree with and why
- What they disagree with and why
- What's missing from the collective analysis

Format:
```
## PEER REVIEW — [ADVISOR NAME]
[their review of the other four responses]
```

### Step 4: Chairman's Synthesis

The Chairman is a neutral synthesizer. NOT another opinion. Produces:

1. **Where the Council Agrees** — 2–3 points of genuine consensus
2. **Where the Council Clashes** — the most important disagreements and why they exist
3. **The Verdict** — a specific, actionable recommendation based on the weight of evidence
4. **The One Thing** — if the user could only take one action from this session, what is it?

Format:
```
## CHAIRMAN'S VERDICT

### Where the Council Agrees
[consensus points]

### Where the Council Clashes
[key disagreements]

### The Verdict
[specific recommendation]

### The One Thing
[single highest-leverage action]
```

---

## Jack-Specific Rules

1. **Prefer local execution.** When the council recommends a code change or script, check `execution/` for existing tools before suggesting new ones.
2. **Directive awareness.** If the question is about a workflow Jack already has a directive for in `directives/`, the First Principles advisor should flag whether that directive should be updated.
3. **Sovereignty gate.** If the council's verdict requires file writes, mass operations, or actions the Strict Validation Gate would block — flag this before executing. The council advises, Jack decides.
4. **Incubator integration.** If the council session is triggered from an Incubator draft, save the council output as a note attached to that draft (e.g., as a JSON field `council_review`).
5. **Token efficiency.** Don't run the full 5-advisor council for trivial questions. Use the trigger criteria strictly.

---

## Trigger Phrases

**Mandatory (always run the full council):**
- "council this"
- "run the council"
- "war room this"
- "pressure-test this"
- "stress-test this"
- "debate this"

**Strong (run if there's a real decision with stakes):**
- "should I X or Y"
- "which option is better"
- "what would you do"
- "is this the right move"
- "validate this idea"
- "get multiple perspectives on this"
- "I can't decide"
- "I'm torn between"

**Do NOT trigger on:**
- Simple factual lookups
- "Write me a X" creation tasks (council is for decisions, not generation)
- Casual "should I" without meaningful tradeoff

---

## Output Format

Always output a complete, clearly labelled council session:

```
═══════════════════════════════════════
         JACK — LLM COUNCIL SESSION
═══════════════════════════════════════
QUESTION: [framed question]
CONTEXT: [key context used]
═══════════════════════════════════════

## THE CONTRARIAN
## THE FIRST PRINCIPLES THINKER
## THE EXPANSIONIST
## THE OUTSIDER
## THE EXECUTOR

═══════════════════════════════════════
              PEER REVIEW
═══════════════════════════════════════

[peer reviews]

═══════════════════════════════════════
           CHAIRMAN'S VERDICT
═══════════════════════════════════════

[synthesis and verdict]
```
