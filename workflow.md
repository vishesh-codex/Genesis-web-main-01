# Workflow Architecture - Genesis QUIC

This document outlines the high-level architecture and data flow of the Genesis QUIC website.

## 1. Technology Stack
- **Frontend Framework**: [Next.js 16](https://nextjs.org/) utilizing the modern **App Router** (`app/` directory).
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/) paired with [Shadcn UI](https://ui.shadcn.com/) (Radix UI primitives).
- **Backend API**: Next.js **Pages API Router** (`pages/api/` directory) for serverless functions.
- **Database**: [MongoDB](https://www.mongodb.com/) via Mongoose (e.g., `Application.js` model).
- **Authentication**: JWT-based authentication using `jsonwebtoken` and `bcrypt`.
- **Deployment**: [Vercel](https://vercel.com/) (indicated by `vercel.json`).

## 2. Overall Data Flow

1. **User Interaction (Frontend)**:
   - The user visits a route handled by the `app/` directory (e.g., `/apply`, `/blogs`).
   - The UI is rendered Server-Side or Client-Side (using `"use client"` directives as seen in `app/page.tsx`).
   - User inputs data (e.g., filling out the incubation application form).

2. **API Communication**:
   - The frontend makes HTTP requests (often via `axios` or native `fetch`) to the backend routes located in `/pages/api/`.
   - Example: Submitting an application triggers a `POST` request to `/api/applications/`.

3. **Backend Processing (API Routes)**:
   - The API route receives the request, validates it, and performs necessary business logic.
   - For authenticated routes, it checks for a valid JWT token.

4. **Database Operations**:
   - The API route interacts with MongoDB using Mongoose models (stored in the `models/` directory, such as `Application`).
   - Data is persisted or retrieved from the database.

5. **Response & UI Update**:
   - The API returns a JSON response to the frontend.
   - The frontend state updates, showing a success message (e.g., via `@radix-ui/react-toast` / `sonner`) or redirecting the user.

## 3. Key Workflows

### Incubation Application Workflow
- **Page**: `app/apply/page.tsx`
- **Action**: User fills out startup details, team info, and pitch deck URL.
- **API**: Submits to `/pages/api/applications/`.
- **Database**: Saved in the `Applications` collection in MongoDB.
- **Admin**: Admins review these via `app/admin/applications/` fetching from the same API.

### Content Management Workflow
- **Admin Dashboard**: Located under `app/admin/`.
- Admins can manage Blogs, Events, and Gallery items.
- Images/media are handled and likely uploaded to AWS S3 (as `@aws-sdk/client-s3` is present in dependencies).
