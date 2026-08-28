import { apiFetch } from "@/lib/api";

export interface Lesson {
  id: string;
  course_id: string;
  title: string;
  description?: string | null;
  content?: string | null;
  video_url?: string | null;
  lesson_order: number;
  difficulty?: string | null;
  estimated_time?: number | null;
}

export interface Course {
  id: string;
  title: string;
  description?: string | null;
  difficulty?: string | null;
  category?: string | null;
  thumbnail?: string | null;
  status?: string;
  created_by?: string | null;
  created_at?: string;
  updated_at?: string;
  lessons?: Lesson[];
}

export async function getCourses(): Promise<Course[]> {
  return apiFetch<Course[]>("/courses")
}

export async function getCourse(
  id: string,
): Promise<Course> {
  return apiFetch<Course>(`/courses/${id}`);
}