import { Injectable } from "@nestjs/common";

@Injectable()
export class AppService {
  getStatus() {
    return {
      status: "ok",
      service: "ai-adaptive-learning-api",
    };
  }
}
