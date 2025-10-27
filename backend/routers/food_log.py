from fastapi import APIRouter, Depends, HTTPException
from typing import List
from ..lib.database import food_logs_collection
from ..lib.models.food_log import FoodLog, FoodLogInDB, FoodLogCreate
from ..lib.models.user import User
from ..routers.auth import get_current_user
from bson import ObjectId
from datetime import datetime

router = APIRouter()

@router.post("/log", response_model=FoodLogInDB)
async def create_food_log(food_log_create: FoodLogCreate, current_user: User = Depends(get_current_user)):
    food_log_data = food_log_create.dict()
    if not food_log_data.get("date"):
        food_log_data["date"] = datetime.now()
    food_log_data["user_id"] = str(current_user.id)
    food_log = FoodLog(**food_log_data)
    inserted_log = await food_logs_collection.insert_one(food_log.dict(by_alias=True))
    return FoodLogInDB(**food_log.dict(by_alias=True), id=str(inserted_log.inserted_id))

@router.get("/log", response_model=List[FoodLogInDB])
async def get_food_logs(current_user: User = Depends(get_current_user)):
    logs = await food_logs_collection.find({"user_id": str(current_user.id)}).to_list(1000)
    return [FoodLogInDB(**log, id=str(log["_id"])) for log in logs]

@router.put("/log/{log_id}", response_model=FoodLogInDB)
async def update_food_log(log_id: str, food_log: FoodLogCreate, current_user: User = Depends(get_current_user)):
    existing_log = await food_logs_collection.find_one({"_id": ObjectId(log_id), "user_id": current_user.id})
    if existing_log is None:
        raise HTTPException(status_code=404, detail="Food log not found")
    
    updated_log = await food_logs_collection.find_one_and_update(
        {"_id": ObjectId(log_id)},
        {"$set": food_log.dict(exclude_unset=True)},
        return_document=True
    )
    return FoodLogInDB(**updated_log, id=str(updated_log["_id"]))

@router.delete("/log/{log_id}")
async def delete_food_log(log_id: str, current_user: User = Depends(get_current_user)):
    try:
        log_object_id = ObjectId(log_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid log_id format")

    delete_result = await food_logs_collection.delete_one({"_id": log_object_id, "user_id": str(current_user.id)})
    if delete_result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Food log not found")
    return {"message": "Food log deleted successfully"}