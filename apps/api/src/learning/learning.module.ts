import { Module } from "@nestjs/common";

import { LearningController } from "./learning.controller";
import { LearningService } from "./learning.service";

import { PrismaModule } from "../prisma/prisma.module";
import { AuthModule } from "../auth/auth.module";
import { AdaptiveModule } from "../adaptive/adaptive.module";

@Module({
  imports: [
    PrismaModule,
    AuthModule,
    AdaptiveModule,
  ],

  controllers: [
    LearningController,
  ],

  providers: [
    LearningService,
  ],
})
export class LearningModule {}