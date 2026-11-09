export interface GmailMessageSummary {
  id: string;
  threadId: string;
  snippet?: string;
  subject?: string;
  from?: string;
  to?: string;
  date?: string;
}

export interface SendEmailParams {
  to: string;
  subject: string;
  bodyHtml: string;
  fromName?: string;
}

/**
 * Encodes an RFC 2822 email message to base64url format for Gmail API
 */
function makeBase64UrlEmail(params: SendEmailParams): string {
  const utf8Subject = `=?utf-8?B?${btoa(unescape(encodeURIComponent(params.subject)))}?=`;
  const messageParts = [
    `To: ${params.to}`,
    `Subject: ${utf8Subject}`,
    'MIME-Version: 1.0',
    'Content-Type: text/html; charset=utf-8',
    'Content-Transfer-Encoding: 7bit',
    '',
    params.bodyHtml,
  ];
  const message = messageParts.join('\r\n');

  // Convert to url-safe base64 string
  return btoa(unescape(encodeURIComponent(message)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

/**
 * Send an email using the Gmail API
 */
export async function sendGmailMessage(
  accessToken: string,
  params: SendEmailParams
): Promise<{ id: string; threadId: string }> {
  const raw = makeBase64UrlEmail(params);

  const response = await fetch(
    'https://gmail.googleapis.com/gmail/v1/users/me/messages/send',
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ raw }),
    }
  );

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      errorData.error?.message || `Gmail API send failed: ${response.status} ${response.statusText}`
    );
  }

  const data = await response.json();
  return { id: data.id, threadId: data.threadId };
}

/**
 * List recent messages from Gmail
 */
export async function listGmailMessages(
  accessToken: string,
  maxResults: number = 10,
  query?: string
): Promise<GmailMessageSummary[]> {
  let url = `https://gmail.googleapis.com/gmail/v1/users/me/messages?maxResults=${maxResults}`;
  if (query) {
    url += `&q=${encodeURIComponent(query)}`;
  }

  const listResponse = await fetch(url, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!listResponse.ok) {
    const err = await listResponse.json().catch(() => ({}));
    throw new Error(err.error?.message || `Gmail API error: ${listResponse.status}`);
  }

  const listData = await listResponse.json();
  if (!listData.messages || listData.messages.length === 0) {
    return [];
  }

  // Fetch snippets and headers for each message (limit to first 10 for snappy responsiveness)
  const detailPromises = listData.messages.slice(0, 10).map(async (msg: { id: string; threadId: string }) => {
    try {
      const res = await fetch(
        `https://gmail.googleapis.com/gmail/v1/users/me/messages/${msg.id}?format=metadata&metadataHeaders=Subject&metadataHeaders=From&metadataHeaders=To&metadataHeaders=Date`,
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );
      if (!res.ok) return { id: msg.id, threadId: msg.threadId };
      const detail = await res.json();
      const headers = detail.payload?.headers || [];
      const getHeader = (name: string) => headers.find((h: any) => h.name.toLowerCase() === name.toLowerCase())?.value;

      return {
        id: msg.id,
        threadId: msg.threadId,
        snippet: detail.snippet,
        subject: getHeader('Subject') || '(No Subject)',
        from: getHeader('From'),
        to: getHeader('To'),
        date: getHeader('Date'),
      };
    } catch {
      return { id: msg.id, threadId: msg.threadId };
    }
  });

  return Promise.all(detailPromises);
}
