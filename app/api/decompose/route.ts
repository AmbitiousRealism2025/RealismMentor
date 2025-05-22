import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from '@google/genai';
import { z } from 'zod';

const apiKey = process.env.GOOGLE_API_KEY;
if (!apiKey) {
  throw new Error('GOOGLE_API_KEY is not set in environment variables');
}

const genAI = new GoogleGenerativeAI(apiKey);

const model = genAI.getGenerativeModel({
  model: 'gemini-1.5-pro-latest',
});

// Define the expected output structure using Zod for validation
const WeeklyTasksSchema = z.object({
  weeklyPlan: z.record(z.string(), z.array(z.string())),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const goal = body.goal;

    if (!goal || typeof goal !== 'string') {
      return NextResponse.json({ error: 'Goal is required and must be a string' }, { status: 400 });
    }

    console.log('Received goal for decomposition:', goal);

    const prompt = `Decompose the following user goal into actionable weekly tasks for the next 4 weeks. 
Provide the output as a valid JSON object with a single top-level key "weeklyPlan". 
This key should map to an object where each key is a week identifier (e.g., "week1", "week2") and its value is an array of task strings.

Example output format:
{
  "weeklyPlan": {
    "week1": ["Task A for week 1", "Task B for week 1"],
    "week2": ["Task C for week 2"]
  }
}

User Goal: "${goal}"

JSON Output:`;

    const generationConfig = {
      // responseMimeType: "application/json", // If supported and desired for stricter JSON output
      temperature: 0.7,
      // maxOutputTokens: 2048, // Adjust as needed
    };

    const safetySettings = [
      { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
      { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
      { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
      { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
    ];

    const result = await model.generateContent(
      prompt,
      // generationConfig, // generationConfig can be passed as second argument
      // safetySettings // safetySettings can be passed as third argument in some SDK versions or part of generationConfig
      // For the latest SDK, generationConfig and safetySettings are often part of the first argument object:
      // { contents: [{ parts: [{ text: prompt }] }], generationConfig, safetySettings }
      // Let's use the simpler direct prompt string first.
    );

    // const response = result.response; // This structure depends on the exact SDK version
    // let textOutput = response.text(); 
    // For some versions, it might be directly in result.candidates[0].content.parts[0].text
    // It's best to check the exact structure from an actual API call or SDK documentation
    // Let's assume a common structure for now for text()

    // A common way to get text, but check your SDK version for the exact method:
    let textOutput = '';
    if (result.response && typeof result.response.text === 'function') {
      textOutput = result.response.text();
    } else if (result.response && result.response.candidates && result.response.candidates[0].content && result.response.candidates[0].content.parts && result.response.candidates[0].content.parts[0].text) {
      textOutput = result.response.candidates[0].content.parts[0].text;
    } else {
      console.error('Unexpected response structure from Gemini:', JSON.stringify(result, null, 2));
      throw new Error('Failed to extract text from Gemini response.');
    }

    console.log("Raw Gemini output:", textOutput);

    // Attempt to parse the text output as JSON
    let parsedJson;
    try {
      // The LLM might sometimes return JSON wrapped in ```json ... ```, so try to strip that.
      const cleanedJsonString = textOutput.replace(/^```json\n?|\n?```$/g, '');
      parsedJson = JSON.parse(cleanedJsonString);
    } catch (parseError) {
      console.error('Failed to parse JSON from Gemini output:', parseError);
      console.error('Problematic string was:', textOutput);
      return NextResponse.json({ error: 'Failed to parse tasks from AI response. Output was not valid JSON.', rawOutput: textOutput }, { status: 500 });
    }

    // Validate the parsed JSON with Zod
    const validatedTasks = WeeklyTasksSchema.parse(parsedJson);

    return NextResponse.json(validatedTasks);

  } catch (error: any) {
    console.error('Error in /api/decompose:', error);
    let errorMessage = 'Failed to decompose goal';
    if (error.message) {
      errorMessage = error.message;
    }
    // If the error is from Zod, it will include details
    if (error.issues) {
      errorMessage = "Invalid data structure from AI: " + error.issues.map((issue: any) => `${issue.path.join('.')} - ${issue.message}`).join('; ');
    }
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
