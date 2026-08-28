import { Module } from "@nestjs/common";

import { QuizController } from "./quiz.controller";
import { QuizService } from "./quiz.service";

import { PrismaModule } from "../prisma/prisma.module";
import { AuthModule } from "../auth/auth.module";

@Module({
  imports: [
    PrismaModule,
    AuthModule,
  ],

  controllers: [
    QuizController,
  ],

  providers: [
    QuizService,
  ],
})
export class QuizModule {}