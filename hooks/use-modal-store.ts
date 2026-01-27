import { create } from "zustand";
import { InferSelectModel } from "drizzle-orm";
import { users } from "@/drizzle/schema";

type User = InferSelectModel<typeof users>;

interface ModalData {
  tutor?: User;
  tutorId?: string;
}

interface ModalStore {
  type: "approveTutor" | "rejectTutor" | null;
  data: ModalData;
  isOpen: boolean;

  onOpen: (type: "approveTutor" | "rejectTutor", data?: ModalData) => void;
  onClose: () => void;
}

export const useModalStore = create<ModalStore>((set) => ({
  type: null,
  data: {},
  isOpen: false,

  onOpen: (type, data = {}) => set({ isOpen: true, type, data }),

  onClose: () => set({ isOpen: false, type: null }),
}));
