import {
  Controller,
  Get,
  Param,
  Post,
  Req,
  UseGuards,
} from "@nestjs/common";

import { LearningService } from "./learning.service";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";

@Controller("learning")
@UseGuards(JwtAuthGuard)
export class LearningController {
  constructor(
    private readonly learningService: LearningService,
  ) {}

  @Get("next")
  async next(@Req() req: any) {
    return this.learningService.next(
      req.user.sub,
    );
  }

  @Get("path")
  async path(@Req() req: any) {
    return this.learningService.path(
      req.user.sub,
    );
  }

  @Get("lesson/:lessonId")
  async getLesson(
    @Req() req: any,
    @Param("lessonId") lessonId: string,
  ) {
    return this.learningService.getLesson(
      req.user.sub,
      lessonId,
    );
  }

  @Post("lesson/:lessonId/start")
  async startLesson(
    @Req() req: any,
    @Param("lessonId") lessonId: string,
  ) {
    return this.learningService.startLesson(
      req.user.sub,
      lessonId,
    );
  }

  @Post("lesson/:lessonId/complete")
  async completeLesson(
    @Req() req: any,
    @Param("lessonId") lessonId: string,
  ) {
    return this.learningService.completeLesson(
      req.user.sub,
      lessonId,
    );
  }
}