import { useState } from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { FoodEntry } from '@/types';
import { mockFoodDatabase } from '@/data/foods';
import { ScrollArea } from './ui/scroll-area';

interface AddFoodDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onAddFood: (entry: Omit<FoodEntry, 'id' | 'timestamp'>) => void;
}

const manualFormSchema = z.object({
  name: z.string().min(1, "Food name is required"),
  quantity: z.string().min(1, "Quantity is required"),
  calories: z.coerce.number().min(0, "Calories must be a positive number"),
});

export const AddFoodDialog = ({ isOpen, onClose, onAddFood }: AddFoodDialogProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const manualForm = useForm<z.infer<typeof manualFormSchema>>({
    resolver: zodResolver(manualFormSchema),
  });

  const handleAddFood = (food: Omit<FoodEntry, 'id' | 'timestamp'>) => {
    onAddFood(food);
    onClose();
  };

  const onManualSubmit = (values: z.infer<typeof manualFormSchema>) => {
    handleAddFood(values);
    manualForm.reset();
  };

  const filteredFoods = mockFoodDatabase.filter(food =>
    food.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add Food to Your Log</DialogTitle>
        </DialogHeader>
        <Tabs defaultValue="search">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="search">Search</TabsTrigger>
            <TabsTrigger value="manual">Manual</TabsTrigger>
          </TabsList>
          <TabsContent value="search" className="py-4">
            <div className="space-y-4">
              <Input
                placeholder="Search for a food..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <ScrollArea className="h-60">
                <div className="space-y-2">
                  {filteredFoods.map(food => (
                    <div key={food.name} className="flex items-center justify-between p-2 border rounded-md">
                      <div>
                        <p className="font-medium">{food.name}</p>
                        <p className="text-sm text-gray-500">{food.calories} kcal / {food.defaultQuantity}</p>
                      </div>
                      <Button size="sm" onClick={() => handleAddFood({ name: food.name, calories: food.calories, quantity: food.defaultQuantity })}>
                        Add
                      </Button>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>
          </TabsContent>
          <TabsContent value="manual" className="py-4">
            <Form {...manualForm}>
              <form onSubmit={manualForm.handleSubmit(onManualSubmit)} className="space-y-4">
                <FormField control={manualForm.control} name="name" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Food Name</FormLabel>
                    <FormControl><Input placeholder="e.g., Homemade Salad" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={manualForm.control} name="quantity" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Quantity</FormLabel>
                    <FormControl><Input placeholder="e.g., 1 bowl" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={manualForm.control} name="calories" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Total Calories</FormLabel>
                    <FormControl><Input type="number" placeholder="e.g., 350" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <DialogFooter>
                  <Button type="submit">Add Manually</Button>
                </DialogFooter>
              </form>
            </Form>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};