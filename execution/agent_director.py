import json
import requests
from typing import List, Dict

class AgentDirector:
    """
    Local Agentic Director (ViMax hybrid implementation).
    Uses Ollama (e.g. Llama-3, Mistral) to generate structured storyboards.
    No paid API dependencies.
    """
    def __init__(self, model: str = "llama3.2"):
        self.model = model
        self.api_url = "http://localhost:11434/api/generate"

    def _call_ollama(self, prompt: str) -> str:
        """Helper to call local Ollama instance."""
        payload = {
            "model": self.model,
            "prompt": prompt,
            "stream": False,
            "format": "json" # Force JSON output if the model supports it
        }
        try:
            resp = requests.post(self.api_url, json=payload, timeout=60)
            if resp.status_code == 200:
                return resp.json().get("response", "")
            else:
                raise RuntimeError(f"Ollama API Error: {resp.text}")
        except requests.exceptions.RequestException:
            print("[Agent Director] Warning: Ollama not running or model missing.")
            return ""

    def generate_storyboard(self, topic: str) -> List[Dict]:
        """
        Acts as the Screenwriter and Director.
        Takes a topic and returns a JSON storyboard array.
        """
        print(f"\n[Agent Director] Brainstorming storyboard for: '{topic}'...")
        
        prompt = f"""
        You are an expert AI Film Director. 
        Create a 3-shot storyboard for a short vertical video about: "{topic}".
        Output ONLY a valid JSON array of objects.
        Each object must have exactly these keys:
        - "shot": integer
        - "visual_prompt": detailed description of what we see
        - "narration": what the voiceover says during this shot
        
        Example:
        [
          {{"shot": 1, "visual_prompt": "A glowing cyberpunk city", "narration": "In the future..."}}
        ]
        """
        
        try:
            response_text = self._call_ollama(prompt)
        except Exception as e:
            print(f"[Agent Director] Error calling Ollama: {e}")
            response_text = ""
        
        if not response_text:
            # Fallback if Ollama isn't running
            print("[Agent Director] Falling back to default storyboard (Ollama offline).")
            return [
                {"shot": 1, "visual_prompt": f"A cinematic establishing shot related to {topic}", "narration": f"Did you know about {topic}?"},
                {"shot": 2, "visual_prompt": f"Detailed close up showing the intricacies of {topic}", "narration": "It is one of the most fascinating subjects."},
                {"shot": 3, "visual_prompt": f"A wide beautiful shot summarizing {topic}", "narration": "Subscribe to learn more."}
            ]
            
        try:
            storyboard = json.loads(response_text)
            
            # If the LLM returned an object instead of an array, try to extract the array
            if isinstance(storyboard, dict):
                # If it looks like a single shot, wrap it in a list
                if "shot" in storyboard and "narration" in storyboard:
                    storyboard = [storyboard]
                else:
                    for key, val in storyboard.items():
                        if isinstance(val, list):
                            storyboard = val
                            break
                        
            if not isinstance(storyboard, list):
                raise ValueError("LLM did not return a list")
                
            print("[Agent Director] Successfully generated agentic storyboard!")
            return storyboard
        except (json.JSONDecodeError, ValueError) as e:
            print(f"[Agent Director] Failed to parse JSON from LLM: {e}. Using fallback.")
            return [
                {"shot": 1, "visual_prompt": f"Visual of {topic}", "narration": f"Let's talk about {topic}"}
            ]

if __name__ == "__main__":
    director = AgentDirector()
    board = director.generate_storyboard("The History of Rome")
    print(json.dumps(board, indent=2))
