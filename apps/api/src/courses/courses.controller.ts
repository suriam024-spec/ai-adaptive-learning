import { Controller, Get, Param } from "@nestjs/common";

import { CoursesService } from "./courses.service";

@Controller("courses")
export class CoursesController {
  constructor(
    private readonly courses: CoursesService,
  ) {}

  @Get()
  findAll() {
    return this.courses.findAll();
  }

  @Get(":id/lessons")
  findLessons(@Param("id") id: string) {
    return this.courses.findLessons(id);
  }

  @Get(":id")
  findOne(@Param("id") id: string) {
    return this.courses.findOne(id);
  }
}