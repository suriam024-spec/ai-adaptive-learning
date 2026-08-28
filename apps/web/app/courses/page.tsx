"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  BookOpen,
  Loader2,
} from "lucide-react";

import { apiFetch } from "@/lib/api";
import { getToken } from "@/lib/auth";

type Course = {
  id: string;
  title: string;
  description?: string | null;
  difficulty?: string | null;
  category?: string | null;
  thumbnail?: string | null;
  status?: string;
};

export default function CoursesPage() {
  const router = useRouter();

  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadCourses();
  }, []);

  async function loadCourses() {
    try {
      setLoading(true);
      setError("");

      const token = getToken();

      const data = await apiFetch<Course[]>(
        "/courses",
        token
          ? {
              token,
            }
          : undefined,
      );

      setCourses(data);
    } catch (error) {
      console.error(error);

      setError(
        error instanceof Error
          ? error.message
          : "ไม่สามารถโหลด Courses ได้",
      );
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="flex items-center gap-3 text-slate-600">
          <Loader2 className="h-5 w-5 animate-spin" />
          กำลังโหลด Courses...
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">

        {/* Header */}

        <header className="mb-8">
          <button
            onClick={() => router.back()}
            className="mb-6 flex items-center gap-2 text-sm text-slate-500 transition hover:text-slate-900"
          >
            <ArrowLeft className="h-4 w-4" />
            กลับ
          </button>

          <div>
            <p className="text-sm font-medium text-blue-600">
              AI ADAPTIVE LEARNING
            </p>

            <h1 className="mt-2 text-3xl font-bold text-slate-900">
              Courses
            </h1>

            <p className="mt-2 text-slate-500">
              เลือก Course ที่คุณต้องการเรียนรู้
            </p>
          </div>
        </header>

        {/* Error */}

        {error && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-red-600">
            {error}
          </div>
        )}

        {/* Empty */}

        {!error && courses.length === 0 && (
          <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center">
            <BookOpen className="mx-auto h-10 w-10 text-slate-400" />

            <h2 className="mt-4 text-lg font-semibold text-slate-900">
              ยังไม่มี Course
            </h2>

            <p className="mt-2 text-sm text-slate-500">
              ตอนนี้ยังไม่มี Course ที่เปิดให้เรียน
            </p>
          </div>
        )}

        {/* Course Grid */}

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {courses.map((course) => (
            <article
              key={course.id}
              className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-md"
            >
              {/* Thumbnail */}

              <div className="flex h-40 items-center justify-center bg-slate-100">
                {course.thumbnail ? (
                  <img
                    src={course.thumbnail}
                    alt={course.title}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <BookOpen className="h-12 w-12 text-slate-300" />
                )}
              </div>

              {/* Content */}

              <div className="p-6">
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

                <h2 className="mt-4 text-xl font-semibold text-slate-900">
                  {course.title}
                </h2>

                <p className="mt-2 line-clamp-3 text-sm leading-6 text-slate-500">
                  {course.description ||
                    "ไม่มีคำอธิบายสำหรับ Course นี้"}
                </p>

                <button
                  onClick={() =>
                    router.push(
                      `/courses/${course.id}`,
                    )
                  }
                  className="mt-6 w-full rounded-xl bg-blue-600 px-5 py-3 font-medium text-white transition hover:bg-blue-700"
                >
                  View Course
                </button>
              </div>
            </article>
          ))}
        </div>
      </div>
    </main>
  );
}