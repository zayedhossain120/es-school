import { IsString, IsNotEmpty } from 'class-validator';

export class CreateEnrollDto {
  @IsString()
  @IsNotEmpty()
  student_id: string;

  @IsString()
  @IsNotEmpty()
  course_id: string;
}
