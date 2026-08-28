import {
  IsArray,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Min,
  ValidateNested,
} from "class-validator";

import { Type } from "class-transformer";

export class SubmitQuizAnswerDto {
  @IsUUID()
  questionId!: string;

  @IsString()
  selectedAnswer!: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  timeUsed?: number;
}

export class SubmitQuizDto {
  @IsUUID()
  attemptId!: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SubmitQuizAnswerDto)
  answers!: SubmitQuizAnswerDto[];
}