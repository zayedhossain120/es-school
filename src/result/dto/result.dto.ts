import { IsNotEmpty, IsOptional, IsUUID, IsInt, IsEnum } from 'class-validator';

export enum Status {
  PASSED = 'PASSED',
  FAILED = 'FAILED',
  PENDING = 'PENDING',
}

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

  @IsUUID()
  @IsNotEmpty()
  participant_id: string;

  @IsOptional()
  @IsInt()
  marks?: number;

  @IsOptional()
  @IsEnum(Status)
  status?: Status;
}

export class UpdateResultDto {
  @IsOptional()
  @IsInt()
  marks?: number;

  @IsOptional()
  @IsEnum(Status)
  status?: Status;
}
