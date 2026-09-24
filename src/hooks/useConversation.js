import { useCallback } from 'react';
import { useApp } from '../context/AppContext';

export default function useConversation() {
  const { conversationHistory, addToConversation, resetConversation } = useApp();

  const sendUserMessage = useCallback(
    (text) => {
      const trimmed = text?.trim();
      if (!trimmed) return;
      addToConversation('user', trimmed);
    },
    [addToConversation]
  );

  const sendAssistantMessage = useCallback(
    (text) => {
      if (!text) return;
      addToConversation('assistant', text);
    },
    [addToConversation]
  );

  const lastAssistantMessage = [...conversationHistory]
    .reverse()
    .find((m) => m.role === 'assistant');

  return {
    history: conversationHistory,
    lastAssistantMessage,
    sendUserMessage,
    sendAssistantMessage,
    resetConversation,
  };
}
