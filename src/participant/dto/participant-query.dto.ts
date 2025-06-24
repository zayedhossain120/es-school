import { IsOptional, IsNumberString, IsString, IsIn } from 'class-validator';

export class ParticipantQueryDto {
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
  @IsOptional() @IsString() answer?: string;
}
