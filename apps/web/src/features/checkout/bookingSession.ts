import { create } from 'zustand';
import { createJSONStorage, persist, type StateStorage } from 'zustand/middleware';

const HOLD_MINUTES = 15;
const storage: StateStorage = {
  getItem: (key) => { try { return window.sessionStorage.getItem(key); } catch { return null; } },
  setItem: (key, value) => { try { window.sessionStorage.setItem(key, value); } catch {} },
  removeItem: (key) => { try { window.sessionStorage.removeItem(key); } catch {} },
};

interface BookingSessionState {
  started: boolean;
  startedAt: number | null;
  expiresAt: number | null;
  start: () => void;
  clear: () => void;
}

export const useBookingSession = create<BookingSessionState>()(
  persist(
    (set, get) => ({
      started: false,
      startedAt: null,
      expiresAt: null,
      start: () => {
        const current = get();
        if (current.started && current.expiresAt && current.expiresAt > Date.now()) return;
        const startedAt = Date.now();
        set({ started: true, startedAt, expiresAt: startedAt + HOLD_MINUTES * 60_000 });
      },
      clear: () => set({ started: false, startedAt: null, expiresAt: null }),
    }),
    { name: 'zproo-booking-session', storage: createJSONStorage(() => storage) },
  ),
);
