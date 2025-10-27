from fastapi import Request
from motor.motor_asyncio import AsyncIOMotorClient
import os

MONGO_DETAILS = os.getenv("MONGO_DETAILS")

if not MONGO_DETAILS:
    raise ValueError("MONGO_DETAILS environment variable not set")

client = AsyncIOMotorClient(MONGO_DETAILS)
database = client["calories-quest"]
food_logs_collection = database.get_collection("food_logs")

def get_db(request: Request):
    return request.app.mongodb