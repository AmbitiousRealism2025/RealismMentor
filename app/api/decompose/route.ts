import { NextRequest, NextResponse } from 'next/server';
// Use CommonJS require instead of ES import
const { GoogleGenAI, HarmCategory, HarmBlockThreshold } = require('@google/genai'); // Changed to GoogleGenAI
import { z } from 'zod';

const apiKey = process.env.GOOGLE_API_KEY;
if (!apiKey) {
  console.error('CRITICAL: GOOGLE_API_KEY is not set in environment variables');
  throw new Error('GOOGLE_API_KEY is not set in environment variables. The application will not work correctly.');
}

// Access GoogleGenerativeAI as a property of the required module
const genAI = new GoogleGenAI({ apiKey }); // Changed to GoogleGenAI

// const model = genAI.getGenerativeModel({ // Removed this line
//   model: 'gemini-1.5-pro-latest',
// });

const WeeklyTasksSchema = z.object({
  weeklyPlan: z.record(z.string(), z.array(z.string()))
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const goal = body.goal;

    if (!goal || typeof goal !== 'string') {
      return NextResponse.json({ error: 'Goal is required and must be a string' }, { status: 400 });
    }

    console.log('[API /api/decompose] Received goal for decomposition:', goal);

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
      responseMimeType: "application/json",
      temperature: 0.7,
    };

    // Access HarmCategory and HarmBlockThreshold through the required module object
    const safetySettings = [
      { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
      { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
      { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
      { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
    ];

    console.log('[API /api/decompose] Attempting to call Gemini API...');
    const result = await genAI.models.generateContent({ // Corrected: Use genAI.models.generateContent
      model: 'gemini-1.5-pro-latest', // Model specified directly in the call
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig: generationConfig,
      safetySettings: safetySettings,
    });
    
    console.log('[API /api/decompose] Full Gemini API result object:', JSON.stringify(result, null, 2));

    let textOutput = '';
    if (result.response && typeof result.response.text === 'function') {
      textOutput = result.response.text();
    } else if (result.response && result.response.candidates && result.response.candidates[0] && result.response.candidates[0].content && result.response.candidates[0].content.parts && result.response.candidates[0].content.parts[0].text) {
      textOutput = result.response.candidates[0].content.parts[0].text;
    } else {
      console.error('[API /api/decompose] Unexpected response structure from Gemini. Full result logged above.');
      let modelError = 'Failed to extract text from Gemini response.';
      if (result.response && result.response.promptFeedback && result.response.promptFeedback.blockReason) {
          modelError = `Content blocked by API: ${result.response.promptFeedback.blockReason}`;
           if (result.response.promptFeedback.blockReasonMessage) {
             modelError += ` - ${result.response.promptFeedback.blockReasonMessage}`;
           }
      } else if (result.response && result.response.candidates && result.response.candidates[0] && result.response.candidates[0].finishReason && result.response.candidates[0].finishReason !== 'STOP') {
          modelError = `Generation finished with reason: ${result.response.candidates[0].finishReason}`;
      }
      throw new Error(modelError);
    }

    console.log("[API /api/decompose] Raw Gemini text output:", textOutput);

    let parsedJson;
    try {
      const cleanedJsonString = textOutput.replace(/^```json\s*([\s\S]*?)\s*```$/gm, '$1').trim();
      parsedJson = JSON.parse(cleanedJsonString);
    } catch (parseError: any) {
      console.error('[API /api/decompose] Failed to parse JSON from Gemini output:', parseError.message);
      console.error('[API /api/decompose] Problematic string was:', textOutput);
      return NextResponse.json({ error: 'Failed to parse tasks from AI response. Output was not valid JSON.', details: parseError.message, rawOutput: textOutput }, { status: 500 });
    }

    const validatedTasks = WeeklyTasksSchema.parse(parsedJson);
    console.log('[API /api/decompose] Successfully decomposed goal and validated tasks.');
    return NextResponse.json(validatedTasks);

  } catch (error: any) {
    console.error('[API /api/decompose] Full error object in catch block:', error);
    if (error.stack) {
      console.error('[API /api/decompose] Error stack:', error.stack);
    }
    let errorMessage = 'Failed to decompose goal';
    let errorDetails = error.message || 'No additional details.';

    if (error.issues) { // Zod validation error
      errorMessage = "Invalid data structure from AI.";
      errorDetails = error.issues.map((issue: any) => `${issue.path.join('.')} - ${issue.message}`).join('; ');
    }
    return NextResponse.json({ error: errorMessage, details: errorDetails }, { status: 500 });
  }
}
