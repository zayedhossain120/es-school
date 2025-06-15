import { IsIn, IsNumberString, IsOptional, IsString } from 'class-validator';

export class CreateCourseDto {
  @IsString()
  title: string;

  @IsString()
  module: string;
}

export class UpdateCourseDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  module?: string;
}

/* ---------- DTO for ?query parameters ------------------------------ */
export class GetAllCoursesQueryDto {
  /* pagination */
  @IsOptional() @IsNumberString() page?: string;
  @IsOptional() @IsNumberString() limit?: string;

  /* simple filters */
  @IsOptional() @IsString() title?: string;
  @IsOptional() @IsString() module?: string;
  @IsOptional() @IsString() teacher_id?: string;

  /* free‑text search */
  @IsOptional() @IsString() searchTerms?: string;

  /* sorting */
  @IsOptional() @IsString() sortBy?: string;
  @IsOptional() @IsIn(['asc', 'desc']) sortOrder?: 'asc' | 'desc';
}
