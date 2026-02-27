import { create } from "zustand";
import { InferSelectModel } from "drizzle-orm";
import { users } from "@/drizzle/schema";

type User = InferSelectModel<typeof users>;

interface ModalData {
  tutor?: User;
  tutorId?: string;
  bio?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  email?: string;
  expertise?: string | null;
  lessonId?: string;
  courseId?: string;
  courseTitle?: string;
}

type ModalType =
  | "approveTutor"
  | "rejectTutor"
  | "checkTutor"
  | "suspendTutor"
  | "banTutor"
  | "aiMentor"
  | "courseCompleted";

interface ModalStore {
  type: ModalType | null;
  data: ModalData;
  isOpen: boolean;

  onOpen: (type: ModalType, data?: ModalData) => void;
  onClose: () => void;
}

export const useModalStore = create<ModalStore>((set) => ({
  type: null,
  data: {},
  isOpen: false,

  onOpen: (type, data = {}) => set({ isOpen: true, type, data }),

  onClose: () => set({ isOpen: false, type: null, data: {} }),
}));
