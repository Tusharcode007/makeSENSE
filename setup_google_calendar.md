# Google Calendar API Integration Setup

To fully run the Google Calendar natural-language logic inside **MakeSense AI**, you must provision OAuth credentials.

## Step 1: Create a Google Cloud Project
1. Navigate to the [Google Cloud Console](https://console.cloud.google.com/).
2. Create a new project named `MakeSense-AI`.
3. Go to **APIs & Services > Library** and search for `Google Calendar API`. Click **Enable**.

## Step 2: Configure OAuth Consent Screen
1. Go to **APIs & Services > OAuth consent screen**.
2. Select **User Type = External** (or Internal if using a specific Google Workspace domain).
3. Fill out App Name (`MakeSense AI`), User Support Email, and Developer Contact Information.
4. Click **Save and Continue**.
5. Add the following scopes:
   - `https://www.googleapis.com/auth/calendar`
   - `https://www.googleapis.com/auth/calendar.events`
6. Add your personal email to **Test Users**. Save and Continue.

## Step 3: Generate Credentials
1. Go to **APIs & Services > Credentials**.
2. Click **Create Credentials > OAuth client ID**.
3. Select **Application Type = Web application**.
4. Add Authorized redirect URIs: `http://localhost:3000/auth/callback` (or wherever your API listener sits).
5. Click **Create**.
6. Copy your **Client ID** and **Client Secret**.

## Step 4: Add to Environment Variables
Open your `.env` file in the project and add your credentials:
```env
GOOGLE_CLIENT_ID=your_client_id_here
GOOGLE_CLIENT_SECRET=your_client_secret_here
GOOGLE_REDIRECT_URI=http://localhost:3000/auth/callback
```

## Step 5: Test the Integration
To test `calendar.events.quickAdd` seamlessly, the `oauth2Client` in `src/services/google/calendar.ts` needs user-approved access tokens. You can securely obtain these dynamically within Express via a standard OAuth code flow.
