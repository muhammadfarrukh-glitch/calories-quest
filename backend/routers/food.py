from fastapi import APIRouter, Depends, Request
from pymongo.mongo_client import MongoClient
from backend.lib.database import get_db
from backend.routers.auth import get_current_user
from backend.lib.models.user import User

router = APIRouter()

@router.get("/")
async def get_food_items(request: Request, current_user: User = Depends(get_current_user), db: MongoClient = Depends(get_db)):
    # Placeholder for fetching food items for the current user
    return {"message": f"Food items for {current_user.email}"}