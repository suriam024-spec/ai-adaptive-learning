import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Req,
  UseGuards,
} from "@nestjs/common";

import { QuizService } from "./quiz.service";
import { SubmitQuizDto } from "./dto/submit-quiz.dto";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";

@Controller("quiz")
@UseGuards(JwtAuthGuard)
export class QuizController {
  constructor(
    private readonly quizService: QuizService,
  ) {}

  /**
   * Get quiz for a lesson.
   *
   * GET /api/quiz/lesson/:lessonId
   */
  @Get("lesson/:lessonId")
  async findByLesson(
    @Param("lessonId") lessonId: string,
    @Req() req: any,
  ) {
    return this.quizService.findByLesson(
      lessonId,
      req.user.sub,
    );
  }

  /**
   * Start a quiz attempt.
   *
   * POST /api/quiz/:quizId/start
   */
  @Post(":quizId/start")
  async startQuiz(
    @Req() req: any,
    @Param("quizId") quizId: string,
  ) {
    return this.quizService.startQuiz(
      quizId,
      req.user.sub,
    );
  }

  /**
   * Submit quiz.
   *
   * POST /api/quiz/submit
   */
  @Post("submit")
  async submitQuiz(
    @Req() req: any,
    @Body() dto: SubmitQuizDto,
  ) {
    return this.quizService.submitQuiz(
      req.user.sub,
      dto,
    );
  }
}