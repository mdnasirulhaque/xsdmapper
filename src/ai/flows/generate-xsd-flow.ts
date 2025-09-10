'use server';
/**
 * @fileOverview An AI flow to generate an XSD schema from an XML file.
 *
 * - generateXsd - A function that takes an XML string and returns a generated XSD schema.
 * - GenerateXsdInput - The input type for the generateXsd function.
 * - GenerateXsdOutput - The return type for the generateXsd function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateXsdInputSchema = z.object({
  xml: z.string().describe('The XML content as a string.'),
});
export type GenerateXsdInput = z.infer<typeof GenerateXsdInputSchema>;

const GenerateXsdOutputSchema = z.object({
  xsd: z.string().describe('The generated XSD schema as a string.'),
});
export type GenerateXsdOutput = z.infer<typeof GenerateXsdOutputSchema>;

export async function generateXsd(input: GenerateXsdInput): Promise<GenerateXsdOutput> {
  return generateXsdFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateXsdPrompt',
  input: {schema: GenerateXsdInputSchema},
  output: {schema: GenerateXsdOutputSchema},
  prompt: `You are an expert in XML and XSD schemas. Your task is to generate a valid XSD schema from the provided XML content.

The generated XSD should accurately represent the structure, elements, and data types found in the XML.
- Infer data types (e.g., xs:string, xs:integer, xs:date) as accurately as possible.
- Define complex types for nested elements.
- Ensure the generated XSD is well-formed and valid.
- Do not include any explanations, comments, or markdown formatting in your response. Only output the raw XSD string.

XML Content:
{{{xml}}}
`,
});

const generateXsdFlow = ai.defineFlow(
  {
    name: 'generateXsdFlow',
    inputSchema: GenerateXsdInputSchema,
    outputSchema: GenerateXsdOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
