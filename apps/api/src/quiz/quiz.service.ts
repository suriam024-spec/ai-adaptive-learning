import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";

import { PrismaService } from "../prisma/prisma.service";
import { SubmitQuizDto } from "./dto/submit-quiz.dto";

@Injectable()
export class QuizService {
  constructor(
    private readonly prisma: PrismaService,
  ) {}

  /**
   * Get quiz for a lesson.
   *
   * GET /quiz/lesson/:lessonId
   */
  async findByLesson(
    lessonId: string,
    userId: string,
  ) {
    const quiz =
      await this.prisma.quizzes.findFirst({
        where: {
          lesson_id: lessonId,
        },

        include: {
          quiz_questions: {
            orderBy: {
              question_order: "asc",
            },

            select: {
              id: true,
              question: true,
              question_type: true,
              option_a: true,
              option_b: true,
              option_c: true,
              option_d: true,
              difficulty: true,
              question_order: true,
            },
          },
        },
      });

    if (!quiz) {
      throw new NotFoundException(
        "Quiz not found",
      );
    }

    /**
     * Check whether the lesson exists.
     */
    const lesson =
      await this.prisma.lessons.findUnique({
        where: {
          id: lessonId,
        },

        select: {
          id: true,
        },
      });

    if (!lesson) {
      throw new NotFoundException(
        "Lesson not found",
      );
    }

    /**
     * Get current progress.
     */
    const progress =
      await this.prisma.learning_progress.findUnique(
        {
          where: {
            user_id_lesson_id: {
              user_id: userId,
              lesson_id: lessonId,
            },
          },
        },
      );

    return {
      id: quiz.id,
      lessonId: quiz.lesson_id,
      title: quiz.title,
      passing_score: Number(
        quiz.passing_score,
      ),
      time_limit: quiz.time_limit,

      questions:
        quiz.quiz_questions,

      progress: {
        status:
          progress?.status ??
          "not_started",

        progressPercent: Number(
          progress?.progress_percent ?? 0,
        ),

        masteryScore: Number(
          progress?.mastery_score ?? 0,
        ),
      },
    };
  }

  /**
   * Start a quiz attempt.
   *
   * POST /quiz/:quizId/start
   */
  async startQuiz(
    quizId: string,
    userId: string,
  ) {
    const quiz =
      await this.prisma.quizzes.findUnique({
        where: {
          id: quizId,
        },

        include: {
          quiz_questions: {
            orderBy: {
              question_order: "asc",
            },

            select: {
              id: true,
              question: true,
              question_type: true,
              option_a: true,
              option_b: true,
              option_c: true,
              option_d: true,
              difficulty: true,
              question_order: true,
            },
          },
        },
      });

    if (!quiz) {
      throw new NotFoundException(
        "Quiz not found",
      );
    }

    if (quiz.quiz_questions.length === 0) {
      throw new BadRequestException(
        "Quiz has no questions",
      );
    }

    /**
     * Verify lesson exists.
     */
    const lesson =
      await this.prisma.lessons.findUnique({
        where: {
          id: quiz.lesson_id,
        },
      });

    if (!lesson) {
      throw new NotFoundException(
        "Lesson not found",
      );
    }

    /**
     * Create new attempt number.
     */
    const previousAttempts =
      await this.prisma.quiz_attempts.count({
        where: {
          quiz_id: quizId,
          user_id: userId,
        },
      });

    const attempt =
      await this.prisma.quiz_attempts.create({
        data: {
          quiz_id: quizId,
          user_id: userId,
          attempt_no:
            previousAttempts + 1,
        },
      });

    /**
     * Mark lesson as in progress.
     */
    const now = new Date();

    await this.prisma.learning_progress.upsert(
      {
        where: {
          user_id_lesson_id: {
            user_id: userId,
            lesson_id: quiz.lesson_id,
          },
        },

        create: {
          user_id: userId,
          lesson_id: quiz.lesson_id,
          status: "in_progress",
          progress_percent: 0,
          mastery_score: 0,
          last_accessed: now,
        },

        update: {
          status: "in_progress",
          last_accessed: now,
        },
      },
    );

    return {
      attemptId: attempt.id,

      quiz: {
        id: quiz.id,
        lessonId: quiz.lesson_id,
        title: quiz.title,

        passing_score:
          Number(quiz.passing_score),

        time_limit:
          quiz.time_limit,

        questions:
          quiz.quiz_questions,
      },
    };
  }

  /**
   * Submit quiz answers.
   *
   * Flow:
   *
   * Validate attempt
   *      ↓
   * Validate answers
   *      ↓
   * Calculate score
   *      ↓
   * Save answers
   *      ↓
   * Finish attempt
   *      ↓
   * Update learning progress
   */
  async submitQuiz(
    userId: string,
    dto: SubmitQuizDto,
  ) {
    /**
     * Find attempt.
     */
    const attempt =
      await this.prisma.quiz_attempts.findUnique({
        where: {
          id: dto.attemptId,
        },

        include: {
          quizzes: {
            include: {
              quiz_questions: {
                orderBy: {
                  question_order: "asc",
                },
              },
            },
          },
        },
      });

    if (!attempt) {
      throw new NotFoundException(
        "Quiz attempt not found",
      );
    }

    /**
     * Security check.
     */
    if (attempt.user_id !== userId) {
      throw new BadRequestException(
        "This attempt does not belong to this user",
      );
    }

    /**
     * Prevent duplicate submission.
     */
    if (attempt.finished_at) {
      throw new BadRequestException(
        "Quiz attempt already submitted",
      );
    }

    const questions =
      attempt.quizzes.quiz_questions;

    if (questions.length === 0) {
      throw new BadRequestException(
        "Quiz has no questions",
      );
    }

    /**
     * Validate answer count.
     */
    if (
      dto.answers.length !==
      questions.length
    ) {
      throw new BadRequestException(
        "All quiz questions must be answered",
      );
    }

    /**
     * Prevent duplicate question IDs.
     */
    const questionIds =
      dto.answers.map(
        (answer) => answer.questionId,
      );

    const uniqueQuestionIds =
      new Set(questionIds);

    if (
      uniqueQuestionIds.size !==
      questionIds.length
    ) {
      throw new BadRequestException(
        "Duplicate question answers are not allowed",
      );
    }

    let correctCount = 0;

    /**
     * Build answer records.
     */
    const answerData =
      dto.answers.map((answer) => {
        const question =
          questions.find(
            (question) =>
              question.id ===
              answer.questionId,
          );

        if (!question) {
          throw new BadRequestException(
            `Question ${answer.questionId} does not belong to this quiz`,
          );
        }

        const selectedAnswer =
          answer.selectedAnswer
            .trim()
            .toLowerCase();

        const correctAnswer =
          question.correct_answer
            .trim()
            .toLowerCase();

        const isCorrect =
          selectedAnswer ===
          correctAnswer;

        if (isCorrect) {
          correctCount++;
        }

        return {
          attempt_id: attempt.id,
          question_id: question.id,
          selected_answer:
            answer.selectedAnswer,
          is_correct: isCorrect,
          time_used:
            answer.timeUsed ?? null,
        };
      });

    /**
     * Calculate score.
     */
    const score = Number(
      (
        (correctCount /
          questions.length) *
        100
      ).toFixed(2),
    );

    /**
     * MVP:
     *
     * Quiz score becomes mastery score.
     */
    const masteryScore = score;

    /**
     * Passing score.
     */
    const passingScore =
      Number(
        attempt.quizzes.passing_score,
      );

    const passed =
      score >= passingScore;

    const now = new Date();

    /**
     * Save everything atomically.
     */
    await this.prisma.$transaction(
      async (tx) => {
        /**
         * 1. Save answers.
         */
        await tx.quiz_answers.createMany({
          data: answerData,
        });

        /**
         * 2. Finish attempt.
         */
        await tx.quiz_attempts.update({
          where: {
            id: attempt.id,
          },

          data: {
            score,
            finished_at: now,
          },
        });

        /**
         * 3. Update learning progress.
         */
        await tx.learning_progress.upsert(
          {
            where: {
              user_id_lesson_id: {
                user_id: userId,
                lesson_id:
                  attempt.quizzes.lesson_id,
              },
            },

            create: {
              user_id: userId,

              lesson_id:
                attempt.quizzes.lesson_id,

              status: passed
                ? "completed"
                : "in_progress",

              progress_percent: passed
                ? 100
                : score,

              mastery_score:
                masteryScore,

              last_accessed: now,

              completed_at: passed
                ? now
                : null,
            },

            update: {
              status: passed
                ? "completed"
                : "in_progress",

              progress_percent: passed
                ? 100
                : score,

              mastery_score:
                masteryScore,

              last_accessed: now,

              completed_at: passed
                ? now
                : null,
            },
          },
        );
      },
    );

    /**
     * Return result.
     */
    return {
      attemptId: attempt.id,

      quizId:
        attempt.quizzes.id,

      lessonId:
        attempt.quizzes.lesson_id,

      score,

      masteryScore,

      correctAnswers:
        correctCount,

      totalQuestions:
        questions.length,

      passingScore,

      passed,

      progress: {
        status: passed
          ? "completed"
          : "in_progress",

        progressPercent: passed
          ? 100
          : score,

        masteryScore,
      },

      adaptive: {
        decision:
          this.getAdaptiveDecision(
            masteryScore,
            passed,
          ),
      },
    };
  }

  /**
   * Determine adaptive decision.
   *
   * MVP rules:
   *
   * < 60
   *   REVIEW
   *
   * 60-79
   *   NEXT_LESSON_WITH_OPTIONAL_REVIEW
   *
   * >= 80
   *   NEXT_LESSON
   */
  private getAdaptiveDecision(
    masteryScore: number,
    passed: boolean,
  ) {
    if (masteryScore < 60) {
      return {
        action: "REVIEW",
        reason: "LOW_MASTERY",
      };
    }

    if (masteryScore < 80) {
      return {
        action: "NEXT_LESSON",
        reason: "MEDIUM_MASTERY",
        reviewRecommended: true,
      };
    }

    return {
      action: "NEXT_LESSON",
      reason: "HIGH_MASTERY",
      reviewRecommended: false,
    };
  }
}