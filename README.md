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

## Current Status & Next Steps (When Resuming)

We are currently paused while troubleshooting the `/api/decompose` API route. The immediate issues are:

1.  **`Error: GOOGLE_API_KEY is not set in environment variables`**: This indicates that the `GOOGLE_API_KEY` from the `.env.local` file is not being correctly loaded by the Next.js server when the API route is executed.
    *   **To Do**: Verify `.env.local` file name, location (must be project root), content (`GOOGLE_API_KEY=your_key_value`), and ensure the dev server is fully restarted after any changes to this file.

2.  **`Attempted import error: 'GoogleGenerativeAI' is not exported from '@google/genai'`**: This suggests an issue with how `GoogleGenerativeAI` is being imported or a potential mismatch with the installed SDK version, though it might be a secondary effect of the environment variable issue.
    *   **To Do (if API key issue is resolved and this persists)**: Double-check the `@google/genai` SDK documentation for the correct import syntax for the installed version. Verify the installed version (`npm list @google/genai`).

Once these issues are resolved, the next step will be to confirm that the `/api/decompose` route can successfully call the Gemini API and return a structured JSON response.

After that, we can proceed with the roadmap:
*   **Task 2: Conversational Chat UI**
    *   Create `<ChatWindow />` component.
    *   Hook chat input to `/api/decompose`.

## Notes from Previous Troubleshooting

*   **Genkit in Next.js API Routes**: Initial attempts to use Genkit's `configureGenkit`, `defineFlow`, and `runFlow` directly within the Next.js API route or by importing flows defined in `genkit.config.ts` encountered persistent `TypeError` and module resolution issues. This suggests potential complexities with Genkit's framework expectations versus the Next.js API route execution environment. For the `/api/decompose` feature, we pivoted to the more direct `@google/genai` SDK approach.
