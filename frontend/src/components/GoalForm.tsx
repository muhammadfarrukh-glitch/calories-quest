import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { UserGoals, updateUserGoals } from '@/utils/api';
import { useToast } from './ui/use-toast';

const formSchema = z.object({
  daily_calorie_goal: z.coerce.number().min(0),
  daily_protein_goal: z.coerce.number().min(0),
  daily_carb_goal: z.coerce.number().min(0),
  daily_fat_goal: z.coerce.number().min(0),
});

interface GoalFormProps {
  initialValues?: UserGoals;
  onSuccess?: () => void;
}

export function GoalForm({ initialValues, onSuccess }: GoalFormProps) {
  const { toast } = useToast();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: initialValues || {
      daily_calorie_goal: 2000,
      daily_protein_goal: 150,
      daily_carb_goal: 200,
      daily_fat_goal: 60,
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      const response = await updateUserGoals(values);
      if (response.ok) {
        toast({
          title: 'Success',
          description: 'Your goals have been updated.',
        });
        if (onSuccess) {
          onSuccess();
        }
      } else {
        toast({
          title: 'Error',
          description: 'Failed to update goals.',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'An unexpected error occurred.',
        variant: 'destructive',
      });
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="daily_calorie_goal"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Daily Calorie Goal</FormLabel>
              <FormControl>
                <Input type="number" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="daily_protein_goal"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Daily Protein Goal (g)</FormLabel>
              <FormControl>
                <Input type="number" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="daily_carb_goal"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Daily Carb Goal (g)</FormLabel>
              <FormControl>
                <Input type="number" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="daily_fat_goal"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Daily Fat Goal (g)</FormLabel>
              <FormControl>
                <Input type="number" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit">Save Goals</Button>
      </form>
    </Form>
  );
}