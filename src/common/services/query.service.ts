import { Injectable } from '@nestjs/common';

export interface QuerySchema<Where, OrderBy> {
  searchable: (keyof Where)[];
  filterable: (keyof Where)[];
  defaultSort?: keyof OrderBy;
  defaultLimit?: number;
}

@Injectable()
export class QueryEngine {
  build<Where extends Record<string, any>, OrderBy extends Record<string, any>>(
    raw: Record<string, any>,
    schema: QuerySchema<Where, OrderBy>,
  ) {
    const { skip, take, page, limit } = this.paginate(
      raw.page,
      raw.limit,
      schema.defaultLimit,
    );
    const { orderBy } = this.sort(
      raw.sortBy,
      raw.sortOrder,
      schema.defaultSort,
    );
    const where = this.filter<Where>(raw, schema);

    return { where, orderBy, skip, take, page, limit };
  }

  private paginate(page = '1', limit = '10', def = 10) {
    const p = Math.max(1, parseInt(page) || 1);
    const l = Math.max(1, parseInt(limit) || def);
    const skip = (p - 1) * l;
    return { skip, take: l, page: p, limit: l };
  }

  private sort(
    sortBy = 'createdAt',
    sortOrder: any = 'desc',
    def: any = 'createdAt',
  ) {
    const column = sortBy || def;
    const dir = sortOrder === 'asc' ? 'asc' : 'desc';
    return { orderBy: { [column]: dir } };
  }

  private filter<Where>(
    raw: Record<string, any>,
    { searchable, filterable }: QuerySchema<Where, any>,
  ): Where {
    const where: Record<string, any> = {};

    for (const key of filterable) {
      const v = raw[key as string] as string;
      if (v !== undefined && v !== '') {
        where[key as string] =
          typeof v === 'string' ? { contains: v, mode: 'insensitive' } : v;
      }
    }

    if (raw.searchTerms) {
      where.OR = searchable.map((col) => ({
        [col]: { contains: raw.searchTerms as string, mode: 'insensitive' },
      }));
    }

    return where as Where;
  }

  /** Optional: Standard paginated response formatter */
  public formatPaginatedResponse<T>(
    data: T[],
    total: number,
    page: number,
    limit: number,
  ) {
    return {
      data,
      total,
      page,
      lastPage: Math.ceil(total / limit),
    };
  }
}
