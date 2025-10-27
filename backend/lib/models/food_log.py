from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class FoodLogCreate(BaseModel):
    food_name: str
    calories: float
    protein: float
    carbs: float
    fat: float
    meal_type: Optional[str] = "snack"
    date: Optional[datetime] = None

class FoodLog(FoodLogCreate):
    user_id: str
    date: datetime

class FoodLogInDB(FoodLog):
    id: str