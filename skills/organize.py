import os
import shutil
import json

SKILLS_DIR = os.path.dirname(os.path.abspath(__file__))

GROUPS = {
    "emotional-direction": [
        "game-design-emotional-canvas",
        "emotional-canvas-moodboard"
    ],
    "planning-strategy": [
        "game-dev-first-steps",
        "game-dev-team-gap",
        "game-dev-budget-estimator",
        "game-dev-time-estimator"
    ],
    "decision-frameworks": [
        "game-design-grow-design",
        "game-design-goal-framing",
        "game-design-option-generation",
        "game-design-five-options",
        "game-design-roadblock-reframing",
        "game-design-ideal-outcome-backcasting",
        "game-design-transformative-reuse",
        "game-design-feature-prioritization",
        "game-design-one-page-design-doc",
        "game-design-one-thing-to-remove"
    ],
    "motivation-psychology": [
        "game-design-player-motivation-audit",
        "game-design-player-need-satisfaction-audit",
        "game-design-bartle-archetype-audit",
        "game-design-granular-player-motivation-audit",
        "game-design-big-five-personality-audit",
        "game-design-fantasy-extractor",
        "game-design-player-persona-extractor",
        "game-design-player-perspective-reframe",
        "game-design-player-segment-perception-audit",
        "game-design-player-values-mapper",
        "game-design-thinking-fast-and-slow-audit",
        "game-design-zeigarnik-effect-audit",
        "game-design-peak-end-audit",
        "game-design-smart-goal-audit",
        "game-design-molyneux-lens"
    ],
    "multiplayer-social": [
        "game-design-multiplayer-feature-audit",
        "game-design-social-satisfaction-matrix",
        "game-design-prosocial-session-chapters",
        "game-design-leaderboard-audit",
        "game-design-leaderboard-builder"
    ],
    "prototyping-uncertainty": [
        "game-design-unknown-unknowns-prototyping",
        "game-design-prototype-intent-audit",
        "game-design-prototyping-companion"
    ],
    "behavior-adoption": [
        "game-design-fogg-behavior-audit",
        "game-design-friction-journey-audit",
        "game-design-ftue-hero-journey-audit",
        "game-design-goal-density-and-immediacy-audit",
        "game-design-premium-pass-audit"
    ],
    "randomness-fairness": [
        "game-design-perceived-randomness-audit",
        "game-design-attribution-audit",
        "game-design-flow-audit",
        "game-design-fairness-frustration-audit"
    ],
    "audits-general": [
        "design-red-team-audit",
        "game-design-kpi-coverage-audit",
        "game-design-novelty-spectrum-audit",
        "game-design-pitch-deck-audit"
    ],
    "software-management": [
        "software-team-conflict-patterns"
    ]
}

def organize():
    entries = []
    
    # Keep standard non-game design folders intact
    keep = ["3d-websites", "3d-websites-settings", "autonomous-agent-loop", "document-visualization-evaluator", "ghost_cms", "html-to-video-orchestrator"]
    for k in keep:
        if os.path.exists(os.path.join(SKILLS_DIR, k)):
            entries.append({"path": f"skills/{k}"})

    for group_name, folders in GROUPS.items():
        group_dir = os.path.join(SKILLS_DIR, "game-design", group_name)
        os.makedirs(group_dir, exist_ok=True)
        
        for folder in folders:
            src = os.path.join(SKILLS_DIR, folder)
            dst = os.path.join(group_dir, folder)
            
            if os.path.exists(src) and not os.path.exists(dst):
                print(f"Moving {folder} -> game-design/{group_name}/")
                shutil.move(src, dst)
            
            if os.path.exists(dst) or os.path.exists(src):
                entries.append({"path": f"skills/game-design/{group_name}/{folder}"})

    # Write skills.json
    skills_json_path = os.path.join(SKILLS_DIR, "skills.json")
    skills_config = {"entries": entries}
    with open(skills_json_path, "w", encoding="utf-8") as f:
        json.dump(skills_config, f, indent=2)
    print("Generated skills.json successfully.")

if __name__ == "__main__":
    organize()
