"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";

import { apiFetch } from "@/lib/api";
import { getToken } from "@/lib/auth";

type QuizQuestion = {
  id: string;
  question: string;
  question_type: string;
  option_a?: string;
  option_b?: string;
  option_c?: string;
  option_d?: string;
  difficulty?: string;
  question_order: number;
};

type Quiz = {
  id: string;
  title: string;
  passing_score: number;
  time_limit: number;
  questions: QuizQuestion[];
};

type StartQuizResponse = {
  attemptId: string;
  quiz: Quiz;
};

type SubmitResponse = {
  attemptId: string;
  score: number;
  masteryScore: number;
  correctAnswers: number;
  totalQuestions: number;
  passingScore: number;
  passed: boolean;
  progress: {
    lessonId: string;
    status: string;
    progressPercent: number;
    masteryScore: number;
  };
};

type NextLearningResponse = {
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

  decision: string;
  reason: string;

  recommendation?: {
    action: string;
    masteryScore: number;
  };
};

type Answer = {
  questionId: string;
  selectedAnswer: string;
  timeUsed: number;
};

export default function QuizClient() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const lessonId = searchParams.get("lessonId");

  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [attemptId, setAttemptId] = useState("");

  const [answers, setAnswers] = useState<Record<string, Answer>>({});

  const [currentIndex, setCurrentIndex] = useState(0);

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [loadingNext, setLoadingNext] = useState(false);

  const [error, setError] = useState("");

  const [result, setResult] = useState<SubmitResponse | null>(null);

  const [nextLearning, setNextLearning] =
    useState<NextLearningResponse | null>(null);

  /*
   * Start quiz
   */
  useEffect(() => {
    const token = getToken();

    if (!token) {
      router.push("/login");
      return;
    }

    if (!lessonId) {
      setError("Lesson ID is missing.");
      setLoading(false);
      return;
    }

    async function startQuizFromLesson() {
      try {
        const quizData = await apiFetch<Quiz>(
          `/quiz/lesson/${lessonId}`,
          {
            token,
          }
        );

        const startData =
          await apiFetch<StartQuizResponse>(
            `/quiz/${quizData.id}/start`,
            {
              method: "POST",
              token,
            }
          );

        setQuiz(startData.quiz);
        setAttemptId(startData.attemptId);
      } catch (err) {
        console.error("Failed to start quiz:", err);

        setError(
          err instanceof Error
            ? err.message
            : "Failed to start quiz"
        );
      } finally {
        setLoading(false);
      }
    }

    startQuizFromLesson();
  }, [lessonId, router]);

  /*
   * Current question
   */
  const currentQuestion = useMemo(() => {
    if (!quiz) {
      return null;
    }

    return quiz.questions[currentIndex] ?? null;
  }, [quiz, currentIndex]);

  /*
   * Select answer
   */
  function selectAnswer(
    questionId: string,
    answer: string
  ) {
    setAnswers((previous) => ({
      ...previous,
      [questionId]: {
        questionId,
        selectedAnswer: answer,
        timeUsed: 10,
      },
    }));

    setError("");
  }

  /*
   * Next question
   */
  function nextQuestion() {
    if (!quiz) {
      return;
    }

    if (currentIndex < quiz.questions.length - 1) {
      setCurrentIndex((index) => index + 1);
    }
  }

  /*
   * Previous question
   */
  function previousQuestion() {
    if (currentIndex > 0) {
      setCurrentIndex((index) => index - 1);
    }
  }

  /*
   * Submit quiz
   */
  async function submitQuiz() {
    const token = getToken();

    if (!token) {
      router.push("/login");
      return;
    }

    if (!quiz || !attemptId) {
      return;
    }

    const unanswered = quiz.questions.filter(
      (question) => !answers[question.id]
    );

    if (unanswered.length > 0) {
      setError(
        `Please answer all questions before submitting. ${unanswered.length} question(s) remaining.`
      );
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      const data = await apiFetch<SubmitResponse>(
        "/quiz/submit",
        {
          method: "POST",
          token,
          body: JSON.stringify({
            attemptId,
            answers: quiz.questions.map((question) => ({
              questionId: question.id,
              selectedAnswer:
                answers[question.id].selectedAnswer,
              timeUsed:
                answers[question.id].timeUsed,
            })),
          }),
        }
      );

      setResult(data);

      setLoadingNext(true);

      try {
        const nextData =
          await apiFetch<NextLearningResponse>(
            "/learning/next",
            {
              token,
            }
          );

        setNextLearning(nextData);
      } catch (err) {
        console.error(
          "Failed to load next learning recommendation:",
          err
        );
      } finally {
        setLoadingNext(false);
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to submit quiz"
      );
    } finally {
      setSubmitting(false);
    }
  }

  /*
   * Loading
   */
  if (loading) {
    return (
      <>
        <main className="quiz-page">
          <div className="quiz-loading-card">
            <div className="quiz-spinner" />

            <p className="quiz-loading-title">
              Preparing your quiz
            </p>

            <p className="quiz-loading-text">
              Please wait while we prepare your
              questions.
            </p>
          </div>
        </main>

        <QuizStyles />
      </>
    );
  }

  /*
   * Fatal error
   */
  if (error && !quiz) {
    return (
      <>
        <main className="quiz-page quiz-center">
          <div className="quiz-message-card">
            <div className="quiz-message-icon quiz-icon-error">
              !
            </div>

            <p className="quiz-eyebrow">
              SOMETHING WENT WRONG
            </p>

            <h1 className="quiz-message-title">
              Unable to load quiz
            </h1>

            <p className="quiz-message-text">
              {error}
            </p>

            <button
              type="button"
              onClick={() =>
                router.push("/dashboard")
              }
              className="quiz-button quiz-button-secondary"
            >
              ← Back to Dashboard
            </button>
          </div>
        </main>

        <QuizStyles />
      </>
    );
  }

  /*
   * Result screen
   */
  if (result) {
    return (
      <>
        <main className="quiz-page">
          <div className="quiz-container">

            <button
              type="button"
              onClick={() =>
                router.push("/dashboard")
              }
              className="quiz-back"
            >
              <span>←</span>
              Back to Dashboard
            </button>

            <section className="quiz-result-shell">

              {/* Result header */}
              <div className="quiz-result-header">

                <div
                  className={
                    result.passed
                      ? "quiz-result-icon quiz-result-success"
                      : "quiz-result-icon quiz-result-review"
                  }
                >
                  {result.passed ? "✓" : "↻"}
                </div>

                <p className="quiz-eyebrow">
                  QUIZ COMPLETED
                </p>

                <h1 className="quiz-result-title">
                  {result.passed
                    ? "Great Job!"
                    : "Keep Practicing"}
                </h1>

                <p className="quiz-result-description">
                  {result.passed
                    ? "You successfully passed this knowledge check."
                    : "Your results show that this topic may need a little more practice."}
                </p>

                <div className="quiz-score">
                  <span className="quiz-score-label">
                    YOUR SCORE
                  </span>

                  <strong>
                    {result.score}
                    <span>%</span>
                  </strong>
                </div>

              </div>

              {/* Statistics */}
              <div className="quiz-result-stats">

                <div className="quiz-result-stat">
                  <span className="quiz-result-stat-label">
                    Correct Answers
                  </span>

                  <strong>
                    {result.correctAnswers}
                    <span>
                      /{result.totalQuestions}
                    </span>
                  </strong>
                </div>

                <div className="quiz-result-stat">
                  <span className="quiz-result-stat-label">
                    Mastery Score
                  </span>

                  <strong>
                    {result.masteryScore}
                    <span>%</span>
                  </strong>
                </div>

                <div className="quiz-result-stat">
                  <span className="quiz-result-stat-label">
                    Passing Score
                  </span>

                  <strong>
                    {result.passingScore}
                    <span>%</span>
                  </strong>
                </div>

              </div>

              {/* Result status */}
              <div
                className={
                  result.passed
                    ? "quiz-result-status quiz-result-status-success"
                    : "quiz-result-status quiz-result-status-review"
                }
              >
                <span>
                  {result.passed ? "✓" : "!"}
                </span>

                <div>
                  <strong>
                    {result.passed
                      ? "Quiz Passed"
                      : "More Practice Recommended"}
                  </strong>

                  <p>
                    {result.passed
                      ? "Your learning progress has been updated."
                      : "Review this lesson and try again when you feel ready."}
                  </p>
                </div>
              </div>

              {/* Adaptive recommendation */}
              <section className="quiz-recommendation">

                <p className="quiz-eyebrow">
                  ADAPTIVE LEARNING
                </p>

                {loadingNext ? (
                  <div className="quiz-recommendation-loading">
                    <div className="quiz-small-spinner" />

                    <div>
                      <strong>
                        Finding your next step
                      </strong>

                      <p>
                        The adaptive engine is
                        analyzing your result.
                      </p>
                    </div>
                  </div>
                ) : nextLearning?.decision ===
                    "NEXT_LESSON" &&
                  nextLearning.nextLesson ? (
                  <div className="quiz-next-card">

                    <div>
                      <span className="quiz-next-label">
                        RECOMMENDED NEXT LESSON
                      </span>

                      <h2>
                        {nextLearning.nextLesson.title}
                      </h2>

                      <p>
                        Lesson{" "}
                        {nextLearning.nextLesson.lessonOrder}
                        <span>•</span>
                        {nextLearning.nextLesson.difficulty}
                      </p>

                      {nextLearning.reason && (
                        <div className="quiz-reason">
                          {nextLearning.reason}
                        </div>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        router.push(
                          `/learn/${nextLearning.nextLesson!.id}`
                        )
                      }
                      className="quiz-button quiz-button-primary"
                    >
                      Continue
                      <span>→</span>
                    </button>

                  </div>
                ) : nextLearning?.decision ===
                  "REVIEW" ? (
                  <div className="quiz-review-card">

                    <div className="quiz-review-icon">
                      ↻
                    </div>

                    <div className="quiz-review-content">
                      <span className="quiz-next-label">
                        ADAPTIVE RECOMMENDATION
                      </span>

                      <h2>
                        Review This Lesson
                      </h2>

                      <p>
                        Your current mastery score is{" "}
                        {nextLearning.recommendation
                          ?.masteryScore ?? 0}
                        . Review the lesson before
                        moving forward.
                      </p>

                      <button
                        type="button"
                        onClick={() => {
                          if (lessonId) {
                            router.push(
                              `/learn/${lessonId}`
                            );
                          }
                        }}
                        className="quiz-button quiz-button-primary"
                      >
                        Review Lesson
                        <span>→</span>
                      </button>
                    </div>

                  </div>
                ) : nextLearning?.decision ===
                  "COURSE_COMPLETED" ? (
                  <div className="quiz-completed-card">

                    <div className="quiz-completed-icon">
                      ✓
                    </div>

                    <div>
                      <span className="quiz-next-label">
                        COURSE STATUS
                      </span>

                      <h2>
                        Course Completed
                      </h2>

                      <p>
                        You have completed all
                        lessons in this course.
                      </p>
                    </div>

                  </div>
                ) : (
                  <div className="quiz-updated-card">
                    <span>✓</span>

                    <div>
                      <strong>
                        Learning progress updated
                      </strong>

                      <p>
                        Your latest quiz result has
                        been recorded.
                      </p>
                    </div>
                  </div>
                )}

              </section>

              <button
                type="button"
                onClick={() =>
                  router.push("/dashboard")
                }
                className="quiz-dashboard-button"
              >
                Back to Dashboard
              </button>

            </section>
          </div>
        </main>

        <QuizStyles />
      </>
    );
  }

  /*
   * Quiz unavailable
   */
  if (!quiz || !currentQuestion) {
    return (
      <>
        <main className="quiz-page quiz-center">
          <div className="quiz-message-card">
            <div className="quiz-message-icon">
              ?
            </div>

            <p className="quiz-eyebrow">
              KNOWLEDGE CHECK
            </p>

            <h1 className="quiz-message-title">
              Quiz unavailable
            </h1>

            <p className="quiz-message-text">
              There are no available questions for
              this lesson.
            </p>

            <button
              type="button"
              onClick={() =>
                lessonId
                  ? router.push(
                      `/learn/${lessonId}`
                    )
                  : router.push("/dashboard")
              }
              className="quiz-button quiz-button-secondary"
            >
              ← Back
            </button>
          </div>
        </main>

        <QuizStyles />
      </>
    );
  }

  const selectedAnswer =
    answers[currentQuestion.id]?.selectedAnswer;

  const isLastQuestion =
    currentIndex === quiz.questions.length - 1;

  const answeredCount =
    Object.keys(answers).length;

  const questionProgress =
    ((currentIndex + 1) /
      quiz.questions.length) *
    100;

  return (
    <>
      <main className="quiz-page">
        <div className="quiz-container">

          {/* Back */}
          <button
            type="button"
            onClick={() =>
              lessonId
                ? router.push(
                    `/learn/${lessonId}`
                  )
                : router.push("/dashboard")
            }
            className="quiz-back"
          >
            <span>←</span>
            Back to Lesson
          </button>

          {/* Quiz shell */}
          <article className="quiz-shell">

            {/* Header */}
            <header className="quiz-header">

              <div className="quiz-header-top">

                <div>
                  <p className="quiz-eyebrow">
                    KNOWLEDGE CHECK
                  </p>

                  <h1 className="quiz-title">
                    {quiz.title}
                  </h1>

                  <div className="quiz-meta">
                    <span>
                      Passing score{" "}
                      <strong>
                        {quiz.passing_score}%
                      </strong>
                    </span>

                    <span className="quiz-meta-dot">
                      •
                    </span>

                    <span>
                      Time limit{" "}
                      <strong>
                        {quiz.time_limit} min
                      </strong>
                    </span>
                  </div>
                </div>

                <div className="quiz-question-counter">
                  <span>
                    QUESTION
                  </span>

                  <strong>
                    {currentIndex + 1}
                    <small>
                      /{quiz.questions.length}
                    </small>
                  </strong>
                </div>

              </div>

              {/* Progress */}
              <div className="quiz-progress">

                <div className="quiz-progress-header">
                  <span>
                    Quiz Progress
                  </span>

                  <strong>
                    {Math.round(
                      questionProgress
                    )}
                    %
                  </strong>
                </div>

                <div className="quiz-progress-track">
                  <div
                    className="quiz-progress-fill"
                    style={{
                      width: `${questionProgress}%`,
                    }}
                  />
                </div>

              </div>

            </header>

            {/* Body */}
            <div className="quiz-body">

              {/* Error */}
              {error && (
                <div className="quiz-error">
                  <span>!</span>

                  <div>
                    <strong>
                      Please check your answer
                    </strong>

                    <p>
                      {error}
                    </p>
                  </div>
                </div>
              )}

              {/* Question */}
              <section className="quiz-question">

                <div className="quiz-question-heading">

                  <span className="quiz-question-number">
                    Q{currentQuestion.question_order}
                  </span>

                  {currentQuestion.difficulty && (
                    <span className="quiz-difficulty">
                      {currentQuestion.difficulty}
                    </span>
                  )}

                </div>

                <h2 className="quiz-question-title">
                  {currentQuestion.question}
                </h2>

                {/* Options */}
                <div className="quiz-options">

                  {(
                    ["A", "B", "C", "D"] as const
                  ).map((option) => {

                    const key =
                      `option_${option.toLowerCase()}` as
                        | "option_a"
                        | "option_b"
                        | "option_c"
                        | "option_d";

                    const text =
                      currentQuestion[key];

                    if (!text) {
                      return null;
                    }

                    const selected =
                      selectedAnswer === option;

                    return (
                      <button
                        key={option}
                        type="button"
                        onClick={() =>
                          selectAnswer(
                            currentQuestion.id,
                            option
                          )
                        }
                        className={
                          selected
                            ? "quiz-option quiz-option-selected"
                            : "quiz-option"
                        }
                      >
                        <span
                          className={
                            selected
                              ? "quiz-option-letter quiz-option-letter-selected"
                              : "quiz-option-letter"
                          }
                        >
                          {option}
                        </span>

                        <span className="quiz-option-text">
                          {text}
                        </span>

                        <span
                          className={
                            selected
                              ? "quiz-option-check quiz-option-check-visible"
                              : "quiz-option-check"
                          }
                        >
                          ✓
                        </span>
                      </button>
                    );
                  })}

                </div>

              </section>

              {/* Navigation */}
              <footer className="quiz-navigation">

                <button
                  type="button"
                  onClick={previousQuestion}
                  disabled={currentIndex === 0}
                  className="quiz-nav-button quiz-nav-secondary"
                >
                  ← Previous
                </button>

                <div className="quiz-answer-status">
                  <strong>
                    {answeredCount}
                  </strong>
                  <span>
                    /{quiz.questions.length} answered
                  </span>
                </div>

                {isLastQuestion ? (
                  <button
                    type="button"
                    onClick={submitQuiz}
                    disabled={submitting}
                    className="quiz-nav-button quiz-nav-primary"
                  >
                    {submitting
                      ? "Submitting..."
                      : "Submit Quiz"}
                    {!submitting && (
                      <span>✓</span>
                    )}
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={nextQuestion}
                    disabled={!selectedAnswer}
                    className="quiz-nav-button quiz-nav-primary"
                  >
                    Next
                    <span>→</span>
                  </button>
                )}

              </footer>

            </div>
          </article>

        </div>
      </main>

      <QuizStyles />
    </>
  );
}

/*
 * Quiz-specific CSS.
 *
 * This intentionally lives inside QuizClient
 * so globals.css does not control the Quiz UI.
 */
function QuizStyles() {
  return (
    <style>{`
      .quiz-page {
        min-height: 100vh;
        padding: 32px 20px 72px;
        background:
          radial-gradient(
            circle at top right,
            rgba(79, 70, 229, 0.07),
            transparent 30%
          ),
          #f7f8fa;
        color: #17191c;
        font-family:
          Arial,
          Helvetica,
          sans-serif;
      }

      .quiz-container {
        width: min(900px, 100%);
        margin: 0 auto;
      }

      .quiz-center {
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 24px;
      }

      .quiz-shell,
      .quiz-result-shell {
        overflow: hidden;
        border: 1px solid #e5e7eb;
        border-radius: 24px;
        background: #ffffff;
        box-shadow:
          0 10px 30px rgba(0, 0, 0, 0.07);
      }

      .quiz-back {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        margin-bottom: 20px;
        padding: 8px 0;
        border: 0;
        background: transparent;
        color: #6b7280;
        font-size: 14px;
        font-weight: 700;
        cursor: pointer;
        transition:
          color 0.2s ease,
          transform 0.2s ease;
      }

      .quiz-back:hover {
        color: #17191c;
        transform: translateX(-2px);
      }

      .quiz-eyebrow {
        margin: 0;
        color: #4f46e5;
        font-size: 11px;
        font-weight: 800;
        letter-spacing: 0.14em;
      }

      .quiz-header {
        padding: 34px 36px 30px;
        border-bottom: 1px solid #e5e7eb;
        background:
          linear-gradient(
            135deg,
            rgba(79, 70, 229, 0.09),
            rgba(99, 102, 241, 0.02) 55%,
            transparent
          ),
          #ffffff;
      }

      .quiz-header-top {
        display: flex;
        align-items: flex-start;
        justify-content: space-between;
        gap: 24px;
      }

      .quiz-title {
        margin: 8px 0 0;
        font-size: clamp(26px, 5vw, 38px);
        line-height: 1.15;
        letter-spacing: -0.025em;
        font-weight: 800;
      }

      .quiz-meta {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        gap: 9px;
        margin-top: 12px;
        color: #6b7280;
        font-size: 13px;
      }

      .quiz-meta strong {
        color: #374151;
      }

      .quiz-meta-dot {
        color: #9ca3af;
      }

      .quiz-question-counter {
        flex-shrink: 0;
        min-width: 90px;
        padding: 13px 15px;
        border: 1px solid #e5e7eb;
        border-radius: 14px;
        background: #f9fafb;
        text-align: center;
      }

      .quiz-question-counter span {
        display: block;
        color: #6b7280;
        font-size: 10px;
        font-weight: 800;
        letter-spacing: 0.1em;
      }

      .quiz-question-counter strong {
        display: block;
        margin-top: 3px;
        color: #17191c;
        font-size: 20px;
      }

      .quiz-question-counter small {
        color: #9ca3af;
        font-size: 13px;
        font-weight: 600;
      }

      .quiz-progress {
        margin-top: 28px;
      }

      .quiz-progress-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 9px;
        color: #6b7280;
        font-size: 12px;
        font-weight: 600;
      }

      .quiz-progress-header strong {
        color: #17191c;
      }

      .quiz-progress-track {
        height: 9px;
        overflow: hidden;
        border-radius: 999px;
        background: #e5e7eb;
      }

      .quiz-progress-fill {
        height: 100%;
        border-radius: inherit;
        background:
          linear-gradient(
            90deg,
            #4f46e5,
            #6366f1
          );
        transition: width 0.3s ease;
      }

      .quiz-body {
        padding: 34px 36px 30px;
      }

      .quiz-error {
        display: flex;
        gap: 12px;
        margin-bottom: 26px;
        padding: 14px 16px;
        border: 1px solid #fecaca;
        border-left: 4px solid #dc2626;
        border-radius: 12px;
        background: #fef2f2;
        color: #991b1b;
      }

      .quiz-error > span {
        display: grid;
        width: 24px;
        height: 24px;
        flex-shrink: 0;
        place-items: center;
        border-radius: 50%;
        background: #fee2e2;
        font-size: 12px;
        font-weight: 800;
      }

      .quiz-error strong {
        display: block;
        font-size: 13px;
      }

      .quiz-error p {
        margin: 3px 0 0;
        font-size: 13px;
        line-height: 1.5;
      }

      .quiz-question-heading {
        display: flex;
        align-items: center;
        gap: 10px;
      }

      .quiz-question-number {
        display: inline-flex;
        align-items: center;
        min-height: 28px;
        padding: 5px 10px;
        border-radius: 8px;
        background: #eef2ff;
        color: #4338ca;
        font-size: 12px;
        font-weight: 800;
      }

      .quiz-difficulty {
        padding: 5px 10px;
        border-radius: 8px;
        background: #f3f4f6;
        color: #6b7280;
        font-size: 11px;
        font-weight: 700;
        text-transform: capitalize;
      }

      .quiz-question-title {
        margin: 14px 0 0;
        max-width: 760px;
        color: #17191c;
        font-size: clamp(21px, 3vw, 27px);
        line-height: 1.45;
        letter-spacing: -0.015em;
      }

      .quiz-options {
        display: grid;
        gap: 12px;
        margin-top: 28px;
      }

      .quiz-option {
        position: relative;
        display: flex;
        width: 100%;
        align-items: flex-start;
        gap: 15px;
        padding: 17px;
        border: 1px solid #e5e7eb;
        border-radius: 14px;
        background: #ffffff;
        color: #17191c;
        text-align: left;
        cursor: pointer;
        transition:
          border-color 0.2s ease,
          background 0.2s ease,
          box-shadow 0.2s ease,
          transform 0.2s ease;
      }

      .quiz-option:hover {
        border-color: #a5b4fc;
        background: #fafaff;
        box-shadow:
          0 4px 12px rgba(79, 70, 229, 0.07);
        transform: translateY(-1px);
      }

      .quiz-option-selected {
        border-color: #4f46e5;
        background: #eef2ff;
        box-shadow:
          0 4px 14px rgba(79, 70, 229, 0.1);
      }

      .quiz-option-letter {
        display: flex;
        width: 34px;
        height: 34px;
        flex-shrink: 0;
        align-items: center;
        justify-content: center;
        border: 1px solid #d1d5db;
        border-radius: 50%;
        background: #ffffff;
        color: #4b5563;
        font-size: 13px;
        font-weight: 800;
      }

      .quiz-option-letter-selected {
        border-color: #4f46e5;
        background: #4f46e5;
        color: #ffffff;
      }

      .quiz-option-text {
        padding-top: 5px;
        padding-right: 25px;
        color: #374151;
        font-size: 14px;
        line-height: 1.65;
      }

      .quiz-option-selected .quiz-option-text {
        color: #312e81;
        font-weight: 600;
      }

      .quiz-option-check {
        position: absolute;
        top: 22px;
        right: 17px;
        display: grid;
        width: 20px;
        height: 20px;
        place-items: center;
        border-radius: 50%;
        background: #4f46e5;
        color: #ffffff;
        font-size: 11px;
        font-weight: 800;
        opacity: 0;
        transform: scale(0.7);
        transition:
          opacity 0.2s ease,
          transform 0.2s ease;
      }

      .quiz-option-check-visible {
        opacity: 1;
        transform: scale(1);
      }

      .quiz-navigation {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 16px;
        margin-top: 34px;
        padding-top: 24px;
        border-top: 1px solid #e5e7eb;
      }

      .quiz-nav-button,
      .quiz-button,
      .quiz-dashboard-button {
        min-height: 44px;
        padding: 11px 18px;
        border-radius: 11px;
        font-size: 13px;
        font-weight: 800;
        cursor: pointer;
        transition:
          background 0.2s ease,
          border-color 0.2s ease,
          transform 0.2s ease,
          box-shadow 0.2s ease;
      }

      .quiz-nav-button {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
        border: 1px solid transparent;
      }

      .quiz-nav-secondary {
        border-color: #e5e7eb;
        background: #ffffff;
        color: #374151;
      }

      .quiz-nav-secondary:hover:not(:disabled) {
        border-color: #d1d5db;
        background: #f9fafb;
      }

      .quiz-nav-primary,
      .quiz-button-primary {
        border: 1px solid #111827;
        background: #111827;
        color: #ffffff;
      }

      .quiz-nav-primary:hover:not(:disabled),
      .quiz-button-primary:hover {
        background: #1f2937;
        box-shadow:
          0 6px 16px rgba(17, 24, 39, 0.14);
        transform: translateY(-1px);
      }

      .quiz-nav-button:disabled {
        opacity: 0.4;
        cursor: not-allowed;
      }

      .quiz-answer-status {
        display: flex;
        align-items: baseline;
        gap: 3px;
        color: #9ca3af;
        font-size: 12px;
      }

      .quiz-answer-status strong {
        color: #374151;
        font-size: 13px;
      }

      /* Loading */

      .quiz-loading-card {
        width: min(420px, 100%);
        padding: 32px;
        border: 1px solid #e5e7eb;
        border-radius: 18px;
        background: #ffffff;
        box-shadow:
          0 10px 30px rgba(0, 0, 0, 0.06);
        text-align: center;
      }

      .quiz-spinner {
        width: 36px;
        height: 36px;
        margin: 0 auto 20px;
        border: 3px solid #e5e7eb;
        border-top-color: #4f46e5;
        border-radius: 50%;
        animation: quiz-spin 0.8s linear infinite;
      }

      .quiz-small-spinner {
        width: 25px;
        height: 25px;
        flex-shrink: 0;
        border: 3px solid #e5e7eb;
        border-top-color: #4f46e5;
        border-radius: 50%;
        animation: quiz-spin 0.8s linear infinite;
      }

      @keyframes quiz-spin {
        to {
          transform: rotate(360deg);
        }
      }

      .quiz-loading-title {
        margin: 0;
        color: #17191c;
        font-size: 18px;
        font-weight: 800;
      }

      .quiz-loading-text {
        margin: 8px 0 0;
        color: #6b7280;
        font-size: 14px;
        line-height: 1.6;
      }

      /* Message */

      .quiz-message-card {
        width: min(500px, 100%);
        padding: 36px;
        border: 1px solid #e5e7eb;
        border-radius: 20px;
        background: #ffffff;
        box-shadow:
          0 10px 30px rgba(0, 0, 0, 0.06);
        text-align: center;
      }

      .quiz-message-icon {
        display: grid;
        width: 54px;
        height: 54px;
        margin: 0 auto 18px;
        place-items: center;
        border-radius: 50%;
        background: #f3f4f6;
        color: #6b7280;
        font-size: 22px;
        font-weight: 800;
      }

      .quiz-icon-error {
        background: #fef2f2;
        color: #dc2626;
      }

      .quiz-message-title {
        margin: 8px 0 0;
        font-size: 25px;
        font-weight: 800;
      }

      .quiz-message-text {
        margin: 10px auto 22px;
        max-width: 420px;
        color: #6b7280;
        font-size: 14px;
        line-height: 1.7;
      }

      .quiz-button-secondary {
        border: 1px solid #e5e7eb;
        background: #ffffff;
        color: #374151;
      }

      .quiz-button-secondary:hover {
        background: #f9fafb;
      }

      /* Result */

      .quiz-result-header {
        padding: 42px 36px 36px;
        border-bottom: 1px solid #e5e7eb;
        background:
          linear-gradient(
            135deg,
            rgba(79, 70, 229, 0.08),
            transparent 65%
          ),
          #ffffff;
        text-align: center;
      }

      .quiz-result-icon {
        display: grid;
        width: 68px;
        height: 68px;
        margin: 0 auto 18px;
        place-items: center;
        border-radius: 50%;
        font-size: 28px;
        font-weight: 800;
      }

      .quiz-result-success {
        background: #ecfdf5;
        color: #059669;
      }

      .quiz-result-review {
        background: #fff7ed;
        color: #ea580c;
      }

      .quiz-result-title {
        margin: 7px 0 0;
        font-size: clamp(28px, 5vw, 38px);
        font-weight: 800;
        letter-spacing: -0.025em;
      }

      .quiz-result-description {
        margin: 9px auto 0;
        max-width: 520px;
        color: #6b7280;
        font-size: 14px;
        line-height: 1.7;
      }

      .quiz-score {
        margin-top: 28px;
      }

      .quiz-score-label {
        display: block;
        color: #6b7280;
        font-size: 11px;
        font-weight: 800;
        letter-spacing: 0.13em;
      }

      .quiz-score strong {
        display: block;
        margin-top: 2px;
        color: #17191c;
        font-size: 64px;
        line-height: 1;
        letter-spacing: -0.04em;
      }

      .quiz-score strong span {
        color: #6b7280;
        font-size: 28px;
      }

      .quiz-result-stats {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 14px;
        padding: 26px 36px;
        border-bottom: 1px solid #e5e7eb;
      }

      .quiz-result-stat {
        padding: 18px;
        border: 1px solid #e5e7eb;
        border-radius: 14px;
        background: #f9fafb;
        text-align: center;
      }

      .quiz-result-stat-label {
        display: block;
        color: #6b7280;
        font-size: 12px;
        font-weight: 600;
      }

      .quiz-result-stat strong {
        display: block;
        margin-top: 5px;
        color: #17191c;
        font-size: 25px;
      }

      .quiz-result-stat strong span {
        color: #9ca3af;
        font-size: 16px;
      }

      .quiz-result-status {
        display: flex;
        gap: 12px;
        margin: 26px 36px 0;
        padding: 15px 17px;
        border-radius: 13px;
      }

      .quiz-result-status > span {
        display: grid;
        width: 28px;
        height: 28px;
        flex-shrink: 0;
        place-items: center;
        border-radius: 50%;
        font-size: 12px;
        font-weight: 800;
      }

      .quiz-result-status strong {
        display: block;
        font-size: 13px;
      }

      .quiz-result-status p {
        margin: 3px 0 0;
        font-size: 13px;
        line-height: 1.5;
      }

      .quiz-result-status-success {
        border: 1px solid #a7f3d0;
        background: #ecfdf5;
        color: #065f46;
      }

      .quiz-result-status-success > span {
        background: #d1fae5;
        color: #059669;
      }

      .quiz-result-status-review {
        border: 1px solid #fed7aa;
        background: #fff7ed;
        color: #9a3412;
      }

      .quiz-result-status-review > span {
        background: #ffedd5;
        color: #ea580c;
      }

      .quiz-recommendation {
        margin: 26px 36px 0;
        padding-top: 26px;
        border-top: 1px solid #e5e7eb;
      }

      .quiz-recommendation-loading {
        display: flex;
        align-items: center;
        gap: 13px;
        margin-top: 13px;
        padding: 18px;
        border: 1px solid #e5e7eb;
        border-radius: 14px;
        background: #f9fafb;
      }

      .quiz-recommendation-loading strong {
        display: block;
        font-size: 14px;
      }

      .quiz-recommendation-loading p {
        margin: 3px 0 0;
        color: #6b7280;
        font-size: 13px;
      }

      .quiz-next-card {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 24px;
        margin-top: 13px;
        padding: 21px;
        border: 1px solid #c7d2fe;
        border-radius: 16px;
        background: #eef2ff;
      }

      .quiz-next-label {
        display: block;
        color: #4f46e5;
        font-size: 10px;
        font-weight: 800;
        letter-spacing: 0.1em;
      }

      .quiz-next-card h2,
      .quiz-review-card h2,
      .quiz-completed-card h2 {
        margin: 5px 0 0;
        color: #17191c;
        font-size: 19px;
        font-weight: 800;
      }

      .quiz-next-card p,
      .quiz-review-card p,
      .quiz-completed-card p {
        margin: 5px 0 0;
        color: #6b7280;
        font-size: 13px;
        line-height: 1.6;
      }

      .quiz-next-card p span {
        margin: 0 7px;
        color: #9ca3af;
      }

      .quiz-reason {
        margin-top: 11px;
        color: #4338ca;
        font-size: 12px;
        line-height: 1.6;
      }

      .quiz-review-card {
        display: flex;
        gap: 15px;
        margin-top: 13px;
        padding: 21px;
        border: 1px solid #fed7aa;
        border-radius: 16px;
        background: #fff7ed;
      }

      .quiz-review-icon {
        display: grid;
        width: 40px;
        height: 40px;
        flex-shrink: 0;
        place-items: center;
        border-radius: 50%;
        background: #ffedd5;
        color: #ea580c;
        font-size: 19px;
        font-weight: 800;
      }

      .quiz-review-content {
        flex: 1;
      }

      .quiz-review-content .quiz-button {
        margin-top: 15px;
      }

      .quiz-completed-card {
        display: flex;
        align-items: center;
        gap: 15px;
        margin-top: 13px;
        padding: 21px;
        border: 1px solid #a7f3d0;
        border-radius: 16px;
        background: #ecfdf5;
      }

      .quiz-completed-icon {
        display: grid;
        width: 40px;
        height: 40px;
        flex-shrink: 0;
        place-items: center;
        border-radius: 50%;
        background: #d1fae5;
        color: #059669;
        font-weight: 800;
      }

      .quiz-updated-card {
        display: flex;
        align-items: center;
        gap: 12px;
        margin-top: 13px;
        padding: 18px;
        border: 1px solid #e5e7eb;
        border-radius: 14px;
        background: #f9fafb;
      }

      .quiz-updated-card > span {
        display: grid;
        width: 30px;
        height: 30px;
        place-items: center;
        border-radius: 50%;
        background: #eef2ff;
        color: #4f46e5;
        font-size: 12px;
        font-weight: 800;
      }

      .quiz-updated-card strong {
        display: block;
        font-size: 13px;
      }

      .quiz-updated-card p {
        margin: 3px 0 0;
        color: #6b7280;
        font-size: 12px;
      }

      .quiz-dashboard-button {
        display: block;
        width: calc(100% - 72px);
        margin: 20px 36px 36px;
        border: 1px solid #e5e7eb;
        background: #ffffff;
        color: #374151;
      }

      .quiz-dashboard-button:hover {
        background: #f9fafb;
        border-color: #d1d5db;
      }

      /* Responsive */

      @media (max-width: 700px) {
        .quiz-page {
          padding: 20px 14px 48px;
        }

        .quiz-header {
          padding: 26px 22px 24px;
        }

        .quiz-body {
          padding: 26px 22px;
        }

        .quiz-header-top {
          flex-direction: column;
          gap: 16px;
        }

        .quiz-question-counter {
          align-self: flex-start;
        }

        .quiz-title {
          font-size: 28px;
        }

        .quiz-question-title {
          font-size: 21px;
        }

        .quiz-navigation {
          flex-wrap: wrap;
        }

        .quiz-answer-status {
          order: 3;
          width: 100%;
          justify-content: center;
        }

        .quiz-result-stats {
          grid-template-columns: 1fr;
          padding: 22px;
        }

        .quiz-result-header {
          padding: 34px 22px 30px;
        }

        .quiz-result-status,
        .quiz-recommendation {
          margin-left: 22px;
          margin-right: 22px;
        }

        .quiz-next-card {
          flex-direction: column;
          align-items: stretch;
        }

        .quiz-dashboard-button {
          width: calc(100% - 44px);
          margin-left: 22px;
          margin-right: 22px;
        }

        .quiz-review-card {
          align-items: flex-start;
        }
      }

      @media (max-width: 480px) {
        .quiz-page {
          padding: 16px 10px 36px;
        }

        .quiz-body {
          padding: 22px 16px;
        }

        .quiz-header {
          padding: 22px 16px;
        }

        .quiz-option {
          gap: 11px;
          padding: 14px;
        }

        .quiz-option-text {
          font-size: 13px;
        }

        .quiz-navigation {
          gap: 10px;
        }

        .quiz-nav-button {
          flex: 1;
        }

        .quiz-result-header {
          padding-left: 18px;
          padding-right: 18px;
        }

        .quiz-result-status,
        .quiz-recommendation {
          margin-left: 18px;
          margin-right: 18px;
        }

        .quiz-dashboard-button {
          width: calc(100% - 36px);
          margin-left: 18px;
          margin-right: 18px;
        }

        .quiz-score strong {
          font-size: 54px;
        }
      }
    `}</style>
  );
}