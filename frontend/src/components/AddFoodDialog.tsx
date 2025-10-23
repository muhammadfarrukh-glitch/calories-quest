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
import { X, Loader2 } from 'lucide-react';
import { FoodSearchItem } from './FoodSearchItem';

interface AddFoodDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onAddFood: (entry: Omit<FoodEntry, 'id' | 'timestamp'>) => Promise<void>;
}

const manualFormSchema = z.object({
  food_name: z.string().min(1, "Food name is required"),
  quantity: z.string().min(1, "Quantity is required"),
  calories: z.coerce.number().min(0, "Calories must be a positive number"),
  protein: z.coerce.number().min(0, "Protein must be a positive number"),
  carbs: z.coerce.number().min(0, "Carbs must be a positive number"),
  fat: z.coerce.number().min(0, "Fat must be a positive number"),
});

export const AddFoodDialog = ({ isOpen, onClose, onAddFood }: AddFoodDialogProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const manualForm = useForm<z.infer<typeof manualFormSchema>>({
    resolver: zodResolver(manualFormSchema),
    defaultValues: {
      protein: 0,
      carbs: 0,
      fat: 0,
    },
  });

  const handleAddFood = async (food: Omit<FoodEntry, 'id' | 'timestamp'>) => {
    setIsLoading(true);
    try {
      await onAddFood(food);
      onClose();
    } finally {
      setIsLoading(false);
    }
  };

  const onManualSubmit = (values: z.infer<typeof manualFormSchema>) => {
    handleAddFood(values as Omit<FoodEntry, 'id' | 'timestamp'>);
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
        <DialogClose asChild>
          <button
            onClick={onClose}
            className="absolute top-4 right-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground"
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </button>
        </DialogClose>
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
                    <FoodSearchItem key={food.name} food={food} onAdd={handleAddFood} />
                  ))}
                </div>
              </ScrollArea>
            </div>
          </TabsContent>
          <TabsContent value="manual" className="py-4">
            <Form {...manualForm}>
              <form onSubmit={manualForm.handleSubmit(onManualSubmit)} className="space-y-4">
                <FormField control={manualForm.control} name="food_name" render={({ field }) => (
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
                <div className="grid grid-cols-3 gap-4">
                  <FormField control={manualForm.control} name="protein" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Protein (g)</FormLabel>
                      <FormControl><Input type="number" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={manualForm.control} name="carbs" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Carbs (g)</FormLabel>
                      <FormControl><Input type="number" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={manualForm.control} name="fat" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Fat (g)</FormLabel>
                      <FormControl><Input type="number" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                </div>
                <DialogFooter>
                  <Button type="submit" disabled={isLoading}>
                    {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                    {isLoading ? "Adding..." : "Add Manually"}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};