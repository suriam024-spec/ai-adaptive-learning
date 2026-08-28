import {
  Controller,
  Get,
  Param,
  Req,
  UseGuards,
} from "@nestjs/common";

import { AdaptiveService } from "./adaptive.service";

import { JwtAuthGuard } from "../auth/jwt-auth.guard";

@Controller("adaptive")
@UseGuards(JwtAuthGuard)
export class AdaptiveController {
  constructor(
    private readonly adaptiveService: AdaptiveService,
  ) {}

  @Get("recommendation/:lessonId")
  async recommendation(
    @Req() req: any,
    @Param("lessonId") lessonId: string,
  ) {
    return this.adaptiveService.getRecommendation(
      req.user.sub,
      lessonId,
    );
  }
}