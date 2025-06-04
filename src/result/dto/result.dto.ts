import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  IsInt,
  IsEnum,
} from 'class-validator';
import { Status } from 'generated/prisma';

export class CreateResultDto {
  @IsUUID()
  @IsNotEmpty()
  exam_id: string;

  @IsUUID()
  @IsNotEmpty()
  student_id: string;

  @IsUUID()
  @IsNotEmpty()
  course_id: string;

  @IsString()
  @IsNotEmpty()
  answer: string;

  @IsOptional()
  @IsInt()
  marks?: number;

  @IsOptional()
  @IsEnum(Status)
  status?: Status;
}
