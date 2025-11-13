import { create } from 'zustand'
import { AIService, type AIMessage } from '@/lib/aiService'

interface ChatMessage extends AIMessage {
  readonly id: string
  readonly timestamp: Date
  readonly isLoading?: boolean
}

interface AIState {
  readonly messages: ChatMessage[]
  readonly isLoading: boolean
  readonly context: string | null

  // Actions
  readonly sendMessage: (content: string) => Promise<void>
  readonly clearMessages: () => void
  readonly setContext: (context: string | null) => void
  readonly addSystemMessage: (content: string) => void
}

export const useAIStore = create<AIState>((set, get) => ({
  messages: [
    {
      id: '1',
      role: 'assistant',
      content: "Hello! I'm NorAI, your smart contract assistant. I can help you:\n\n• Generate contracts from natural language\n• Review code for security issues\n• Optimize gas usage\n• Generate test cases\n• Explain complex code\n\nWhat would you like to work on today?",
      timestamp: new Date(),
    },
  ],
  isLoading: false,
  context: null,

  sendMessage: async (content: string) => {
    const { messages, context } = get()

    // Add user message
    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      content,
      timestamp: new Date(),
    }

    set({
      messages: [...messages, userMessage],
      isLoading: true,
    })

    try {
      // Prepare conversation history
      const conversationHistory: AIMessage[] = [...messages, userMessage].map(
        ({ role, content }) => ({ role, content })
      )

      // Call AI service
      const response = await AIService.chat({
        messages: conversationHistory,
        context: context || undefined,
      })

      // Add AI response
      const assistantMessage: ChatMessage = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: response.message,
        timestamp: new Date(),
      }

      set({
        messages: [...get().messages, assistantMessage],
        isLoading: false,
      })

      // If there are suggestions, add them as a follow-up
      if (response.suggestions && response.suggestions.length > 0) {
        const suggestionsMessage: ChatMessage = {
          id: crypto.randomUUID(),
          role: 'system',
          content: `**Quick Actions:**\n${response.suggestions.map((s) => `• ${s}`).join('\n')}`,
          timestamp: new Date(),
        }

        set({
          messages: [...get().messages, suggestionsMessage],
        })
      }
    } catch (error) {
      console.error('AI Chat Error:', error)

      // Add error message
      const errorMessage: ChatMessage = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date(),
      }

      set({
        messages: [...get().messages, errorMessage],
        isLoading: false,
      })
    }
  },

  clearMessages: () => {
    set({
      messages: [
        {
          id: '1',
          role: 'assistant',
          content: 'Chat cleared. How can I help you?',
          timestamp: new Date(),
        },
      ],
    })
  },

  setContext: (context: string | null) => {
    set({ context })
  },

  addSystemMessage: (content: string) => {
    const systemMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: 'system',
      content,
      timestamp: new Date(),
    }

    set({
      messages: [...get().messages, systemMessage],
    })
  },
}))
