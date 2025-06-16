'use server';

/**
 * @fileOverview An AI-powered career assessment flow.
 *
 * - careerAssessment - A function that provides personalized job/internship recommendations based on skills and interests.
 * - CareerAssessmentInput - The input type for the careerAssessment function.
 * - CareerAssessmentOutput - The return type for the careerAssessment function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const CareerAssessmentInputSchema = z.object({
  skills: z
    .string()
    .describe('A list of skills that the user possesses, separated by commas.'),
  interests: z
    .string()
    .describe('A list of interests that the user has, separated by commas.'),
});
export type CareerAssessmentInput = z.infer<typeof CareerAssessmentInputSchema>;

const CareerAssessmentOutputSchema = z.object({
  careerRecommendations: z
    .string()
    .describe(
      'A list of career recommendations based on the provided skills and interests.'
    ),
  skillDevelopmentAreas: z
    .string()
    .describe(
      'A list of skill development areas to focus on based on the recommended careers.'
    ),
});
export type CareerAssessmentOutput = z.infer<typeof CareerAssessmentOutputSchema>;

export async function careerAssessment(input: CareerAssessmentInput): Promise<CareerAssessmentOutput> {
  return careerAssessmentFlow(input);
}

const prompt = ai.definePrompt({
  name: 'careerAssessmentPrompt',
  input: {schema: CareerAssessmentInputSchema},
  output: {schema: CareerAssessmentOutputSchema},
  prompt: `You are a career counselor. A student will provide you with a list of their skills and interests. You will use this information to provide a list of potential career recommendations, and a list of skill development areas to focus on to pursue those careers.

Skills: {{{skills}}}
Interests: {{{interests}}}

Provide career recommendations, and skill development areas in a single paragraph.`,
});

const careerAssessmentFlow = ai.defineFlow(
  {
    name: 'careerAssessmentFlow',
    inputSchema: CareerAssessmentInputSchema,
    outputSchema: CareerAssessmentOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
