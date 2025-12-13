import { create } from 'zustand';

interface Toast {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  message: string;
  duration?: number;
}

interface UIState {
  // 로딩 상태
  isLoading: boolean;
  loadingText: string;

  // 모달
  activeModal: string | null;
  modalData: unknown;

  // 토스트 메시지
  toasts: Toast[];

  // 바텀 네비게이션
  activeTab: string;

  // Actions
  setLoading: (loading: boolean, text?: string) => void;
  openModal: (modalId: string, data?: unknown) => void;
  closeModal: () => void;
  showToast: (toast: Omit<Toast, 'id'>) => void;
  removeToast: (id: string) => void;
  setActiveTab: (tab: string) => void;
}

export const useUIStore = create<UIState>((set, get) => ({
  isLoading: false,
  loadingText: '',
  activeModal: null,
  modalData: null,
  toasts: [],
  activeTab: 'home',

  setLoading: (loading, text = '') =>
    set({ isLoading: loading, loadingText: text }),

  openModal: (modalId, data = null) =>
    set({ activeModal: modalId, modalData: data }),

  closeModal: () =>
    set({ activeModal: null, modalData: null }),

  showToast: (toast) => {
    const id = `toast-${Date.now()}`;
    const newToast = { ...toast, id };

    set((state) => ({
      toasts: [...state.toasts, newToast],
    }));

    // 자동 제거
    setTimeout(() => {
      get().removeToast(id);
    }, toast.duration || 3000);
  },

  removeToast: (id) =>
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id),
    })),

  setActiveTab: (tab) =>
    set({ activeTab: tab }),
}));
