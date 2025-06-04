import { IsNotEmpty, IsString, IsUUID, IsDateString } from 'class-validator';

export class CreateExamDto {
  @IsNotEmpty()
  @IsString()
  title: string;

  @IsNotEmpty()
  @IsString()
  description: string;

  @IsNotEmpty()
  @IsDateString()
  exam_date: string;

  @IsNotEmpty()
  @IsUUID()
  course_id: string;
}
