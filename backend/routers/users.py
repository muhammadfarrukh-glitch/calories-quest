from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from pymongo.mongo_client import MongoClient
from backend.lib.database import get_db
from backend.lib.models.user import User
from backend.routers.auth import create_access_token, ACCESS_TOKEN_EXPIRE_MINUTES
import bcrypt
from datetime import datetime, timedelta
import json
from bson import ObjectId

class JSONEncoder(json.JSONEncoder):
    def default(self, o):
        if isinstance(o, ObjectId):
            return str(o)
        return json.JSONEncoder.default(self, o)

router = APIRouter()

@router.post("/register")
async def signup(form_data: OAuth2PasswordRequestForm = Depends(), db: MongoClient = Depends(get_db)):
    users_collection = db.get_collection("users")
    
    email = form_data.username
    print(f"Received registration attempt for email: {email}")

    if not email:
        raise HTTPException(status_code=400, detail="Email/Username is required.")

    existing_user = users_collection.find_one({"email": email})
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
        result = users_collection.insert_one(new_user)
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
async def get_all_users(db: MongoClient = Depends(get_db)):
    users_collection = db.get_collection("users")
    users = []
    for user in users_collection.find({}, {"password": 0}):
        users.append(user)
    return json.loads(JSONEncoder().encode(users))