import { lessons, chapters, courses } from "@/drizzle/schema";
import { InferSelectModel } from "drizzle-orm";

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
