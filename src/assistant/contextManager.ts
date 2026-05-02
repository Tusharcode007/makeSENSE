import { Message, AssistantContext } from './assistant';

const memoryStore = new Map<string, AssistantContext>();

export const getContext = (userId: string): AssistantContext => {
  if (!memoryStore.has(userId)) {
    memoryStore.set(userId, {
      userId,
      history: [],
      timeOfDay: '',
      previousActions: [],
      userIntent: '',
      lastActive: new Date()
    });
  }
  
  const context = memoryStore.get(userId)!;
  context.lastActive = new Date();
  return context;
};

export const clearContext = (userId: string) => {
  memoryStore.delete(userId);
};
