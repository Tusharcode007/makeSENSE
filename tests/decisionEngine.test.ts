import { decide_action } from '../src/logic/decisionEngine';
import { AssistantContext } from '../src/assistant/assistant';

describe('MakeSense AI Decision Engine', () => {
  let mockContext: AssistantContext;

  beforeEach(() => {
    mockContext = {
      userId: 'test1',
      history: [],
      timeOfDay: 'afternoon',
      previousActions: [],
      userIntent: 'check_calendar',
      lastActive: new Date()
    };
  });

  it('Rule 1: should suggest automation if time-consuming task is repeated', () => {
    mockContext.previousActions = ['accessed_calendar', 'accessed_calendar'];
    mockContext.userIntent = 'check_calendar';
    
    const decision = decide_action(mockContext, 'check my calendar again');
    expect(decision.actionType).toBe('suggest_automation');
  });

  it('Rule 2: should suggest summary if user is inactive', () => {
    // User inactive for 24 hours
    mockContext.lastActive = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const decision = decide_action(mockContext, 'hello');
    
    expect(decision.actionType).toBe('suggest_summary');
  });

  it('Rule 3: should suggest planning if time is morning', () => {
    mockContext.timeOfDay = 'morning';
    mockContext.history = [{ role: 'user', content: 'good morning' }];
    
    const decision = decide_action(mockContext, 'good morning');
    expect(decision.actionType).toBe('suggest_planning');
  });

  it('Rule 4: should suggest wrap-up if time is evening', () => {
    mockContext.timeOfDay = 'evening';
    mockContext.history = [{ role: 'user', content: 'hello' }];
    
    const decision = decide_action(mockContext, 'hello');
    expect(decision.actionType).toBe('suggest_wrap_up');
  });

  it('Default: should fallback to standard AI response', () => {
    mockContext.timeOfDay = 'afternoon';
    mockContext.previousActions = ['chatted'];
    mockContext.userIntent = 'general_chat';
    mockContext.history = [{ role: 'user', content: 'hello' }, { role: 'assistant', content: 'hi' }];
    
    const decision = decide_action(mockContext, 'tell me a joke');
    expect(decision.actionType).toBe('standard_ai_response');
  });
});
