export interface UserProfile {
  age: number;
  gender: 'male' | 'female';
  height: number;
  weight: number;
  activityLevel: 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active';
  goal: 'lose' | 'maintain' | 'gain';
}

export interface Quest {
  dailyCalorieTarget: number;
}

export interface FoodEntry {
  id: string;
  name: string;
  quantity: string;
  calories: number;
  timestamp: string;
}