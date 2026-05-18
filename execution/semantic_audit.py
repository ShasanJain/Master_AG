import os
import re

TARGET_DIR = r"C:\Users\swaya\.gemini\skills\meta\agent"
TECHNICAL_KEYWORDS = [
    "npm", "npx", "eslint", "typescript", "ts", "test", "jest", "vitest", "build", 
    "api", "sql", "zod", "pydantic", "jwt", "oauth", "rbac", "cors", "helmet", 
    "json", "react", "usememo", "usecallback", "redis", "docker", "vercel", "cli",
    "dependency", "package.json", "requirements.txt", "main.py", "index.ts", 
    ".env", "O(N)", "O(1)", "O(N^2)"
]

def verify_implementation_density():
    print("Running Semantic Verification (Implementation Density Check)...")
    passed = 0
    failed = 0
    
    for root, _, files in os.walk(TARGET_DIR):
        for file in files:
            if not file.endswith(".md"): continue
            
            filepath = os.path.join(root, file)
            with open(filepath, "r", encoding="utf-8") as f:
                content = f.read().lower()
                
            # Count technical terms found
            found_terms = [term for term in TECHNICAL_KEYWORDS if term in content]
            
            # Check for specific actionable commands (e.g., `command`)
            has_code_blocks = "```" in content or "`" in content
            
            score = len(found_terms) + (3 if has_code_blocks else 0)
            
            if score >= 3:
                status = "PASS (High Density)"
                passed += 1
            else:
                status = "FAIL (Low Density - Missing technical substance)"
                failed += 1
                
            print(f"[{status}] {file} (Score: {score}, Terms: {len(found_terms)})")

    print(f"\nVerification Complete: {passed} passed, {failed} failed.")

if __name__ == "__main__":
    verify_implementation_density()
