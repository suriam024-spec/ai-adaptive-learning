import {
  Controller,
  Get,
  Param,
} from "@nestjs/common";

import { LessonsService } from "./lessons.service";

@Controller("lessons")
export class LessonsController {
  constructor(
    private readonly lessonsService: LessonsService,
  ) {}

  @Get(":id")
  findOne(
    @Param("id") id: string,
  ) {
    return this.lessonsService.findOne(id);
  }
}