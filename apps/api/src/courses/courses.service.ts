import {
  Injectable,
  NotFoundException,
} from "@nestjs/common";

import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class CoursesService {
  constructor(
    private readonly prisma: PrismaService,
  ) {}

  /**
   * Get all published courses.
   *
   * GET /api/courses
   */
  async findAll() {
    return this.prisma.courses.findMany({
      where: {
        status: "published",
      },
      orderBy: {
        created_at: "desc",
      },
    });
  }

  /**
   * Get course detail with lessons.
   *
   * GET /api/courses/:id
   */
  async findOne(id: string) {
    const course =
      await this.prisma.courses.findUnique({
        where: {
          id,
        },
        include: {
          lessons: {
            orderBy: {
              lesson_order: "asc",
            },
          },
        },
      });

    if (!course) {
      throw new NotFoundException(
        "Course not found",
      );
    }

    return course;
  }

  /**
   * Get lessons of a course.
   *
   * GET /api/courses/:id/lessons
   */
  async findLessons(courseId: string) {
    const course =
      await this.prisma.courses.findUnique({
        where: {
          id: courseId,
        },
        select: {
          id: true,
        },
      });

    if (!course) {
      throw new NotFoundException(
        "Course not found",
      );
    }

    return this.prisma.lessons.findMany({
      where: {
        course_id: courseId,
      },
      orderBy: {
        lesson_order: "asc",
      },
    });
  }
}