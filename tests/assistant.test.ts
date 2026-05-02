import { getContext, clearContext } from '../src/assistant/contextManager';
import { process_user_input, AssistantContext } from '../src/assistant/assistant';

describe('MakeSense AI Context Manager & Assistant', () => {
  const testUserId = 'test-user-1';

  afterEach(() => {
    clearContext(testUserId);
  });

  it('should initialize context correctly', () => {
    const context = getContext(testUserId);
    expect(context.history).toEqual([]);
    expect(context.userId).toBe(testUserId);
  });

  it('should limit history to last 5 messages', async () => {
    const context = getContext(testUserId);
    await process_user_input('message 1', context);
    await process_user_input('message 2', context);
    await process_user_input('message 3', context);
    
    // 3 user inputs + 3 assistant responses = 6 messages. 
    // The history bounded to 5, so we should see exactly 5 items.
    expect(context.history.length).toBe(5);
  });

  it('should detect intents and previous actions properly', async () => {
    const context = getContext(testUserId);
    const reply = await process_user_input('I need to check my calendar', context);
    
    expect(context.userIntent).toBe('check_calendar');
    expect(context.previousActions).toContain('accessed_calendar');
    expect(reply).toContain('calendar');
  });
});
