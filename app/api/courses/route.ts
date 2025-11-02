import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// GET /api/courses - Get all courses for the current user
export async function GET() {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: coursesData, error } = await supabase
      .from('courses')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching courses:', error)
      return NextResponse.json(
        { error: 'Failed to fetch courses' },
        { status: 500 }
      )
    }

    // Transform snake_case to camelCase for frontend
    const courses = coursesData?.map((course: any) => ({
      id: course.id,
      userId: course.user_id,
      courseName: course.course_name,
      courseCode: course.course_code,
      color: course.color,
      instructor: course.instructor,
      term: course.term,
      syllabusUrl: course.syllabus_url,
      syllabusUploaded: course.syllabus_uploaded,
      eventsExtracted: course.events_extracted,
      createdAt: course.created_at,
      updatedAt: course.updated_at,
    })) || []

    return NextResponse.json({ courses })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST /api/courses - Create a new course
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { courseName, courseCode, color, instructor, term } = body

    // Validate required fields
    if (!courseName || !courseCode || !color) {
      return NextResponse.json(
        { error: 'Missing required fields: courseName, courseCode, color' },
        { status: 400 }
      )
    }

    // Validate color
    const validColors = [
      'purple',
      'blue',
      'red',
      'green',
      'orange',
      'pink',
      'indigo',
      'teal',
    ]
    if (!validColors.includes(color)) {
      return NextResponse.json(
        { error: 'Invalid color. Must be one of: ' + validColors.join(', ') },
        { status: 400 }
      )
    }

    const { data: course, error } = await supabase
      .from('courses')
      .insert({
        user_id: user.id,
        course_name: courseName,
        course_code: courseCode,
        color,
        instructor,
        term,
        syllabus_uploaded: false,
        events_extracted: 0,
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating course:', error)
      return NextResponse.json(
        { error: 'Failed to create course' },
        { status: 500 }
      )
    }

    return NextResponse.json({ course }, { status: 201 })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
