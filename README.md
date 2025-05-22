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
    *   Successfully resolved `TypeError` issues related to `@google/genai` SDK instantiation and method calls within the API route by correcting import methods and usage patterns.
    *   Fixed a UI bug in `components/ChatWindow.tsx` where it incorrectly expected `data.decomposedTasks` instead of `data.weeklyPlan` from the API and updated display logic for `weeklyPlan`.

## MVP Status

The core codebase for the MVP functionality is now complete. This includes:
*   A functional API route (`app/api/decompose/route.ts`) that correctly integrates with the `@google/genai` SDK to call the Gemini API.
*   A user interface (`components/ChatWindow.tsx`) that allows users to input goals and is designed to display the AI's response.
*   Fixes for previously identified critical bugs related to SDK usage and UI data handling.

However, the MVP is **not currently fully operational.** End-to-end testing has revealed that the final step of successfully fetching results from the Google AI service is blocked. This is because the service requires a **valid `GOOGLE_API_KEY`**, and the key available in the testing environment is not valid.

With a valid `GOOGLE_API_KEY` configured in the environment, the application is expected to function as intended.

## MVP Testing Status & Current Blocker

**Initial Problem (Resolved):**
*   Previously, testing was blocked by a persistent server-side `TypeError` in `app/api/decompose/route.ts` related to the `@google/genai` SDK (e.g., `GoogleGenerativeAI is not a constructor` or `genAI.getGenerativeModel is not a function`).
*   **Resolution:** These SDK-related TypeErrors have been **fixed** by:
    *   Switching to CommonJS `require` for the `@google/genai` module.
    *   Using the correct constructor name (`GoogleGenAI`).
    *   Calling the AI model methods correctly (e.g., `genAI.models.generateContent()`).

**UI Bug (Resolved):**
*   A bug was identified in `components/ChatWindow.tsx` where it expected `data.decomposedTasks` from the API, while the API returns `data.weeklyPlan`. The display logic was also updated to correctly format the `weeklyPlan` object.
*   **Resolution:** This has been **fixed**. The UI now correctly processes the `weeklyPlan` field.

**Current Blocker:**
*   **Valid `GOOGLE_API_KEY` Required:** End-to-end tests show that the application, while structurally sound, fails to retrieve data from the Google AI service. The service returns a 400 Bad Request error, indicating that the `GOOGLE_API_KEY` being used is invalid.
*   **Symptom:** The `/api/decompose` route returns an HTTP 500 error to the client, with details pointing to the "API key not valid" error from the external service.
*   **Next Step for Operation:** The application requires a valid `GOOGLE_API_KEY` to be properly configured in its deployment or testing environment to become fully operational.

## Future Enhancements & Next Steps

With the core functionality coded and pending a valid API key for operation, future efforts can focus on improving the user experience and expanding features:

*   Enhanced UI/UX for displaying tasks (e.g., as a checklist, with more formatting).
*   User accounts and goal history.
*   Ability to edit, mark as complete, or further decompose individual tasks.
*   Integration with calendar or to-do list applications.
*   More sophisticated error handling and user feedback.
*   Refinements to the prompt used for goal decomposition for better results.

## MVP Task List
- **User Interface for Goal Input:** Implemented. Users can enter goals in `<ChatWindow />`.
- **Display Decomposed Tasks:** Implemented. `<ChatWindow />` can display AI responses, and logic to format `weeklyPlan` data is in place.
- **Connect UI to API:** Implemented. `<ChatWindow />` sends goals to `/api/decompose` and handles responses.
- **Basic Styling and Usability:** Implemented. The chat interface is styled with Tailwind CSS and is usable.
- **End-to-End Testing:** Performed. Core application logic is sound. Functionality is currently blocked by the need for a valid `GOOGLE_API_KEY`.
- **Configure Valid `GOOGLE_API_KEY`:** **Required for full MVP operation.** The application needs a valid API key to successfully fetch results from the Google AI service.

## Notes from Previous Troubleshooting

*   **Genkit in Next.js API Routes**: Initial attempts to use Genkit's `configureGenkit`, `defineFlow`, and `runFlow` directly within the Next.js API route or by importing flows defined in `genkit.config.ts` encountered persistent `TypeError` and module resolution issues. This was resolved by pivoting to the more direct `@google/genai` SDK approach for the `/api/decompose` feature.
*   **`@google/genai` SDK Integration**: Resolved `TypeError` issues in `app/api/decompose/route.ts` by adjusting import methods (to CommonJS `require`) and ensuring correct SDK class (`GoogleGenAI`) and method (`genAI.models.generateContent()`) usage.
