import os
import sys

def verify_environment():
    print("==================================================")
    print("       ONBOARDING ENVIRONMENT VERIFICATION        ")
    print("==================================================")
    
    # Read environment variables
    # (In production, load_dotenv() would be called first)
    try:
        from dotenv import load_dotenv
        load_dotenv()
    except ImportError:
        pass
        
    required_keys = ["EDGETTS_VOICE", "TIKTOK_API_KEY"]
    
    missing = []
    print("Checking active environment keys...")
    for key in required_keys:
        val = os.getenv(key)
        if val:
            # Mask value
            masked = val[:3] + "*" * (len(val) - 3) if len(val) > 3 else "*"
            print(f" [PASS] {key:<20} : Active ({masked})")
        else:
            print(f" [FAIL] {key:<20} : MISSING")
            missing.append(key)
            
    print("--------------------------------------------------")
    if missing:
        print(f"VERIFICATION STATUS: FAILED ({len(missing)} missing key(s))")
        print("Please configure the missing keys in your local .env file.")
        sys.exit(1)
    else:
        print("VERIFICATION STATUS: SUCCESS")
        print("All required role configurations are active.")
        sys.exit(0)

if __name__ == "__main__":
    verify_environment()
