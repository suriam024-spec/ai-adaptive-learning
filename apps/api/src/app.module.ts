import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";

import { PrismaModule } from "./prisma/prisma.module";
import { HealthModule } from "./health/health.module";
import { AuthModule } from "./auth/auth.module";
import { CoursesModule } from "./courses/courses.module";
import { LearningModule } from "./learning/learning.module";
import { AiModule } from "./ai/ai.module";
import { QuizModule } from "./quiz/quiz.module";
import { AdaptiveModule } from "./adaptive/adaptive.module";
import { LessonsModule } from "./lessons/lessons.module";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),

    PrismaModule,
    HealthModule,
    AuthModule,
    CoursesModule,
    LearningModule,
    AiModule,
    QuizModule,
    AdaptiveModule,
    LessonsModule,
  ],
})
export class AppModule {}

