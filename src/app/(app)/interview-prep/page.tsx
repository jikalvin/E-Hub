'use client';

import type { InterviewPreparationInput, InterviewPreparationOutput } from '@/ai/flows/interview-preparation';
import { interviewPreparation } from '@/ai/flows/interview-preparation';
import { PageHeader } from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription as ShadCNCardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, MessageCircle, Send, Sparkles, ThumbsUp, Pencil } from 'lucide-react';
import { useState, type FormEvent, useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
// AuthGuard is now handled by the (app) layout

const initialFormSchema = z.object({
  jobDescription: z.string().min(20, { message: 'Job description must be at least 20 characters.' }),
  userSkills: z.string().min(5, { message: 'Please list some skills (at least 5 characters).' }),
});
type InitialFormData = z.infer<typeof initialFormSchema>;

const answerFormSchema = z.object({
  userAnswer: z.string().min(1, { message: 'Please provide an answer.' }),
});
type AnswerFormData = z.infer<typeof answerFormSchema>;

interface ChatMessage {
  type: 'question' | 'answer' | 'feedback';
  content: string;
}

export default function InterviewPrepPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [interviewState, setInterviewState] = useState<InterviewPreparationInput | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState<string | null>(null);
  // const [currentFeedback, setCurrentFeedback] = useState<string | null>(null); // currentFeedback is part of chatHistory
  const [questionNumber, setQuestionNumber] = useState(1);
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  const { toast } = useToast();

  const initialForm = useForm<InitialFormData>({
    resolver: zodResolver(initialFormSchema),
    defaultValues: { jobDescription: '', userSkills: '' },
  });

  const answerForm = useForm<AnswerFormData>({
    resolver: zodResolver(answerFormSchema),
    defaultValues: { userAnswer: '' },
  });

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [chatHistory]);

  async function startInterview(values: InitialFormData) {
    setIsLoading(true);
    setCurrentQuestion(null);
    // setCurrentFeedback(null);
    setChatHistory([]);
    setQuestionNumber(1);

    const prepInput: InterviewPreparationInput = {
      jobDescription: values.jobDescription,
      userSkills: values.userSkills.split(',').map(skill => skill.trim()).filter(skill => skill),
      questionNumber: 1,
    };
    setInterviewState(prepInput);

    try {
      const response = await interviewPreparation(prepInput);
      setCurrentQuestion(response.question);
      setChatHistory([{ type: 'question', content: response.question }]);
      if (response.feedback) {
        // setCurrentFeedback(response.feedback);
        setChatHistory(prev => [...prev, { type: 'feedback', content: response.feedback! }]);
      }
    } catch (error) {
      console.error('Interview start failed:', error);
      toast({ title: 'Error', description: 'Failed to start interview. Please try again.', variant: 'destructive' });
      setInterviewState(null); 
    } finally {
      setIsLoading(false);
    }
  }

  async function submitAnswer(values: AnswerFormData) {
    if (!interviewState || !currentQuestion) return;
    setIsLoading(true);
    
    setChatHistory(prev => [...prev, { type: 'answer', content: values.userAnswer }]);

    const prepInput: InterviewPreparationInput = {
      ...interviewState,
      userAnswer: values.userAnswer,
      questionNumber: questionNumber, // This is actually the number of the question just answered. The AI will generate the *next* question.
    };

    try {
      const response = await interviewPreparation(prepInput);
      
      let newMessages: ChatMessage[] = [];
      if (response.feedback) {
        // setCurrentFeedback(response.feedback);
        newMessages.push({ type: 'feedback', content: response.feedback });
      }
      newMessages.push({ type: 'question', content: response.question });
      setChatHistory(prev => [...prev, ...newMessages]);
      
      setCurrentQuestion(response.question); // Set the new current question
      setQuestionNumber(prev => prev + 1); // Increment for the *next* cycle
      answerForm.reset(); 

    } catch (error) {
      console.error('Interview continuation failed:', error);
      toast({ title: 'Error', description: 'Failed to get next question/feedback. Please try again.', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  }

  const restartInterview = () => {
    setInterviewState(null);
    setCurrentQuestion(null);
    // setCurrentFeedback(null);
    setChatHistory([]);
    setQuestionNumber(1);
    initialForm.reset();
    answerForm.reset();
  }

  if (!interviewState) {
    return (
      <div className="container mx-auto">
        <PageHeader
          title="AI Interview Preparation"
          description="Practice for your upcoming interview with AI-generated questions and feedback."
        />
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="font-headline text-xl">Setup Your Mock Interview</CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...initialForm}>
              <form onSubmit={initialForm.handleSubmit(startInterview)} className="space-y-6">
                <FormField
                  control={initialForm.control}
                  name="jobDescription"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Job Description</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Paste the job description here..." className="min-h-[150px]" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={initialForm.control}
                  name="userSkills"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Your Key Skills</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Java, Communication, Teamwork (comma-separated)" {...field} />
                      </FormControl>
                      <FormDescription>List skills relevant to the job you're applying for.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" disabled={isLoading} className="w-full md:w-auto">
                  {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
                  Start Interview
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto flex flex-col h-[calc(100vh-10rem)]">
      <PageHeader title="Mock Interview in Progress" description={`Question ${questionNumber}`} />
      
      <div ref={chatContainerRef} className="flex-grow overflow-y-auto space-y-4 p-4 mb-4 bg-muted/50 rounded-lg border">
        {chatHistory.map((msg, index) => (
          <div key={index} className={`flex ${msg.type === 'answer' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] p-3 rounded-xl shadow-md ${
              msg.type === 'question' ? 'bg-primary text-primary-foreground' : 
              msg.type === 'answer' ? 'bg-card border' : 
              'bg-accent text-accent-foreground'
            }`}>
              <div className="flex items-center gap-2 mb-1 text-xs font-medium">
                {msg.type === 'question' && <MessageCircle className="h-4 w-4" />}
                {msg.type === 'answer' && <Pencil className="h-4 w-4" />}
                {msg.type === 'feedback' && <ThumbsUp className="h-4 w-4" />}
                <span className="font-headline">{msg.type.charAt(0).toUpperCase() + msg.type.slice(1)}</span>
              </div>
              <p className="whitespace-pre-wrap text-sm">{msg.content}</p>
            </div>
          </div>
        ))}
        {isLoading && chatHistory.length > 0 && chatHistory[chatHistory.length -1].type === 'answer' && (
             <div className="flex justify-start">
                <div className="max-w-[70%] p-3 rounded-lg bg-muted">
                    <Loader2 className="h-5 w-5 animate-spin text-primary" />
                </div>
            </div>
        )}
      </div>

      <Form {...answerForm}>
        <form onSubmit={answerForm.handleSubmit(submitAnswer)} className="flex items-start gap-2 p-2 border-t">
          <FormField
            control={answerForm.control}
            name="userAnswer"
            render={({ field }) => (
              <FormItem className="flex-grow">
                <FormControl>
                  <Textarea placeholder="Type your answer here..." className="min-h-[60px] resize-none" {...field} disabled={isLoading || !currentQuestion} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit" disabled={isLoading || !currentQuestion} size="lg">
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            <span className="sr-only">Send Answer</span>
          </Button>
        </form>
      </Form>
      <Button onClick={restartInterview} variant="outline" className="mt-4 w-full md:w-auto self-center">
        Restart Interview
      </Button>
    </div>
  );
}
