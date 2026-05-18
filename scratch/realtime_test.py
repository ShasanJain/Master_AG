from fastapi import FastAPI, HTTPException
import logging
import time

app = FastAPI(title="Real-Time Meta Skills Test API")
logging.basicConfig(level=logging.INFO)

# 1. Stateful Persistence Simulation (In-Memory Checkpoint)
STATE_STORE = {"last_execution": None, "status": "idle"}

# 2. Performance Optimization (O(1) Data Lookup)
MOCK_DB = {
    "user_1": {"name": "Jack", "role": "Supervisor"},
    "user_2": {"name": "Alice", "role": "Worker"}
}

@app.get("/api/user/{user_id}")
async def get_user(user_id: str):
    start_time = time.time()
    
    # 3. Security Hardening & Robust Boundaries (try-catch)
    try:
        # Checkpoint Log
        STATE_STORE["status"] = "querying"
        
        # O(1) Lookup
        user = MOCK_DB.get(user_id)
        if not user:
            raise ValueError("User not found")
            
        STATE_STORE["last_execution"] = "Success"
        
        return {
            "status": "success",
            "data": user,
            "latency_ms": round((time.time() - start_time) * 1000, 2)
        }
        
    except ValueError as e:
        # Error Resiliency
        logging.error(f"Lookup failed: {str(e)}")
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        logging.critical(f"Critical System Crash: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal Server Error")
