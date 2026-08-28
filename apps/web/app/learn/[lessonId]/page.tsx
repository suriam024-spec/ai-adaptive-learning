"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

import { apiFetch } from "@/lib/api";
import { getToken } from "@/lib/auth";

import AiTutor from "./AiTutor";

type LessonProgress = {
  status: string;
  progressPercent: number;
  masteryScore: number;
  lastAccessed: string | null;
  completedAt: string | null;
};

type Lesson = {
  id: string;
  courseId: string;
  title: string;
  content: string;
  videoUrl: string | null;
  lessonOrder: number;
  difficulty: string;
  estimatedTime: number;
  progress: LessonProgress;
};

type Quiz = {
  id: string;
  title: string;
  passing_score: number;
  time_limit: number;
  quiz_questions: unknown[];
};

export default function LessonPage() {
  const router = useRouter();
  const params = useParams();

  const lessonId =
    typeof params.lessonId === "string"
      ? params.lessonId
      : "";

  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [quiz, setQuiz] = useState<Quiz | null>(null);

  const [loading, setLoading] = useState(true);
  const [starting, setStarting] = useState(false);
  const [error, setError] = useState("");

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

    async function loadLesson() {
      try {
        const lessonData = await apiFetch<Lesson>(
          `/learning/lesson/${lessonId}`,
          {
            token,
          }
        );

        setLesson(lessonData);

        try {
          const quizData = await apiFetch<Quiz>(
            `/quiz/lesson/${lessonId}`,
            {
              token,
            }
          );

          setQuiz(quizData);
        } catch {
          setQuiz(null);
        }
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Failed to load lesson."
        );
      } finally {
        setLoading(false);
      }
    }

    loadLesson();
  }, [lessonId, router]);

  async function startLesson() {
    const token = getToken();

    if (!token) {
      router.push("/login");
      return;
    }

    if (!lessonId) {
      return;
    }

    setStarting(true);
    setError("");

    try {
      const response = await apiFetch<{
        message: string;
        progress: LessonProgress;
      }>(
        `/learning/lesson/${lessonId}/start`,
        {
          method: "POST",
          token,
        }
      );

      setLesson((current) => {
        if (!current) {
          return current;
        }

        return {
          ...current,
          progress: response.progress,
        };
      });
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to start lesson."
      );
    } finally {
      setStarting(false);
    }
  }

  function takeQuiz() {
    if (!quiz || !lessonId) {
      return;
    }

    router.push(
      `/quiz?lessonId=${lessonId}&quizId=${quiz.id}`
    );
  }

  function goBack() {
    router.push("/dashboard");
  }

  if (loading) {
    return (
      <>
        <main className="lesson-page">
          <div className="loading-card">
            <div className="spinner" />
            <h2>Loading lesson</h2>
            <p>
              Please wait while we prepare your lesson.
            </p>
          </div>
        </main>

        <style jsx>{styles}</style>
      </>
    );
  }

  if (error && !lesson) {
    return (
      <>
        <main className="lesson-page">
          <div className="empty-card">
            <div className="empty-icon error-icon">
              !
            </div>

            <h1>Unable to load lesson</h1>

            <p>{error}</p>

            <button
              type="button"
              onClick={goBack}
              className="primary-button"
            >
              ← Back to Dashboard
            </button>
          </div>
        </main>

        <style jsx>{styles}</style>
      </>
    );
  }

  if (!lesson) {
    return (
      <>
        <main className="lesson-page">
          <div className="empty-card">
            <div className="empty-icon">
              ?
            </div>

            <h1>Lesson not found</h1>

            <p>
              This lesson could not be found.
            </p>

            <button
              type="button"
              onClick={goBack}
              className="primary-button"
            >
              ← Back to Dashboard
            </button>
          </div>
        </main>

        <style jsx>{styles}</style>
      </>
    );
  }

  const normalizedStatus =
    lesson.progress.status.toLowerCase();

  const isCompleted =
    normalizedStatus === "completed";

  const isStarted =
    normalizedStatus === "in_progress" ||
    isCompleted;

  const progressPercent = Math.min(
    100,
    Math.max(
      0,
      Number(lesson.progress.progressPercent) || 0
    )
  );

  const masteryScore = Math.min(
    100,
    Math.max(
      0,
      Number(lesson.progress.masteryScore) || 0
    )
  );

  const statusText = isCompleted
    ? "Completed"
    : isStarted
      ? "In Progress"
      : "Not Started";

  return (
    <>
      <main className="lesson-page">

        <div className="lesson-container">

          {/* Back */}
          <button
            type="button"
            onClick={goBack}
            className="back-button"
          >
            <span>←</span>
            Back to Dashboard
          </button>

          {/* Error */}
          {error && (
            <div className="error-banner">
              <strong>
                Something went wrong
              </strong>

              <span>{error}</span>
            </div>
          )}

          {/* Main */}
          <article className="lesson-card">

            {/* ================= HEADER ================= */}

            <header className="lesson-header">

              <div className="header-row">

                <div className="header-content">

                  <div className="lesson-label">
                    LESSON {lesson.lessonOrder}
                  </div>

                  <h1 className="lesson-title">
                    {lesson.title}
                  </h1>

                  <div className="difficulty">
                    <span>
                      Difficulty
                    </span>

                    <span className="dot">
                      •
                    </span>

                    <strong>
                      {lesson.difficulty}
                    </strong>
                  </div>

                </div>

                <div
                  className={
                    isCompleted
                      ? "status status-completed"
                      : isStarted
                        ? "status status-progress"
                        : "status"
                  }
                >
                  <span className="status-dot" />

                  {statusText}
                </div>

              </div>

              {/* Progress */}

              <div className="progress-section">

                <div className="progress-header">
                  <span>
                    Lesson Progress
                  </span>

                  <strong>
                    {progressPercent}%
                  </strong>
                </div>

                <div className="progress-track">
                  <div
                    className="progress-fill"
                    style={{
                      width: `${progressPercent}%`,
                    }}
                  />
                </div>

              </div>

              {/* Stats */}

              <div className="stats">

                <div className="stat-card">

                  <div className="stat-icon">
                    ◷
                  </div>

                  <div>
                    <div className="stat-label">
                      Estimated Time
                    </div>

                    <div className="stat-value">
                      {lesson.estimatedTime} min
                    </div>
                  </div>

                </div>

                <div className="stat-card">

                  <div className="stat-icon">
                    ★
                  </div>

                  <div>
                    <div className="stat-label">
                      Mastery Score
                    </div>

                    <div className="stat-value">
                      {masteryScore}%
                    </div>
                  </div>

                </div>

              </div>

            </header>

            {/* ================= BODY ================= */}

            <div className="lesson-body">

              {/* Content */}

              <section className="section">

                <div className="section-label">
                  LEARNING MATERIAL
                </div>

                <h2 className="section-title">
                  Lesson Content
                </h2>

                <div className="content-box">
                  {lesson.content}
                </div>

              </section>

              {/* Video */}

              {lesson.videoUrl && (
                <section className="section">

                  <div className="section-label">
                    OPTIONAL
                  </div>

                  <h2 className="section-title">
                    Video
                  </h2>

                  <a
                    href={lesson.videoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="video-card"
                  >
                    <span className="video-icon">
                      ▶
                    </span>

                    <span className="video-text">
                      Open lesson video
                    </span>

                    <span className="video-arrow">
                      ↗
                    </span>
                  </a>

                </section>
              )}

              {/* Actions */}

              <section className="actions">

                {!isStarted && (
                  <div className="action-card">

                    <div className="action-icon">
                      ▶
                    </div>

                    <div className="action-content">

                      <div className="action-label">
                        READY TO LEARN?
                      </div>

                      <h2>
                        Start this lesson
                      </h2>

                      <p>
                        Begin learning and we&apos;ll
                        track your progress automatically.
                      </p>

                    </div>

                    <button
                      type="button"
                      onClick={startLesson}
                      disabled={starting}
                      className="action-button"
                    >
                      {starting
                        ? "Starting..."
                        : "Start Lesson →"}
                    </button>

                  </div>
                )}

                {isStarted && quiz && (
                  <div className="action-card quiz-action">

                    <div className="action-icon quiz-icon">
                      ✓
                    </div>

                    <div className="action-content">

                      <div className="action-label">
                        KNOWLEDGE CHECK
                      </div>

                      <h2>
                        Test your understanding
                      </h2>

                      <p>
                        Take the quiz to measure how
                        well you understand this lesson.
                      </p>

                    </div>

                    <button
                      type="button"
                      onClick={takeQuiz}
                      className="action-button quiz-button"
                    >
                      Take Quiz →
                    </button>

                  </div>
                )}

                {isStarted && !quiz && (
                  <div className="no-quiz">

                    <div className="no-quiz-icon">
                      i
                    </div>

                    <div>
                      <strong>
                        No quiz available
                      </strong>

                      <p>
                        A knowledge check has not been
                        added to this lesson yet.
                      </p>
                    </div>

                  </div>
                )}

              </section>

              {/* AI Tutor */}

              <section className="tutor-section">

                <div className="section-label">
                  AI ASSISTANT
                </div>

                <h2 className="section-title">
                  AI Tutor
                </h2>

                <p className="tutor-description">
                  Ask questions about this lesson
                  and get help from your AI tutor.
                </p>

                <div className="tutor-box">
                  <AiTutor
                    lessonId={lessonId}
                  />
                </div>

              </section>

            </div>

          </article>

        </div>

      </main>

      <style jsx>{styles}</style>
    </>
  );
}

const styles = `
  /* =====================================================
     LESSON PAGE
     Self-contained styles
     ===================================================== */

  .lesson-page {
    min-height: 100vh;
    padding: 32px 20px 80px;
    background:
      radial-gradient(
        circle at top right,
        rgba(79, 70, 229, 0.08),
        transparent 32%
      ),
      #f7f8fa;
    color: #17191c;
  }

  .lesson-container {
    width: min(920px, 100%);
    margin: 0 auto;
  }

  /* Back */

  .back-button {
    display: inline-flex;
    align-items: center;
    gap: 9px;
    margin-bottom: 20px;
    padding: 8px 2px;
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

  .back-button:hover {
    color: #17191c;
    transform: translateX(-3px);
  }

  /* Error */

  .error-banner {
    display: flex;
    flex-direction: column;
    gap: 3px;
    margin-bottom: 20px;
    padding: 15px 18px;
    border: 1px solid #fecaca;
    border-left: 4px solid #dc2626;
    border-radius: 14px;
    background: #fef2f2;
    color: #991b1b;
    font-size: 14px;
  }

  /* Main */

  .lesson-card {
    overflow: hidden;
    border: 1px solid #e5e7eb;
    border-radius: 24px;
    background: #ffffff;
    box-shadow:
      0 10px 30px rgba(0, 0, 0, 0.06),
      0 2px 6px rgba(0, 0, 0, 0.03);
  }

  /* Header */

  .lesson-header {
    padding: 38px 40px 34px;
    border-bottom: 1px solid #e5e7eb;
    background:
      linear-gradient(
        135deg,
        rgba(79, 70, 229, 0.08),
        rgba(99, 102, 241, 0.025) 55%,
        #ffffff
      );
  }

  .header-row {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 24px;
  }

  .header-content {
    min-width: 0;
  }

  .lesson-label {
    color: #4f46e5;
    font-size: 12px;
    font-weight: 800;
    letter-spacing: 0.14em;
  }

  .lesson-title {
    margin: 8px 0 0;
    color: #17191c;
    font-size: clamp(28px, 5vw, 42px);
    font-weight: 800;
    line-height: 1.12;
    letter-spacing: -0.03em;
  }

  .difficulty {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-top: 12px;
    color: #6b7280;
    font-size: 14px;
  }

  .difficulty strong {
    color: #374151;
  }

  .dot {
    color: #9ca3af;
  }

  /* Status */

  .status {
    display: inline-flex;
    flex-shrink: 0;
    align-items: center;
    gap: 7px;
    padding: 8px 13px;
    border: 1px solid #e5e7eb;
    border-radius: 999px;
    background: #f9fafb;
    color: #6b7280;
    font-size: 12px;
    font-weight: 800;
    white-space: nowrap;
  }

  .status-dot {
    width: 7px;
    height: 7px;
    border-radius: 50%;
    background: #9ca3af;
  }

  .status-progress {
    border-color: #c7d2fe;
    background: #eef2ff;
    color: #4338ca;
  }

  .status-progress .status-dot {
    background: #4f46e5;
  }

  .status-completed {
    border-color: #a7f3d0;
    background: #ecfdf5;
    color: #047857;
  }

  .status-completed .status-dot {
    background: #10b981;
  }

  /* Progress */

  .progress-section {
    margin-top: 30px;
  }

  .progress-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 9px;
    color: #6b7280;
    font-size: 13px;
    font-weight: 600;
  }

  .progress-header strong {
    color: #17191c;
    font-weight: 800;
  }

  .progress-track {
    height: 9px;
    overflow: hidden;
    border-radius: 999px;
    background: #e5e7eb;
  }

  .progress-fill {
    height: 100%;
    border-radius: inherit;
    background: linear-gradient(
      90deg,
      #4f46e5,
      #6366f1
    );
    transition: width 0.4s ease;
  }

  /* Stats */

  .stats {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 14px;
    margin-top: 22px;
  }

  .stat-card {
    display: flex;
    align-items: center;
    gap: 13px;
    padding: 17px 18px;
    border: 1px solid #e5e7eb;
    border-radius: 14px;
    background: rgba(249, 250, 251, 0.8);
  }

  .stat-icon {
    display: grid;
    flex-shrink: 0;
    width: 40px;
    height: 40px;
    place-items: center;
    border-radius: 11px;
    background: #eef2ff;
    color: #4f46e5;
    font-size: 18px;
    font-weight: 800;
  }

  .stat-label {
    color: #6b7280;
    font-size: 12px;
    font-weight: 600;
  }

  .stat-value {
    margin-top: 3px;
    color: #17191c;
    font-size: 17px;
    font-weight: 800;
  }

  /* Body */

  .lesson-body {
    padding: 38px 40px;
  }

  .section {
    margin: 0;
  }

  .section + .section {
    margin-top: 36px;
  }

  .section-label {
    margin-bottom: 6px;
    color: #4f46e5;
    font-size: 11px;
    font-weight: 800;
    letter-spacing: 0.14em;
  }

  .section-title {
    margin: 0;
    color: #17191c;
    font-size: 21px;
    font-weight: 800;
    letter-spacing: -0.015em;
  }

  /* Content */

  .content-box {
    margin-top: 15px;
    padding: 25px;
    border: 1px solid #e5e7eb;
    border-radius: 17px;
    background: #f9fafb;
    color: #374151;
    font-size: 15px;
    line-height: 1.9;
    white-space: pre-wrap;
  }

  /* Video */

  .video-card {
    display: flex;
    align-items: center;
    gap: 13px;
    margin-top: 15px;
    padding: 17px 19px;
    border: 1px solid #e5e7eb;
    border-radius: 14px;
    background: #ffffff;
    color: #17191c;
    font-size: 14px;
    font-weight: 700;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.03);
    transition:
      border-color 0.2s ease,
      transform 0.2s ease,
      box-shadow 0.2s ease;
  }

  .video-card:hover {
    border-color: #c7d2fe;
    box-shadow: 0 7px 18px rgba(0, 0, 0, 0.06);
    transform: translateY(-1px);
  }

  .video-icon {
    display: grid;
    width: 38px;
    height: 38px;
    place-items: center;
    border-radius: 10px;
    background: #eef2ff;
    color: #4f46e5;
    font-size: 14px;
  }

  .video-text {
    flex: 1;
  }

  .video-arrow {
    color: #9ca3af;
    font-size: 18px;
  }

  /* Actions */

  .actions {
    margin-top: 38px;
    padding-top: 30px;
    border-top: 1px solid #e5e7eb;
  }

  .action-card {
    display: grid;
    grid-template-columns: auto 1fr auto;
    align-items: center;
    gap: 18px;
    padding: 22px;
    border: 1px solid #e5e7eb;
    border-radius: 17px;
    background:
      linear-gradient(
        135deg,
        #ffffff,
        #f9fafb
      );
  }

  .action-icon {
    display: grid;
    width: 48px;
    height: 48px;
    place-items: center;
    border-radius: 13px;
    background: #111827;
    color: #ffffff;
    font-size: 17px;
    font-weight: 800;
  }

  .action-content {
    min-width: 0;
  }

  .action-label {
    margin-bottom: 3px;
    color: #6b7280;
    font-size: 10px;
    font-weight: 800;
    letter-spacing: 0.12em;
  }

  .action-content h2 {
    margin: 0;
    color: #17191c;
    font-size: 18px;
    font-weight: 800;
  }

  .action-content p {
    margin: 4px 0 0;
    color: #6b7280;
    font-size: 13px;
    line-height: 1.5;
  }

  .action-button {
    min-height: 45px;
    padding: 11px 18px;
    border: 0;
    border-radius: 12px;
    background: #111827;
    color: #ffffff;
    font-size: 13px;
    font-weight: 800;
    white-space: nowrap;
    cursor: pointer;
    transition:
      background 0.2s ease,
      transform 0.2s ease,
      box-shadow 0.2s ease;
  }

  .action-button:hover {
    background: #1f2937;
    box-shadow: 0 7px 18px rgba(17, 24, 39, 0.15);
    transform: translateY(-1px);
  }

  .action-button:disabled {
    opacity: 0.55;
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
  }

  /* Quiz */

  .quiz-action {
    border-color: #c7d2fe;
    background:
      linear-gradient(
        135deg,
        #ffffff,
        #eef2ff
      );
  }

  .quiz-icon {
    background: #4f46e5;
  }

  .quiz-button {
    background: #4f46e5;
  }

  .quiz-button:hover {
    background: #4338ca;
  }

  /* No quiz */

  .no-quiz {
    display: flex;
    align-items: flex-start;
    gap: 13px;
    padding: 17px 18px;
    border: 1px dashed #d1d5db;
    border-radius: 14px;
    background: #f9fafb;
  }

  .no-quiz-icon {
    display: grid;
    flex-shrink: 0;
    width: 28px;
    height: 28px;
    place-items: center;
    border-radius: 50%;
    background: #e5e7eb;
    color: #6b7280;
    font-size: 13px;
    font-weight: 800;
  }

  .no-quiz strong {
    color: #374151;
    font-size: 14px;
  }

  .no-quiz p {
    margin: 3px 0 0;
    color: #6b7280;
    font-size: 13px;
  }

  /* AI Tutor */

  .tutor-section {
    margin-top: 38px;
    padding-top: 32px;
    border-top: 1px solid #e5e7eb;
  }

  .tutor-description {
    margin: 6px 0 18px;
    color: #6b7280;
    font-size: 14px;
  }

  .tutor-box {
    overflow: hidden;
    border: 1px solid #e5e7eb;
    border-radius: 17px;
    background: #ffffff;
  }

  /* Loading */

  .loading-card {
    width: min(420px, 100%);
    margin: 120px auto 0;
    padding: 34px;
    border: 1px solid #e5e7eb;
    border-radius: 18px;
    background: #ffffff;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.06);
    text-align: center;
  }

  .spinner {
    width: 30px;
    height: 30px;
    margin: 0 auto 18px;
    border: 3px solid #e5e7eb;
    border-top-color: #4f46e5;
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
  }

  .loading-card h2 {
    margin: 0;
    font-size: 18px;
  }

  .loading-card p {
    margin: 6px 0 0;
    color: #6b7280;
    font-size: 13px;
  }

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }

  /* Empty */

  .empty-card {
    width: min(500px, 100%);
    margin: 120px auto 0;
    padding: 36px;
    border: 1px solid #e5e7eb;
    border-radius: 20px;
    background: #ffffff;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.06);
    text-align: center;
  }

  .empty-icon {
    display: grid;
    width: 52px;
    height: 52px;
    margin: 0 auto 18px;
    place-items: center;
    border-radius: 15px;
    background: #eef2ff;
    color: #4f46e5;
    font-size: 22px;
    font-weight: 800;
  }

  .error-icon {
    background: #fef2f2;
    color: #dc2626;
  }

  .empty-card h1 {
    margin: 0;
    font-size: 22px;
    font-weight: 800;
  }

  .empty-card p {
    margin: 8px 0 22px;
    color: #6b7280;
    font-size: 14px;
    line-height: 1.6;
  }

  .primary-button {
    min-height: 45px;
    padding: 11px 18px;
    border: 0;
    border-radius: 12px;
    background: #111827;
    color: #ffffff;
    font-size: 13px;
    font-weight: 800;
    cursor: pointer;
  }

  .primary-button:hover {
    background: #1f2937;
  }

  /* Mobile */

  @media (max-width: 700px) {

    .lesson-page {
      padding: 20px 14px 50px;
    }

    .lesson-header {
      padding: 28px 22px 25px;
    }

    .lesson-body {
      padding: 28px 22px;
    }

    .header-row {
      flex-direction: column;
      gap: 15px;
    }

    .status {
      align-self: flex-start;
    }

    .lesson-title {
      font-size: 30px;
    }

    .stats {
      grid-template-columns: 1fr;
    }

    .action-card {
      grid-template-columns: auto 1fr;
    }

    .action-button {
      grid-column: 1 / -1;
      width: 100%;
    }

    .content-box {
      padding: 19px;
    }

  }

  @media (max-width: 460px) {

    .lesson-title {
      font-size: 27px;
    }

    .lesson-body {
      padding: 24px 18px;
    }

    .lesson-header {
      padding: 25px 18px 22px;
    }

    .action-card {
      grid-template-columns: 1fr;
      text-align: left;
    }

    .action-icon {
      width: 42px;
      height: 42px;
    }

  }
`;