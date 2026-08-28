import { Module } from "@nestjs/common";

import { AdaptiveController } from "./adaptive.controller";
import { AdaptiveService } from "./adaptive.service";

import { PrismaModule } from "../prisma/prisma.module";
import { AuthModule } from "../auth/auth.module";

@Module({
  imports: [
    PrismaModule,
    AuthModule,
  ],

  controllers: [
    AdaptiveController,
  ],

  providers: [
    AdaptiveService,
  ],

  exports: [
    AdaptiveService,
  ],
})
export class AdaptiveModule {}