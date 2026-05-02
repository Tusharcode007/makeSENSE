import { getContext, clearContext } from '../src/assistant/contextManager';
import { process_user_input } from '../src/assistant/assistant';
import { decide_action } from '../src/logic/decisionEngine';

// Import services directly to type-cast them as Jest Mocks
import * as calendarService from '../src/services/google/calendar';
import * as gmailService from '../src/services/google/gmail';
import * as driveService from '../src/services/google/drive';

// Globally intercept all heavy external API requirements
jest.mock('../src/services/google/calendar');
jest.mock('../src/services/google/gmail');
jest.mock('../src/services/google/drive');
jest.mock('../src/logic/decisionEngine', () => ({
  decide_action: jest.fn()
}));

const mockCalendar = calendarService as jest.Mocked<typeof calendarService>;
const mockGmail = gmailService as jest.Mocked<typeof gmailService>;
const mockDrive = driveService as jest.Mocked<typeof driveService>;
const mockDecideAction = decide_action as jest.Mock;

describe('MakeSense AI Core Logic & Mocks', () => {
  const testUserId = 'testuser-123';

  beforeEach(() => {
    jest.clearAllMocks();
    clearContext(testUserId);
    
    // Default the decision engine mock to generic baseline execution
    mockDecideAction.mockReturnValue({ actionType: 'standard_ai_response' });
    
    // Guarantee that saving logs doesn't asynchronously dump our test runner state
    mockDrive.save_log.mockResolvedValue({ success: true, fileId: '123', fileName: 'mock.txt' });
  });

  it('1. Assistant Logic: Should accurately maintain context limits and standard responses', async () => {
    const context = getContext(testUserId);
    
    // First message populates
    const response = await process_user_input("Hello there", context);
    expect(context.history.length).toBe(2); 
    expect(context.userIntent).toBe('general_chat');
    expect(response).toContain('MakeSense AI');
    
    // Test that conversational trackers force flush at 5 nodes
    await process_user_input("One", context);
    await process_user_input("Two", context);
    await process_user_input("Three", context);
    
    expect(context.history.length).toBe(5); // Bound limits check!
  });

  it('2. Decision Engine Hook: Should actively intercept flow if actionType overrides standard AI intent', async () => {
    const context = getContext(testUserId);
    
    // Force the logic engine layer to fire a rule matching 'Automation'
    mockDecideAction.mockReturnValue({ actionType: 'suggest_automation' });
    
    const response = await process_user_input("Check my routine", context);
    
    expect(mockDecideAction).toHaveBeenCalled();
    expect(response).toContain('Would you like me to automate this routine');
  });

  it('3. Google APIs (Mocked): Successfully fires Calendar APIs mapping exact intent strings', async () => {
    const context = getContext(testUserId);
    
    // Setup Mock Network response matching Google signature
    mockCalendar.createEventFromNaturalLanguage.mockResolvedValue({
      success: true, eventId: 'event-123', link: 'http://test.link'
    });

    const response = await process_user_input("Schedule a meeting tomorrow", context);
    
    expect(context.userIntent).toBe('create_calendar_event');
    expect(mockCalendar.createEventFromNaturalLanguage).toHaveBeenCalledWith(testUserId, "Schedule a meeting tomorrow");
    // Verifies data payload mapping propagates safely to final wrapper string
    expect(response).toContain('http://test.link');
  });

  it('4. Google APIs (Mocked): Successfully fires Gmail APIs requesting summarization', async () => {
    const context = getContext(testUserId);
    
    mockGmail.summarizeEmails.mockResolvedValue({
      success: true, summary: 'Mock Summary Built via Gmail APIs.', emails: []
    });

    const response = await process_user_input("Summarize my recent emails", context);
    
    expect(context.userIntent).toBe('summarize_emails');
    expect(mockGmail.summarizeEmails).toHaveBeenCalled();
    expect(response).toContain('Mock Summary Built via Gmail APIs.');
  });

  it('5. Engine Reliability: Intelligently catches and halts failing API calls (Unauthorized Blocks)', async () => {
    const context = getContext(testUserId);
    
    // Intercept with an active Network rejection throw (simulating a dead Google token)
    mockDrive.fetch_logs.mockRejectedValue(new Error('Unauthorized execution scope.'));

    const response = await process_user_input("Fetch my past logs", context);
    
    // Assert the Promise doesn't explode the app backend, but instead handles cleanly to the user
    expect(context.userIntent).toBe('fetch_logs');
    expect(response).toContain('Unauthorized error from Google');
  });
});
