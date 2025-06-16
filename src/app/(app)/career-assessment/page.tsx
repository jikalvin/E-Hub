'use client';

import type { CareerAssessmentInput, CareerAssessmentOutput } from '@/ai/flows/career-assessment';
import { careerAssessment } from '@/ai/flows/career-assessment';
import { PageHeader } from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'; // Removed FormDescription as it's not used
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, Sparkles } from 'lucide-react';
import { useState, type FormEvent } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
// AuthGuard is now handled by the (app) layout

const formSchema = z.object({
  skills: z.string().min(10, { message: 'Please list some of your skills (at least 10 characters).' }),
  interests: z.string().min(10, { message: 'Please tell us about your interests (at least 10 characters).' }),
});

type FormData = z.infer<typeof formSchema>;

export default function CareerAssessmentPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<CareerAssessmentOutput | null>(null);
  const { toast } = useToast();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      skills: '',
      interests: '',
    },
  });

  async function onSubmit(values: FormData) {
    setIsLoading(true);
    setResult(null);
    try {
      const assessmentInput: CareerAssessmentInput = {
        skills: values.skills,
        interests: values.interests,
      };
      const response = await careerAssessment(assessmentInput);
      setResult(response);
    } catch (error) {
      console.error('Career assessment failed:', error);
      toast({
        title: 'Error',
        description: 'Failed to get career assessment. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="container mx-auto">
      <PageHeader
        title="AI Career Assessment"
        description="Let our AI help you discover personalized job and internship recommendations based on your skills and interests."
      />

      <Card className="mb-8 shadow-lg">
        <CardHeader>
          <CardTitle className="font-headline text-xl">Tell Us About Yourself</CardTitle>
          <CardDescription>The more detail you provide, the better our AI can assist you.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="skills"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Your Skills</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="e.g., JavaScript, Python, project management, graphic design, communication..."
                        className="min-h-[100px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                    {/* <FormDescription> 
                      List your technical and soft skills, separated by commas or new lines.
                    </FormDescription> */}
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="interests"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Your Interests</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="e.g., technology, education, healthcare, sustainability, art, entrepreneurship..."
                        className="min-h-[100px]"
                        {...field}
                      />
                    </FormControl>
                     <FormMessage />
                    {/* <FormDescription>
                      Describe your hobbies, passions, and areas you'd like to work in.
                    </FormDescription> */}
                  </FormItem>
                )}
              />
              <Button type="submit" disabled={isLoading} className="w-full md:w-auto">
                {isLoading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Sparkles className="mr-2 h-4 w-4" />
                )}
                Get My Assessment
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {isLoading && (
        <Card className="text-center p-8 shadow-lg">
          <Loader2 className="mx-auto h-12 w-12 animate-spin text-primary" />
          <p className="mt-4 text-lg text-muted-foreground">
            Our AI is analyzing your profile... This may take a moment.
          </p>
        </Card>
      )}

      {result && !isLoading && (
        <Card className="shadow-xl animate-in fade-in-50 duration-500">
          <CardHeader>
            <CardTitle className="font-headline text-2xl text-primary">Your Personalized Career Insights</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h3 className="font-headline text-xl font-semibold mb-2">Career Recommendations:</h3>
              <p className="text-md whitespace-pre-line leading-relaxed bg-muted p-4 rounded-md">
                {result.careerRecommendations}
              </p>
            </div>
            <div>
              <h3 className="font-headline text-xl font-semibold mb-2">Skill Development Areas:</h3>
              <p className="text-md whitespace-pre-line leading-relaxed bg-muted p-4 rounded-md">
                {result.skillDevelopmentAreas}
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
