'use server';

/**
 * @fileOverview An AI-powered interview preparation flow.
 *
 * - interviewPreparation - A function that generates interview questions and provides feedback on answers.
 * - InterviewPreparationInput - The input type for the interviewPreparation function.
 * - InterviewPreparationOutput - The return type for the interviewPreparation function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const InterviewPreparationInputSchema = z.object({
  jobDescription: z
    .string()
    .describe('The description of the job the user is interviewing for.'),
  userSkills: z.array(z.string()).describe('The skills of the user.'),
  userAnswer: z.string().optional().describe('The user provided answer to the last question, if any.'),
  questionNumber: z.number().describe('The question number in the interview.'),
});
export type InterviewPreparationInput = z.infer<typeof InterviewPreparationInputSchema>;

const InterviewPreparationOutputSchema = z.object({
  question: z.string().describe('The generated interview question.'),
  feedback: z.string().optional().describe('Feedback on the user provided answer, if any.'),
});
export type InterviewPreparationOutput = z.infer<typeof InterviewPreparationOutputSchema>;

export async function interviewPreparation(input: InterviewPreparationInput): Promise<InterviewPreparationOutput> {
  return interviewPreparationFlow(input);
}

const interviewPreparationPrompt = ai.definePrompt({
  name: 'interviewPreparationPrompt',
  input: {schema: InterviewPreparationInputSchema},
  output: {schema: InterviewPreparationOutputSchema},
  prompt: `You are an expert career coach helping a candidate prepare for an interview.

The job they are interviewing for has the following description:

{{jobDescription}}

The candidate has the following skills:

{{#if userSkills}}
User Skills:
{{#each userSkills}}
 - {{{this}}}
{{/each}}
{{else}}
No skills listed.
{{/if}}

You are now on question number {{questionNumber}} of the interview.

{{#if userAnswer}}
The candidate answered the previous question with the following:

{{{userAnswer}}}

Provide feedback on their answer. Be specific, and give concrete suggestions for improvement.
{{/if}}

Generate the next interview question. Focus on questions that will evaluate the candidate's skills and experience in relation to the job description.

Be sure to ask questions that are relevant to the job description and the candidate's skills.

Output the question and feedback in the following JSON format:

{
  "question": "The generated interview question.",
  "feedback": "Feedback on the user provided answer, if any."
}
`,
});

const interviewPreparationFlow = ai.defineFlow(
  {
    name: 'interviewPreparationFlow',
    inputSchema: InterviewPreparationInputSchema,
    outputSchema: InterviewPreparationOutputSchema,
  },
  async input => {
    const {output} = await interviewPreparationPrompt(input);
    return output!;
  }
);
