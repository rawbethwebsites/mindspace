import { useQuery, useMutation } from 'convex/react'
import { api } from '../../convex/_generated/api'
import type { Id } from '../../convex/_generated/dataModel'

export function useChatCloud() {
  // For anonymous users, we use local-only mode (no userId)
  const userId = undefined as Id<'users'> | undefined
  
  const chats = useQuery(api.mindspace.listChats, { userId })
  const createChat = useMutation(api.mindspace.createChat)
  const updateChatTitle = useMutation(api.mindspace.updateChatTitle)
  const deleteChat = useMutation(api.mindspace.deleteChat)
  const addMessage = useMutation(api.mindspace.addMessage)
  
  return {
    chats: chats ?? [],
    createChat,
    updateChatTitle,
    deleteChat,
    addMessage,
  }
}

export function useMessages(chatId: Id<'chats'>) {
  const messages = useQuery(api.mindspace.getMessages, { chatId })
  return messages ?? []
}

export function useJournalCloud() {
  const userId = undefined as Id<'users'> | undefined
  const journals = useQuery(api.mindspace.listJournals, { userId })
  const createJournal = useMutation(api.mindspace.createJournal)
  const updateJournalReflection = useMutation(api.mindspace.updateJournalReflection)
  const deleteJournal = useMutation(api.mindspace.deleteJournal)
  
  return {
    journals: journals ?? [],
    createJournal,
    updateJournalReflection,
    deleteJournal,
  }
}

export function useMoodCloud() {
  const userId = undefined as Id<'users'> | undefined
  const moods = useQuery(api.mindspace.listMoods, { userId })
  const logMood = useMutation(api.mindspace.logMood)
  
  return {
    moods: moods ?? [],
    logMood,
  }
}

export function useExercisesCloud() {
  const userId = undefined as Id<'users'> | undefined
  const exercises = useQuery(api.mindspace.listExercises, { userId })
  const completeExercise = useMutation(api.mindspace.completeExercise)
  
  return {
    exercises: exercises ?? [],
    completeExercise,
  }
}
