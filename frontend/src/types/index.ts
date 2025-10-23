export interface UserProfile {
  age: number;
  gender: 'male' | 'female';
  height: number;
  weight: number;
  activityLevel: 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active';
  goal: 'lose' | 'maintain' | 'gain';
  daily_calorie_goal?: number;
  daily_protein_goal?: number;
  daily_carb_goal?: number;
  daily_fat_goal?: number;
}

export interface Quest {
  dailyCalorieTarget: number;
}

export interface FoodEntry {
  id: string;
  food_name: string;
  quantity: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  timestamp: string;
}