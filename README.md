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
