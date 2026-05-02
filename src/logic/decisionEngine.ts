import { AssistantContext } from '../assistant/assistant';

export interface ActionDecision {
  actionType: 'suggest_automation' | 'suggest_summary' | 'suggest_planning' | 'suggest_wrap_up' | 'standard_ai_response';
  reasoning: string;
}

export const decide_action = (context: AssistantContext, input: string): ActionDecision => {
  // 1. Rule: If user repeats a task -> suggest automation
  // Check if the current intent has been performed 2 or more times previously
  if (context.userIntent && context.previousActions.length >= 2) {
    const recentActions = context.previousActions.slice(-2);
    // Rough check: if recent actions are all similar to the current intent
    const isRepeated = recentActions.every((action) => action.includes(context.userIntent.split('_')[1] || ''));
    if (isRepeated && context.userIntent !== 'general_chat') {
      return {
        actionType: 'suggest_automation',
        reasoning: 'User has repeated the same action consecutive times.',
      };
    }
  }

  // 2. Rule: If user is inactive -> suggest summary
  const now = new Date();
  if (context.lastActive) {
    // Determine inactivity: e.g., > 12 hours
    const hoursInactive = (now.getTime() - context.lastActive.getTime()) / (1000 * 60 * 60);
    if (hoursInactive > 12) {
      return {
        actionType: 'suggest_summary',
        reasoning: 'User has been inactive for more than 12 hours.',
      };
    }
  }

  // 3. Rule: If time is morning -> suggest planning
  if (context.timeOfDay === 'morning' && context.history.length <= 1) {
    return {
      actionType: 'suggest_planning',
      reasoning: 'It is morning and the session just started.',
    };
  }

  // 4. Rule: If time is evening -> suggest wrap-up
  if (context.timeOfDay === 'evening' && context.history.length <= 1) {
    return {
      actionType: 'suggest_wrap_up',
      reasoning: 'It is evening and the session just started.',
    };
  }

  return {
    actionType: 'standard_ai_response',
    reasoning: 'No specific rule matched, proceed with standard AI reasoning.',
  };
};
