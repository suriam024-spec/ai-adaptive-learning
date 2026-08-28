import { apiFetch } from "@/lib/api";
import type { LearningPathItem } from "@/features/learning/types";

export const recommendationService = {
  getNextLesson() {
    return apiFetch<LearningPathItem>("/recommendations/next");
  },
};
