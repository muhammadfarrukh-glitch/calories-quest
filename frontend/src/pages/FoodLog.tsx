import { useEffect, useState } from 'react';
import {
  getFoodLog,
  addFoodLog,
  updateFoodLog,
  deleteFoodLog,
} from '../utils/api';

interface FoodLogEntry {
  _id: string;
  food_name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

const FoodLog = () => {
  const [foodLog, setFoodLog] = useState<FoodLogEntry[]>([]);

  useEffect(() => {
    const fetchFoodLog = async () => {
      try {
        const response = await getFoodLog();
        if (response.ok) {
          const data = await response.json();
          console.log('Fetched data:', data);
          setFoodLog(data);
        } else {
          console.error('Failed to fetch food log');
        }
      } catch (error) {
        console.error('Error fetching food log:', error);
      }
    };

    fetchFoodLog();
  }, []);

  const handleAddFood = async (newLog: Omit<FoodLogEntry, '_id'>) => {
    try {
      const response = await addFoodLog(newLog);
      if (response.ok) {
        const data = await response.json();
        setFoodLog([...foodLog, data]);
      } else {
        console.error('Failed to add food log');
      }
    } catch (error) {
      console.error('Error adding food log:', error);
    }
  };

  const handleUpdateFood = async (updatedLog: FoodLogEntry) => {
    try {
      const response = await updateFoodLog(updatedLog._id, updatedLog);
      if (response.ok) {
        const data = await response.json();
        setFoodLog(
          foodLog.map((log) => (log._id === updatedLog._id ? data : log))
        );
      } else {
        console.error('Failed to update food log');
      }
    } catch (error) {
      console.error('Error updating food log:', error);
    }
  };

  const handleDeleteFood = async (logId: string) => {
    try {
      const response = await deleteFoodLog(logId);
      if (response.ok) {
        setFoodLog(foodLog.filter((log) => log._id !== logId));
      } else {
        console.error('Failed to delete food log');
      }
    } catch (error) {
      console.error('Error deleting food log:', error);
    }
  };

  console.log('Food log state:', foodLog);
  return (
    <div>
      <h1>Food Log</h1>
      {/* UI for adding, updating, and deleting food log entries will go here */}
    </div>
  );
};

export default FoodLog;