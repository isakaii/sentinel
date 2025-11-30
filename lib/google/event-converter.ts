import { GoogleCalendarEvent } from './calendar';

interface SentinelEvent {
  id: string;
  type: string;
  title: string;
  description?: string;
  date: string; // YYYY-MM-DD format
  time?: string; // HH:MM:SS format
  location?: string;
  points?: number;
  coverage?: string;
}

/**
 * Convert Sentinel events to Google Calendar format
 */
export function convertEventsToGoogleFormat(
  events: SentinelEvent[],
  courseName: string,
  courseCode: string
): GoogleCalendarEvent[] {
  return events.map(event => {
    // Determine if it's an all-day event or has specific time
    const isAllDay = !event.time || event.time === '00:00:00';

    let startDateTime: any = {};
    let endDateTime: any = {};

    if (isAllDay) {
      // All-day event
      startDateTime = { date: event.date };
      endDateTime = { date: event.date };
    } else {
      // Event with specific time
      // Combine date and time into ISO format
      const [hours, minutes] = event.time!.split(':');
      const startTime = new Date(event.date + 'T' + event.time);

      // Set end time to 1 hour after start (default duration)
      const endTime = new Date(startTime);
      endTime.setHours(endTime.getHours() + 1);

      startDateTime = {
        dateTime: startTime.toISOString(),
        timeZone: 'America/New_York' // You might want to make this configurable
      };
      endDateTime = {
        dateTime: endTime.toISOString(),
        timeZone: 'America/New_York'
      };
    }

    // Build description with all relevant info
    let description = `Course: ${courseCode} - ${courseName}\n`;
    description += `Type: ${event.type.charAt(0).toUpperCase() + event.type.slice(1)}\n`;

    if (event.description) {
      description += `\nDetails: ${event.description}\n`;
    }

    if (event.points) {
      description += `Points: ${event.points}\n`;
    }

    if (event.coverage) {
      description += `Coverage: ${event.coverage}\n`;
    }

    description += `\n---\nCreated by Sentinel Academic Calendar`;

    // Map event types to emojis for better visual distinction
    const typeEmojis: Record<string, string> = {
      assignment: '📝',
      exam: '📚',
      quiz: '✏️',
      reading: '📖',
      important_date: '📌'
    };

    const emoji = typeEmojis[event.type] || '📅';
    const summary = `${emoji} [${courseCode}] ${event.title}`;

    const googleEvent: GoogleCalendarEvent = {
      summary,
      description,
      start: startDateTime,
      end: endDateTime,
      reminders: {
        useDefault: false,
        overrides: [
          // Add reminders based on event type
          event.type === 'exam' ?
            { method: 'email', minutes: 24 * 60 * 7 } : // 1 week before exams
            { method: 'email', minutes: 24 * 60 }, // 1 day before other events
          { method: 'popup', minutes: 60 } // 1 hour before all events
        ]
      }
    };

    if (event.location) {
      googleEvent.location = event.location;
    }

    return googleEvent;
  });
}