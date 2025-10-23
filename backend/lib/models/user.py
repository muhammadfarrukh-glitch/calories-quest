from pydantic import BaseModel, Field
from typing import Optional
from bson import ObjectId

class PyObjectId(ObjectId):
    @classmethod
    def __get_validators__(cls):
        yield cls.validate

    @classmethod
    def validate(cls, v, _):
        if not ObjectId.is_valid(v):
            raise ValueError("Invalid objectid")
        return ObjectId(v)

    @classmethod
    def __get_pydantic_json_schema__(cls, core_schema, handler):
        return {"type": "string"}

class User(BaseModel):
    id: Optional[PyObjectId] = Field(default=None, alias='_id')
    email: str
    password: str
    daily_calorie_goal: Optional[float] = None
    daily_protein_goal: Optional[float] = None
    daily_carb_goal: Optional[float] = None
    daily_fat_goal: Optional[float] = None

    class Config:
        populate_by_name = True
        arbitrary_types_allowed = True
        json_encoders = {
            ObjectId: str
        }

class UserUpdate(BaseModel):
    daily_calorie_goal: Optional[float] = None
    daily_protein_goal: Optional[float] = None
    daily_carb_goal: Optional[float] = None
    daily_fat_goal: Optional[float] = None