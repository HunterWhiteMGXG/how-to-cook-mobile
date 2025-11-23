import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type { Timer } from '@/types'

interface CookingState {
  // 做菜状态
  isActive: boolean
  recipeId: string | null
  currentStep: number
  completedSteps: number[]

  // 计时器
  timers: Timer[]

  // 操作
  startCooking: (recipeId: string) => void
  endCooking: () => void
  nextStep: () => void
  prevStep: () => void
  goToStep: (step: number) => void
  completeStep: (step: number) => void

  // 计时器操作
  addTimer: (timer: Timer) => void
  removeTimer: (id: string) => void
  updateTimer: (id: string, remaining: number) => void
}

export const useCookingStore = create<CookingState>()(
  persist(
    (set, get) => ({
      isActive: false,
      recipeId: null,
      currentStep: 0,
      completedSteps: [],
      timers: [],

      startCooking: (recipeId) =>
        set({
          isActive: true,
          recipeId,
          currentStep: 0,
          completedSteps: [],
        }),

      endCooking: () =>
        set({
          isActive: false,
          recipeId: null,
          currentStep: 0,
          completedSteps: [],
          timers: [],
        }),

      nextStep: () =>
        set((state) => ({
          currentStep: state.currentStep + 1,
        })),

      prevStep: () =>
        set((state) => ({
          currentStep: Math.max(0, state.currentStep - 1),
        })),

      goToStep: (step) => set({ currentStep: step }),

      completeStep: (step) =>
        set((state) => {
          if (!state.completedSteps.includes(step)) {
            return {
              completedSteps: [...state.completedSteps, step],
            }
          }
          return state
        }),

      addTimer: (timer) =>
        set((state) => ({
          timers: [...state.timers, timer],
        })),

      removeTimer: (id) =>
        set((state) => ({
          timers: state.timers.filter((t) => t.id !== id),
        })),

      updateTimer: (id, remaining) =>
        set((state) => ({
          timers: state.timers.map((t) =>
            t.id === id ? { ...t, remaining } : t
          ),
        })),
    }),
    {
      name: 'cooking-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
)
