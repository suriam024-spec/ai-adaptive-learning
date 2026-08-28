export type LearningPathStatus =
  | "not_started"
  | "in_progress"
  | "completed";

export type LearningPathItem = {
  id: string;
  courseId: string;
  title: string;
  lessonOrder: number;
  difficulty: string;

  status: LearningPathStatus;

  progressPercent: number;
  masteryScore: number;

  lastAccessed: string | null;
  completedAt: string | null;
};

export type LearningDecision =
  | "START_LEARNING"
  | "REVIEW"
  | "NEXT_LESSON"
  | "COURSE_COMPLETED";

export type LearningNextResponse = {
  currentLesson: {
    id: string;
    title: string;
    lessonOrder: number;
    difficulty: string;
    status: string;
    progressPercent: number;
    masteryScore: number;
  } | null;

  nextLesson: {
    id: string;
    title: string;
    lessonOrder: number;
    difficulty: string;
  } | null;

  decision: LearningDecision;
  reason: string;

  recommendation?: {
    action: string;
    masteryScore: number;
  };
};