from fastapi import APIRouter, Depends, HTTPException
from pymongo.mongo_client import MongoClient
from pydantic import BaseModel
from datetime import datetime
from bson import ObjectId
import json

from ..lib.database import get_db
from ..lib.models.user import User
from .auth import get_current_user

router = APIRouter()

class FoodLog(BaseModel):
    foodName: str
    calories: int
    protein: float
    carbs: float
    fats: float
    date: datetime = datetime.utcnow()

class JSONEncoder(json.JSONEncoder):
    def default(self, o):
        if isinstance(o, ObjectId):
            return str(o)
        return json.JSONEncoder.default(self, o)

@router.post("/")
async def add_food_log(food_log: FoodLog, current_user: User = Depends(get_current_user), db: MongoClient = Depends(get_db)):
    food_logs_collection = db.get_collection("food_logs")
    
    new_log = food_log.dict()
    new_log["userId"] = current_user.email
    
    result = food_logs_collection.insert_one(new_log)
    
    if result.inserted_id:
        return {"message": "Food log added successfully", "log_id": str(result.inserted_id)}
    
    raise HTTPException(status_code=500, detail="Failed to add food log")

@router.get("/")
async def get_food_logs(current_user: User = Depends(get_current_user), db: MongoClient = Depends(get_db)):
    food_logs_collection = db.get_collection("food_logs")
    
    logs = []
    for log in food_logs_collection.find({"userId": current_user.email}):
        logs.append(log)
        
    return json.loads(JSONEncoder().encode(logs))