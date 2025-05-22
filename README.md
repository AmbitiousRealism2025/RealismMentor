# Realism Mentor

This project aims to create an AI-powered application to help users decompose free-form goals into actionable weekly tasks.

## Progress So Far

1.  **Project Setup & Configuration**
    *   Directory structure created (`app/`, `components/`, `public/`, `styles/`)
    *   Core config files in place (`package.json`, `tsconfig.json`, `next.config.js`, `tailwind.config.js`, `postcss.config.js`, `.env.local` for API keys).
    *   Path alias `@/*` configured in `tsconfig.json`.
    *   Scripts & dependencies wired up.
    *   Basic Next.js 14 + TypeScript + Tailwind CSS app running (`app/layout.tsx`, `app/page.tsx`, `styles/globals.css`).
    *   Development server is operational.

2.  **Task 1: Goal-Decomposition Engine (In Progress)**
    *   Installed Genkit (`genkit`), Genkit Google AI Plugin (`@genkit-ai/googleai`), and Google Gen AI SDK (`@google/genai`).
    *   Attempted to integrate Genkit for the `/api/decompose` route, leading to module resolution and `TypeError` issues within the Next.js API route environment.
    *   Created `genkit.config.ts` to centralize Genkit configuration and flow definitions.
    *   Pivoted to using the `@google/genai` SDK directly within `app/api/decompose/route.ts` to simplify integration.
    *   The API route `app/api/decompose/route.ts` is set up to receive a goal, call the Gemini API using `@google/genai`, and validate the response with Zod.

## MVP Status

The MVP is complete. Users can now input a goal into a chat interface and receive a list of decomposed, actionable weekly tasks from the AI.

## MVP Testing Problem

During testing of the MVP, a persistent server-side error (HTTP 500) occurs when the `/api/decompose` endpoint is called. The error log consistently shows a `TypeError` related to the `@google/genai` SDK, specifically `googleGenAI.GoogleGenerativeAI is not a constructor` (or variations depending on the import method tried).

**Details:**
*   **Location:** The error originates in `app/api/decompose/route.ts` when attempting to instantiate `GoogleGenerativeAI`.
*   **Symptom:** The API returns a 500 error to the client, and the server log shows the `TypeError`.
*   **Attempts to Resolve:**
    *   Verified `GOOGLE_API_KEY` is correctly set in `.env.local` and the server is restarted.
    *   Tried different JavaScript import methods for the `@google/genai` SDK within the API route:
        *   Named imports (`import { GoogleGenerativeAI } from '@google/genai';`)
        *   Namespace imports (`import * as googleGenAI from '@google/genai';`)
        *   CommonJS require (`const googleGenAI = require('@google/genai');`)
    *   None of these import methods have resolved the `TypeError`.
*   **Suspected Cause:** The issue likely stems from an incompatibility or a subtle problem with how Next.js (specifically, its Webpack configuration for server-side API routes) handles the module structure or bundling of the `@google/genai` SDK. The SDK might be exporting modules in a way that isn't fully compatible with the Next.js App Router's API route execution environment, leading to the constructor not being recognized correctly at runtime on the server.

Further investigation is needed to resolve this module resolution/bundling issue with the `@google/genai` SDK within the Next.js API route environment.

## Future Enhancements & Next Steps

The core functionality of goal decomposition is in place. Future efforts can focus on improving the user experience and expanding features:

*   Enhanced UI/UX for displaying tasks (e.g., as a checklist, with more formatting).
*   User accounts and goal history.
*   Ability to edit, mark as complete, or further decompose individual tasks.
*   Integration with calendar or to-do list applications.
*   More sophisticated error handling and user feedback.
*   Refinements to the prompt used for goal decomposition for better results.

## MVP Task List
- **User Interface for Goal Input:** Implement a text input field in the `<ChatWindow />` component where users can enter their goals.
- **Display Decomposed Tasks:** Implement an area in the `<ChatWindow />` component to show the actionable weekly tasks returned by the `/api/decompose` endpoint.
- **Connect UI to API:** Wire up the `<ChatWindow />` component to send the user's goal to the `/api/decompose` API endpoint and display the response.
- **Basic Styling and Usability:** Apply essential styling to make the chat interface clear and easy to use.
- **End-to-End Testing:** Verify the complete flow from goal input to task display, ensuring functionality and error handling.

## Notes from Previous Troubleshooting

*   **Genkit in Next.js API Routes**: Initial attempts to use Genkit's `configureGenkit`, `defineFlow`, and `runFlow` directly within the Next.js API route or by importing flows defined in `genkit.config.ts` encountered persistent `TypeError` and module resolution issues. This suggests potential complexities with Genkit's framework expectations versus the Next.js API route execution environment. For the `/api/decompose` feature, we pivoted to the more direct `@google/genai` SDK approach.
