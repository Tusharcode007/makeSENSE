import { google } from 'googleapis';
import { oauth2Client } from './auth';

// Initialize the Gmail API client
const gmail = google.gmail({ version: 'v1', auth: oauth2Client });

/**
 * Creates an email draft based on user input parameters.
 * @param to recipient email address
 * @param subject the subject line
 * @param body the main text payload
 */
export const draftEmail = async (userId: string, to: string, subject: string, body: string) => {
  try {
    // Gmail requires RFC 2822 formatting encoded in base64url
    const rawMessage = [
      `To: ${to}`,
      `Subject: ${subject}`,
      'Content-Type: text/plain; charset="UTF-8"',
      'MIME-Version: 1.0',
      '',
      body
    ].join('\r\n');

    const encodedMessage = Buffer.from(rawMessage)
      .toString('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');

    const response = await gmail.users.drafts.create({
      userId: 'me', // Refers to the authenticated user's inbox
      requestBody: {
        message: {
          raw: encodedMessage,
        },
      },
    });

    console.log(`[Gmail API] Draft properly staged for ${to}. Draft ID: ${response.data.id}`);
    
    return { 
      success: true, 
      draftId: response.data.id,
      threadId: response.data.message?.threadId
    };
  } catch (error) {
    console.error('[Gmail API] Error creating email draft:', error);
    throw new Error('Failed to create an email draft via Google APIs.');
  }
};

/**
 * Fetches recent emails and formats a text-based summary of the inbox.
 */
export const summarizeEmails = async (userId: string, maxResults: number = 5) => {
  try {
    // Queries the inbox for the X most recent emails
    const response = await gmail.users.messages.list({
      userId: 'me',
      labelIds: ['INBOX'],
      maxResults: maxResults,
    });

    const messages = response.data.messages || [];
    
    if (messages.length === 0) {
      return { summary: "Your inbox is completely clear. No recent emails.", emails: [] };
    }

    // Map through the message headers to extract subjects, senders, and snippets
    const emailDetails = await Promise.all(
      messages.map(async (msg) => {
        const msgDetails = await gmail.users.messages.get({
          userId: 'me',
          id: msg.id!,
          format: 'metadata',
          metadataHeaders: ['Subject', 'From'],
        });
        
        const headers = msgDetails.data.payload?.headers || [];
        const subject = headers.find((h) => h.name === 'Subject')?.value || 'No Subject specified';
        const from = headers.find((h) => h.name === 'From')?.value || 'Unknown Sender';
        const snippet = msgDetails.data.snippet || ''; // Google natively generates a rough snippet!

        return { id: msg.id, subject, from, snippet };
      })
    );
    
    // Agglomerate data into a cohesive summary string
    const summaryText = `I have scanned your inbox and found ${emailDetails.length} recent messages limit. ` + 
      emailDetails.map(e => `You have a message from ${e.from} regarding "${e.subject}"`).join(', and ');

    return {
      success: true,
      summary: summaryText,
      emails: emailDetails,
    };
  } catch (error) {
    console.error('[Gmail API] Error summarizing emails:', error);
    throw new Error('Failed to fetch and summarize emails.');
  }
};
