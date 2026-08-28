import { apiFetch } from "@/lib/api";
import type {
  LearningNextResponse,
  LearningPathItem,
} from "@/features/learning/types";

export const learningService = {
  getNextLesson() {
    return apiFetch<LearningNextResponse>(
      "/learning/next",
    );
  },

  getLearningPath() {
    return apiFetch<LearningPathItem[]>(
      "/learning/path",
    );
  },
};