'use server';
/**
 * @fileOverview A Hadith translation AI agent.
 *
 * - translateHadith - A function that handles the Hadith translation process.
 * - TranslateHadithInput - The input type for the translateHadith function.
 * - TranslateHadithOutput - The return type for the translateHadith function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'zod';

const TranslateHadithInputSchema = z.object({
  hadithText: z.string().describe('The original Arabic Hadith text to be translated.'),
});
export type TranslateHadithInput = z.infer<typeof TranslateHadithInputSchema>;

const TranslateHadithOutputSchema = z.object({
  translatedText: z.string().describe('The Indonesian translation of the Hadith text.'),
});
export type TranslateHadithOutput = z.infer<typeof TranslateHadithOutputSchema>;

export async function translateHadith(input: TranslateHadithInput): Promise<TranslateHadithOutput> {
  return translateHadithFlow(input);
}

const prompt = ai.definePrompt({
  name: 'translateHadithPrompt',
  input: {schema: TranslateHadithInputSchema},
  output: {schema: TranslateHadithOutputSchema},
  prompt: `You are an expert translator. Translate the following Arabic Hadith text accurately into Indonesian.
Provide only the Indonesian translation text, without any introductory phrases, explanations, or any other text apart from the translation itself.

Arabic Hadith Text:
{{{hadithText}}}
`,
});

const translateHadithFlow = ai.defineFlow(
  {
    name: 'translateHadithFlow',
    inputSchema: TranslateHadithInputSchema,
    outputSchema: TranslateHadithOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    if (!output) {
      throw new Error('AI translation failed to produce output.');
    }
    return output;
  }
);
