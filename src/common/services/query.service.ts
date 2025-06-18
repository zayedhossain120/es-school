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

    const { orderBy } = this.sort<OrderBy>(
      raw.sortBy,
      raw.sortOrder,
      schema.defaultSort!,
    );

    const where = this.filter<Where, OrderBy>(raw, schema);

    return { where, orderBy, skip, take, page, limit };
  }

  private paginate(page = '1', limit = '10', def = 10) {
    const p = Math.max(1, parseInt(page) || 1);
    const l = Math.max(1, parseInt(limit) || def);
    const skip = (p - 1) * l;
    return { skip, take: l, page: p, limit: l };
  }

  /* ---------- Sorting -------------------------------------------- */
  private sort<OrderBy extends Record<string, unknown>>(
    sortBy: string | undefined,
    sortOrder: string | undefined,
    defaultColumn: keyof OrderBy,
  ): { orderBy: Partial<OrderBy> } {
    const column = (sortBy as keyof OrderBy) ?? defaultColumn;
    const dir: 'asc' | 'desc' = sortOrder === 'asc' ? 'asc' : 'desc';

    /* only ONE property, typed as Partial<OrderBy> */
    return {
      orderBy: { [column]: dir } as Partial<OrderBy>,
    };
  }

  private filter<Where, OrderBy>(
    raw: Record<string, any>,
    { searchable, filterable }: QuerySchema<Where, OrderBy>,
  ): Where {
    const where: Record<string, any> = {};

    for (const key of filterable) {
      const v = raw[key as string] as string;
      if (v !== undefined && v !== '') {
        where[key as string] = typeof v === 'string' ? { contains: v } : v;
      }
    }

    if (raw.searchTerms) {
      where.OR = searchable.map((col) => ({
        [col]: { contains: raw.searchTerms as string },
      }));
    }

    return where as Where;
  }

  public formatPaginatedResponse<T>(
    data: T[],
    total: number,
    page: number,
    limit: number,
  ) {
    return {
      meta: { total, page, limit }, //lastPage: Math.ceil(total / limit)
      data,
    };
  }
}
