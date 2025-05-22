import { configureGenkit, defineFlow } from 'genkit';
import { googleAI } from '@genkit-ai/googleai';
import { z } from 'zod';

// Define the expected output structure using Zod for validation
const WeeklyTasksSchema = z.object({
  weeklyPlan: z.record(z.string(), z.array(z.string())),
});

// Define the Genkit flow for goal decomposition
export const decomposeGoalFlow = defineFlow(
  {
    name: 'decomposeGoalFlow',
    inputSchema: z.string(), // Expects the goal as a string
    outputSchema: WeeklyTasksSchema,
  },
  async (goal: string) => {
    const model = googleAI.model('gemini-1.5-pro-latest');

    const prompt = `Decompose the following user goal into actionable weekly tasks for the next 4 weeks. 
Provide the output as a valid JSON object with keys like "week1", "week2", etc., where each key maps to an array of task strings.

User Goal: "${goal}"

JSON Output:`;

    try {
      const result = await model.generate({
        prompt: prompt,
        output: {
          format: 'json',
          schema: WeeklyTasksSchema,
        },
      });

      const jsonOutput = result.output();
      if (!jsonOutput) {
        throw new Error('No output from model or output is not valid JSON.');
      }
      const validatedTasks = WeeklyTasksSchema.parse(jsonOutput);
      return validatedTasks;

    } catch (e) {
      console.error("Error in Genkit flow:", e);
      throw new Error('Failed to generate tasks from Gemini model.');
    }
  }
);

export default configureGenkit({
  plugins: [
    googleAI({ apiKey: process.env.GOOGLE_API_KEY }),
  ],
  flows: [decomposeGoalFlow], // Register the flow with Genkit
  logLevel: 'debug',
  enableTracingAndMetrics: false, // Keeping this false for now
});
