import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { LearningLanguage } from '@/types';

interface LanguageState {
  currentLanguage: LearningLanguage;
  setLanguage: (language: LearningLanguage) => void;
}

export const useLanguageStore = create<LanguageState>()(
  persist(
    (set) => ({
      currentLanguage: 'en',

      setLanguage: (language) => {
        set({ currentLanguage: language });
      },
    }),
    {
      name: 'speakflow-language',
      version: 1,
    }
  )
);
