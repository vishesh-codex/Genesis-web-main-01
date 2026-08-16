# Core Functions & APIs - Genesis QUIC

The backend logic of the website is primarily driven by Next.js API routes located in the `pages/api/` directory. Below is a breakdown of the core functionalities and endpoints.

## 1. Authentication Functions (`pages/api/auth/`)
Handles user identity and sessions (primarily for the Admin portal).
- **`login.js`**: Authenticates user credentials against the database using `bcrypt`. Generates and assigns a JWT token stored in HTTP-only cookies.
- **`verify.js`**: Middleware-like endpoint to verify if the incoming request has a valid JWT token.
- **`logout.js`**: Clears the authentication token from the user's cookies.

## 2. Application Functions (`pages/api/applications/`)
Manages the incubation applications submitted by startups.
- **Create**: Handles incoming `POST` requests from the `/apply` page. Validates the data against the Mongoose `Application` model and saves it.
- **Read/Update**: Used by the admin dashboard to view submitted applications, filter them, and update their statuses (e.g., Approved, Rejected, Under Review).

## 3. Blog Functions (`pages/api/blogs/`)
Content management for the news and community section.
- Fetches blog posts to be displayed on the `/blogs` page.
- Provides endpoints for admins to create new blogs, utilizing rich text data (likely stored as HTML since `@lexical/react` and `react-quill` are installed).

## 4. Event Functions (`pages/api/events/`)
Manages workshops, hackathons, and webinars.
- Fetches upcoming and past events.
- Handles user event registration data (linked to `EventRegistrationModal.tsx` on the frontend).

## 5. Media & Gallery Functions (`pages/api/media/` & `pages/api/gallery/`)
- Handles file uploads (using `formidable` or `multer`).
- Interfaces with AWS S3 (`@aws-sdk/client-s3`) to store and retrieve images for the gallery, blogs, and startup portfolios.

## 6. Utilities & Helpers (`lib/`)
- **`db.js` / `mongodb.js`**: Connection pools and setup for connecting to the MongoDB instance. Ensures singleton connection in serverless environments.
- **`utils.ts`**: Frontend/Backend helper functions (e.g., Tailwind class merging `cn()`).
