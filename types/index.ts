import {
  lessons,
  chapters,
  courses,
  questions,
  answers,
  users,
} from "@/drizzle/schema";
import { InferSelectModel } from "drizzle-orm";

export type User = InferSelectModel<typeof users>;
export type Question = InferSelectModel<typeof questions>;
export type Answer = InferSelectModel<typeof answers>;

export type AnswerWithUser = Answer & {
  user: User;
};

export type QuestionWithRelations = Question & {
  user: User;
  answers: AnswerWithUser[];
};

export type Lesson = InferSelectModel<typeof lessons> & {
  muxData?: {
    id: string;
    assetId: string;
    playbackId: string | null;
  } | null;
};

export type Chapter = InferSelectModel<typeof chapters> & {
  lessons: Lesson[];
};

export type Course = InferSelectModel<typeof courses> & {
  chapters: Chapter[];
};
