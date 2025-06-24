import { IsOptional, IsNumberString, IsString, IsIn } from 'class-validator';

export class ResultQueryDto {
  /* ───── Pagination ───── */
  @IsOptional() @IsNumberString() page?: string; // e.g. 1
  @IsOptional() @IsNumberString() limit?: string; // e.g. 10

  /* ───── Sorting ───── */
  @IsOptional()
  @IsIn(['created_at', 'status'])
  sortBy?: string;

  @IsOptional()
  @IsIn(['asc', 'desc'])
  sortOrder?: 'asc' | 'desc';

  /* ───── Free‑text search ───── */
  @IsOptional() @IsString() searchTerms?: string;

  /* ───── Filterable fields ───── */
  @IsOptional() @IsString() status?: string;
}
