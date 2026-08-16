# Genesis QUIC - Complete Workflow & Features Specification

This document provides an exhaustive, production-grade technical specification and operational workflow guide for the **Genesis QUIC (Quantum University Innovation Council)** web platform.

---

## Table of Contents
1. [Executive Architecture Overview](#1-executive-architecture-overview)
2. [Public User Website Features](#2-public-user-website-features)
3. [Admin Panel Features](#3-admin-panel-features)
4. [Database Schema & Universal Fallback System](#4-database-schema--universal-fallback-system)
5. [Groq AI Chatbot Integration](#5-groq-ai-chatbot-integration)
6. [Custom Event Form Fields Manager](#6-custom-event-form-fields-manager)
7. [Step-by-Step User Workflow Guide](#7-step-by-step-user-workflow-guide)

---

## 1. Executive Architecture Overview

The Genesis QUIC platform is built using a modern, scalable full-stack web architecture designed for high availability, fast response times, and resilience against database disconnects.

```
                  +-----------------------------------+
                  |        Browser / End User         |
                  +-----------------------------------+
                                    |
            +-----------------------+-----------------------+
            |                                               |
            v                                               v
+-----------------------+                       +-----------------------+
|  Next.js App Router   |                       | Pages API Router      |
|  (Frontend UI Pages)  | <-------------------> | (/pages/api/*)        |
+-----------------------+                       +-----------------------+
                                                            |
                                            +---------------+---------------+
                                            |                               |
                                            v                               v
                                +-----------------------+       +-----------------------+
                                | MySQL Database        |       | Groq AI API           |
                                | (lib/db.js Pool)      |       | (llama-3.3-70b)       |
                                +-----------------------+       +-----------------------+
                                            |                               |
                                            +---------------+---------------+
                                                            |
                                                            v (On DB/Key Fail)
                                                +-----------------------+
                                                | MemoryStore Fallback  |
                                                | (lib/memoryStore.js)  |
                                                +-----------------------+
```

### Key Technical Specifications
- **Frontend Core**: Next.js 16 (App Router) with React 19 / Client & Server Components.
- **Styling & UI Components**: Tailwind CSS v4, Shadcn UI (Radix UI primitives), Lucide React Icons.
- **Backend APIs**: Next.js Pages API Router (`pages/api/*`) for RESTful micro-endpoints.
- **Database Layer**: MySQL (`mysql2/promise` connection pool) with schema migrations (`genesis.sql`).
- **Resilience Engine**: Universal In-Memory Fallback Store (`lib/memoryStore.js`) protecting all CRUD operations.
- **AI Chatbot Engine**: Groq API integration (`llama-3.3-70b-versatile`) with security guardrails and offline fallback.
- **Page Builder**: Puck Visual Page Editor integration (`lib/puck-config.jsx`).

---

## 2. Public User Website Features

The public-facing portal delivers an engaging user experience, presenting incubator statistics, programs, events, blogs, startups, and interactive registration tools.

```
                              PUBLIC WEBSITE MAP
                              
  +------------------+------------------+------------------+------------------+
  |                  |                  |                  |                  |
  v                  v                  v                  v                  v
[ Home ]         [ About ]          [ Apply ]          [ Events ]         [ Blogs ]
  /                 |                  |                  |                  |
  +----> Stats       +----> Leadership  +----> Pitch Form  +----> Listing     +----> Categories
  +----> Programs    +----> Facilities  +----> Uploads     +----> Detail      +----> Search
  +----> Incubatees  +----> Partners                       +----> Register    +----> Reader
  
  +------------------+------------------+------------------+
  |                  |                  |                  |
  v                  v                  v                  v
[ Portfolio ]     [ Gallery ]       [ Contact ]       [ AI Chatbot ]
  |                  |                  |                  |
  +----> Grid        +----> Filters     +----> Form        +----> Floating UI
  +----> Filters     +----> Lightbox    +----> Map         +----> Hindi/Eng
```

### 2.1 Home Landing Page (`/`)
- **Hero Banner**: Dynamic headline, call-to-action buttons ("Apply for Incubation", "Explore Programs"), and background visual accents.
- **Impact Metrics Counter**: Animated statistics counters displaying total startups incubated (50+), funding raised (₹25 Cr+), patents filed (30+), and survival rate (85%+).
- **Incubation Tracks**: Overview of Pre-Incubation (Idea Stage), Incubation (MVP & Growth), and Acceleration (Seed to Series A) programs.
- **Leadership Message Carousel**: Interactive auto-sliding carousel displaying messages from university directors and incubation heads.
- **Incubated Startup Highlights**: Featured startup cards showcasing top alumni ventures.
- **Interactive FAQ Accordion**: Expandable Q&A accordion addressing common applicant questions with smooth Tailwind animations.

### 2.2 About Us Page (`/about`)
- **Vision & Mission**: Detailed outline of Genesis QUIC's objective to foster entrepreneurship and tech commercialization.
- **Incubator Infrastructure**: Showcase of prototyping labs, maker spaces, IoT equipment, co-working bays, and conference facilities.
- **Ecosystem & Academic Partners**: Grid of corporate, government (SISFS, NIDHI-PRAYAS, BIRAC), and academic partner logos.
- **Leadership & Advisory Team**: Team grid featuring executive profiles, designations, and social links.

### 2.3 Apply for Incubation (`/apply`)
- **Multi-Step Application Form**: Interactive multi-stage application wizard capturing:
  - Startup Basic Details (Startup name, sector, stage, incorporated status).
  - Founder & Team Information (Lead founder name, email, mobile number, team size).
  - Technology & Value Proposition (Problem statement, innovation details, target market).
  - Financials & Pitch Deck (Funding required, current traction, pitch deck URL / document upload).
- **Client-Side Validation**: Immediate feedback on required fields, email formatting, and phone validation.

### 2.4 Events Portal (`/events` & `/events/[slug]`)
- **Event Listing Grid**: Filterable display of upcoming, ongoing, and completed events with category badges (Summit, Workshop, Hackathon, Pitching, Masterclass).
- **Event Detail Page**: Full breakdown featuring event schedule, keynote speakers, venue location map, capacity indicator, and registration status.
- **Dynamic Registration Modal**: Powered by `EventRegistrationModal.tsx`, fetching custom form fields dynamically configured by administrators for each specific event.

### 2.5 Blogs & News (`/blogs` & `/blogs/[slug]`)
- **Blog Feed**: Grid view featuring cover images, category pills, author details, read time, and published date.
- **Search & Category Filters**: Real-time text search and category tab selection (Entrepreneurs, Culture, Insights, DeepTech, Venture Capital, Sustainability, Innovation).
- **Rich Content Reader**: Rendered HTML article view with blockquotes, styled lists, author bios, view counters, and related articles.

### 2.6 Startup Portfolio (`/portfolio`)
- **Interactive Directory**: Filterable grid displaying cohort ventures.
- **Sector & Tag Filters**: Filter startups by domain (CleanTech, HealthTech, AgriTech, FinTech, AI & Robotics, EdTech, SaaS, DeepTech).
- **Startup Details**: Funding metrics, employee bracket, founding year, tags, and direct external website links.

### 2.7 Media Gallery (`/gallery`)
- **Category Filter Tabs**: Grouping media into Events, Workshops, Infrastructure, and Campus Life.
- **Lightbox Preview**: Full-screen modal image preview with captions and high-resolution view.

### 2.8 Contact Us (`/contact`)
- **Inquiry Form**: Direct submission form for general inquiries, mentorship requests, or partnership proposals.
- **Contact Info & Location**: Physical campus address, office hours, helpline numbers, and embedded interactive map.

### 2.9 Groq AI Assistant Chatbot (`Genesis AI`)
- **Floating Chat Widget**: Access floating button on all public pages.
- **Multilingual Support**: Seamlessly accepts and responds in English, Hindi (हिन्दी), and Hinglish.
- **Dual Knowledge Capabilities**:
  1. *General Knowledge*: Free-flowing conversation on general queries, code, science, recipes, celebrities, and trivia.
  2. *Genesis QUIC Knowledge*: Immediate guidance on incubation tracks, seed funding, eligibility, application steps, and events.
- **Suggestion Pills & Action Links**: Clickable prompt chips and direct navigation links rendered inside chat bubbles.

### 2.10 Vishesh Event Scanner Portal (`/vishesh-event`)
- **Live Gate Attendee Check-In/Check-Out**: Interactive web portal for volunteers and admins to verify attendee badges via QR code camera scanning or manual QU-ID entry.
- **Dual Gate Permission Mode**: Toggle between IN Gate (Check-In) and OUT Gate (Check-Out) scanning modes with real-time role validation.
- **Key Verification Engine**: Connects to `/api/scanner/verify`, `/api/scanner/scan`, and `/api/scanner/history` to authenticate volunteer key codes, prevent expired/revoked key access, and enforce gate role security.

---

## 3. Admin Panel Features

The Admin Panel (`/admin` and `/admin/dashboard/*`) provides comprehensive administrative control over all site resources with Role-Based Access Control (RBAC).

```
                              ADMIN PANEL MAP
                              
  +------------------+------------------+------------------+------------------+
  |                  |                  |                  |                  |
  v                  v                  v                  v                  v
[ Dashboard ]    [ Applications ]    [ Events ]          [ Blogs ]         [ Gallery ]
  /                  |                  |                  |                  |
  +----> Stats       +----> Filter      +----> Create/Edit +----> Rich Editor +----> Uploads
  +----> Recent      +----> Statuses    +----> Form Fields +----> Publish     +----> Categories
                     +----> Details     +----> Registrations+----> Drafts     +----> Order
                                        +----> Export CSV
                                        
  +------------------+------------------+------------------+------------------+
  |                  |                  |                  |                  |
  v                  v                  v                  v                  v
[ Portfolio ]       [ Pages ]         [ Roles ]          [ Admins ]        [ Settings ]
  |                  |                  |                  |                  |
  +----> Add/Edit    +----> Puck Editor +----> Permissions +----> Accounts    +----> Groq API
  +----> Status      +----> Layouts     +----> Slugs       +----> Assign Role +----> System Config
```

### 3.1 Authentication & Role Management (`/admin/page.jsx`, `/api/auth/*`)
- **JWT Cookie Authentication**: Secure login via HTTP-only cookies preventing XSS token theft.
- **Role-Based Access Control (RBAC)**: Managed via `admin_roles` table:
  - *Super Admin*: Unrestricted access across all modules, settings, and user management.
  - *Content Editor*: Access limited to Blogs, Gallery, and Custom Pages.
  - *Event Manager*: Access limited to Events, Form Fields, and Registrations.
  - *Application Reviewer*: Access limited to reviewing submitted incubation applications.
- **Admin Management (`/admin/dashboard/admins`)**: Super admins can add, update, deactivate, or reset passwords for admin accounts.

### 3.2 Executive Dashboard (`/admin/dashboard/page.jsx`)
- **System Telemetry Cards**: Overview of total applications, active events, published blogs, portfolio count, and registered users.
- **Recent Submissions Log**: Real-time table of recent incubation applications and event registrations.
- **Quick Action Bar**: Shortcuts for creating events, writing blogs, or updating site settings.

### 3.3 Incubation Application Management (`/admin/dashboard/applications`)
- **Filterable Data Table**: Filter submitted applications by status (`submitted`, `under_review`, `accepted`, `rejected`).
- **Application Detail View**: Inspect complete startup information, founder contact details, answer responses, and pitch deck URLs.
- **Status Updater**: Modal allowing reviewers to update application status and attach internal review notes.

### 3.4 Event & Custom Form Fields Manager (`/admin/dashboard/events`)
- **Event CRUD Operations**: Create, edit, feature, or soft-delete events.
- **Custom Event Form Fields Builder**: Interface allowing admins to define dynamic registration forms per event (see Section 6).
- **Attendee Registration Manager**: View registered attendees, inspect custom form answers, update registration status (`pending`, `confirmed`, `cancelled`), and export attendee lists to CSV.

### 3.4.1 Volunteer Key & Scanner Manager (`/admin/dashboard/volunteers`)
- **Direct Scanner Link**: Features an instant access button launching the **Vishesh Event Scanner (`/vishesh-event`)**.
- **Volunteer Access Keys**: Generate, extend (+24h), revoke, or reactivate IN/OUT gate access keys with custom expiry durations (1h to 7d or never).
- **Live Feed Monitoring**: Real-time event check-in/check-out scan logs auto-syncing every 4 seconds.

### 3.5 Blog Manager (`/admin/dashboard/blogs`)
- **Rich Article Editor**: WYSIWYG editor supporting heading hierarchy, lists, blockquotes, code blocks, and media embeds.
- **Publishing Workflow**: Manage post status (`draft`, `published`), set publication timestamp, featured toggle, cover image selection, and category mapping.

### 3.6 Media Gallery Manager (`/admin/dashboard/gallery`)
- **Bulk Image Uploader**: Drag-and-drop file upload supporting JPEG, PNG, WebP format.
- **Metadata Management**: Set image titles, category tags, descriptions, and grid display order.

### 3.7 Startup Portfolio Manager (`/admin/dashboard/portfolio`)
- **Portfolio Showcase Editor**: Add incubated companies, assign sectors, upload company logos/banners, input funding amounts, employee headcount, and founding date.
- **Status Controls**: Toggle visibility between `featured`, `active`, and `draft`.

### 3.8 Visual Page Builder (`/admin/dashboard/pages`)
- **Puck Editor Integration**: Drag-and-drop visual page builder (`lib/puck-config.jsx`) for landing pages and custom promotional pages.
- **Live Preview & Publishing**: Edit components, adjust layout padding, modify copy, and publish directly to dynamic slugs (`custom_pages` schema).

### 3.9 System Settings (`/admin/dashboard/settings`)
- **AI Chatbot Configuration**: Configure `groq_api_key` dynamically without server restarts, select active model (`llama-3.3-70b-versatile`), and adjust system prompt parameters.
- **Site Metadata**: Update organization contact details, social links, and SEO defaults.

---

## 4. Database Schema & Universal Fallback System

The Genesis platform uses a dual-layer data persistence architecture: a primary MySQL relational database backed by a global in-memory fallback store.

```
                              DATA LAYER ARCHITECTURE
                              
  API Request  --->  [ Try MySQL DB Connection (lib/db.js) ]
                             |
         +-------------------+-------------------+
         | Success                               | Connection Failure / Offline
         v                                       v
  [ Execute MySQL Query ]               [ Route to MemoryStore (lib/memoryStore.js) ]
  Return MySQL Result Set               Return In-Memory Data Object
```

### 4.1 Relational Database Schema (`genesis.sql`)

#### 1. `admin` & `admin_roles`
```sql
CREATE TABLE IF NOT EXISTS `admin_roles` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(100) NOT NULL,
  `slug` VARCHAR(100) NOT NULL UNIQUE,
  `description` TEXT,
  `permissions` JSON NOT NULL DEFAULT (json_object()),
  `is_super` TINYINT(1) DEFAULT '0',
  `created_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
);

CREATE TABLE IF NOT EXISTS `admin` (
  `id` CHAR(36) NOT NULL,
  `first_name` VARCHAR(255) DEFAULT NULL,
  `last_name` VARCHAR(255) DEFAULT NULL,
  `username` VARCHAR(255) NOT NULL,
  `password` VARCHAR(255) NOT NULL,
  `role` VARCHAR(32) DEFAULT NULL,
  `role_id` INT DEFAULT NULL,
  `token` VARCHAR(255) DEFAULT NULL,
  `status` INT DEFAULT '0',
  `created_at` TIMESTAMP NULL DEFAULT NULL,
  `updated_at` TIMESTAMP NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  CONSTRAINT `fk_admin_role` FOREIGN KEY (`role_id`) REFERENCES `admin_roles` (`id`) ON DELETE SET NULL
);
```

#### 2. `events`, `event_form_fields`, `event_registrations`, & `volunteer_keys`
```sql
CREATE TABLE IF NOT EXISTS `events` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `title` VARCHAR(255) NOT NULL,
  `slug` VARCHAR(255) DEFAULT NULL UNIQUE,
  `description` TEXT,
  `date` DATE NOT NULL,
  `time` TIME NOT NULL,
  `location` VARCHAR(255) NOT NULL,
  `max_attendees` INT DEFAULT '0',
  `category` VARCHAR(100) DEFAULT NULL,
  `image_url` VARCHAR(500) DEFAULT NULL,
  `featured` TINYINT(1) DEFAULT '0',
  `status` ENUM('upcoming', 'ongoing', 'completed', 'cancelled') DEFAULT 'upcoming',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
);

CREATE TABLE IF NOT EXISTS `event_form_fields` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `event_id` INT NOT NULL,
  `field_name` VARCHAR(100) NOT NULL,
  `field_label` VARCHAR(255) NOT NULL,
  `field_type` ENUM('text','email','phone','textarea','select','radio','checkbox','file') NOT NULL,
  `field_options` TEXT,
  `required` TINYINT(1) DEFAULT '0',
  `placeholder` VARCHAR(255) DEFAULT NULL,
  `validation_rules` TEXT,
  `order_index` INT DEFAULT '0',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  CONSTRAINT `fk_event_fields` FOREIGN KEY (`event_id`) REFERENCES `events` (`id`) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS `event_registrations` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `event_id` INT NOT NULL,
  `registration_data` LONGTEXT CHECK (json_valid(`registration_data`)),
  `status` ENUM('pending', 'confirmed', 'cancelled', 'checked_out') DEFAULT 'pending',
  `registration_date` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `confirmed_at` TIMESTAMP NULL DEFAULT NULL,
  `in_time` TIMESTAMP NULL DEFAULT NULL,
  `out_time` TIMESTAMP NULL DEFAULT NULL,
  `in_scanned_by` VARCHAR(255) DEFAULT NULL,
  `out_scanned_by` VARCHAR(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  CONSTRAINT `fk_event_registrations` FOREIGN KEY (`event_id`) REFERENCES `events` (`id`) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS `volunteer_keys` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `key_code` VARCHAR(100) NOT NULL UNIQUE,
  `role` VARCHAR(100) NOT NULL DEFAULT 'IN Gate Volunteer',
  `assigned_to` VARCHAR(255) DEFAULT NULL,
  `is_active` TINYINT(1) DEFAULT '1',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
);
```

#### 3. `blogs` & `blog_categories`
```sql
CREATE TABLE IF NOT EXISTS `blog_categories` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(100) NOT NULL UNIQUE,
  `created_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
);

CREATE TABLE IF NOT EXISTS `blogs` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `title` VARCHAR(500) NOT NULL,
  `slug` VARCHAR(500) NOT NULL UNIQUE,
  `excerpt` TEXT,
  `content` LONGTEXT NOT NULL,
  `author` VARCHAR(150) DEFAULT 'Genesis Team',
  `category_id` INT DEFAULT NULL,
  `image_url` VARCHAR(500) DEFAULT NULL,
  `featured` TINYINT(1) DEFAULT '0',
  `status` ENUM('draft', 'published') DEFAULT 'draft',
  `views` INT DEFAULT '0',
  `comments_count` INT DEFAULT '0',
  `published_at` DATETIME DEFAULT NULL,
  `created_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  CONSTRAINT `fk_blog_category` FOREIGN KEY (`category_id`) REFERENCES `blog_categories` (`id`) ON DELETE SET NULL
);
```

#### 4. `applications` & `application_answers`
```sql
CREATE TABLE IF NOT EXISTS `applications` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `form_id` INT NOT NULL,
  `applicant_name` VARCHAR(255) DEFAULT NULL,
  `applicant_email` VARCHAR(255) DEFAULT NULL,
  `status` ENUM('submitted', 'under_review', 'accepted', 'rejected') DEFAULT 'submitted',
  `submitted_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
);
```

#### 5. `portfolio`, `gallery`, & `custom_pages`
```sql
CREATE TABLE IF NOT EXISTS `portfolio` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `title` VARCHAR(255) NOT NULL,
  `category` VARCHAR(100) NOT NULL,
  `description` TEXT,
  `image_url` VARCHAR(500) DEFAULT NULL,
  `status` ENUM('featured', 'active', 'draft') DEFAULT 'draft',
  `tags` JSON NOT NULL DEFAULT (json_array()),
  `link` VARCHAR(500) DEFAULT NULL,
  `date` DATE NOT NULL,
  `funding` VARCHAR(50) DEFAULT '₹50000',
  `employees` VARCHAR(50) DEFAULT '0–5',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
);

CREATE TABLE IF NOT EXISTS `gallery` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `title` VARCHAR(255) NOT NULL,
  `category` VARCHAR(50) DEFAULT 'general',
  `type` VARCHAR(50) DEFAULT 'image',
  `url` VARCHAR(500) NOT NULL,
  `created_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
);

CREATE TABLE IF NOT EXISTS `custom_pages` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `title` VARCHAR(255) NOT NULL,
  `slug` VARCHAR(255) NOT NULL UNIQUE,
  `content` JSON DEFAULT NULL,
  `status` ENUM('draft', 'published') DEFAULT 'draft',
  `created_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
);
```

### 4.2 Universal In-Memory Fallback System (`lib/memoryStore.js`)
- **Global Singleton**: Instantiated on `globalThis.__genesisMemoryStore` to ensure persistence across Hot Module Reloads (HMR) during development.
- **Automatic Interception**: API handlers wrapping DB calls catch connection errors (`ECONNREFUSED`, `ENOTFOUND`, `ETIMEDOUT`) and fallback to `memoryStore` without throwing 500 errors to the client.
- **Full CRUD Support**: Create, read, update, and delete operations mutate both the database (when available) and `memoryStore` synchronously.

---

## 5. Groq AI Chatbot Integration

The platform features an intelligent, conversational AI assistant (`pages/api/chat.js`) built on Groq's high-performance inference engine.

```
                            GROQ AI CHATBOT PIPELINE
                            
  [ User Query ] ---> [ Security Guardrail Check (SENSITIVE_PATTERNS) ]
                                      |
                     +----------------+----------------+
                     | Violation                       | Clean Query
                     v                                 v
        [ Security Refusal Block ]         [ Read Groq API Key ]
                                                       |
                                      +----------------+----------------+
                                      | Valid Key                       | Key Missing / API Error
                                      v                                 v
                          [ Groq API Request ]               [ Rich Offline Resolver ]
                          Model: llama-3.3-70b               (getOfflineKnowledgeResponse)
                                      |                                 |
                                      +----------------+----------------+
                                                       |
                                                       v
                                            [ Output Sanitizer ]
                                           (Masks gsk_ & env keys)
                                                       |
                                                       v
                                            [ Client Response JSON ]
```

### 5.1 Technical Pipeline Details
- **API Endpoint**: `POST /api/chat`
- **Primary Model**: `llama-3.3-70b-versatile` via Groq OpenAI-compatible completions endpoint.
- **Dynamic Credentials**: Checks `memoryStore.settings.groq_api_key` first, falling back to `process.env.GROQ_API_KEY`.

### 5.2 Strict Zero-Leak Security Layer
To prevent prompt injection, credential harvesting, or system prompt leaks, requests are processed through `SENSITIVE_PATTERNS` regex filters:

```javascript
const SENSITIVE_PATTERNS = [
  /groq_api_key/i,
  /process\.env/i,
  /gsk_[a-zA-Z0-9_\-]+/i,
  /db_password/i,
  /database_url/i,
  /system\s*prompt/i,
  /bypass\s+guardrails/i,
  /reveal\s+key/i
];
```

Output payloads are passed through `sanitizeOutput()` to scrub any accidental key signatures (`gsk_...` replaced with `[REDACTED_API_KEY]`).

### 5.3 Offline Knowledge Base Resolver (`getOfflineKnowledgeResponse`)
If the Groq API key is unconfigured or the network is unreachable, the endpoint serves deterministic responses covering:
- Incubation tracks & eligibility.
- Seed funding & government grant details.
- Application steps (`/apply`).
- Event listings and contact information.
- General knowledge & Hinglish greetings.

---

## 6. Custom Event Form Fields Manager

The Custom Event Form Fields Manager enables administrators to construct custom registration forms tailored for individual events without touching code.

```
                       CUSTOM FORM FIELDS ARCHITECTURE
                       
  ADMIN SIDE                                PUBLIC FRONTEND SIDE
  
+--------------------------+               +--------------------------+
|  Admin Event Dashboard   |               |  Public Event Page       |
|  (app/admin/dashboard/   |               |  (/events/[slug])        |
|   events/[id])           |               +--------------------------+
+--------------------------+                            |
             |                                          | Fetches Form Fields
             v                                          v
+--------------------------+               +--------------------------+
|  Configure Form Fields   |               |  EventRegistrationModal  |
|  (Label, Type, Required, |               |  (Dynamic Form Renderer) |
|   Options, Order)        |               +--------------------------+
+--------------------------+                            |
             |                                          | Submits Payload
             v (POST/PUT API)                           v
+--------------------------+               +--------------------------+
|  `event_form_fields` DB  | ------------> |  `event_registrations`   |
|  & `memoryStore`         |               |  (JSON registration_data)|
+--------------------------+               +--------------------------+
```

### 6.1 Supported Field Types
1. `text`: Single-line text input (e.g., Full Name, Organization).
2. `email`: Email address input with format validation.
3. `phone`: Phone number input with regex numeric validation.
4. `textarea`: Multi-line text block (e.g., Startup Summary, Expectations).
5. `select`: Single-option dropdown menu with admin-defined options.
6. `radio`: Radio button list for single choice selections.
7. `checkbox`: Multi-select checkbox group.
8. `file`: File upload field with file preview and backend handling via `/api/admin/events/upload`.

### 6.2 Data Model & Payload Structure
Form fields are persisted in `event_form_fields` or `memoryStore.formFields[eventId]`:

```json
[
  {
    "id": 101,
    "event_id": 1,
    "field_name": "pitch_deck_link",
    "field_label": "Pitch Deck URL",
    "field_type": "text",
    "required": true,
    "placeholder": "https://drive.google.com/...",
    "order_index": 1
  },
  {
    "id": 102,
    "event_id": 1,
    "field_name": "team_size",
    "field_label": "Number of Team Members",
    "field_type": "select",
    "field_options": ["1-2 Founders", "3-5 Members", "6+ Team"],
    "required": true,
    "order_index": 2
  }
]
```

### 6.3 Dynamic Frontend Rendering (`EventRegistrationModal.tsx`)
When a user clicks "Register Now" on an event page:
1. `EventRegistrationModal.tsx` queries `/api/admin/events/[id]/form-fields`.
2. Fields are sorted by `order_index`.
3. Input elements are rendered dynamically according to `field_type`.
4. Attached files are uploaded to S3 / local media storage first.
5. Registration data is saved as structured JSON in `event_registrations.registration_data`.

---

## 7. Step-by-Step User Workflow Guide

Follow this guide to set up, operate, and verify the Genesis QUIC web platform.

```
                           COMPLETE WORKFLOW MAP
                           
  STEP 1: Setup & Launch  --->  STEP 2: Admin Login & Settings
                                           |
  STEP 4: Public Registration <--- STEP 3: Create Event & Form
            |
            v
  STEP 5: Application & Review ---> STEP 6: AI Chatbot Operational
```

### Step 1: Environment Setup & Server Launch
1. Open PowerShell or Terminal in project root:
   ```bash
   cd "c:\Users\Hp\OneDrive\Desktop\Genesis website\Genesis-QUIC-main"
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Configure environment variables in `.env`:
   ```env
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=your_password
   DB_NAME=genesis
   DB_PORT=3306
   GROQ_API_KEY=gsk_your_groq_api_key_here
   ```
4. Start development server:
   ```bash
   npm run dev
   ```
5. Open browser at `http://localhost:3000`.

---

### Step 2: Admin Login & System Setup
1. Navigate to `http://localhost:3000/admin`.
2. Enter admin credentials:
   - **Username**: `admin`
   - **Password**: `admin123` (or configured credentials in `admin` table).
3. Upon authentication, you will be redirected to `/admin/dashboard`.
4. Go to **Settings** (`/admin/dashboard/settings`):
   - Input your **Groq API Key**.
   - Select AI model `llama-3.3-70b-versatile`.
   - Click **Save Settings**.

---

### Step 3: Creating an Event with Custom Registration Fields
1. In the Admin Dashboard, click **Events** (`/admin/dashboard/events`).
2. Click **Create New Event**.
3. Fill in basic event information:
   - Title: `National DeepTech Hackathon 2026`
   - Category: `Hackathon`
   - Date & Time: `2026-10-15` at `09:00 AM`
   - Location: `Genesis Maker Space, Roorkee`
   - Max Attendees: `200`
4. In the **Custom Form Fields Builder** section, add fields:
   - *Field 1*: Label = `Team Name`, Type = `text`, Required = `Yes`.
   - *Field 2*: Label = `Tech Track`, Type = `select`, Options = `AI/ML, ClimateTech, Quantum`, Required = `Yes`.
   - *Field 3*: Label = `Pitch Deck / Proposal PDF`, Type = `file`, Required = `No`.
5. Click **Publish Event**.

---

### Step 4: Public User Event Registration Workflow
1. As a public user, navigate to `http://localhost:3000/events`.
2. Locate `National DeepTech Hackathon 2026` and click **View Details**.
3. Click **Register Now** to trigger `EventRegistrationModal`.
4. Fill in the dynamically generated form fields (Team Name, Tech Track, file upload).
5. Click **Submit Registration**.
6. Receive success confirmation toast notification.

---

### Step 5: Reviewing Registrations & Exporting Data
1. Return to Admin Panel (`/admin/dashboard/events`).
2. Click on the created event and select **View Registrations**.
3. Inspect attendee responses in the interactive data table.
4. Click **Export to CSV** to download registration records.

---

### Step 6: Submitting an Incubation Application
1. Navigate to `http://localhost:3000/apply`.
2. Fill out startup details, founder contact info, funding requirement, and pitch deck link.
3. Submit the form.
4. Go to Admin Dashboard -> **Applications** (`/admin/dashboard/applications`).
5. Review the new application, change status from `Submitted` to `Under Review` or `Accepted`.

---

### Step 7: Testing the Groq AI Chatbot
1. On any public page, click the floating **Genesis AI** button in the bottom right.
2. Ask in English, Hindi, or Hinglish:
   - *"How can I get seed funding from Genesis QUIC?"*
   - *"Aamir Khan ka ghar kaha hai?"*
   - *"What are the eligibility criteria for incubation?"*
3. Verify that responses are immediate, accurate, multilingual, and display suggestion pills and action links.

---

### Step 8: Production Build & Deployment
1. Test production build locally:
   ```bash
   npm run build
   ```
2. Start production server:
   ```bash
   npm run start
   ```
3. Deploy to Vercel or cloud VPS:
   ```bash
   vercel --prod
   ```

---
*Documentation prepared for Genesis QUIC Platform.*
