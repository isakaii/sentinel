# Sentinel

**Automated peace of mind for managing course syllabi and deadlines**

Sentinel is an academic calendar management application that helps university students automatically extract events from course syllabi and sync them to Google Calendar.

## Features

- **Course Management**: Create and manage courses with custom colors
- **PDF Upload**: Upload course syllabi with drag-and-drop interface
- **Automatic Parsing**: AI-powered extraction of assignments, exams, quizzes, and deadlines
- **Event Timeline**: View all events in chronological or course-grouped views
- **Google Calendar Sync**: Two-way synchronization with Google Calendar
- **Dashboard**: See upcoming deadlines and progress at a glance

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Database**: Supabase (Postgres)
- **Authentication**: Supabase Auth
- **LLM**: OpenAI API (GPT-4o-mini)
- **PDF Processing**: pdf-parse, pdfjs-dist, tesseract.js
- **Calendar**: Google Calendar API
- **Hosting**: Vercel

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Supabase account
- OpenAI API key
- Google Cloud Console project (for Calendar API)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/isakaii/sentinel.git
cd sentinel
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env.local
```

Edit `.env.local` and add your API keys:
- `NEXT_PUBLIC_SUPABASE_URL`: Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Your Supabase anonymous key
- `SUPABASE_SERVICE_ROLE_KEY`: Your Supabase service role key
- `OPENAI_API_KEY`: Your OpenAI API key
- `GOOGLE_CLIENT_ID`: Your Google OAuth client ID
- `GOOGLE_CLIENT_SECRET`: Your Google OAuth client secret

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.