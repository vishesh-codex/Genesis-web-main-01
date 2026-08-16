# Genesis QUIC - System Walkthrough & Verification Guide

This document provides a step-by-step walkthrough guide for navigating, demonstrating, running, and verifying the **Genesis QUIC** web platform.

---

## 1. Quick Start & System Initialization

### Prerequisites
- **Node.js**: v18.x or v20.x installed.
- **Package Manager**: `npm` (v9+).
- **Database (Optional)**: MySQL 8.0+ running on `localhost:3000` (or rely on the Built-in `memoryStore` fallback).

### Command Line Launch
1. Open PowerShell or Command Prompt in the repository folder:
   ```bash
   cd "c:\Users\Hp\OneDrive\Desktop\Genesis website\Genesis-QUIC-main"
   ```
2. Install npm packages (if not already installed):
   ```bash
   npm install
   ```
3. Create/Verify `.env` configuration in project root:
   ```env
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=your_password
   DB_NAME=genesis
   DB_PORT=3306
   GROQ_API_KEY=gsk_your_groq_api_key_here
   ```
4. Start the Next.js development server:
   ```bash
   npm run dev
   ```
5. Access the application in browser:
   - **Public Site**: [http://localhost:3000](http://localhost:3000)
   - **Admin Portal**: [http://localhost:3000/admin](http://localhost:3000/admin)

---

## 2. System Navigation Map

| Section | Route Path | Description | Access Level |
| :--- | :--- | :--- | :--- |
| **Home Page** | `/` | Hero section, metrics, programs, leadership carousel | Public |
| **About Us** | `/about` | Vision, mission, infrastructure, partners | Public |
| **Apply** | `/apply` | Incubation application form & pitch upload | Public |
| **Events Portal** | `/events` | Listing, detail page, dynamic registration modal | Public |
| **Blogs & News** | `/blogs` | Filterable blog posts and rich content reader | Public |
| **Portfolio** | `/portfolio` | Incubated startups directory & domain tags | Public |
| **Media Gallery** | `/gallery` | Visual photo gallery with category tabs | Public |
| **Contact Us** | `/contact` | Inquiry form, helpline, location map | Public |
| **Admin Login** | `/admin` | JWT authentication screen | Public |
| **Admin Dashboard**| `/admin/dashboard` | Telemetry cards, recent submissions | Authenticated Admin |
| **Applications Admin**| `/admin/dashboard/applications` | Review submitted startup applications | Admin / Reviewer |
| **Events Admin** | `/admin/dashboard/events` | Create events, custom form fields, registrations | Admin / Event Manager |
| **Blogs Admin** | `/admin/dashboard/blogs` | Rich text article editor, status, publish | Admin / Content Editor |
| **Gallery Admin** | `/admin/dashboard/gallery` | Bulk image uploader and categorization | Admin / Content Editor |
| **Portfolio Admin** | `/admin/dashboard/portfolio` | Add/edit cohort startups and funding metrics | Admin |
| **Pages Admin** | `/admin/dashboard/pages` | Puck visual drag-and-drop page builder | Admin |
| **Roles & Admins** | `/admin/dashboard/roles` | RBAC permissions matrix and admin accounts | Super Admin |
| **System Settings**| `/admin/dashboard/settings` | Groq AI key, active model, site metadata | Super Admin |

---

## 3. End-to-End Walkthrough Scenarios

### Walkthrough 1: Public Portal Navigation & Groq AI Chatbot Interaction

```
[ Visit http://localhost:3000 ]
           |
           +---> 1. Scroll through Hero, Animated Stats Counters, & Leadership Carousel
           +---> 2. Click Floating "Genesis AI" Chat Widget (Bottom Right)
           +---> 3. Test Query 1 (Hinglish): "Genesis QUIC me apply kaise kare?"
           +---> 4. Test Query 2 (General): "Aamir Khan ka ghar kaha hai?"
           +---> 5. Verify immediate multilingual response + suggestion pills
```

1. Open `http://localhost:3000`.
2. Explore the landing page: view animated impact counters (50+ Startups, ₹25 Cr+ Funding), leadership carousel, and FAQ accordion.
3. Click the floating **Genesis AI** chatbot button in the bottom-right corner.
4. Type a test question in Hinglish or English:
   - *"Genesis QUIC me application process kya hai?"*
5. Observe the AI response:
   - Responds in fluent Hinglish/Hindi explaining the 4-step application process.
   - Provides suggestion pills (`Incubation Tracks`, `Seed Funding`, `How to Apply?`).
   - Renders direct action button linking to `/apply`.
6. Type a general knowledge query:
   - *"Aamir Khan ka ghar kaha hai?"*
7. Observe that the chatbot answers general queries accurately without blocking or breaking persona.

---

### Walkthrough 2: Submitting an Incubation Application & Admin Review

```
[ Applicant Visit /apply ]                          [ Admin Review /admin/dashboard/applications ]
            |                                                              |
    Fill Startup Form                                              View Submitted App
    & Submit Pitch Link                                                    |
            |                                                      Update Status to
            v                                                      "Under Review" or "Accepted"
   Saved in `applications` DB                                              |
   (or `memoryStore`)                                               Save Reviewer Notes
```

1. Navigate to `http://localhost:3000/apply`.
2. Fill out the application form:
   - **Startup Name**: `QuantumEdge AI`
   - **Lead Founder**: `Rahul Sharma`
   - **Email**: `rahul@quantumedge.io`
   - **Mobile**: `+91-9876543210`
   - **Sector**: `DeepTech / AI`
   - **Stage**: `MVP / Prototype`
   - **Description**: `Building energy-efficient LLM inference acceleration for edge robotics.`
   - **Pitch Deck Link**: `https://drive.google.com/file/d/sample-pitch`
3. Click **Submit Application**. Verify success toast notification.
4. Log into Admin Panel at `http://localhost:3000/admin` (Username: `admin`, Password: `admin123`).
5. Go to **Applications** (`/admin/dashboard/applications`).
6. Locate `QuantumEdge AI` in the applications table.
7. Click **View Details** to inspect pitch deck link and responses.
8. Update status from `Submitted` to `Under Review` or `Accepted` and click **Save Status**.

---

### Walkthrough 3: Custom Event Form Fields Creation & User Registration

```
ADMIN SIDE (/admin/dashboard/events)                  PUBLIC SIDE (/events)
         |                                                       |
 1. Create New Event                                    1. Browse Upcoming Events
 2. Add Custom Form Fields:                             2. Open Event Detail Page
    - Team Name (Text, Required)                        3. Click "Register Now"
    - Track (Select: AI/CleanTech)                      4. Dynamic Modal Renders Custom Fields
    - Proposal PDF (File, Optional)                     5. Fill & Submit Form
         |                                                       |
         +-------------------------> DB & MemoryStore <----------+
                                          |
                                          v
                              Admin Views Registrations
                              & Exports CSV File
```

1. In Admin Panel, navigate to **Events** (`/admin/dashboard/events`).
2. Click **Create Event**:
   - Title: `Genesis AI & Robotics Hackathon 2026`
   - Date: `2026-11-10`, Time: `10:00 AM`
   - Location: `Genesis Maker Space, Roorkee`
   - Capacity: `150`
3. In the **Form Field Builder**, configure custom registration questions:
   - **Field 1**: Label = `Team Name`, Type = `text`, Required = `Yes`.
   - **Field 2**: Label = `Hackathon Domain`, Type = `select`, Options = `Robotics, Computer Vision, Generative AI`, Required = `Yes`.
   - **Field 3**: Label = `Project Abstract PDF`, Type = `file`, Required = `No`.
4. Click **Publish Event**.
5. Open a new tab and visit public events page at `http://localhost:3000/events`.
6. Select `Genesis AI & Robotics Hackathon 2026` and click **Register Now**.
7. Observe `EventRegistrationModal`:
   - Renders input fields for `Team Name`, `Hackathon Domain` dropdown, and file upload zone dynamically based on admin configuration.
8. Input sample data and submit.
9. Return to Admin Panel -> **Events** -> **View Registrations** for this event to view the registrant's custom field responses.
10. Click **Export CSV** to download the registration manifest.

---

### Walkthrough 4: Blog & Gallery Content Management

1. In Admin Panel, navigate to **Blogs** (`/admin/dashboard/blogs`).
2. Click **Write New Blog**:
   - Title: `Scaling DeepTech Startups: From Lab to Market`
   - Category: `DeepTech`
   - Author: `Varun Tiwari`
   - Content: Input formatted article text with headings and blockquotes.
   - Status: `Published`
3. Click **Save Article**.
4. Visit public blog feed at `http://localhost:3000/blogs` to verify the newly published article appears instantly.
5. In Admin Panel, navigate to **Gallery** (`/admin/dashboard/gallery`).
6. Upload event photos, set titles and categories (`Events`, `Infrastructure`).
7. Visit public gallery at `http://localhost:3000/gallery` to test filtering tabs and lightbox preview.

---

### Walkthrough 5: Database Resilience & In-Memory Fallback Test

```
              TESTING DATABASE RESILIENCE
              
  [ Stop Local MySQL Service or Set Invalid DB_PASSWORD in .env ]
                               |
                               v
               [ Refresh Public Pages & Admin ]
                               |
                               v
  System detects DB error -> Seamlessly routes to `memoryStore.js`
  Page loads 100% cleanly with zero crash / 500 error screens!
```

1. To test system resilience when MySQL is offline:
   - Temporarily modify `DB_PASSWORD` in `.env` to an incorrect value or stop local MySQL service.
2. Refresh `http://localhost:3000`, `/events`, `/blogs`, `/portfolio`, and `/admin`.
3. Notice that all pages load instantly using `lib/memoryStore.js` fallback seed data.
4. Create a blog post or event in admin dashboard while offline — the system handles CRUD operations seamlessly within `memoryStore`.

---

## 4. Verification & Health Checklist

- [x] Next.js App Router and Pages API Router rendering cleanly without build or runtime errors.
- [x] MySQL database connection pool (`lib/db.js`) handling queries with automatic reconnection.
- [x] Universal In-Memory Fallback Store (`lib/memoryStore.js`) maintaining state across HMR reloads.
- [x] Groq AI Chatbot (`pages/api/chat.js`) returning multilingual responses with security key scrubbing.
- [x] Custom Event Form Fields Manager allowing dynamic field creation, dynamic UI rendering, and CSV exports.
- [x] All 8 public user portal pages (`/`, `/about`, `/apply`, `/events`, `/blogs`, `/portfolio`, `/gallery`, `/contact`) fully functional.
- [x] Admin Panel modules (`/admin/dashboard/*`) delivering complete CRUD capability across all resources.

---
*Verification guide updated for Genesis QUIC.*
