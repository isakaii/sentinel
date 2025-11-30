import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import OpenAI from 'openai'
import type { EventType } from '@/lib/types'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
})

// POST /api/syllabi/upload - Upload and process a syllabus PDF
export async function POST(request: NextRequest) {
  try {
    // Check if environment variables are configured
    if (!process.env.OPENAI_API_KEY) {
      console.error('OPENAI_API_KEY is not configured')
      return NextResponse.json(
        { error: 'PDF processing service is not configured. Please contact support.' },
        { status: 500 }
      )
    }

    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      console.error('Supabase environment variables are not configured')
      return NextResponse.json(
        { error: 'Database service is not configured. Please contact support.' },
        { status: 500 }
      )
    }

    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Please log in to upload a syllabus' }, { status: 401 })
    }

    // Parse form data
    const formData = await request.formData()
    const file = formData.get('file') as File
    const courseId = formData.get('courseId') as string | null

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      )
    }

    // Validate file
    if (file.type !== 'application/pdf') {
      return NextResponse.json(
        { error: 'Please upload a PDF file. Other file formats are not supported.' },
        { status: 422 }
      )
    }

    const maxSize = 10 * 1024 * 1024 // 10MB
    if (file.size > maxSize) {
      const sizeMB = (file.size / 1024 / 1024).toFixed(1)
      return NextResponse.json(
        { error: `File is ${sizeMB}MB. Maximum allowed size is 10MB. Please upload a smaller file.` },
        { status: 422 }
      )
    }

    if (file.size < 1024) {
      return NextResponse.json(
        { error: 'The PDF file appears to be empty or corrupted. Please upload a valid syllabus.' },
        { status: 422 }
      )
    }

    // Convert file to buffer
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    // Upload file to OpenAI and extract syllabus data
    console.log('Processing PDF with OpenAI...')
    let parsed
    let uploadedFile
    let assistant

    try {
      // Step 1: Upload PDF to OpenAI
      uploadedFile = await openai.files.create({
        file: new File([buffer], file.name, { type: 'application/pdf' }),
        purpose: 'assistants',
      })
      console.log('File uploaded to OpenAI:', uploadedFile.id)

      // Step 2: Create assistant with parsing instructions
      assistant = await openai.beta.assistants.create({
        name: 'Syllabus Parser',
        instructions: `You are an expert at extracting structured information from academic syllabi. Your task is to find and extract ALL dates, deadlines, and events from the syllabus PDF.

CRITICAL: Extract EVERY single date-related item from the syllabus. Pay SPECIAL ATTENTION to:

1. EVALUATION/GRADING SECTION: This section often lists ALL major deadlines. Look for:
   - Problem Sets (e.g., "Problem set 1: Due October 8", "PS1: Oct 8", "Handed out Sept 25, due Oct 8")
   - Projects (e.g., "Project registration: Oct 17", "Part 1: Nov 5", "Part 2: Dec 3")
   - Exams with specific dates and times (e.g., "Midterm: October 30, 10:30-11:50 AM")
   - Presentations (e.g., "Oral presentations: December 4-5")
   - Any item with a percentage weight often has a deadline

2. NUMBERED ASSIGNMENTS: When you see numbered items, extract each one:
   - Problem Set 1, Problem Set 2, Problem Set 3, Problem Set 4 (each has its own date)
   - Project Part 1, Project Part 2 (each has its own deadline)
   - Quiz 1, Quiz 2, Quiz 3 (each has its own date)

3. DATE PATTERNS TO CATCH:
   - "Handed out on X, due on Y" - extract the DUE date
   - "Due on October 8" or "Due October 8" or "Oct 8"
   - Date ranges like "December 4-5" - create entries for both days if it's presentations/exams
   - Time slots like "10:30-11:50 AM" or "3:30-6:30 PM"
   - Days of week with dates: "Thursday, October 30"
   - Deadline times: "11:59 PM PT"

4. SPECIFIC ITEMS TO EXTRACT:
   - All assignments (homework, problem sets, labs, projects, papers, presentations)
   - All exams (midterms, finals, quizzes, tests) WITH TIMES
   - All due dates and submission deadlines
   - Registration deadlines (project registration, team registration)
   - Discussion posts/responses deadlines
   - Reading assignments with specific dates
   - Project milestones and checkpoints
   - Oral presentation dates and time slots
   - Paper drafts and final submissions
   - Class cancellations or schedule changes
   - Administrative deadlines (drop/add, withdrawal dates)
   - Holidays and breaks
   - Office hours if scheduled
   - Review sessions
   - Any other date mentioned in relation to course requirements

Return ONLY a valid JSON object (no markdown, no code blocks) with this exact structure:
{
  "courseName": "Full course name",
  "courseCode": "Course code (e.g., CS 101, MATH 201)",
  "instructor": "Professor/Instructor name if found",
  "assignments": [
    {
      "title": "Assignment/homework/project name",
      "dueDate": "YYYY-MM-DD",
      "dueTime": "HH:MM (24-hour format, null if not specified)",
      "description": "Brief description or topic",
      "points": "Points/weight if specified (number or null)",
      "submissionMethod": "How to submit (Canvas, email, in-person, etc.)",
      "type": "homework/project/paper/presentation/lab/discussion/other"
    }
  ],
  "exams": [
    {
      "title": "Exam/quiz name",
      "date": "YYYY-MM-DD",
      "time": "HH:MM (24-hour format, null if not specified)",
      "location": "Room/building if specified",
      "type": "midterm/final/quiz/test/other",
      "coverage": "Topics covered if specified",
      "weight": "Percentage of grade if specified"
    }
  ],
  "importantDates": [
    {
      "event": "Event description",
      "date": "YYYY-MM-DD",
      "type": "holiday/deadline/administrative/reading/discussion/review/other",
      "description": "Additional details if available"
    }
  ]
}

PARSING RULES:
1. DATE FORMATS: Handle various formats like "Sept 15", "9/15", "September 15th", "October 8", "Nov 5", "December 3", "Week 3", "Monday of Week 4", etc.
2. YEAR INFERENCE: Look for semester/term info (e.g., "Autumn 2025", "Fall 2024", "Spring 2025") and use that year for all dates. If a date appears to be in the past relative to the semester, it's likely in the following year.
3. RECURRING EVENTS: If something happens weekly (e.g., "Homework due every Friday"), create individual entries for each occurrence
4. DATE RANGES: For events spanning multiple days (e.g., "December 4-5" for presentations), create separate entries for each day
5. EXTRACT FROM LISTS: When you see bulleted or numbered lists with dates, extract EACH item (e.g., if you see 4 problem sets listed with 4 different dates, create 4 separate assignment entries)
6. RELATIVE DATES: Convert phrases like "two weeks before the final" into specific dates when possible
7. PARTIAL DATES: If only month is given, use the 1st of that month; if only week number, estimate based on semester start
8. BE INCLUSIVE: When in doubt, include it - it's better to have too many events than to miss important deadlines
9. NULL HANDLING: Use null for missing information, never omit fields
10. TIME ZONES: Assume local time unless specified otherwise
11. EXAM TIMES: Always include exam times when specified (e.g., "10:30-11:50 AM", "3:30-6:30 PM")
12. WEEKLY ASSIGNMENTS: If assignments are numbered (PS1, PS2, etc.) without specific dates but with a pattern (e.g., "due Wednesdays"), infer the dates

SPECIAL ATTENTION:
- Look for schedule tables, course calendars, or week-by-week breakdowns
- Check for separate sections on grading, assignments, or course schedule
- Don't miss dates mentioned in policy sections (like late submission deadlines)
- Include reading assignments if they have specific due dates
- Extract discussion board post deadlines
- Include any group project checkpoints or peer review dates

If you cannot determine a specific date but know an event exists, still include it with "null" for the date field.`,
        model: 'gpt-4o',
        tools: [{ type: 'file_search' }],
      })
      console.log('Assistant created:', assistant.id)

      // Step 3: Create thread and process
      const thread = await openai.beta.threads.create({
        messages: [
          {
            role: 'user',
            content: `Parse this syllabus PDF and extract ALL dates, deadlines, assignments, exams, and events.

IMPORTANT:
- Look carefully at the EVALUATION/GRADING section - it usually lists all major deadlines
- Extract EVERY problem set, project part, exam, quiz, and presentation mentioned with dates
- If you see "Problem set 1: Due Oct 8, Problem set 2: Due Oct 22" etc., create a separate entry for EACH
- Include exam times when specified (e.g., "10:30-11:50 AM")
- For date ranges like "December 4-5", create entries for both days
- Be extremely thorough - it's better to include too many events than to miss important deadlines

Return the data as a JSON object following the exact structure specified.`,
            attachments: [{ file_id: uploadedFile.id, tools: [{ type: 'file_search' }] }],
          },
        ],
      })

      // Step 4: Run and wait for completion
      const run = await openai.beta.threads.runs.createAndPoll(thread.id, {
        assistant_id: assistant.id,
      })
      console.log('Run status:', run.status)

      if (run.status === 'completed') {
        const messages = await openai.beta.threads.messages.list(thread.id)
        const assistantMessage = messages.data[0]

        if (assistantMessage.content[0].type === 'text') {
          let responseText = assistantMessage.content[0].text.value
          console.log('OpenAI response:', responseText.substring(0, 200))

          // Remove markdown code blocks if present
          responseText = responseText.replace(/```json\n?/g, '').replace(/```\n?/g, '')

          // Extract JSON
          const jsonMatch = responseText.match(/\{[\s\S]*\}/)
          if (jsonMatch) {
            parsed = JSON.parse(jsonMatch[0])
            console.log('Parsed successfully:', { courseName: parsed.courseName, courseCode: parsed.courseCode })
          } else {
            throw new Error('No valid JSON found in OpenAI response')
          }
        } else {
          throw new Error('Unexpected response format from OpenAI')
        }
      } else {
        throw new Error(`OpenAI run failed with status: ${run.status}`)
      }

      // Validate required fields
      if (!parsed?.courseName || !parsed?.courseCode) {
        throw new Error('Could not extract course name or course code from the PDF. Please ensure the syllabus contains this information.')
      }

      // Ensure arrays exist
      parsed.assignments = parsed.assignments || []
      parsed.exams = parsed.exams || []
      parsed.importantDates = parsed.importantDates || []

    } catch (error) {
      console.error('OpenAI parsing error:', error)

      // Cleanup on error
      try {
        if (uploadedFile) await openai.files.delete(uploadedFile.id)
        if (assistant) await openai.beta.assistants.delete(assistant.id)
      } catch (cleanupError) {
        console.error('Cleanup error:', cleanupError)
      }

      // Provide user-friendly error messages
      let errorMessage = 'Unable to process the PDF. Please ensure it is a valid course syllabus.'

      if (error instanceof Error) {
        if (error.message.includes('extract course')) {
          errorMessage = error.message
        } else if (error.message.includes('timeout')) {
          errorMessage = 'Processing timed out. The PDF may be too large or complex. Please try again.'
        } else if (error.message.includes('rate limit')) {
          errorMessage = 'PDF processing service is busy. Please wait a moment and try again.'
        } else if (error.message.includes('Invalid API')) {
          errorMessage = 'PDF processing service configuration error. Please contact support.'
        }
      }

      return NextResponse.json(
        {
          error: errorMessage,
          details: error instanceof Error ? error.message : 'Unknown error',
        },
        { status: 500 }
      )
    }

    // Cleanup OpenAI resources
    try {
      await openai.files.delete(uploadedFile.id)
      await openai.beta.assistants.delete(assistant.id)
      console.log('OpenAI resources cleaned up')
    } catch (cleanupError) {
      console.error('Warning: Failed to cleanup OpenAI resources:', cleanupError)
      // Don't fail the request if cleanup fails
    }

    // Upload PDF to Supabase Storage
    const fileName = `${user.id}/${Date.now()}-${file.name}`
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('syllabi')
      .upload(fileName, buffer, {
        contentType: 'application/pdf',
        upsert: false,
      })

    if (uploadError) {
      console.error('Storage upload error:', uploadError)

      let errorMessage = 'Failed to save the PDF file. Please try again.'
      if (uploadError.message?.includes('storage')) {
        errorMessage = 'Storage service is temporarily unavailable. Please try again later.'
      } else if (uploadError.message?.includes('limit')) {
        errorMessage = 'Storage quota exceeded. Please contact support.'
      }

      return NextResponse.json(
        { error: errorMessage },
        { status: 500 }
      )
    }

    // Get public URL
    const {
      data: { publicUrl },
    } = supabase.storage.from('syllabi').getPublicUrl(fileName)

    // Create or update course
    let courseData
    if (courseId) {
      // Update existing course
      const { data, error } = await supabase
        .from('courses')
        .update({
          course_name: parsed.courseName,
          course_code: parsed.courseCode,
          instructor: parsed.instructor || null,
          syllabus_url: publicUrl,
          syllabus_uploaded: true,
        })
        .eq('id', courseId)
        .eq('user_id', user.id)
        .select()
        .single()

      if (error) {
        console.error('Error updating course:', error)
        return NextResponse.json(
          { error: 'Failed to update course information. The syllabus was processed but the course could not be updated.' },
          { status: 500 }
        )
      }
      courseData = data
    } else {
      // Create new course - pick a default color
      const colors = ['cardinal', 'blue', 'red', 'green', 'orange', 'pink', 'indigo', 'teal']
      const randomColor = colors[Math.floor(Math.random() * colors.length)]

      const { data, error } = await supabase
        .from('courses')
        .insert({
          user_id: user.id,
          course_name: parsed.courseName,
          course_code: parsed.courseCode,
          instructor: parsed.instructor || null,
          color: randomColor,
          syllabus_url: publicUrl,
          syllabus_uploaded: true,
          events_extracted: 0,
        })
        .select()
        .single()

      if (error) {
        console.error('Error creating course:', error)

        let errorMessage = 'Failed to create course. Please try again.'
        if (error.message?.includes('duplicate') || error.code === '23505') {
          errorMessage = 'A course with this code already exists. Please update the existing course instead.'
        }

        return NextResponse.json(
          { error: errorMessage },
          { status: 500 }
        )
      }
      courseData = data
    }

    // Transform to camelCase
    const course = {
      id: courseData.id,
      userId: courseData.user_id,
      courseName: courseData.course_name,
      courseCode: courseData.course_code,
      color: courseData.color,
      instructor: courseData.instructor,
      term: courseData.term,
      syllabusUrl: courseData.syllabus_url,
      syllabusUploaded: courseData.syllabus_uploaded,
      eventsExtracted: courseData.events_extracted,
      createdAt: courseData.created_at,
      updatedAt: courseData.updated_at,
    }

    // Create events from parsed data
    const eventsToInsert = []

    // Add assignments
    if (parsed.assignments && Array.isArray(parsed.assignments)) {
      for (const assignment of parsed.assignments) {
        // Validate date - skip if invalid or "null" string
        if (assignment.dueDate && assignment.dueDate !== 'null' && assignment.dueDate !== 'undefined') {
          // Map assignment types to our event types
          let eventType: EventType = 'assignment'
          if (assignment.type === 'discussion') {
            eventType = 'reading' // Using 'reading' for discussion posts as closest match
          }

          eventsToInsert.push({
            course_id: course.id,
            user_id: user.id,
            type: eventType,
            title: assignment.title,
            description: assignment.description || `${assignment.type || 'Assignment'}: ${assignment.title}`,
            date: assignment.dueDate,
            time: assignment.dueTime,
            points: assignment.points,
            submission_method: assignment.submissionMethod,
            completed: false,
            synced_to_calendar: false,
          })
        }
      }
    }

    // Add exams (including quizzes)
    if (parsed.exams && Array.isArray(parsed.exams)) {
      for (const exam of parsed.exams) {
        // Validate date - skip if invalid or "null" string
        if (exam.date && exam.date !== 'null' && exam.date !== 'undefined') {
          // Map exam types to our event types
          let eventType: EventType = 'exam'
          if (exam.type === 'quiz' || exam.type === 'test') {
            eventType = 'quiz'
          }

          eventsToInsert.push({
            course_id: course.id,
            user_id: user.id,
            type: eventType,
            title: exam.title,
            description: exam.coverage || exam.weight ? `${exam.coverage || ''}${exam.weight ? ` (${exam.weight}% of grade)` : ''}`.trim() : '',
            date: exam.date,
            time: exam.time,
            location: exam.location,
            coverage: exam.coverage,
            completed: false,
            synced_to_calendar: false,
          })
        }
      }
    }

    // Add important dates
    if (parsed.importantDates && Array.isArray(parsed.importantDates)) {
      for (const importantDate of parsed.importantDates) {
        // Validate date - skip if invalid or "null" string
        if (importantDate.date && importantDate.date !== 'null' && importantDate.date !== 'undefined') {
          const eventType: EventType =
            importantDate.type === 'reading' ? 'reading' :
            importantDate.type === 'quiz' ? 'quiz' :
            importantDate.type === 'discussion' ? 'reading' :
            'important_date'

          eventsToInsert.push({
            course_id: course.id,
            user_id: user.id,
            type: eventType,
            title: importantDate.event,
            description: importantDate.description || '',
            date: importantDate.date,
            completed: false,
            synced_to_calendar: false,
          })
        }
      }
    }

    // Insert all events
    let events = []
    if (eventsToInsert.length > 0) {
      const { data: insertedEvents, error: eventsError } = await supabase
        .from('events')
        .insert(eventsToInsert)
        .select()

      if (eventsError) {
        console.error('Error creating events:', eventsError)
        // Don't fail the whole request if events fail, just log it
      } else if (insertedEvents) {
        // Transform events to camelCase
        events = insertedEvents.map((event: any) => ({
          id: event.id,
          courseId: event.course_id,
          userId: event.user_id,
          type: event.type,
          title: event.title,
          description: event.description,
          date: event.date,
          time: event.time,
          location: event.location,
          points: event.points,
          submissionMethod: event.submission_method,
          coverage: event.coverage,
          completed: event.completed,
          syncedToCalendar: event.synced_to_calendar,
          googleCalendarEventId: event.google_calendar_event_id,
          confidence: event.confidence,
          createdAt: event.created_at,
          updatedAt: event.updated_at,
        }))

        // Update course with event count
        await supabase
          .from('courses')
          .update({ events_extracted: events.length })
          .eq('id', course.id)

        // Update the course object
        course.eventsExtracted = events.length
      }
    }

    return NextResponse.json({
      success: true,
      course,
      events,
      eventsCount: events.length,
      parsingStatus: 'completed',
    })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
