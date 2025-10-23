import os
import sys
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import UJSONResponse
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv

# Construct path to .env file
dotenv_path = os.path.join(os.path.dirname(__file__), '.env')
load_dotenv(dotenv_path=dotenv_path)

# Add the project root to the Python path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from backend.routers import users, auth, food, food_log

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*", "Authorization"],
)

MONGO_DETAILS = os.getenv("MONGO_DETAILS")

@app.on_event("startup")
async def startup_db_client():
    if not MONGO_DETAILS:
        raise ValueError("MONGO_DETAILS environment variable not set")
    app.mongodb_client = AsyncIOMotorClient(MONGO_DETAILS)
    app.mongodb = app.mongodb_client["calories-quest"]
    try:
        await app.mongodb_client.admin.command('ismaster')
        print("Successfully connected to MongoDB.")
    except Exception as e:
        print(f"FATAL: Could not connect to MongoDB: {e}")

@app.on_event("shutdown")
async def shutdown_db_client():
    app.mongodb_client.close()

@app.get("/healthz", response_class=UJSONResponse)
async def health_check():
    try:
        await app.mongodb_client.admin.command('ismaster')
        return {"status": "ok", "database": "connected"}
    except Exception as e:
        raise HTTPException(status_code=503, detail={"error": str(e)})

app.include_router(users.router, prefix="/api/users", tags=["users"])
app.include_router(auth.router, prefix="/api/auth", tags=["auth"])
app.include_router(food.router, prefix="/api/food", tags=["food"])
app.include_router(food_log.router, prefix="/api/food", tags=["food_log"])

# Log all registered routes
for route in app.routes:
    if hasattr(route, "methods"):
        print(f"Route: {route.path}, Methods: {route.methods}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)