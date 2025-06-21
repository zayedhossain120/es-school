import { IsOptional, IsString, IsUUID, Length } from 'class-validator';

// create exam dto

export class CreateExamParticipantDto {
  @IsUUID()
  exam_id: string;

  @IsUUID()
  student_id: string;

  @IsUUID()
  course_id: string;

  @IsString()
  @IsOptional()
  @Length(0, 10_000)
  answer: string;
}

/* -------------------------------------------------- */
/*  UPDATE                                            */
/* -------------------------------------------------- */
export class UpdateExammParticipantDto {
  @IsString()
  @IsOptional()
  @Length(0, 10_000)
  answer: string;
}
