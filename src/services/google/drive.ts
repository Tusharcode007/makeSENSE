import { google } from 'googleapis';
import { oauth2Client } from './auth';

// Initialize the Google Drive v3 client using the shared oauth2Client
const drive = google.drive({ version: 'v3', auth: oauth2Client });

/**
 * Stores a user session log inside Google Drive as a plaintext file.
 */
export const save_log = async (
  userId: string, 
  logContent: string, 
  fileName: string = `session_log_${userId}_${Date.now()}.txt`
) => {
  try {
    const fileMetadata = {
      name: fileName,
      mimeType: 'text/plain',
    };
    
    const media = {
      mimeType: 'text/plain',
      body: logContent,
    };

    const response = await drive.files.create({
      requestBody: fileMetadata,
      media: media,
      fields: 'id, name, createdTime',
    });
    
    console.log(`[Google Drive] Saved log for ${userId} with File ID: ${response.data.id}`);
    
    return { 
      success: true, 
      fileId: response.data.id, 
      fileName: response.data.name, 
      createdTime: response.data.createdTime 
    };
  } catch (error) {
    console.error(`[Google Drive API] Error saving log for ${userId}:`, error);
    throw new Error('Failed to save log to Google Drive.');
  }
};

/**
 * Retrieves the stored session summaries specifically tied to a user.
 */
export const fetch_logs = async (userId: string) => {
  try {
    // Queries Drive for files matching the specific user's log naming scheme
    const response = await drive.files.list({
      q: `name contains 'session_log_${userId}' and mimeType='text/plain'`,
      fields: 'files(id, name, createdTime)',
      orderBy: 'createdTime desc',
      pageSize: 10, // Pulls the 10 most recent logs
    });
    
    const files = response.data.files || [];
    
    return files.map(file => ({
      id: file.id,
      name: file.name,
      createdAt: file.createdTime
    }));
  } catch (error) {
    console.error(`[Google Drive API] Error fetching logs for ${userId}:`, error);
    throw new Error('Failed to fetch logs from Google Drive.');
  }
};
