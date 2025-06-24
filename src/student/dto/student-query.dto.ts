import {
  IsOptional,
  IsNumberString,
  IsString,
  IsBooleanString,
  IsIn,
} from 'class-validator';

export class GetStudentsQueryDto {
  /* pagination */
  @IsOptional() @IsNumberString() page?: string;
  @IsOptional() @IsNumberString() limit?: string;

  /* sorting */
  @IsOptional()
  @IsIn(['created_at', 'full_name', 'email'])
  sortBy?: string;

  @IsOptional()
  @IsIn(['asc', 'desc'])
  sortOrder?: 'asc' | 'desc';

  /* free‑text search */
  @IsOptional() @IsString() searchTerms?: string;

  /* filterable fields */
  @IsOptional() @IsString() full_name?: string;
  @IsOptional() @IsString() email?: string;
  @IsOptional() @IsBooleanString() is_active?: string;
}
