"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { apiFetch } from "@/lib/api";
import { getToken, removeToken } from "@/lib/auth";

type LearningPathItem = {
  id: string;
  title: string;
  lessonOrder: number;
  difficulty: string;
  status: string;
  progressPercent: number;
  masteryScore: number;
};

type NextLesson = {
  id: string;
  title: string;
  lessonOrder: number;
  difficulty: string;
};

type CurrentLesson = {
  id: string;
  title: string;
  lessonOrder: number;
  difficulty: string;
  status: string;
  progressPercent: number;
  masteryScore: number;
};

type Recommendation = {
  action: string;
  masteryScore: number;
};

type NextLearningResponse = {
  currentLesson: CurrentLesson | null;
  nextLesson: NextLesson | null;
  decision: string;
  reason: string;
  recommendation?: Recommendation;
};

export default function DashboardPage() {
  const router = useRouter();

  const [path, setPath] = useState<LearningPathItem[]>([]);
  const [nextLearning, setNextLearning] =
    useState<NextLearningResponse | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const token = getToken();

    if (!token) {
      router.push("/login");
      return;
    }

    async function loadDashboard() {
      try {
        const [learningPath, next] = await Promise.all([
          apiFetch<LearningPathItem[]>("/learning/path", {
            token,
          }),
          apiFetch<NextLearningResponse>("/learning/next", {
            token,
          }),
        ]);

        setPath(learningPath);
        setNextLearning(next);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Failed to load dashboard"
        );
      } finally {
        setLoading(false);
      }
    }

    loadDashboard();
  }, [router]);

  function logout() {
    removeToken();
    router.push("/login");
  }

  function continueLearning() {
    if (!nextLearning?.nextLesson) return;

    router.push(
      `/learn/${nextLearning.nextLesson.id}`
    );
  }

  const completedLessons = useMemo(() => {
    return path.filter(
      (lesson) =>
        lesson.progressPercent >= 100 ||
        lesson.status === "COMPLETED"
    ).length;
  }, [path]);

  const overallProgress = useMemo(() => {
    if (path.length === 0) return 0;

    const total = path.reduce(
      (sum, lesson) => sum + lesson.progressPercent,
      0
    );

    return Math.round(total / path.length);
  }, [path]);

  const averageMastery = useMemo(() => {
    if (path.length === 0) return 0;

    const total = path.reduce(
      (sum, lesson) => sum + lesson.masteryScore,
      0
    );

    return Math.round(total / path.length);
  }, [path]);

  if (loading) {
    return (
      <main className="dashboard-page">
        <div className="dashboard-container dashboard-loading">
          <div className="dashboard-spinner" />
          <p>Loading your learning dashboard...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="dashboard-page">
      <div className="dashboard-container">

        {/* Header */}
        <header className="dashboard-header">
          <div>
            <div className="dashboard-brand">
              AI LEARN
            </div>

            <h1 className="dashboard-title">
              Adaptive Learning
            </h1>

            <p className="dashboard-subtitle">
              Your personalized learning journey
            </p>
          </div>

          <button
            onClick={logout}
            className="dashboard-logout"
          >
            Logout
          </button>
        </header>

        {/* Error */}
        {error && (
          <div className="dashboard-error">
            <strong>Something went wrong</strong>
            <p>{error}</p>
          </div>
        )}

        {/* AI Recommendation */}
        {nextLearning?.nextLesson &&
          nextLearning.decision !== "COURSE_COMPLETED" && (
            <section className="dashboard-ai-card">

              <div className="dashboard-ai-content">

                <div className="dashboard-ai-label">
                  <span className="dashboard-ai-icon">
                    ✦
                  </span>

                  AI RECOMMENDATION
                </div>

                <h2 className="dashboard-ai-title">
                  {nextLearning.nextLesson.title}
                </h2>

                <div className="dashboard-ai-meta">
                  Lesson{" "}
                  {nextLearning.nextLesson.lessonOrder}
                  <span>•</span>
                  {nextLearning.nextLesson.difficulty}
                </div>

                <p className="dashboard-ai-reason">
                  {nextLearning.reason ||
                    "Based on your current learning progress and mastery, this lesson is the recommended next step."}
                </p>

              </div>

              <button
                onClick={continueLearning}
                className="dashboard-primary-button"
              >
                Continue Learning
                <span>→</span>
              </button>

            </section>
          )}

        {/* Completed */}
        {nextLearning?.decision ===
          "COURSE_COMPLETED" && (
          <section className="dashboard-completed-card">

            <div className="dashboard-completed-icon">
              ✓
            </div>

            <div>
              <div className="dashboard-completed-label">
                COURSE COMPLETED
              </div>

              <h2>
                You completed this course!
              </h2>

              <p>
                Great work. You have completed all
                available lessons.
              </p>
            </div>

          </section>
        )}

        {/* Progress Overview */}
        <section className="dashboard-section">

          <div className="dashboard-section-heading">
            <div>
              <h2>Progress Overview</h2>
              <p>
                A quick look at your learning performance.
              </p>
            </div>
          </div>

          <div className="dashboard-stats">

            {/* Completed */}
            <div className="dashboard-stat-card">
              <div className="dashboard-stat-icon dashboard-icon-blue">
                ✓
              </div>

              <div className="dashboard-stat-label">
                Lessons Completed
              </div>

              <div className="dashboard-stat-value">
                {completedLessons}
                <span>
                  / {path.length}
                </span>
              </div>

              <p className="dashboard-stat-description">
                lessons completed
              </p>
            </div>

            {/* Progress */}
            <div className="dashboard-stat-card">
              <div className="dashboard-stat-icon dashboard-icon-purple">
                ↗
              </div>

              <div className="dashboard-stat-label">
                Overall Progress
              </div>

              <div className="dashboard-stat-value">
                {overallProgress}
                <span>%</span>
              </div>

              <div className="dashboard-progress">
                <div
                  className="dashboard-progress-bar dashboard-progress-purple"
                  style={{
                    width: `${Math.min(
                      100,
                      Math.max(0, overallProgress)
                    )}%`,
                  }}
                />
              </div>
            </div>

            {/* Mastery */}
            <div className="dashboard-stat-card">
              <div className="dashboard-stat-icon dashboard-icon-green">
                ★
              </div>

              <div className="dashboard-stat-label">
                Average Mastery
              </div>

              <div className="dashboard-stat-value">
                {averageMastery}
                <span>%</span>
              </div>

              <div className="dashboard-progress">
                <div
                  className="dashboard-progress-bar dashboard-progress-green"
                  style={{
                    width: `${Math.min(
                      100,
                      Math.max(0, averageMastery)
                    )}%`,
                  }}
                />
              </div>
            </div>

          </div>
        </section>

        {/* Learning Path */}
        <section className="dashboard-section">

          <div className="dashboard-section-heading">
            <div>
              <h2>Learning Path</h2>
              <p>
                Your personalized step-by-step curriculum.
              </p>
            </div>

            <div className="dashboard-lesson-count">
              {path.length} Lessons
            </div>
          </div>

          {path.length === 0 ? (
            <div className="dashboard-empty">
              <div className="dashboard-empty-icon">
                📚
              </div>

              <h3>No lessons available</h3>

              <p>
                Your learning path does not contain any
                lessons yet.
              </p>
            </div>
          ) : (
            <div className="dashboard-learning-list">

              {path.map((lesson) => {
                const completed =
                  lesson.progressPercent >= 100 ||
                  lesson.status === "COMPLETED";

                const inProgress =
                  !completed &&
                  lesson.progressPercent > 0;

                return (
                  <button
                    key={lesson.id}
                    type="button"
                    className="dashboard-lesson-card"
                    onClick={() =>
                      router.push(
                        `/learn/${lesson.id}`
                      )
                    }
                  >

                    {/* Lesson Number */}
                    <div
                      className={
                        completed
                          ? "dashboard-lesson-number dashboard-lesson-completed"
                          : inProgress
                          ? "dashboard-lesson-number dashboard-lesson-progress"
                          : "dashboard-lesson-number"
                      }
                    >
                      {completed ? (
                        "✓"
                      ) : (
                        lesson.lessonOrder
                      )}
                    </div>

                    {/* Main */}
                    <div className="dashboard-lesson-main">

                      <div className="dashboard-lesson-top">

                        <span
                          className={
                            completed
                              ? "dashboard-status dashboard-status-completed"
                              : inProgress
                              ? "dashboard-status dashboard-status-progress"
                              : "dashboard-status dashboard-status-new"
                          }
                        >
                          {completed
                            ? "Completed"
                            : inProgress
                            ? "In Progress"
                            : "Not Started"}
                        </span>

                        <span className="dashboard-difficulty">
                          {lesson.difficulty}
                        </span>

                      </div>

                      <h3 className="dashboard-lesson-title">
                        {lesson.title}
                      </h3>

                      <p className="dashboard-lesson-subtitle">
                        Lesson {lesson.lessonOrder}
                      </p>

                    </div>

                    {/* Right */}
                    <div className="dashboard-lesson-progress">

                      <strong>
                        {lesson.progressPercent}%
                      </strong>

                      <span>
                        Mastery {lesson.masteryScore}%
                      </span>

                      <div className="dashboard-mini-progress">
                        <div
                          className={
                            completed
                              ? "dashboard-mini-progress-bar dashboard-mini-green"
                              : "dashboard-mini-progress-bar"
                          }
                          style={{
                            width: `${Math.min(
                              100,
                              Math.max(
                                0,
                                lesson.progressPercent
                              )
                            )}%`,
                          }}
                        />
                      </div>

                    </div>

                    <div className="dashboard-arrow">
                      →
                    </div>

                  </button>
                );
              })}

            </div>
          )}

        </section>

      </div>
    </main>
  );
}
