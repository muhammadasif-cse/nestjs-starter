import { ObjectLiteral, SelectQueryBuilder } from 'typeorm';
import { QueryHelperDto } from '@/common/dto/query-helper.dto';
import { Injectable } from '@nestjs/common';

@Injectable()
export class QueryHelperService {
  applyPaginationAndSearch<T extends ObjectLiteral>(
    queryBuilder: SelectQueryBuilder<T>,
    queryHelperDto: QueryHelperDto,
    searchableFields: string[],
    searchTerm?: string,
  ): SelectQueryBuilder<T> {
    const { page = 1, limit = 10, sort, search } = queryHelperDto;

    // Apply search
    if (search && searchableFields.length > 0) {
      const searchConditions = searchableFields
        .map((field) => `${field} LIKE :search`)
        .join(' OR ');
      queryBuilder.andWhere(`(${searchConditions})`, { search: `%${search}%` });
    }

    // Apply sorting
    if (sort) {
      const [field, order] = sort.split(':');
      if (field && order) {
        queryBuilder.orderBy(field, order as 'ASC' | 'DESC');
      }
    }

    // Apply pagination
    queryBuilder.skip((page - 1) * limit).take(limit);

    return queryBuilder;
  }
}
