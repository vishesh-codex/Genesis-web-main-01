# Full Documentation: Page, Code & Animation Mapping

This document provides a comprehensive map of how the visible pages of the Genesis QUIC website correspond to the underlying codebase, along with a detailed look at how animations are implemented.

## 1. Page to Code Mapping (Routing)

Next.js App Router uses file-system-based routing. The folders inside `app/` define the URL paths.

| Page / Route | File Location | Description |
| :--- | :--- | :--- |
| **Home Page** (`/`) | `app/page.tsx` | The main landing page. Features hero section, partners, leadership carousel, and startup highlights. |
| **About Us** (`/about`) | `app/about/page.tsx` | Details about Genesis QUIC, vision, and mission. |
| **Apply** (`/apply`) | `app/apply/page.tsx` | The incubation application form. |
| **Blogs** (`/blogs`) | `app/blogs/page.tsx` | News and views from the community. |
| **Events** (`/events`) | `app/events/page.tsx` | Upcoming hackathons, sessions, and events. |
| **Portfolio** (`/portfolio`) | `app/portfolio/page.tsx` | Showcases incubated startups and their progress. |
| **Admin Dashboard** (`/admin/*`) | `app/admin/page.tsx` | Protected routes for staff to manage content and review applications. Uses `components/admin-applications-page.jsx`. |
| **Legal Pages** | `app/privacy-policy/page.tsx`, `app/terms-conditions/page.tsx` | Static legal text and policies. |

## 2. Component Architecture (`components/`)

The UI is built using modular, reusable components heavily relying on **Shadcn UI** (Radix).
- **Core UI (`components/ui/`)**: Contains generic, accessible components like `button.tsx`, `card.tsx`, `dialog.tsx`, `accordion.tsx`, and `carousel.tsx`.
- **Layout Components**: 
  - `components/header.tsx`: The top navigation bar.
  - `components/footer.tsx`: The site footer.
- **Feature Components**:
  - `components/EventRegistrationModal.tsx`: A modal dialog allowing users to sign up for specific events.

## 3. Animation & Interactivity Documentation

Animations in the Genesis QUIC project are handled through three primary mechanisms: Tailwind CSS keyframes, Radix UI primitives, and Lottie React.

### A. Tailwind CSS & Tailwind-Animate
The primary engine for micro-interactions and smooth UI transitions.
- **Configuration**: Defined in `tailwind.config.ts`.
- **Keyframes**:
  - `accordion-down` & `accordion-up`: Smoothly expands and collapses accordion content by animating the `height` property.
  - `collapsible-down` & `collapsible-up`: Animates dropdowns and collapsible sections.
- **Plugin**: `tailwindcss-animate` is used to enable class-based animation utilities (e.g., `animate-in`, `fade-in`, `slide-in-from-bottom`).

### B. Component-Level Animations (Client-Side)
- **Carousel Transitions**: In `app/page.tsx`, the Leadership Messages carousel uses React `useState` and `useEffect` with `setInterval` to translate the X-axis:
  ```tsx
  style={{ transform: `translateX(-${currentSlide * 100}%)` }}
  ```
  Coupled with Tailwind's `transition-transform duration-500 ease-in-out` for a smooth sliding effect.
- **FAQ Accordions**: Handled via simple state toggling (`expandedFAQ === index`), with Chevron icons rotating using Tailwind's `rotate-180 transition-transform`.

### C. Advanced Animations (Lottie)
- The project includes `lottie-react` in its dependencies.
- **Usage**: Used for high-quality, lightweight vector animations (JSON-based) typically exported from Adobe After Effects. These are likely used for loading states, empty states in the admin dashboard, or hero illustrations on specific pages.

### D. Embla Carousel
- The project includes `embla-carousel-react`, which powers smooth, touch-friendly, physics-based sliding carousels, likely used inside the `components/ui/carousel.tsx` component for image galleries or startup portfolios.
