import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Quest, FoodEntry } from '@/types';
import Layout from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { PlusCircle, Trash2 } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { AddFoodDialog } from '@/components/AddFoodDialog';
import { getFoodLog, addFoodLog, deleteFoodLog } from '../utils/api';

const Index = () => {
  const navigate = useNavigate();
  const [quest, setQuest] = useState<Quest | null>(null);
  const [foodLog, setFoodLog] = useState<FoodEntry[]>([]);
  const [isAddFoodOpen, setIsAddFoodOpen] = useState(false);

  useEffect(() => {
    const storedQuest = localStorage.getItem('quest');
    if (!storedQuest) {
      navigate('/onboarding');
      return;
    }
    setQuest(JSON.parse(storedQuest));

    const fetchFoodLog = async () => {
      try {
        const response = await getFoodLog();
        if (response.ok) {
          const data = await response.json();
          setFoodLog(data);
        } else {
          console.error('Failed to fetch food log');
        }
      } catch (error) {
        console.error('Error fetching food log:', error);
      }
    };

    fetchFoodLog();
  }, [navigate]);

  const addFoodEntry = async (entry: Omit<FoodEntry, 'id' | 'timestamp'>): Promise<void> => {
    try {
      const response = await addFoodLog(entry);
      if (response.ok) {
        const newEntry = await response.json();
        setFoodLog([...foodLog, newEntry]);
      } else {
        console.error('Failed to add food log');
      }
    } catch (error) {
      console.error('Error adding food log:', error);
    }
  };

  const deleteFoodEntry = async (id: string) => {
    try {
      const response = await deleteFoodLog(id);
      if (response.ok) {
        setFoodLog(foodLog.filter(entry => entry.id !== id));
      } else {
        console.error('Failed to delete food log');
      }
    } catch (error) {
      console.error('Error deleting food log:', error);
    }
  };

  const consumedCalories = foodLog.reduce((sum, entry) => sum + entry.calories, 0);
  const progressPercentage = quest ? (consumedCalories / quest.dailyCalorieTarget) * 100 : 0;

  if (!quest) {
    return null; // Render nothing while redirecting
  }

  return (
    <Layout>
      <div className="space-y-8">
        <Card>
          <CardHeader>
            <CardTitle>Today's Quest</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-baseline">
              <span className="text-4xl font-bold">{consumedCalories.toLocaleString()}</span>
              <span className="text-lg text-gray-500">/ {quest.dailyCalorieTarget.toLocaleString()} kcal</span>
            </div>
            <Progress value={progressPercentage} />
            <div className="flex justify-between text-sm text-gray-600">
              <span>Consumed</span>
              <span>Goal</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Daily Food Log</CardTitle>
            <Button size="sm" onClick={() => setIsAddFoodOpen(true)}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Food
            </Button>
          </CardHeader>
          <CardContent>
            {foodLog.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Food</TableHead>
                    <TableHead>Quantity</TableHead>
                    <TableHead className="text-right">Calories</TableHead>
                    <TableHead className="w-[50px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {foodLog.map(entry => (
                    <TableRow key={entry.id}>
                      <TableCell className="font-medium">{entry.food_name}</TableCell>
                      <TableCell>{entry.quantity}</TableCell>
                      <TableCell className="text-right">{entry.calories}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon" onClick={() => deleteFoodEntry(entry.id)}>
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <p>No food logged yet today.</p>
                <p>Click "Add Food" to start your quest!</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      <AddFoodDialog
        isOpen={isAddFoodOpen}
        onClose={() => setIsAddFoodOpen(false)}
        onAddFood={addFoodEntry}
      />
    </Layout>
  );
};

export default Index;