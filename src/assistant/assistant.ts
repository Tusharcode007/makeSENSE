import { decide_action } from '../logic/decisionEngine';
import { getUpcomingEvents, createEventFromNaturalLanguage } from '../services/google/calendar';
import { summarizeEmails, draftEmail } from '../services/google/gmail';
import { fetch_logs, save_log } from '../services/google/drive';

export interface Message {
  role: 'user' | 'assistant';
  content: string;
}

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
  
  if (lower.includes('schedule') || lower.includes('create event')) {
    return 'create_calendar_event';
  }
  if (lower.includes('calendar') || lower.includes('upcoming')) {
    return 'check_calendar';
  }
  if (lower.includes('summarize email') || lower.includes('recent email') || lower.includes('check email') || lower.includes('inbox')) {
    return 'summarize_emails';
  }
  if (lower.includes('draft email')) {
    return 'draft_email';
  }
  if (lower.includes('session history') || lower.includes('past logs')) {
    return 'fetch_logs';
  }
  
  return 'general_chat';
};

/**
 * FULL ENGINE PIPELINE: 
 * User Input -> Extractor -> Decision Logic -> Execution Layer -> Response Wrapper
 */
export const process_user_input = async (input: string, context: AssistantContext): Promise<string> => {
  
  // 1 & 2. Context Extraction & History Management
  context.timeOfDay = getTimeOfDay();
  context.userIntent = extractIntent(input);
  context.history.push({ role: 'user', content: input });
  
  if (context.history.length > 5) {
    context.history = context.history.slice(-5);
  }
  
  let response = '';

  // 3. Execution of Root Level Decision Engine (Declarative Rules)
  const decision = decide_action(context, input);

  // Unobtrusively snapshot this interaction to Google Drive as requested
  try {
     await save_log(context.userId, `[${new Date().toISOString()}] User Intent: ${context.userIntent} | Action Decision: ${decision.actionType}`);
  } catch(e) {
     console.warn('[MakeSense AI] Drive auth missing. Bypassing persistent log string.');
  }

  // Intercept the execution layer if the decision engine demands an active interaction pivot
  if (decision.actionType === 'suggest_automation') {
    response = `I noticed you repeatedly perform "${context.userIntent.split('_').join(' ')}". Would you like me to automate this routine going forward?`;
  } else if (decision.actionType === 'suggest_summary') {
    response = `Welcome back! Since you've been inactive for a while, would you like a comprehensive summary of what you missed?`;
  } else if (decision.actionType === 'suggest_planning') {
    response = `Good morning! Let's start the day strong. Would you like to review your calendar plan for today?`;
  } else if (decision.actionType === 'suggest_wrap_up') {
    response = `Good evening! It's getting late. Would you like to wrap up and summarize today's tasks?`;
  } 
  
  // 4. Execution Layer: Perform Google Automations based on Intent
  if (response === '') {
    try {
      switch (context.userIntent) {
        
        case 'create_calendar_event':
          // Passing natural language string completely straight to Google Calendar QuickAdd!
          const event = await createEventFromNaturalLanguage(context.userId, input);
          response = `Done! I successfully scheduled that event for you. (Generated Google Link: ${event.link})`;
          context.previousActions.push('accessed_calendar');
          break;

        case 'check_calendar':
          const events = await getUpcomingEvents(context.userId, 3);
          if (events.length > 0) {
             const summaries = events.map((e: any) => e.summary).join(', ');
             response = `You currently have the following upcoming events: ${summaries}.`;
          } else {
             response = 'Your calendar is completely clear! Nothing scheduled soon.';
          }
          context.previousActions.push('accessed_calendar');
          break;

        case 'summarize_emails':
          const emailSummary = await summarizeEmails(context.userId, 5);
          response = emailSummary.summary;
          context.previousActions.push('accessed_email');
          break;
          
        case 'fetch_logs':
          const logs = await fetch_logs(context.userId);
          response = `I checked your Google Drive. I found ${logs.length} recorded session logs available.`;
          context.previousActions.push('accessed_drive');
          break;

        case 'general_chat':
        default:
          const previousUserMessages = context.history.filter(m => m.role === 'user');
          if (previousUserMessages.length > 1) {
            response = `I'm tracking the conversation! So far we've covered standard chat limits. Try an actionable hit, like "Schedule a meeting tomorrow at 5" or "Summarize recent emails".`;
          } else {
            response = `Hello there! I'm your newly built MakeSense AI! Try asking me to schedule a meeting, check your email, or display drive logs!`;
          }
          context.previousActions.push('chatted');
          break;
      }
    } catch (error: any) {
      // 4b. Fail-safe fallback if Authentication limits fire.
      response = `[API Access Check] I successfully intercepted your intent as "${context.userIntent}", but received an Unauthorized error from Google. Be absolutely certain you clicked Authorize at /auth/google!`;
    }
  }

  // 5. Append Assistant Return state
  context.history.push({ role: 'assistant', content: response });
  if (context.history.length > 5) context.history = context.history.slice(-5);

  return response;
};
