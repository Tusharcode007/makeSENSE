export interface Message {
  role: 'user' | 'assistant';
  content: string;
}

import { decide_action } from '../logic/decisionEngine';

export interface AssistantContext {
  userId: string;
  history: Message[];
  timeOfDay: string;
  previousActions: string[];
  userIntent: string;
  lastActive: Date;
}

const getTimeOfDay = (): string => {
  const hour = new Date().getHours();
  if (hour < 12) return 'morning';
  if (hour < 18) return 'afternoon';
  return 'evening';
};

const extractIntent = (input: string): string => {
  const lower = input.toLowerCase();
  if (lower.includes('calendar') || lower.includes('schedule') || lower.includes('meeting')) {
    return 'check_calendar';
  }
  if (lower.includes('email') || lower.includes('gmail') || lower.includes('message')) {
    return 'check_email';
  }
  if (lower.includes('drive') || lower.includes('file') || lower.includes('document')) {
    return 'search_files';
  }
  return 'general_chat';
};

export const process_user_input = async (input: string, context: AssistantContext): Promise<string> => {
  // 1. Maintain session context: update intent and time of day
  context.timeOfDay = getTimeOfDay();
  context.userIntent = extractIntent(input);
  
  // Append user message to history
  context.history.push({ role: 'user', content: input });
  
  // Maintain context constraint: strictly keep only the last 5 messages
  if (context.history.length > 5) {
    context.history = context.history.slice(-5);
  }
  
  let response = '';

  // 2. Return intelligent responses based on context components
  switch (context.userIntent) {
    case 'check_calendar':
      response = `Good ${context.timeOfDay}! I see you want to manage your schedule. I will check your calendar now.`;
      context.previousActions.push('accessed_calendar');
      break;
    case 'check_email':
      response = `Good ${context.timeOfDay}! Let me check your most recent emails for you.`;
      context.previousActions.push('accessed_email');
      break;
    case 'search_files':
      response = `Looking up files in your Google Drive right now. Give me a moment.`;
      context.previousActions.push('accessed_drive');
      break;
    case 'general_chat':
    default:
      // Delegate to decision engine for logic rules
      const decision = decide_action(context, input);
      
      if (decision.actionType === 'suggest_automation') {
         response = `I noticed you frequently ${context.userIntent.split('_').join(' ')}. Would you like me to automate this for you?`;
      } else if (decision.actionType === 'suggest_summary') {
         response = `Welcome back! Since you've been inactive for a while, would you like a quick summary of what you missed?`;
      } else if (decision.actionType === 'suggest_planning') {
         response = `Good morning! Let's start the day strong. Would you like to review your plan for today?`;
      } else if (decision.actionType === 'suggest_wrap_up') {
         response = `Good evening! It's getting late. Would you like to wrap up and summarize today's tasks?`;
      } else {
         const previousUserMessages = context.history.filter(m => m.role === 'user');
         if (previousUserMessages.length > 1) {
           const prevMsg = previousUserMessages[previousUserMessages.length - 2].content;
           response = `I'm still here! You previously mentioned: "${prevMsg}". How can I help you further this ${context.timeOfDay}?`;
         } else {
           response = `Hello there! I'm MakeSense AI. How can I assist you this ${context.timeOfDay}? [AI-reasoning proxy]`;
         }
      }
      context.previousActions.push('chatted');
      break;
  }

  // Append assistant message to history
  context.history.push({ role: 'assistant', content: response });
  
  // Double-check the 5-message bound after appending assistant response
  if (context.history.length > 5) {
    context.history = context.history.slice(-5);
  }

  return response;
};
