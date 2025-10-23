import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { calculateDailyCalorieTarget } from '@/lib/bmr';
import { UserProfile } from '@/types';
import { GoalForm } from '@/components/GoalForm';
import { updateUserGoals } from '@/utils/api';

const formSchema = z.object({
  age: z.coerce.number().min(13, "Must be at least 13 years old"),
  gender: z.enum(['male', 'female']),
  height: z.coerce.number().min(100, "Height must be in cm"),
  weight: z.coerce.number().min(30, "Weight must be in kg"),
  activityLevel: z.enum(['sedentary', 'light', 'moderate', 'active', 'very_active']),
  goal: z.enum(['lose', 'maintain', 'gain']),
});

const Onboarding = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      gender: 'male',
      activityLevel: 'moderate',
      goal: 'maintain',
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    const profile = values as UserProfile;
    setUserProfile(profile);
    const dailyCalorieTarget = calculateDailyCalorieTarget(profile);
    localStorage.setItem('userProfile', JSON.stringify(profile));
    localStorage.setItem('quest', JSON.stringify({ dailyCalorieTarget }));
    setStep(2);
  }

  const handleGoalSuccess = () => {
    localStorage.setItem('isLoggedIn', 'true');
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-lg">
        <CardHeader>
          {step === 1 ? (
            <>
              <CardTitle className="text-2xl">Start Your Quest!</CardTitle>
              <CardDescription>Tell us a bit about yourself to calculate your daily needs.</CardDescription>
            </>
          ) : (
            <>
              <CardTitle className="text-2xl">Set Your Goals</CardTitle>
              <CardDescription>Set your daily nutritional goals to personalize your quest.</CardDescription>
            </>
          )}
        </CardHeader>
        <CardContent>
          {step === 1 ? (
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField control={form.control} name="age" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Age</FormLabel>
                      <FormControl><Input type="number" placeholder="e.g., 25" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="gender" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Gender</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl><SelectTrigger><SelectValue placeholder="Select gender" /></SelectTrigger></FormControl>
                        <SelectContent>
                          <SelectItem value="male">Male</SelectItem>
                          <SelectItem value="female">Female</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="height" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Height (cm)</FormLabel>
                      <FormControl><Input type="number" placeholder="e.g., 180" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="weight" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Weight (kg)</FormLabel>
                      <FormControl><Input type="number" placeholder="e.g., 75" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                </div>
                <FormField control={form.control} name="activityLevel" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Activity Level</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl><SelectTrigger><SelectValue placeholder="Select activity level" /></SelectTrigger></FormControl>
                      <SelectContent>
                        <SelectItem value="sedentary">Sedentary (little or no exercise)</SelectItem>
                        <SelectItem value="light">Lightly active (light exercise/sports 1-3 days/week)</SelectItem>
                        <SelectItem value="moderate">Moderately active (moderate exercise/sports 3-5 days/week)</SelectItem>
                        <SelectItem value="active">Very active (hard exercise/sports 6-7 days a week)</SelectItem>
                        <SelectItem value="very_active">Extra active (very hard exercise/physical job)</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="goal" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Primary Goal</FormLabel>
                    <FormControl>
                      <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-4">
                        <FormItem className="flex items-center space-x-3 space-y-0">
                          <FormControl><RadioGroupItem value="lose" /></FormControl>
                          <FormLabel className="font-normal">Lose Weight</FormLabel>
                        </FormItem>
                        <FormItem className="flex items-center space-x-3 space-y-0">
                          <FormControl><RadioGroupItem value="maintain" /></FormControl>
                          <FormLabel className="font-normal">Maintain Weight</FormLabel>
                        </FormItem>
                        <FormItem className="flex items-center space-x-3 space-y-0">
                          <FormControl><RadioGroupItem value="gain" /></FormControl>
                          <FormLabel className="font-normal">Gain Muscle</FormLabel>
                        </FormItem>
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <Button type="submit" className="w-full">Next</Button>
              </form>
            </Form>
          ) : (
            <GoalForm onSuccess={handleGoalSuccess} />
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Onboarding;