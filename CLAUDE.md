# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Sentinel is an academic calendar management application built with Next.js 15 that helps university students automatically extract events from course syllabi and sync them to Google Calendar.

**Current Status**:
- ✅ Frontend complete with full UI/UX implementation
- ✅ Backend core features implemented (authentication, database, API routes, PDF processing, AI extraction)
- ✅ Date synchronization (timeline shows only upcoming events based on current date)
- ✅ Event completion tracking, event editing (CRUD)
- 🚧 In progress: Google Calendar integration and advanced features

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
  - `auth/` - Authentication endpoints (Supabase Auth)

### Component Organization

Components are organized by domain:

- `components/ui/` - Base UI primitives (button, card, badge, modal, input, select, dropdown-menu)
- `components/layout/` - Layout components (header, navigation-tabs, dashboard-layout)
- `components/courses/` - Course-specific components (course-card, course-list, add-course-modal, upload-syllabus-modal)
- `components/events/` - Event-specific components (event-card, event-timeline, next-deadline, coming-up-week)
- `components/auth/` - Authentication components (login-form, signup-form, auth-modal)
- `components/providers/` - React context providers (auth-provider)

**Pattern**: All UI components use the `cn()` utility from `lib/utils/cn.ts` for className merging with Tailwind.

### Data Layer

**Current State**: Application uses Supabase PostgreSQL database with Row Level Security (RLS).

- `lib/types/index.ts` - TypeScript interfaces for Course, Event, User, DashboardStats
- `lib/supabase/client.ts` - Client-side Supabase client
- `lib/supabase/server.ts` - Server-side Supabase client (for API routes)
- `lib/contexts/AuthContext.tsx` - React context for authentication state
- `supabase/migrations/` - Database migration files
  - `001_initial_schema.sql` - Tables, indexes, RLS policies, storage buckets
  - `002_add_user_trigger.sql` - Automatic user creation trigger

**Database Schema**:
- `users` - User profiles with Google Calendar connection status
- `courses` - Course information with syllabus URLs and event counts
- `events` - Calendar events with course relationships and sync status
- Storage bucket: `syllabi` - PDF storage with user-scoped access policies

**Key Features**:
- Row Level Security ensures users only access their own data
- Cascade deletes: deleting a course deletes all associated events
- Automatic timestamps with triggers

### Type System

Core types are defined in `lib/types/index.ts`:

- **CourseColor**: 8 predefined colors for course organization (purple, blue, red, green, orange, pink, indigo, teal)
- **EventType**: assignment, exam, quiz, reading, important_date
- **Course**: Main course entity with userId, syllabusUrl, eventsExtracted count
- **Event**: Calendar event with courseId, type, date/time, completion status, Google Calendar sync status

### Styling

**Tailwind CSS** is used throughout with custom color extensions:

- Course colors: `course.{color}` (e.g., `bg-course-purple`)
- Event type colors: `event.{type}` (e.g., `text-event-exam`)
- Import alias: `@/*` maps to project root

Configuration in `tailwind.config.ts` defines the color system that matches the design mockups.

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

### ✅ UI Features
- Course management (add, delete, view)
- Event timeline with filtering (by course, by type, by completion status)
- Event deletion with confirmation
- **Event completion tracking** with checkbox UI, visual feedback, and show/hide completed filter
- **Event editing** with full modal interface for updating all event fields (title, description, date, time, type)
- Loading states with animated feedback
- Event count display (replaced problematic progress bars)
- Dropdown menus for actions (edit event, delete course, delete event)
- **Date-based filtering** - Dashboard shows only upcoming events (today and future)

## Remaining Features to Implement

### 🚧 Priority 1: Google Calendar Integration
**Status**: Database schema ready (`google_calendar_connected`, `synced_to_calendar`, `google_calendar_event_id` fields exist)

**Remaining Work**:
1. **OAuth Flow**
   - Implement Google OAuth 2.0 callback endpoint
   - Store refresh tokens securely in user profiles
   - Add "Connect Google Calendar" button to UI
   - Handle token refresh for long-lived access

2. **Two-Way Sync**
   - Create events in Google Calendar when extracted from syllabus
   - Update events in Google Calendar when modified in Sentinel
   - Delete from Google Calendar when deleted in Sentinel
   - Sync completion status to Google Calendar
   - Handle sync conflicts and errors gracefully

3. **UI Updates**
   - Show sync status on event cards
   - Add manual sync trigger button
   - Display last sync timestamp
   - Show errors if sync fails

**Files to Create/Modify**:
- `app/api/auth/google/callback/route.ts` - OAuth callback handler
- `app/api/calendar/sync/route.ts` - Manual sync endpoint
- `lib/google/calendar.ts` - Google Calendar API client
- Update event creation to trigger calendar sync
- Add sync status indicators to UI components

### 🚧 Priority 2: Additional Features

1. **Notifications & Reminders**
   - Email reminders for upcoming deadlines
   - In-app notification system
   - Customizable reminder timing (1 day before, 1 week before, etc.)

2. **Bulk Operations**
   - Select multiple events for bulk actions
   - Bulk delete events
   - Bulk mark as complete

3. **Advanced Syllabus Parsing**
   - Support for non-PDF formats (Word docs, images)
   - Manual event creation from UI
   - AI improvement: better date inference and context understanding
   - Handle multi-semester syllabi

4. **Analytics & Insights**
   - Workload visualization (events per week)
   - Course-by-course workload comparison
   - Upcoming deadline density heatmap
   - Study time recommendations based on upcoming events
   - Completion statistics and trends

5. **Course Management Enhancements**
   - Edit course details (name, instructor, term)
   - Archive courses instead of deleting
   - Course templates for common course structures
   - Re-upload syllabus to update events

6. **Export Features**
   - Export events to .ics file
   - Export to other calendar platforms (Outlook, Apple Calendar)
   - PDF export of schedule

7. **Collaboration Features**
   - Share course schedules with classmates
   - Group study session scheduling
   - Study group coordination

## Client-Side State Management

The application uses React's `useState` for local state and React Context for global state:

### Authentication State
- `lib/contexts/AuthContext.tsx` - Global auth state provider
- Wraps app in `components/providers/auth-provider.tsx`
- Provides `user`, `loading`, and auth methods to all components

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

### Date Handling
- Event dates stored as `DATE` type in database (YYYY-MM-DD format)
- Event times stored as `TIME` type (HH:MM:SS format)
- Use `lib/utils/date.ts` utilities for formatting and display
- **Known Issue**: Need to sync to current date for timeline features (see Priority 1 in TODOs)

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
- `backend-dev` - Current development branch (check git status before working)

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

### Testing Syllabus Parsing
1. Ensure `OPENAI_API_KEY` is set in `.env.local`
2. Upload a real course syllabus PDF (10MB max)
3. Check console logs for parsing progress
4. Review extracted events in database/UI
5. Refine AI prompt in `app/api/syllabi/upload/route.ts` if needed
