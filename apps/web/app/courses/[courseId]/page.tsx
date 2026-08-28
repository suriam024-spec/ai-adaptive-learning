"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  BookOpen,
  CheckCircle2,
  Clock,
  Loader2,
  Lock,
  Play,
} from "lucide-react";

import { apiFetch } from "@/lib/api";
import { getToken } from "@/lib/auth";

type Lesson = {
  id: string;
  title: string;
  description?: string | null;
  content?: string | null;
  lesson_order: number;
  difficulty?: string | null;
};

type Course = {
  id: string;
  title: string;
  description?: string | null;
  difficulty?: string | null;
  category?: string | null;
  thumbnail?: string | null;
  status?: string;
  lessons: Lesson[];
};

export default function CoursePage() {
  const params = useParams();
  const router = useRouter();

  const courseId = params.courseId as string;

  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!courseId) {
      setError("ไม่พบ Course ID");
      setLoading(false);
      return;
    }

    loadCourse();
  }, [courseId]);

  async function loadCourse() {
    try {
      setLoading(true);
      setError("");

      const token = getToken();

      if (!token) {
        router.push("/login");
        return;
      }

      const data = await apiFetch<Course>(
        `/courses/${courseId}`,
        {
          token,
        },
      );

      setCourse(data);
    } catch (error) {
      console.error(error);

      setError(
        error instanceof Error
          ? error.message
          : "ไม่สามารถโหลด Course ได้",
      );
    } finally {
      setLoading(false);
    }
  }

  function openLesson(lessonId: string) {
    router.push(`/learn/${lessonId}`);
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="flex items-center gap-3 text-slate-600">
          <Loader2 className="h-5 w-5 animate-spin" />
          กำลังโหลด Course...
        </div>
      </main>
    );
  }

  if (error || !course) {
    return (
      <main className="min-h-screen bg-slate-50 p-6">
        <div className="mx-auto max-w-4xl">
          <button
            onClick={() => router.push("/courses")}
            className="mb-6 flex items-center gap-2 text-sm text-slate-600 transition hover:text-slate-900"
          >
            <ArrowLeft className="h-4 w-4" />
            กลับไป Courses
          </button>

          <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-red-700">
            {error || "ไม่พบ Course"}
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">

        {/* Back */}

        <button
          onClick={() => router.push("/courses")}
          className="mb-6 flex items-center gap-2 text-sm text-slate-500 transition hover:text-slate-900"
        >
          <ArrowLeft className="h-4 w-4" />
          กลับไป Courses
        </button>

        {/* Course Header */}

        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

          {/* Thumbnail */}

          <div className="flex h-56 items-center justify-center bg-slate-100">
            {course.thumbnail ? (
              <img
                src={course.thumbnail}
                alt={course.title}
                className="h-full w-full object-cover"
              />
            ) : (
              <BookOpen className="h-20 w-20 text-slate-300" />
            )}
          </div>

          {/* Course Info */}

          <div className="p-6 sm:p-8">

            <div className="flex flex-wrap gap-2">

              {course.category && (
                <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-600">
                  {course.category}
                </span>
              )}

              {course.difficulty && (
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium capitalize text-slate-600">
                  {course.difficulty}
                </span>
              )}

            </div>

            <h1 className="mt-4 text-3xl font-bold text-slate-900">
              {course.title}
            </h1>

            <p className="mt-3 max-w-3xl leading-7 text-slate-600">
              {course.description ||
                "ไม่มีคำอธิบายสำหรับ Course นี้"}
            </p>

            <div className="mt-6 flex flex-wrap gap-4 text-sm text-slate-500">

              <div className="flex items-center gap-2">
                <BookOpen className="h-4 w-4" />
                {course.lessons.length} Lessons
              </div>

              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Adaptive Learning
              </div>

            </div>

          </div>
        </section>

        {/* Learning Path */}

        <section className="mt-8">

          <div className="mb-5">
            <p className="text-sm font-medium text-blue-600">
              LEARNING PATH
            </p>

            <h2 className="mt-1 text-2xl font-bold text-slate-900">
              Course Lessons
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              เรียนตาม Learning Path ที่ระบบ Adaptive Learning แนะนำ
            </p>
          </div>

          {course.lessons.length === 0 ? (
            <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center">
              <BookOpen className="mx-auto h-10 w-10 text-slate-300" />

              <h3 className="mt-4 font-semibold text-slate-900">
                ยังไม่มีบทเรียน
              </h3>

              <p className="mt-2 text-sm text-slate-500">
                Course นี้ยังไม่มี Lesson
              </p>
            </div>
          ) : (
            <div className="space-y-4">

              {course.lessons.map((lesson, index) => (
                <article
                  key={lesson.id}
                  className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md"
                >
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

                    {/* Lesson Info */}

                    <div className="flex items-start gap-4">

                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-50 text-sm font-semibold text-blue-600">
                        {lesson.lesson_order ||
                          index + 1}
                      </div>

                      <div>

                        <h3 className="font-semibold text-slate-900">
                          {lesson.title}
                        </h3>

                        {lesson.description && (
                          <p className="mt-1 text-sm leading-6 text-slate-500">
                            {lesson.description}
                          </p>
                        )}

                        <div className="mt-2 flex flex-wrap gap-2">

                          {lesson.difficulty && (
                            <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs capitalize text-slate-500">
                              {lesson.difficulty}
                            </span>
                          )}

                          <span className="rounded-full bg-green-50 px-2.5 py-1 text-xs text-green-600">
                            Available
                          </span>

                        </div>

                      </div>

                    </div>

                    {/* Action */}

                    <button
                      onClick={() =>
                        openLesson(lesson.id)
                      }
                      className="flex shrink-0 items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 font-medium text-white transition hover:bg-blue-700"
                    >
                      <Play className="h-4 w-4" />
                      Start Lesson
                    </button>

                  </div>
                </article>
              ))}

            </div>
          )}

        </section>

        {/* Course Learning Info */}

        <section className="mt-8 rounded-2xl border border-blue-100 bg-blue-50 p-6">

          <div className="flex items-start gap-4">

            <div className="rounded-xl bg-white p-3">
              <CheckCircle2 className="h-5 w-5 text-blue-600" />
            </div>

            <div>
              <h3 className="font-semibold text-slate-900">
                Adaptive Learning
              </h3>

              <p className="mt-1 text-sm leading-6 text-slate-600">
                ระบบจะประเมินความรู้และผลการเรียนของคุณ
                เพื่อเลือกบทเรียนถัดไปที่เหมาะสมกับระดับความรู้ของคุณ
              </p>
            </div>

          </div>

        </section>

      </div>
    </main>
  );
}