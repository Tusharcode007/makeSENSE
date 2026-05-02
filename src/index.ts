import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import { getContext } from './assistant/contextManager';
import { process_user_input } from './assistant/assistant';
import { getAuthUrl, handleAuthCallback } from './services/google/auth';

import path from 'path';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));

app.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'healthy', service: 'MakeSense AI' });
});

// Mock OAuth Flow execution limits
app.get('/auth/google', (req: Request, res: Response) => {
  const url = getAuthUrl();
  console.log('Redirecting to Google Auth:', url);
  res.redirect(url);
});

app.get('/auth/callback', async (req: Request, res: Response) => {
  const code = req.query.code as string;
  if (!code) {
    return res.status(400).send('Authorization code missing from callback!');
  }

  try {
    const tokens = await handleAuthCallback(code);
    res.json({
      message: 'Successfully authenticated with Google!',
      action: 'You can now hit the /api/message endpoints knowing calendar writes will succeed.',
      mock_tokens_received: !!tokens
    });
  } catch (error) {
    console.error('Error during Google Auth Callback:', error);
    res.status(500).send('Authentication failed.');
  }
});

app.post('/api/message', async (req: Request, res: Response) => {
  try {
    const { message, userId } = req.body;
    if (!message || !userId) {
      return res.status(400).json({ error: 'Message and userId are required.' });
    }

    // Retrieve or initialize context for this user
    const context = getContext(userId);

    // Process input context-aware
    const response = await process_user_input(message, context);
    res.json({ response, intent: context.userIntent, timeOfDay: context.timeOfDay });
  } catch (error) {
    console.error('Error processing message:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

app.listen(PORT, () => {
  console.log(`MakeSense AI server running on port ${PORT}`);
});
