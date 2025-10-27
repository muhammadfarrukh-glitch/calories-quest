from fastapi import APIRouter, Depends, HTTPException, status, Request
from fastapi.security import OAuth2PasswordRequestForm
from pymongo.mongo_client import MongoClient
from ..lib.database import get_db
from pydantic import BaseModel
from ..lib.models.user import User, UserUpdate
from .auth import create_access_token, ACCESS_TOKEN_EXPIRE_MINUTES, get_current_user
import bcrypt
from datetime import datetime, timedelta
import json
from bson import ObjectId

class UserProfile(BaseModel):
    age: int
    gender: str
    height: float
    weight: float
    activityLevel: str
    goal: str

class JSONEncoder(json.JSONEncoder):
    def default(self, o):
        if isinstance(o, ObjectId):
            return str(o)
        if isinstance(o, datetime):
            return o.isoformat()
        return json.JSONEncoder.default(self, o)

router = APIRouter()

@router.post("/register")
async def signup(request: Request, form_data: OAuth2PasswordRequestForm = Depends(), db: MongoClient = Depends(get_db)):
    users_collection = db.get_collection("users")
    
    email = form_data.username
    print(f"Received registration attempt for email: {email}")

    if not email:
        raise HTTPException(status_code=400, detail="Email/Username is required.")

    existing_user = await users_collection.find_one({"email": email})
    print(f"Existing user check for {email}: {existing_user}")
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")

    if len(form_data.password) < 6:
        raise HTTPException(status_code=400, detail="Password must be at least 6 characters")

    hashed_password = bcrypt.hashpw(form_data.password.encode('utf-8'), bcrypt.gensalt())
    
    new_user = {
        "email": email,
        "password": hashed_password,
        "created_at": datetime.utcnow()
    }
    
    try:
        result = await users_collection.insert_one(new_user)
        print(f"SUCCESS: Inserted user with id: {result.inserted_id}")
    except Exception as e:
        print(f"DATABASE ERROR: Failed to insert user. Reason: {e}")
        raise HTTPException(status_code=500, detail="Failed to create user in the database.")

    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": email}, expires_delta=access_token_expires
    )
    
    return {"access_token": access_token, "token_type": "bearer"}

@router.get("/all")
async def get_all_users(request: Request, db: MongoClient = Depends(get_db)):
    users_collection = db.get_collection("users")
    users = []
    for user in users_collection.find({}, {"password": 0}):
        users.append(user)
    return json.loads(JSONEncoder().encode(users))

@router.get("/profile")
async def get_user_profile(request: Request, current_user: User = Depends(get_current_user), db: MongoClient = Depends(get_db)):
    users_collection = db.get_collection("users")
    user_profile = await users_collection.find_one({"email": current_user.email}, {"password": 0})
    if not user_profile:
        raise HTTPException(status_code=404, detail="User profile not found")
    return json.loads(JSONEncoder().encode(user_profile))

@router.put("/profile")
async def update_user_profile(request: Request, profile_data: UserProfile, current_user: User = Depends(get_current_user), db: MongoClient = Depends(get_db)):
    users_collection = db.get_collection("users")
    
    user = await users_collection.find_one({"email": current_user.email})
    if not user:
        raise HTTPException(status_code=404, detail="User profile not found")

    update_data = profile_data.dict()
    
    result = await users_collection.update_one(
        {"email": current_user.email},
        {"$set": update_data}
    )
    
    if result.modified_count == 1:
        return {"message": "Profile updated successfully"}
    
    if result.matched_count == 1 and result.modified_count == 0:
        return {"message": "Profile found, but no changes were necessary"}

    raise HTTPException(status_code=404, detail="User profile not found or no changes made")

@router.put("/profile/goals")
async def update_user_goals(request: Request, goals: UserUpdate, current_user: User = Depends(get_current_user), db: MongoClient = Depends(get_db)):
    users_collection = db.get_collection("users")

    # Check if the user exists
    user = await users_collection.find_one({"email": current_user.email})
    if not user:
        raise HTTPException(status_code=404, detail="User profile not found")

    update_data = goals.dict(exclude_unset=True)
    print(f"Updating goals for user {current_user.email} with data: {update_data}")
    if not update_data:
        raise HTTPException(status_code=400, detail="No goal data provided")

    result = await users_collection.update_one(
        {"email": current_user.email},
        {"$set": update_data}
    )
    
    if result.modified_count == 1:
        return {"message": "Goals updated successfully"}
    
    if result.matched_count == 1 and result.modified_count == 0:
        return {"message": "Profile found, but no changes were necessary"}

    raise HTTPException(status_code=404, detail="User profile not found or no changes made")