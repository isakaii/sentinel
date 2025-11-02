# Supabase Setup Instructions

## 1. Run the Database Migration

Go to your Supabase dashboard at https://supabase.com/dashboard/project/xkleihbhknwwevwbellv

1. Click on "SQL Editor" in the left sidebar
2. Click "New Query"
3. Copy and paste the contents of `supabase/migrations/001_initial_schema.sql`
4. Click "Run" to execute the migration

This will create:
- `users` table
- `courses` table
- `events` table
- Row Level Security policies
- Storage bucket for syllabus PDFs
- Indexes for performance
- Auto-update triggers
- **CRITICAL**: `handle_new_user()` trigger - automatically creates user record when email is verified

## 2. Enable Email Auth

1. Go to "Authentication" > "Providers" in your Supabase dashboard
2. Make sure "Email" provider is enabled
3. **Email Verification**: By default, Supabase requires email verification for new signups
   - Users will receive a verification email after signup
   - They must click the link before they can sign in
   - The `handle_new_user()` trigger automatically creates their user record upon verification

## 3. Verify Setup

After running the migration, you should see:
- Three tables (users, courses, events) in "Database" > "Tables"
- A storage bucket called "syllabi" in "Storage"
- RLS policies enabled on all tables

## Notes

- RLS (Row Level Security) is enabled to ensure users can only access their own data
- The storage bucket is private, users can only access their own uploaded syllabi
- Auth is handled automatically by Supabase
