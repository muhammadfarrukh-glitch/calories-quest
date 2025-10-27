import { getToken } from './auth';

export interface UserGoals {
  daily_calorie_goal?: number;
  daily_protein_goal?: number;
  daily_carb_goal?: number;
  daily_fat_goal?: number;
}

const api = async (url: string, options: RequestInit = {}) => {
  const token = getToken();
  const headers = { ...options.headers };

  if (options.body && typeof options.body === 'string') {
    try {
      JSON.parse(options.body);
      headers['Content-Type'] = 'application/json';
    } catch (e) {
      // Not a JSON string, do not set Content-Type
    }
  }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const fullUrl = `${import.meta.env.VITE_API_BASE_URL}${url}`;
  const response = await fetch(fullUrl, {
    ...options,
    headers,
  });

  return response;
};

export default api;

export const updateUserGoals = async (goals: UserGoals) => {
  const url = '/api/users/profile/goals';
  return api(url, {
    method: 'PUT',
    body: JSON.stringify(goals),
  });
};
export const getFoodLog = async () => {
  return api('/api/food/log');
};

export const addFoodLog = async (foodLog: {
  food_name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}) => {
  return api('/api/food/log', {
    method: 'POST',
    body: JSON.stringify(foodLog),
  });
};

export const updateFoodLog = async (
  log_id: string,
  foodLog: {
    food_name: string;
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  }
) => {
  return api(`/api/food/log/${log_id}`, {
    method: 'PUT',
    body: JSON.stringify(foodLog),
  });
};

export const deleteFoodLog = async (log_id: string) => {
  return api(`/api/food/log/${log_id}`, {
    method: 'DELETE',
  });
};