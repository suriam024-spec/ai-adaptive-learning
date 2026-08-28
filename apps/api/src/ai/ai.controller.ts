import {
  Body,
  Controller,
  Post,
  Req,
  UseGuards,
} from "@nestjs/common";

import { AiService } from "./ai.service";
import { AskTutorDto } from "./dto/ask-tutor.dto";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";

@Controller("ai")
@UseGuards(JwtAuthGuard)
export class AiController {
  constructor(
    private readonly aiService: AiService,
  ) {}

  @Post("tutor")
  async tutor(
    @Req() req: any,
    @Body() dto: AskTutorDto,
  ) {
    return this.aiService.tutor(
      req.user.sub,
      dto.lessonId,
      dto.question,
      dto.context,
    );
  }
}