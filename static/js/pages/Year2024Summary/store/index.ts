import { SUMMARY_STAGE } from '@/constants/yearSummary';
import { create } from 'zustand';
export const useYear2024SummaryStore = create<{
  stage: SUMMARY_STAGE;
  setStage: (stage: SUMMARY_STAGE) => void;
  modalOpen: boolean;
  setModalOpen: (modalOpen: boolean) => void;
  showYYSSBtn: boolean;
  setShowYYSSBtn: (showYYSSBtn: boolean) => void;
}>((set) => ({
  stage: SUMMARY_STAGE.START,
  modalOpen: false,
  setModalOpen: (modalOpen: boolean) =>
    set(() => ({
      modalOpen,
    })),
  setStage: (stage: SUMMARY_STAGE) => set(() => ({ stage })),
  showYYSSBtn: false,
  setShowYYSSBtn: (showYYSSBtn: boolean) => set(() => ({ showYYSSBtn })),
}));
