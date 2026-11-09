export interface GoogleMeetSpace {
  name: string;
  meetingUri: string;
  meetingCode: string;
  config?: {
    accessType?: string;
    entryPointAccess?: string;
  };
}

/**
 * Creates a real Google Meet conference space using Google Meet REST API v2
 */
export async function createGoogleMeetSpace(accessToken: string): Promise<GoogleMeetSpace> {
  const response = await fetch('https://meet.googleapis.com/v2/spaces', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({}),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      errorData.error?.message || `Google Meet API error: ${response.status} ${response.statusText}`
    );
  }

  const data = await response.json();
  return {
    name: data.name || '',
    meetingUri: data.meetingUri || `https://meet.google.com/${data.name?.replace('spaces/', '') || ''}`,
    meetingCode: data.meetingCode || data.name?.replace('spaces/', '') || '',
    config: data.config,
  };
}

/**
 * Fetches information about a Google Meet space
 */
export async function getGoogleMeetSpace(accessToken: string, spaceName: string): Promise<GoogleMeetSpace> {
  const formattedName = spaceName.startsWith('spaces/') ? spaceName : `spaces/${spaceName}`;
  const response = await fetch(`https://meet.googleapis.com/v2/${formattedName}`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      errorData.error?.message || `Failed to fetch Meet space: ${response.status}`
    );
  }

  const data = await response.json();
  return {
    name: data.name,
    meetingUri: data.meetingUri,
    meetingCode: data.meetingCode,
    config: data.config,
  };
}
