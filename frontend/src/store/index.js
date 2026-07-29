import { create } from 'zustand';
import apiClient from '../api/client';

const useStore = create((set, get) => ({
  // Global State
  userRole: null, // 'admin' | 'agent' | null
  setUserRole: (role) => set({ userRole: role }),

  // CS Agent State
  messages: [],
  isTyping: false,
  error: null,

  addMessage: (msg) => set((state) => ({ messages: [...state.messages, msg] })),
  
  sendMessage: async (text) => {
    set({ isTyping: true, error: null });
    
    // Add user message
    get().addMessage({ role: 'user', content: text });

    try {
      // For now, hit the legacy or new endpoint
      // Adjust this to the actual endpoint
      const response = await apiClient.post('/cs/chat', { message: text });
      
      get().addMessage({ 
        role: 'assistant', 
        content: response.data.answer,
        // we can also store tools used or context if needed
      });
    } catch (err) {
      console.error('Chat error:', err);
      set({ error: err.message || 'Failed to send message' });
      get().addMessage({ role: 'assistant', content: '죄송합니다. 오류가 발생했습니다.' });
    } finally {
      set({ isTyping: false });
    }
  },
}));

export default useStore;
