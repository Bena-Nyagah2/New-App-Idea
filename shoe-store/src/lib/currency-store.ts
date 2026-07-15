import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type CurrencyCode = 'KES' | 'USD';

interface CurrencyStore {
  currency: CurrencyCode;
  setCurrency: (c: CurrencyCode) => void;
  toggle: () => void;
}

export const useCurrencyStore = create<CurrencyStore>()(
  persist(
    (set, get) => ({
      currency: 'KES',
      setCurrency: (currency) => set({ currency }),
      toggle: () => set({ currency: get().currency === 'KES' ? 'USD' : 'KES' }),
    }),
    { name: 'nurwins-currency' }
  )
);
