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

## Project Structure

```
sentinel/
├── app/                    # Next.js App Router pages
│   ├── (dashboard)/       # Protected dashboard routes
│   ├── api/               # API routes
│   └── globals.css        # Global styles
├── components/
│   ├── ui/                # Reusable UI components
│   ├── courses/           # Course-related components
│   ├── events/            # Event-related components
│   └── layout/            # Layout components
├── lib/
│   ├── supabase/          # Supabase client
│   ├── utils/             # Utility functions
│   ├── types/             # TypeScript types
│   └── data/              # Mock data
└── hooks/                 # Custom React hooks
```

## Development Roadmap

### Frontend (Completed)
- ✅ Project setup with Next.js, TypeScript, and Tailwind CSS
- ✅ Design system and UI component library
- ✅ Course management (create, view, upload syllabus)
- ✅ Event timeline with filtering
- ✅ Dashboard with next deadline and upcoming events
- ✅ PDF upload interface with drag-and-drop

### Backend (Pending)
- ⏳ Supabase database schema and RLS policies
- ⏳ PDF text extraction pipeline
- ⏳ OpenAI API integration for syllabus parsing
- ⏳ Google Calendar OAuth and sync functionality
- ⏳ API routes for CRUD operations

### Testing & Optimization
- ⏳ Unit tests for components
- ⏳ Integration tests for workflows
- ⏳ Performance optimization (<15s latency target)
- ⏳ Accessibility improvements

## Contributing

This is a course project for demonstrating LLM-assisted development tools. Contributions are welcome after the course concludes.

## License

ISC

## Acknowledgments

Built with AI-powered development tools including:
- Claude Code (code generation)
- GitHub Copilot (code completion)
- Cursor (component scaffolding)
