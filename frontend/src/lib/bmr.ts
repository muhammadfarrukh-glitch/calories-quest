import { UserProfile } from '@/types';

// Calculates daily calorie needs based on the Mifflin-St Jeor equation and activity level.
export const calculateDailyCalorieTarget = (profile: UserProfile): number => {
  const { age, gender, height, weight, activityLevel, goal } = profile;

  // Mifflin-St Jeor Equation for BMR
  let bmr: number;
  if (gender === 'male') {
    bmr = 10 * weight + 6.25 * height - 5 * age + 5;
  } else {
    bmr = 10 * weight + 6.25 * height - 5 * age - 161;
  }

  // Activity Multiplier
  const activityMultipliers = {
    sedentary: 1.2,
    light: 1.375,
    moderate: 1.55,
    active: 1.725,
    very_active: 1.9,
  };

  const tdee = bmr * activityMultipliers[activityLevel];

  // Goal Adjustment
  let calorieTarget: number;
  switch (goal) {
    case 'lose':
      calorieTarget = tdee - 500; // 1lb per week deficit
      break;
    case 'gain':
      calorieTarget = tdee + 500; // 1lb per week surplus
      break;
    case 'maintain':
    default:
      calorieTarget = tdee;
      break;
  }

  return Math.round(calorieTarget);
};