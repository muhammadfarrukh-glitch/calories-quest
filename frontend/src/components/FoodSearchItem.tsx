import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { FoodEntry } from '@/types';
import { cn } from '@/lib/utils';

interface FoodSearchItemProps {
  food: {
    name: string;
    calories: number;
    defaultQuantity: string;
    protein: number;
    carbs: number;
    fat: number;
  };
  onAdd: (food: Omit<FoodEntry, 'id' | 'timestamp'>) => Promise<void>;
}

export const FoodSearchItem = ({ food, onAdd }: FoodSearchItemProps) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleAdd = async () => {
    setIsLoading(true);
    try {
      await onAdd({
        food_name: food.name,
        calories: food.calories,
        quantity: food.defaultQuantity,
        protein: food.protein,
        carbs: food.carbs,
        fat: food.fat,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-between p-2 border rounded-md">
      <div>
        <p className="font-medium">{food.name}</p>
        <p className="text-sm text-gray-500">{food.calories} kcal / {food.defaultQuantity}</p>
      </div>
      <Button
        size="sm"
        onClick={handleAdd}
        disabled={isLoading}
        className={cn(isLoading ? "px-3" : "")}
      >
        {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Add"}
      </Button>
    </div>
  );
};