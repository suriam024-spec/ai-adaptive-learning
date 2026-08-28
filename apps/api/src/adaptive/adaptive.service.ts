import {
  Injectable,
  NotFoundException,
} from "@nestjs/common";

import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class AdaptiveService {
  constructor(
    private readonly prisma: PrismaService,
  ) {}

  /**
   * Main Adaptive Engine.
   *
   * MVP Rules:
   *
   * No progress
   *   -> START_LEARNING
   *
   * Mastery < 60
   *   -> REVIEW
   *
   * Mastery 60-79
   *   -> NEXT_LESSON + optional review
   *
   * Mastery >= 80
   *   -> NEXT_LESSON
   *
   * No next lesson
   *   -> COURSE_COMPLETED
   */
  async getNextLearning(userId: string) {
    if (!userId) {
      throw new NotFoundException(
        "User ID is required",
      );
    }

    /**
     * Get the user's latest learning progress.
     */
    const currentProgress =
      await this.prisma.learning_progress.findFirst({
        where: {
          user_id: userId,
        },

        orderBy: {
          last_accessed: "desc",
        },

        include: {
          lessons: true,
        },
      });

    /**
     * User has never started learning.
     */
    if (!currentProgress) {
      const firstLesson =
        await this.prisma.lessons.findFirst({
          orderBy: {
            lesson_order: "asc",
          },
        });

      if (!firstLesson) {
        throw new NotFoundException(
          "No lessons found",
        );
      }

      return {
        currentLesson: null,

        nextLesson: {
          id: firstLesson.id,
          title: firstLesson.title,
          lessonOrder:
            firstLesson.lesson_order,
          difficulty:
            firstLesson.difficulty,
        },

        decision: "START_LEARNING",
        reason: "NO_PROGRESS",
      };
    }

    const currentLesson =
      currentProgress.lessons;

    const masteryScore = Number(
      currentProgress.mastery_score ?? 0,
    );

    const progressPercent = Number(
      currentProgress.progress_percent ?? 0,
    );

    /**
     * Find the next lesson in the same course.
     */
    const nextLesson =
      await this.prisma.lessons.findFirst({
        where: {
          course_id:
            currentLesson.course_id,

          lesson_order: {
            gt: currentLesson.lesson_order,
          },
        },

        orderBy: {
          lesson_order: "asc",
        },
      });

    /**
     * Low mastery -> review current lesson.
     */
    if (masteryScore < 60) {
      return {
        currentLesson: {
          id: currentLesson.id,
          title: currentLesson.title,
          lessonOrder:
            currentLesson.lesson_order,
          difficulty:
            currentLesson.difficulty,
          status:
            currentProgress.status,
          progressPercent,
          masteryScore,
        },

        nextLesson: {
          id: currentLesson.id,
          title: currentLesson.title,
          lessonOrder:
            currentLesson.lesson_order,
          difficulty:
            currentLesson.difficulty,
        },

        decision: "REVIEW",
        reason: "LOW_MASTERY",

        recommendation: {
          action:
            "REVIEW_CURRENT_LESSON",
          masteryScore,
        },
      };
    }

    /**
     * No next lesson -> course completed.
     */
    if (!nextLesson) {
      return {
        currentLesson: {
          id: currentLesson.id,
          title: currentLesson.title,
          lessonOrder:
            currentLesson.lesson_order,
          difficulty:
            currentLesson.difficulty,
          status:
            currentProgress.status,
          progressPercent,
          masteryScore,
        },

        nextLesson: null,

        decision: "COURSE_COMPLETED",
        reason: "NO_MORE_LESSONS",

        recommendation: {
          action: "COURSE_COMPLETED",
          masteryScore,
        },
      };
    }

    /**
     * High mastery -> continue immediately.
     */
    if (masteryScore >= 80) {
      return {
        currentLesson: {
          id: currentLesson.id,
          title: currentLesson.title,
          lessonOrder:
            currentLesson.lesson_order,
          difficulty:
            currentLesson.difficulty,
          status:
            currentProgress.status,
          progressPercent,
          masteryScore,
        },

        nextLesson: {
          id: nextLesson.id,
          title: nextLesson.title,
          lessonOrder:
            nextLesson.lesson_order,
          difficulty:
            nextLesson.difficulty,
        },

        decision: "NEXT_LESSON",
        reason: "HIGH_MASTERY",

        recommendation: {
          action: "CONTINUE",
          masteryScore,
        },
      };
    }

    /**
     * Medium mastery -> continue,
     * but recommend optional review.
     */
    return {
      currentLesson: {
        id: currentLesson.id,
        title: currentLesson.title,
        lessonOrder:
          currentLesson.lesson_order,
        difficulty:
          currentLesson.difficulty,
        status:
          currentProgress.status,
        progressPercent,
        masteryScore,
      },

      nextLesson: {
        id: nextLesson.id,
        title: nextLesson.title,
        lessonOrder:
          nextLesson.lesson_order,
        difficulty:
          nextLesson.difficulty,
      },

      decision: "NEXT_LESSON",
      reason: "MEDIUM_MASTERY",

      recommendation: {
        action: "REVIEW_OPTIONAL",
        masteryScore,
      },
    };
  }

  /**
   * Get recommendation for a specific lesson.
   *
   * GET /adaptive/recommendation/:lessonId
   *
   * Used when the user has just completed
   * a lesson / quiz and we want to know
   * what should happen next.
   */
  async getRecommendation(
    userId: string,
    lessonId: string,
  ) {
    if (!userId) {
      throw new NotFoundException(
        "User ID is required",
      );
    }

    if (!lessonId) {
      throw new NotFoundException(
        "Lesson ID is required",
      );
    }

    /**
     * Get lesson and all lessons
     * belonging to the same course.
     */
    const lesson =
      await this.prisma.lessons.findUnique({
        where: {
          id: lessonId,
        },

        include: {
          courses: {
            include: {
              lessons: {
                orderBy: {
                  lesson_order: "asc",
                },
              },
            },
          },
        },
      });

    if (!lesson) {
      throw new NotFoundException(
        "Lesson not found",
      );
    }

    /**
     * Get this user's progress for this lesson.
     */
    const progress =
      await this.prisma.learning_progress.findUnique({
        where: {
          user_id_lesson_id: {
            user_id: userId,
            lesson_id: lessonId,
          },
        },
      });

    const mastery = Number(
      progress?.mastery_score ?? 0,
    );

    const lessons =
      lesson.courses.lessons;

    const currentIndex =
      lessons.findIndex(
        (item) => item.id === lessonId,
      );

    /**
     * Safety check.
     */
    if (currentIndex === -1) {
      throw new NotFoundException(
        "Lesson does not belong to its course",
      );
    }

    const nextLesson =
      lessons[currentIndex + 1] ?? null;

    /**
     * Low mastery -> review current lesson.
     */
    if (mastery < 60) {
      return {
        currentLesson: {
          id: lesson.id,
          title: lesson.title,
          lessonOrder:
            lesson.lesson_order,
        },

        mastery,

        recommendation: {
          type: "REVIEW",
          reason: "LOW_MASTERY",

          lesson: {
            id: lesson.id,
            title: lesson.title,
            lessonOrder:
              lesson.lesson_order,
          },
        },
      };
    }

    /**
     * No next lesson -> course completed.
     */
    if (!nextLesson) {
      return {
        currentLesson: {
          id: lesson.id,
          title: lesson.title,
          lessonOrder:
            lesson.lesson_order,
        },

        mastery,

        recommendation: {
          type: "COURSE_COMPLETED",
          reason: "NO_MORE_LESSONS",
          lesson: null,
        },
      };
    }

    /**
     * High mastery -> continue.
     */
    if (mastery >= 80) {
      return {
        currentLesson: {
          id: lesson.id,
          title: lesson.title,
          lessonOrder:
            lesson.lesson_order,
        },

        mastery,

        recommendation: {
          type: "NEXT_LESSON",
          reason: "HIGH_MASTERY",

          lesson: {
            id: nextLesson.id,
            title: nextLesson.title,
            lessonOrder:
              nextLesson.lesson_order,
          },
        },
      };
    }

    /**
     * Medium mastery -> continue
     * with optional review.
     */
    return {
      currentLesson: {
        id: lesson.id,
        title: lesson.title,
        lessonOrder:
          lesson.lesson_order,
      },

      mastery,

      recommendation: {
        type: "NEXT_LESSON",
        reason: "MEDIUM_MASTERY",

        lesson: {
          id: nextLesson.id,
          title: nextLesson.title,
          lessonOrder:
            nextLesson.lesson_order,
        },

        reviewRecommended: true,
      },
    };
  }
}