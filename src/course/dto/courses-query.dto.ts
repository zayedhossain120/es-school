import {
  IsOptional,
  IsNumberString,
  IsString,
  IsIn,
  IsUUID,
} from 'class-validator';

export class GetCoursesQueryDto {
  /* ───── Pagination ───── */
  @IsOptional() @IsNumberString() page?: string; // e.g. 1
  @IsOptional() @IsNumberString() limit?: string; // e.g. 10

  /* ───── Sorting ───── */
  @IsOptional()
  @IsIn(['created_at', 'title', 'module'])
  sortBy?: string;

  @IsOptional()
  @IsIn(['asc', 'desc'])
  sortOrder?: 'asc' | 'desc';

  /* ───── Free‑text search ───── */
  @IsOptional() @IsString() searchTerms?: string;

  /* ───── Filterable fields ───── */
  @IsOptional() @IsString() title?: string;
  @IsOptional() @IsString() module?: string;
  @IsOptional() @IsUUID() teacher_id?: string; // UUID from Prisma model
}
