import { useEffect, useState } from 'react';
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
import Layout from '@/components/Layout';
import { showSuccess, showError } from '@/utils/toast';
import api from '@/utils/api';
import { GoalForm } from '@/components/GoalForm';

const formSchema = z.object({
  age: z.coerce.number().min(13, "Must be at least 13 years old"),
  gender: z.enum(['male', 'female']),
  height: z.coerce.number().min(100, "Height must be in cm"),
  weight: z.coerce.number().min(30, "Weight must be in kg"),
  activityLevel: z.enum(['sedentary', 'light', 'moderate', 'active', 'very_active']),
  goal: z.enum(['lose', 'maintain', 'gain']),
});

const Profile = () => {
  const navigate = useNavigate();
  // In a real app, you'd fetch this from the server
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await api('/api/users/profile');
        if (response.ok) {
          const data = await response.json();
          setUserProfile(data);
          form.reset(data);
        }
      } catch (error) {
        console.error('Failed to fetch profile', error);
      }
    };

    fetchProfile();
  }, []);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: userProfile,
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      const response = await api('/api/users/profile', {
        method: 'PUT',
        body: JSON.stringify(values),
      });

      if (response.ok) {
        showSuccess("Profile updated successfully!");
      } else {
        const errorData = await response.json();
        showError(errorData.msg || "Failed to update profile.");
      }
    } catch (error) {
      showError("An error occurred while updating the profile.");
    }
  }

  return (
    <Layout>
      <div className="space-y-6">
        <Card className="w-full max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle className="text-2xl">Your Profile</CardTitle>
            <CardDescription>Update your personal information and goals here.</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField control={form.control} name="age" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Age</FormLabel>
                      <FormControl><Input type="number" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="gender" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Gender</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
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
                      <FormControl><Input type="number" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="weight" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Weight (kg)</FormLabel>
                      <FormControl><Input type="number" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                </div>
                <FormField control={form.control} name="activityLevel" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Activity Level</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                      <SelectContent>
                        <SelectItem value="sedentary">Sedentary</SelectItem>
                        <SelectItem value="light">Lightly active</SelectItem>
                        <SelectItem value="moderate">Moderately active</SelectItem>
                        <SelectItem value="active">Very active</SelectItem>
                        <SelectItem value="very_active">Extra active</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="goal" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Primary Goal</FormLabel>
                    <FormControl>
                      <RadioGroup onValueChange={field.onChange} value={field.value} className="flex space-x-4">
                        <FormItem className="flex items-center space-x-2"><FormControl><RadioGroupItem value="lose" /></FormControl><FormLabel className="font-normal">Lose Weight</FormLabel></FormItem>
                        <FormItem className="flex items-center space-x-2"><FormControl><RadioGroupItem value="maintain" /></FormControl><FormLabel className="font-normal">Maintain Weight</FormLabel></FormItem>
                        <FormItem className="flex items-center space-x-2"><FormControl><RadioGroupItem value="gain" /></FormControl><FormLabel className="font-normal">Gain Muscle</FormLabel></FormItem>
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <div className="flex justify-end space-x-2">
                  <Button type="submit">Save Changes</Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
        <Card className="w-full max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle className="text-2xl">Nutritional Goals</CardTitle>
            <CardDescription>Update your daily nutritional goals.</CardDescription>
          </CardHeader>
          <CardContent>
            {userProfile && <GoalForm initialValues={userProfile} />}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default Profile;