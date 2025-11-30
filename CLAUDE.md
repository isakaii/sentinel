# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Sentinel is an academic calendar management application built with Next.js 15 that helps university students automatically extract events from course syllabi and sync them to Google Calendar.

**Current Status**:
- ✅ Frontend complete with full UI/UX implementation
- ✅ Backend core features implemented (authentication, database, API routes, PDF processing, AI extraction)
- ✅ Date synchronization (timeline shows only upcoming events based on current date)
- ✅ Event completion tracking, event editing (CRUD)
- ✅ Google Calendar integration (OAuth + manual sync working)
- ✅ Dark mode with system preference detection
- ✅ In-app notifications for upcoming deadlines
- ✅ Settings modal with user preferences

## Development Commands

```bash
# Development
npm run dev        # Start Next.js dev server on http://localhost:3000
npm run build      # Build production bundle
npm run start      # Start production server
npm run lint       # Run Next.js linter
```

## Architecture

### App Router Structure

This is a **Next.js 15 App Router** project. All pages use the `app/` directory structure:

- `app/page.tsx` - Landing/home page
- `app/(dashboard)/` - Route group for protected dashboard routes (uses shared layout)
  - `dashboard/page.tsx` - Main dashboard view
  - `courses/page.tsx` - Course list view
  - `events/page.tsx` - Event timeline view
- `app/api/` - API routes for backend operations
  - `courses/` - CRUD operations for courses
  - `events/` - CRUD operations for events
  - `syllabi/upload/` - PDF upload and AI-powered extraction
  - `auth/` - Authentication endpoints (Supabase Auth, Google OAuth)
  - `user/preferences/` - User preferences API

### Component Organization

Components are organized by domain:

- `components/ui/` - Base UI primitives (button, card, badge, modal, input, select, dropdown-menu)
- `components/layout/` - Layout components (header, navigation-tabs, dashboard-layout, notification-bell)
- `components/courses/` - Course-specific components (course-card, course-list, add-course-modal, upload-syllabus-modal)
- `components/events/` - Event-specific components (event-card, event-timeline, next-deadline, coming-up-week)
- `components/auth/` - Authentication components (login-form, signup-form, auth-modal)
- `components/settings/` - Settings components (settings-modal)
- `components/google/` - Google integration components (google-connection-button)
- `components/providers/` - React context providers (auth-provider, Providers wrapper)

**Pattern**: All UI components use the `cn()` utility from `lib/utils/cn.ts` for className merging with Tailwind.

### Data Layer

**Current State**: Application uses Supabase PostgreSQL database with Row Level Security (RLS).

- `lib/types/index.ts` - TypeScript interfaces for Course, Event, User, DashboardStats, ThemePreference, NotificationTiming
- `lib/supabase/client.ts` - Client-side Supabase client
- `lib/supabase/server.ts` - Server-side Supabase client (for API routes)
- `lib/contexts/AuthContext.tsx` - React context for authentication state
- `lib/contexts/ThemeContext.tsx` - React context for theme/dark mode state
- `supabase/migrations/` - Database migration files
  - `001_initial_schema.sql` - Tables, indexes, RLS policies, storage buckets
  - `002_add_user_trigger.sql` - Automatic user creation trigger
  - `005_add_user_preferences.sql` - Theme preference and notification timing columns

**Database Schema**:
- `users` - User profiles with Google Calendar connection status, theme preference, notification timing
- `courses` - Course information with syllabus URLs, event counts, Google Calendar IDs
- `events` - Calendar events with course relationships and sync status
- Storage bucket: `syllabi` - PDF storage with user-scoped access policies

**Key Features**:
- Row Level Security ensures users only access their own data
- Cascade deletes: deleting a course deletes all associated events
- Automatic timestamps with triggers

### Type System

Core types are defined in `lib/types/index.ts`:

- **CourseColor**: 8 predefined colors for course organization (cardinal, blue, red, green, orange, pink, indigo, teal)
- **EventType**: assignment, exam, quiz, reading, important_date
- **ThemePreference**: 'light' | 'dark' | 'system'
- **NotificationTiming**: '1_day' | '3_days' | '1_week'
- **Course**: Main course entity with userId, syllabusUrl, eventsExtracted count, googleCalendarId
- **Event**: Calendar event with courseId, type, date/time, completion status, Google Calendar sync status
- **User**: User profile with themePreference, notificationTiming array, googleCalendarConnected

### Styling

**Tailwind CSS v4** is used throughout with custom color extensions:

- Course colors: `course.{color}` (e.g., `bg-course-cardinal`)
- Event type colors: `event.{type}` (e.g., `text-event-exam`)
- Dark mode: Uses `@custom-variant dark (&:where(.dark, .dark *))` in globals.css
- Import alias: `@/*` maps to project root

Configuration in `tailwind.config.ts` defines the color system that matches the design mockups.

**Dark Mode Implementation**:
- All components include `dark:` variant classes for dark mode styling
- Theme state managed by `ThemeContext` with localStorage persistence
- System preference detection via `window.matchMedia('(prefers-color-scheme: dark)')`
- Flash prevention script in `app/layout.tsx` applies theme before render

## Environment Variables

Required variables (from `.env.example`):

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# OpenAI (for syllabus parsing)
OPENAI_API_KEY=

# Google Calendar
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=

# Next Auth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=
```

## Implemented Backend Features

The following backend features are fully implemented:

### ✅ Authentication & Authorization
- Supabase Auth integration with email/password
- Protected routes with middleware (`middleware.ts`)
- Row Level Security (RLS) policies on all tables
- User profile creation on signup via database trigger

### ✅ Database & API Routes
- **Courses API** (`app/api/courses/`)
  - `GET /api/courses` - List all user's courses
  - `GET /api/courses/[id]` - Get specific course
  - `PATCH /api/courses/[id]` - Update course (color, name, etc.)
  - `DELETE /api/courses/[id]` - Delete course (cascades to events)

- **Events API** (`app/api/events/`)
  - `GET /api/events` - List all user's events (sorted by date)
  - `PATCH /api/events/[id]` - Update event (completion status, details)
  - `DELETE /api/events/[id]` - Delete individual event

- **User Preferences API** (`app/api/user/preferences/`)
  - `GET /api/user/preferences` - Get user's theme and notification settings
  - `PATCH /api/user/preferences` - Update user preferences

### ✅ PDF Processing & AI Extraction
- **Syllabus Upload** (`app/api/syllabi/upload/`)
  - PDF file validation (type, size checks)
  - Upload to Supabase Storage with user-scoped access
  - OpenAI GPT-4o integration with file search
  - Advanced AI prompt for comprehensive date extraction:
    - Extracts assignments, exams, quizzes, project deadlines
    - Handles multiple date formats and patterns
    - Focuses on evaluation/grading sections where deadlines are listed
    - Parses numbered assignments (PS1, PS2, etc.)
    - Identifies exam times and date ranges
  - Automatic course creation or update
  - Event creation in database
  - Progress feedback UI with rotating status messages

### ✅ Google Calendar Integration
- **OAuth Flow** - Complete Google OAuth 2.0 authentication with token storage and refresh
- **Manual Calendar Management** - Users can create per-course calendars and manually sync events
- **Sync Endpoints** - `app/api/courses/[id]/calendar/` routes for create/delete calendars and manual sync
- **Google Calendar API Client** - `lib/google/calendar.ts` handles event creation/updates/deletion
- **Connection Management** - `app/api/auth/google/` handles OAuth flow and disconnection

**Current Limitations**:
- No automatic sync when events are edited or deleted in Sentinel
- No two-way sync from Google Calendar back to Sentinel

### ✅ Dark Mode & Theming
- **ThemeContext** (`lib/contexts/ThemeContext.tsx`) - Global theme state management
- Three theme options: Light, Dark, System (follows OS preference)
- Persistence in localStorage with database sync
- System preference change listener for real-time updates
- Flash prevention with inline script before page render
- All UI components styled with `dark:` Tailwind variants

### ✅ In-App Notifications
- **Notification Bell** (`components/layout/notification-bell.tsx`) - Header component showing upcoming deadlines
- Configurable reminder timing (1 day, 3 days, 1 week before deadlines)
- Badge showing count of upcoming items
- Dropdown with grouped deadlines by urgency (Today, Tomorrow, This week)
- Click to navigate to events page

### ✅ Settings Modal
- **Settings Modal** (`components/settings/settings-modal.tsx`) - Quick access settings UI
- **Appearance Section**: Theme selector with Light/Dark/System options
- **Deadline Reminders Section**: Configurable notification timing checkboxes
- **Google Calendar Section**: Connection status with connect/disconnect button
- Accessible via settings icon in header

### ✅ UI Features
- Course management (add, delete, view)
- Event timeline with filtering (by course, by type, by completion status)
- Event deletion with confirmation
- **Event completion tracking** with checkbox UI, visual feedback, and show/hide completed filter
- **Event editing** with full modal interface for updating all event fields (title, description, date, time, type)
- Loading states with animated feedback
- Event count display
- Dropdown menus for actions (edit event, delete course, delete event)
- **Date-based filtering** - Dashboard shows only upcoming events (today and future)
- **Google Calendar connection button** - Connect/disconnect Google account
- **Full dark mode support** across all components

## Remaining Features to Implement

1. **Google Calendar sync status indicators displayed on Course cards**
   - Status of whether the course is added to Google Calendar

2. **Advanced Syllabus Parsing**
   - Support for non-PDF formats (Word docs, images)
   - Manual event creation from UI
   - AI improvement: better date inference and context understanding
   - Handle multi-semester syllabi

3. **2-Way Sync for Sentinel / Google Calendar**
   - Reflect changes on Sentinel to Google Calendar events, and vice versa
   - Automatic sync on event edit/delete

4. **Course Management Enhancements**
   - Archive courses instead of deleting
   - Re-upload syllabus to update events

5. **Collaboration Features**
   - Share course schedules with classmates
   - Group study session scheduling
   - Study group coordination

## Client-Side State Management

The application uses React's `useState` for local state and React Context for global state:

### Authentication State
- `lib/contexts/AuthContext.tsx` - Global auth state provider
- Wraps app in `components/providers/auth-provider.tsx`
- Provides `user`, `loading`, and auth methods to all components

### Theme State
- `lib/contexts/ThemeContext.tsx` - Global theme state provider
- Provides `theme`, `resolvedTheme`, and `setTheme` to all components
- Handles system preference detection and localStorage persistence

### Page-Level State Management

Each dashboard page manages its own data fetching and state:

**Dashboard Page** (`app/(dashboard)/dashboard/page.tsx`):
- Fetches courses and events on mount
- `handleAddCourse` - Upload syllabus PDF, extract course info, create course
- `handleUploadSyllabus` - Upload syllabus to existing course, parse events
- `handleDeleteCourse` - Delete course and cascade to events

**Courses Page** (`app/(dashboard)/courses/page.tsx`):
- Similar handlers to dashboard page
- Focused on course management

**Events Page** (`app/(dashboard)/events/page.tsx`):
- Fetches events and courses
- `handleDeleteEvent` - Delete individual event
- Event filtering by course and type

### Data Fetching Pattern
All pages follow this pattern:
1. `useState` for local data and loading state
2. `useEffect` to fetch on mount
3. `fetchData()` function for API calls
4. Refetch after mutations (create, update, delete)

## Important Implementation Notes

### Dropdown Menu Pattern
The app uses HeadlessUI's `Menu` component for dropdowns. Key implementation details:
- Use the `close()` function from HeadlessUI's render prop to close menu after action
- Call action handlers BEFORE closing menu to ensure event propagation
- Example: `onClick={() => { onClick?.(); setTimeout(() => close(), 0); }}`

### Dark Mode Pattern
All components should include dark mode variants:
- Background: `bg-white dark:bg-gray-900` or `bg-gray-50 dark:bg-gray-800`
- Text: `text-gray-900 dark:text-white` or `text-gray-600 dark:text-gray-400`
- Borders: `border-gray-200 dark:border-gray-700`
- Hover states: Include both light and dark variants

### Date Handling
- Event dates stored as `DATE` type in database (YYYY-MM-DD format)
- Event times stored as `TIME` type (HH:MM:SS format)
- Use `lib/utils/date.ts` utilities for formatting and display

### File Upload & Processing
- Maximum PDF size: 10MB
- Files uploaded to Supabase Storage bucket `syllabi`
- User-scoped folder structure: `{userId}/{timestamp}-{filename}`
- OpenAI processes files using Assistants API with file search
- Cleanup: OpenAI files and assistants are deleted after processing

### Error Handling
- User-friendly error messages for common scenarios
- API errors transformed to readable messages
- Console logging for debugging (should be removed in production)
- Confirmation dialogs for destructive actions (delete course, delete event)

### Performance Considerations
- Database queries include proper indexes (see migration files)
- RLS policies ensure secure data access
- Use `.select()` to limit returned fields when possible
- Events ordered by date for timeline performance

## Branch Strategy

- `main` - Main branch for production
- `backend-features` - Current development branch

When creating PRs, target the `main` branch unless otherwise specified.

## Common Development Tasks

### Adding a New Event Field
1. Update `lib/types/index.ts` - Add field to `Event` interface
2. Update `supabase/migrations/` - Create new migration file to alter table
3. Update API routes - Add field to transformation functions
4. Update UI components - Display new field in event cards

### Adding a New API Endpoint
1. Create route file: `app/api/{resource}/route.ts`
2. Import Supabase server client: `import { createClient } from '@/lib/supabase/server'`
3. Check authentication: `const { data: { user } } = await supabase.auth.getUser()`
4. Implement handler with proper error handling
5. Transform snake_case database fields to camelCase for frontend

### Adding Dark Mode to a Component
1. Add `dark:` variants to all background colors (e.g., `bg-white dark:bg-gray-900`)
2. Add `dark:` variants to text colors (e.g., `text-gray-900 dark:text-white`)
3. Add `dark:` variants to border colors (e.g., `border-gray-200 dark:border-gray-700`)
4. Update hover and focus states with dark variants
5. Test in both light and dark modes

### Testing Syllabus Parsing
1. Ensure `OPENAI_API_KEY` is set in `.env.local`
2. Upload a real course syllabus PDF (10MB max)
3. Check console logs for parsing progress
4. Review extracted events in database/UI
5. Refine AI prompt in `app/api/syllabi/upload/route.ts` if needed
