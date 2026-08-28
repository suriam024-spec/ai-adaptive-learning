import {
  IsOptional,
  IsString,
  IsUUID,
} from "class-validator";

export class AskTutorDto {
  @IsUUID()
  lessonId!: string;

  @IsString()
  question!: string;

  @IsOptional()
  @IsString()
  context?: string;
}