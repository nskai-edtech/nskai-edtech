import { create } from "zustand";
import { InferSelectModel } from "drizzle-orm";
import { users } from "@/drizzle/schema";

type User = InferSelectModel<typeof users>;

interface ModalData {
  tutor?: User;
}

interface ModalStore {
  type: "approveTutor" | "rejectTutor" | null;
  data: ModalData;
  isOpen: boolean;

  // Actions
  onOpen: (type: "approveTutor" | "rejectTutor", data?: ModalData) => void;
  onClose: () => void;
}

export const useModalStore = create<ModalStore>((set) => ({
  // Initial State
  type: null,
  data: {},
  isOpen: false,

  // Action: Open a modal
  onOpen: (type, data = {}) => set({ isOpen: true, type, data }),

  // Action: Close a modal
  onClose: () => set({ isOpen: false, type: null }),
}));
