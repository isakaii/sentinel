import { google } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';
import { createOAuth2Client } from './auth';

const calendar = google.calendar('v3');

export interface GoogleCalendar {
  id: string;
  summary: string;
  description?: string;
  timeZone?: string;
}

export interface GoogleCalendarEvent {
  id?: string;
  summary: string;
  description?: string;
  start: {
    dateTime?: string;
    date?: string;
    timeZone?: string;
  };
  end: {
    dateTime?: string;
    date?: string;
    timeZone?: string;
  };
  reminders?: {
    useDefault: boolean;
    overrides?: Array<{
      method: string;
      minutes: number;
    }>;
  };
}

/**
 * Create a new Google Calendar for a course
 */
export async function createCalendar(
  refreshToken: string,
  courseName: string,
  courseCode: string,
  color: string
): Promise<GoogleCalendar> {
  const oauth2Client = createOAuth2Client(refreshToken);

  // Map our course colors to Google Calendar colors
  const colorMap: Record<string, string> = {
    'purple': '9', // Grape
    'blue': '7',   // Peacock
    'red': '11',   // Tomato
    'green': '10', // Basil
    'orange': '6', // Tangerine
    'pink': '4',   // Flamingo
    'indigo': '2', // Lavender
    'teal': '3'    // Sage
  };

  try {
    const response = await calendar.calendars.insert({
      auth: oauth2Client,
      requestBody: {
        summary: `${courseCode} - ${courseName}`,
        description: `Calendar for ${courseName} (${courseCode}) - Created by Sentinel`,
        timeZone: 'America/New_York' // You might want to make this configurable
      }
    });

    if (response.data.id) {
      // Set calendar color
      await calendar.calendarList.patch({
        auth: oauth2Client,
        calendarId: response.data.id,
        requestBody: {
          colorId: colorMap[color] || '7' // Default to blue
        }
      });
    }

    return {
      id: response.data.id!,
      summary: response.data.summary!,
      description: response.data.description,
      timeZone: response.data.timeZone
    };
  } catch (error) {
    console.error('Error creating calendar:', error);
    throw new Error('Failed to create Google Calendar');
  }
}

/**
 * Delete a Google Calendar
 */
export async function deleteCalendar(
  refreshToken: string,
  calendarId: string
): Promise<void> {
  const oauth2Client = createOAuth2Client(refreshToken);

  try {
    await calendar.calendars.delete({
      auth: oauth2Client,
      calendarId
    });
  } catch (error) {
    console.error('Error deleting calendar:', error);
    // Don't throw error if calendar doesn't exist (already deleted)
    if ((error as any).code !== 404) {
      throw new Error('Failed to delete Google Calendar');
    }
  }
}

/**
 * Create an event in a Google Calendar
 */
export async function createCalendarEvent(
  refreshToken: string,
  calendarId: string,
  event: GoogleCalendarEvent
): Promise<string> {
  const oauth2Client = createOAuth2Client(refreshToken);

  try {
    const response = await calendar.events.insert({
      auth: oauth2Client,
      calendarId,
      requestBody: event
    });

    return response.data.id!;
  } catch (error) {
    console.error('Error creating calendar event:', error);
    throw new Error('Failed to create calendar event');
  }
}

/**
 * Create multiple events in a Google Calendar (batch operation)
 */
export async function createCalendarEvents(
  refreshToken: string,
  calendarId: string,
  events: GoogleCalendarEvent[]
): Promise<string[]> {
  const oauth2Client = createOAuth2Client(refreshToken);
  const eventIds: string[] = [];

  // Google Calendar API doesn't have a true batch insert, so we'll do them sequentially
  // but we could optimize this with batch requests if needed
  for (const event of events) {
    try {
      const response = await calendar.events.insert({
        auth: oauth2Client,
        calendarId,
        requestBody: event
      });

      if (response.data.id) {
        eventIds.push(response.data.id);
      }
    } catch (error) {
      console.error('Error creating event:', event.summary, error);
      // Continue with other events even if one fails
    }
  }

  return eventIds;
}

/**
 * Update an event in a Google Calendar
 */
export async function updateCalendarEvent(
  refreshToken: string,
  calendarId: string,
  eventId: string,
  event: GoogleCalendarEvent
): Promise<void> {
  const oauth2Client = createOAuth2Client(refreshToken);

  try {
    await calendar.events.update({
      auth: oauth2Client,
      calendarId,
      eventId,
      requestBody: event
    });
  } catch (error) {
    console.error('Error updating calendar event:', error);
    throw new Error('Failed to update calendar event');
  }
}

/**
 * Delete an event from a Google Calendar
 */
export async function deleteCalendarEvent(
  refreshToken: string,
  calendarId: string,
  eventId: string
): Promise<void> {
  const oauth2Client = createOAuth2Client(refreshToken);

  try {
    await calendar.events.delete({
      auth: oauth2Client,
      calendarId,
      eventId
    });
  } catch (error) {
    console.error('Error deleting calendar event:', error);
    // Don't throw error if event doesn't exist (already deleted)
    if ((error as any).code !== 404) {
      throw new Error('Failed to delete calendar event');
    }
  }
}

/**
 * List all calendars for a user
 */
export async function listCalendars(refreshToken: string): Promise<GoogleCalendar[]> {
  const oauth2Client = createOAuth2Client(refreshToken);

  try {
    const response = await calendar.calendarList.list({
      auth: oauth2Client,
      maxResults: 250
    });

    return response.data.items?.map(item => ({
      id: item.id!,
      summary: item.summary!,
      description: item.description,
      timeZone: item.timeZone
    })) || [];
  } catch (error) {
    console.error('Error listing calendars:', error);
    throw new Error('Failed to list Google Calendars');
  }
}

/**
 * Check if a refresh token is still valid
 */
export async function validateRefreshToken(refreshToken: string): Promise<boolean> {
  try {
    const oauth2Client = createOAuth2Client(refreshToken);
    const { credentials } = await oauth2Client.refreshAccessToken();
    return !!credentials.access_token;
  } catch {
    return false;
  }
}