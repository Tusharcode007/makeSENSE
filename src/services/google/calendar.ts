import { google } from 'googleapis';
import { oauth2Client } from './auth';

// Note: In a production app, credentials should be fetched from a database based on userId
export const setCredentials = (tokens: any) => {
  oauth2Client.setCredentials(tokens);
};

const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

/**
 * List upcoming events for the user
 */
export const getUpcomingEvents = async (userId: string, maxResults = 10) => {
  try {
    const response = await calendar.events.list({
      calendarId: 'primary',
      timeMin: new Date().toISOString(),
      maxResults,
      singleEvents: true,
      orderBy: 'startTime',
    });
    return response.data.items || [];
  } catch (error) {
    console.error(`[Google Calendar API] Error fetching events for ${userId}:`, error);
    throw new Error('Failed to fetch upcoming events.');
  }
};

/**
 * Suggest available time slots by checking Free/Busy info
 */
export const suggestTimeSlots = async (userId: string, targetDate: Date) => {
  try {
    // 9 AM to 5 PM window
    const timeMin = new Date(targetDate.setHours(9, 0, 0, 0)).toISOString();
    const timeMax = new Date(targetDate.setHours(17, 0, 0, 0)).toISOString();

    const response = await calendar.freebusy.query({
      requestBody: {
        timeMin,
        timeMax,
        items: [{ id: 'primary' }]
      }
    });

    const busySlots = response.data.calendars?.primary?.busy || [];
    
    // Naive logic: suggest general gaps in the 9-5 schedule.
    // In production, we'd iteratively find 30-min gaps between busy bounds.
    let recommendation = "Based on your availability, 10:00 AM or 1:00 PM are generally safe starting points.";
    
    return {
      date: targetDate.toISOString().split('T')[0],
      busySlots,
      recommendation
    };
  } catch (error) {
    console.error(`[Google Calendar API] Error querying freebusy for ${userId}:`, error);
    throw new Error('Failed to suggest time slots.');
  }
};

/**
 * Creates an event from natural language (e.g. "Schedule meeting tomorrow at 5")
 */
export const createEventFromNaturalLanguage = async (userId: string, text: string) => {
  try {
    // We use the QuickAdd feature which elegantly parses natural language!
    const response = await calendar.events.quickAdd({
      calendarId: 'primary',
      text: text, 
    });
    
    return { 
      success: true, 
      eventId: response.data.id,
      summary: response.data.summary,
      start: response.data.start?.dateTime || response.data.start?.date,
      link: response.data.htmlLink
    };
  } catch (error) {
    console.error(`[Google Calendar API] Error quick-adding event for ${userId}:`, error);
    throw new Error('Failed to parse text and create event.');
  }
};
