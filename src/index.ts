import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import { getContext } from './assistant/contextManager';
import { process_user_input } from './assistant/assistant';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'healthy', service: 'MakeSense AI' });
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
