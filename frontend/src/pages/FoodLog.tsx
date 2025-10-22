import { useEffect, useState } from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { showError, showSuccess } from '@/utils/toast';
import api from '@/utils/api';
import Layout from '@/components/Layout';

const formSchema = z.object({
  foodName: z.string().min(1, "Food name is required"),
  calories: z.coerce.number().min(0, "Calories must be a positive number"),
  protein: z.coerce.number().min(0, "Protein must be a positive number"),
  carbs: z.coerce.number().min(0, "Carbs must be a positive number"),
  fats: z.coerce.number().min(0, "Fats must be a positive number"),
});

const FoodLog = () => {
  const [foodLogs, setFoodLogs] = useState([]);
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      foodName: "",
      calories: 0,
      protein: 0,
      carbs: 0,
      fats: 0,
    },
  });

  const fetchFoodLogs = async () => {
    try {
      const response = await api('/api/food');
      if (response.ok) {
        const data = await response.json();
        setFoodLogs(data);
      }
    } catch (error) {
      console.error('Failed to fetch food logs', error);
    }
  };

  useEffect(() => {
    fetchFoodLogs();
  }, []);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      const response = await api('/api/food', {
        method: 'POST',
        body: JSON.stringify(values),
      });

      if (response.ok) {
        showSuccess("Food log added successfully!");
        fetchFoodLogs();
        form.reset();
      } else {
        const errorData = await response.json();
        showError(errorData.detail || "Failed to add food log.");
      }
    } catch (error) {
      showError("An error occurred while adding the food log.");
    }
  }

  return (
    <Layout>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Card>
          <CardHeader>
            <CardTitle>Add Food Log</CardTitle>
            <CardDescription>Log a new food item you've consumed.</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField control={form.control} name="foodName" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Food Name</FormLabel>
                    <FormControl><Input placeholder="e.g., Chicken Breast" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="calories" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Calories</FormLabel>
                    <FormControl><Input type="number" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="protein" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Protein (g)</FormLabel>
                    <FormControl><Input type="number" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="carbs" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Carbs (g)</FormLabel>
                    <FormControl><Input type="number" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="fats" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Fats (g)</FormLabel>
                    <FormControl><Input type="number" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <Button type="submit" className="w-full">Add Log</Button>
              </form>
            </Form>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Today's Food Log</CardTitle>
            <CardDescription>Here's what you've logged today.</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-4">
              {foodLogs.map((log: any) => (
                <li key={log._id} className="p-4 border rounded-md">
                  <h3 className="font-semibold">{log.foodName}</h3>
                  <p>Calories: {log.calories}</p>
                  <p>Protein: {log.protein}g, Carbs: {log.carbs}g, Fats: {log.fats}g</p>
                  <p className="text-sm text-gray-500">{new Date(log.date).toLocaleString()}</p>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default FoodLog;