import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// GET /api/courses/[id] - Get a specific course
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: courseData, error } = await supabase
      .from('courses')
      .select('*')
      .eq('id', id)
      .eq('user_id', user.id)
      .single()

    if (error || !courseData) {
      return NextResponse.json({ error: 'Course not found' }, { status: 404 })
    }

    // Transform snake_case to camelCase
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

    return NextResponse.json({ course })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// PATCH /api/courses/[id] - Update a course
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const updates: any = {}

    // Only include fields that are provided
    if (body.courseName !== undefined) updates.course_name = body.courseName
    if (body.courseCode !== undefined) updates.course_code = body.courseCode
    if (body.color !== undefined) updates.color = body.color
    if (body.instructor !== undefined) updates.instructor = body.instructor
    if (body.term !== undefined) updates.term = body.term

    const { data: courseData, error } = await supabase
      .from('courses')
      .update(updates)
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error || !courseData) {
      return NextResponse.json(
        { error: 'Failed to update course' },
        { status: 500 }
      )
    }

    // Transform snake_case to camelCase
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

    return NextResponse.json({ course })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// DELETE /api/courses/[id] - Delete a course
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Delete course (events will be cascade deleted)
    const { error } = await supabase
      .from('courses')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id)

    if (error) {
      return NextResponse.json(
        { error: 'Failed to delete course' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
