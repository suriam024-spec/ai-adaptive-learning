import {
  Injectable,
  NotFoundException,
} from "@nestjs/common";

import { PrismaService } from "../prisma/prisma.service";
import { AdaptiveService } from "../adaptive/adaptive.service";

@Injectable()
export class LearningService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly adaptiveService: AdaptiveService,
  ) {}

  /**
   * Get the next recommended lesson for a user.
   *
   * Adaptive MVP rules:
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
  async next(userId: string) {
  if (!userId) {
    throw new NotFoundException(
      "User ID is required",
    );
  }

  return this.adaptiveService.getNextLearning(
    userId,
  );
}

  /**
   * Get complete learning path for a user.
   */
  async path(userId: string) {
    if (!userId) {
      throw new NotFoundException(
        "User ID is required",
      );
    }

    const lessons =
      await this.prisma.lessons.findMany({
        orderBy: [
          {
            course_id: "asc",
          },
          {
            lesson_order: "asc",
          },
        ],

        include: {
          learning_progress: {
            where: {
              user_id: userId,
            },

            orderBy: {
              last_accessed: "desc",
            },

            select: {
              status: true,
              progress_percent: true,
              mastery_score: true,
              last_accessed: true,
              completed_at: true,
            },
          },
        },
      });

    return lessons.map((lesson) => {
      const progress =
        lesson.learning_progress[0];

      return {
        id: lesson.id,

        courseId:
          lesson.course_id,

        title:
          lesson.title,

        lessonOrder:
          lesson.lesson_order,

        difficulty:
          lesson.difficulty,

        status:
          progress?.status ??
          "not_started",

        progressPercent: Number(
          progress?.progress_percent ?? 0,
        ),

        masteryScore: Number(
          progress?.mastery_score ?? 0,
        ),

        lastAccessed:
          progress?.last_accessed ??
          null,

        completedAt:
          progress?.completed_at ??
          null,
      };
    });
  }

  /**
   * Get a single lesson.
   */
  async getLesson(
    userId: string,
    lessonId: string,
  ) {
    if (!userId) {
      throw new NotFoundException(
        "User ID is required",
      );
    }

    const lesson =
      await this.prisma.lessons.findUnique({
        where: {
          id: lessonId,
        },

        include: {
          learning_progress: {
            where: {
              user_id: userId,
            },

            orderBy: {
              last_accessed: "desc",
            },
          },
        },
      });

    if (!lesson) {
      throw new NotFoundException(
        "Lesson not found",
      );
    }

    const progress =
      lesson.learning_progress[0];

    return {
      id: lesson.id,

      courseId:
        lesson.course_id,

      title:
        lesson.title,

      content:
        lesson.content,

      videoUrl:
        lesson.video_url,

      lessonOrder:
        lesson.lesson_order,

      difficulty:
        lesson.difficulty,

      estimatedTime:
        lesson.estimated_time,

      progress: {
        status:
          progress?.status ??
          "not_started",

        progressPercent:
          Number(
            progress?.progress_percent ?? 0,
          ),

        masteryScore:
          Number(
            progress?.mastery_score ?? 0,
          ),

        lastAccessed:
          progress?.last_accessed ??
          null,

        completedAt:
          progress?.completed_at ??
          null,
      },
    };
  }

  /**
   * Start a lesson.
   */
  async startLesson(
    userId: string,
    lessonId: string,
  ) {
    if (!userId) {
      throw new NotFoundException(
        "User ID is required",
      );
    }

    const lesson =
      await this.prisma.lessons.findUnique({
        where: {
          id: lessonId,
        },
      });

    if (!lesson) {
      throw new NotFoundException(
        "Lesson not found",
      );
    }

    const now = new Date();

    const progress =
      await this.prisma.learning_progress.upsert({
        where: {
          user_id_lesson_id: {
            user_id: userId,
            lesson_id: lessonId,
          },
        },

        create: {
          user_id: userId,
          lesson_id: lessonId,
          status: "in_progress",
          progress_percent: 0,
          mastery_score: 0,
          last_accessed: now,
        },

        update: {
          status: "in_progress",
          last_accessed: now,
        },
      });

    return {
      message: "Lesson started",

      lesson: {
        id: lesson.id,
        title: lesson.title,
        courseId:
          lesson.course_id,
        lessonOrder:
          lesson.lesson_order,
        difficulty:
          lesson.difficulty,
        estimatedTime:
          lesson.estimated_time,
      },

      progress: {
        status:
          progress.status,

        progressPercent:
          Number(
            progress.progress_percent,
          ),

        masteryScore:
          Number(
            progress.mastery_score,
          ),

        lastAccessed:
          progress.last_accessed,
      },
    };
  }

  /**
   * Complete a lesson.
   *
   * IMPORTANT:
   * This method does not modify mastery_score.
   *
   * Mastery comes from Quiz submission.
   */
  async completeLesson(
    userId: string,
    lessonId: string,
  ) {
    if (!userId) {
      throw new NotFoundException(
        "User ID is required",
      );
    }

    const lesson =
      await this.prisma.lessons.findUnique({
        where: {
          id: lessonId,
        },
      });

    if (!lesson) {
      throw new NotFoundException(
        "Lesson not found",
      );
    }

    const now = new Date();

    /**
     * Check existing progress first.
     * This preserves mastery calculated by quiz.
     */
    const existingProgress =
      await this.prisma.learning_progress.findUnique({
        where: {
          user_id_lesson_id: {
            user_id: userId,
            lesson_id: lessonId,
          },
        },
      });

    const progress =
      await this.prisma.learning_progress.upsert({
        where: {
          user_id_lesson_id: {
            user_id: userId,
            lesson_id: lessonId,
          },
        },

        create: {
          user_id: userId,
          lesson_id: lessonId,
          status: "completed",
          progress_percent: 100,
          mastery_score: 0,
          last_accessed: now,
          completed_at: now,
        },

        update: {
          status: "completed",
          progress_percent: 100,
          last_accessed: now,
          completed_at: now,

          /**
           * Do not modify existing mastery score.
           */
          ...(existingProgress
            ? {}
            : {
                mastery_score: 0,
              }),
        },
      });

    return {
      message: "Lesson completed",

      lesson: {
        id: lesson.id,
        title: lesson.title,
        courseId:
          lesson.course_id,
        lessonOrder:
          lesson.lesson_order,
      },

      progress: {
        status:
          progress.status,

        progressPercent:
          Number(
            progress.progress_percent,
          ),

        masteryScore:
          Number(
            progress.mastery_score,
          ),

        lastAccessed:
          progress.last_accessed,

        completedAt:
          progress.completed_at,
      },
    };
  }
}