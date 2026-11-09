export interface GoogleCalendarEvent {
  id: string;
  summary: string;
  description?: string;
  location?: string;
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
  hangoutLink?: string;
  htmlLink?: string;
  attendees?: Array<{
    email: string;
    displayName?: string;
    responseStatus?: string;
  }>;
}

export interface CreateEventParams {
  summary: string;
  description?: string;
  startTime: string; // ISO string e.g. 2026-11-08T16:00:00+05:30
  endTime: string;   // ISO string e.g. 2026-11-08T17:00:00+05:30
  timeZone?: string;
  attendeeEmail?: string;
  createMeetConference?: boolean;
}

/**
 * List upcoming events from primary Google Calendar
 */
export async function listGoogleCalendarEvents(
  accessToken: string,
  maxResults: number = 20
): Promise<GoogleCalendarEvent[]> {
  const now = new Date().toISOString();
  const url = `https://www.googleapis.com/calendar/v3/calendars/primary/events?timeMin=${encodeURIComponent(
    now
  )}&maxResults=${maxResults}&singleEvents=true&orderBy=startTime`;

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      errorData.error?.message || `Calendar API error: ${response.status} ${response.statusText}`
    );
  }

  const data = await response.json();
  return (data.items || []).map((item: any) => ({
    id: item.id,
    summary: item.summary || 'Untitled Event',
    description: item.description,
    location: item.location,
    start: item.start,
    end: item.end,
    hangoutLink: item.hangoutLink,
    htmlLink: item.htmlLink,
    attendees: item.attendees,
  }));
}

/**
 * Create a new event on primary Google Calendar with optional Meet conference
 */
export async function createGoogleCalendarEvent(
  accessToken: string,
  params: CreateEventParams
): Promise<GoogleCalendarEvent> {
  const timeZone = params.timeZone || Intl.DateTimeFormat().resolvedOptions().timeZone || 'Asia/Kolkata';

  const body: any = {
    summary: params.summary,
    description: params.description,
    start: {
      dateTime: params.startTime,
      timeZone,
    },
    end: {
      dateTime: params.endTime,
      timeZone,
    },
  };

  if (params.attendeeEmail) {
    body.attendees = [{ email: params.attendeeEmail }];
  }

  if (params.createMeetConference) {
    body.conferenceData = {
      createRequest: {
        requestId: `meet_req_${Date.now()}`,
        conferenceSolutionKey: {
          type: 'hangoutsMeet',
        },
      },
    };
  }

  const endpoint = `https://www.googleapis.com/calendar/v3/calendars/primary/events?conferenceDataVersion=1`;

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      errorData.error?.message || `Failed to create calendar event: ${response.status}`
    );
  }

  const data = await response.json();
  return {
    id: data.id,
    summary: data.summary,
    description: data.description,
    start: data.start,
    end: data.end,
    hangoutLink: data.hangoutLink,
    htmlLink: data.htmlLink,
    attendees: data.attendees,
  };
}

/**
 * Delete a calendar event with mandatory user confirmation
 */
export async function deleteGoogleCalendarEvent(
  accessToken: string,
  eventId: string
): Promise<boolean> {
  const response = await fetch(
    `https://www.googleapis.com/calendar/v3/calendars/primary/events/${eventId}`,
    {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  if (!response.ok && response.status !== 204) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      errorData.error?.message || `Failed to delete calendar event: ${response.status}`
    );
  }

  return true;
}
