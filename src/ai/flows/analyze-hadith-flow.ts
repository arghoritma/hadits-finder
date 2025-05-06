'use server';
/**
 * @fileOverview A Hadith analysis AI agent.
 *
 * - analyzeHadithFlow - A function that handles the Hadith analysis process.
 * - AnalyzeHadithInput - The input type for the analyzeHadithFlow function.
 * - AnalyzeHadithOutput - The return type for the analyzeHadithFlow function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'zod'; 

const AnalyzeHadithInputSchema = z.object({
  hadithText: z.string().describe('The text of the Hadith.'),
  rawi: z.string().optional().describe('The narrator (Rawi) of the Hadith.'),
  mohdith: z.string().optional().describe('The scholar/reporter (Mohdith) who graded or compiled the Hadith.'),
  book: z.string().optional().describe('The source book of the Hadith.'),
  grade: z.string().optional().describe('The authenticity grade of the Hadith (e.g., Sahih, Hasan, Dhaif).'),
  explainGrade: z.string().optional().describe('Explanation or clarification of the Hadith grade.'),
});
export type AnalyzeHadithInput = z.infer<typeof AnalyzeHadithInputSchema>;

const AnalyzeHadithOutputSchema = z.object({
  dirayahAnalysis: z.string().describe('Analysis of the Hadith content and meaning (Dirayah).'),
  riwayahAnalysis: z.string().describe('Analysis of the Hadith chain of narrators and authenticity (Riwayah).'),
  asbabAlWurudAnalysis: z.string().describe('Analysis of the context or reasons for the Hadith\'s pronouncement (Asbab al-Wurud).'),
});
export type AnalyzeHadithOutput = z.infer<typeof AnalyzeHadithOutputSchema>;

export async function analyzeHadith(input: AnalyzeHadithInput): Promise<AnalyzeHadithOutput> {
  return analyzeHadithFlow(input);
}

const analyzeHadithPrompt = ai.definePrompt({
  name: 'analyzeHadithPrompt',
  input: {schema: AnalyzeHadithInputSchema},
  output: {schema: AnalyzeHadithOutputSchema},
  prompt: `You are an expert Islamic scholar specializing in Hadith sciences (Ulum al-Hadith).
Analyze the provided Hadith based on its content (Dirayah), chain of narrators (Riwayah), and context of revelation/pronouncement (Asbab al-Wurud).
Provide a concise yet comprehensive analysis for each aspect in Arabic.

Hadith Details:
- Text (متن الحديث): {{{hadithText}}}
{{#if rawi}}- Narrator (الراوي): {{{rawi}}}{{/if}}
{{#if mohdith}}- Scholar/Reporter (المحدث): {{{mohdith}}}{{/if}}
{{#if book}}- Source Book (الكتاب): {{{book}}}{{/if}}
{{#if grade}}- Grade (درجة الصحة): {{{grade}}}{{/if}}
{{#if explainGrade}}- Explanation of Grade (توضيح درجة الصحة): {{{explainGrade}}}{{/if}}

Please structure your response into three distinct sections:
1.  تحليل الدراية (Dirayah Analysis): Discuss the meaning, implications, and any potential interpretations or scholarly discussions related to the Hadith text.
2.  تحليل الرواية (Riwayah Analysis): Briefly comment on aspects related to the chain of narrators, considering the provided grade, scholar, and book. Discuss how these elements contribute to the Hadith's authenticity.
3.  أسباب الورود (Asbab al-Wurud Analysis): If known or can be reasonably inferred from the Hadith text or common Islamic knowledge, explain the historical context, specific situation, or question that led to this Hadith being narrated. If not directly known, discuss possible general contexts or methodologies for determining it.

Ensure the analysis is thorough and reflects scholarly understanding. Output the analysis in Arabic.
`,
});

const analyzeHadithFlow = ai.defineFlow(
  {
    name: 'analyzeHadithFlow',
    inputSchema: AnalyzeHadithInputSchema,
    outputSchema: AnalyzeHadithOutputSchema,
  },
  async input => {
    const llmResponse = await analyzeHadithPrompt.generate({input: input, stream: false});
    const output = llmResponse.output; 
    if (!output) {
      throw new Error('AI analysis failed to produce output.');
    }
    return output;
  }
);
