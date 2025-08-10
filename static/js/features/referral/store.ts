import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

interface TraderState {
  referralCode: string;
  setReferralCode: (code: string) => void;
}

export const useReferralStore = create<TraderState>()(
  devtools(
    persist(
      (set) => ({
        referralCode: '',
        setReferralCode: (code) => set(() => ({ referralCode: code })),
      }),
      {
        name: 'referral-storage',
        partialize: (state) => ({
          referralCode: state.referralCode,
        }),
        version: 0,
      },
    ),
  ),
);
