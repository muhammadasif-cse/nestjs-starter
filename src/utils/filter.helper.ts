import { FindOptionsWhere, ILike, In } from 'typeorm';
import { EntityPropertiesNotFoundError } from './properties-errors';

export class FilterHelper<T> {
  static parseQueryFilters(rawQuery: any): any {
    const filters = {};
    Object.keys(rawQuery).forEach((key) => {
      if (key.startsWith('filters.')) {
        const nestedKeys = key.split('.').slice(1);
        const value = rawQuery[key];
        this.setNestedValue(filters, nestedKeys, this.parseValue(value));
      }
    });
    return filters;
  }

  static buildTypeORMWhere<T>(
    filters: any,
    entityFields: string[] = [],
  ): FindOptionsWhere<T> {
    const where: FindOptionsWhere<T> = {};

    for (const [key, value] of Object.entries(filters)) {
      if (!entityFields.includes(key.split('.')[0])) {
        throw new EntityPropertiesNotFoundError(key);
      }

      if (Array.isArray(value)) {
        where[key] = In(value as any[]);
      } else if (typeof value === 'object') {
        where[key] = value;
      } else {
        where[key] = ILike(`%${value}%`);
      }
    }

    return where;
  }

  private static parseValue(value: any): any {
    if (Array.isArray(value)) {
      return value.map((v) => this.parseSingleValue(v));
    } else if (typeof value === 'string' && value.includes(',')) {
      return value.split(',').map((v) => this.parseSingleValue(v.trim()));
    } else {
      return this.parseSingleValue(value);
    }
  }

  private static parseSingleValue(value: any): any {
    const num = Number(value);
    return isNaN(num) ? value : num;
  }

  private static setNestedValue(obj: any, keys: string[], value: any): void {
    let current = obj;
    for (let i = 0; i < keys.length - 1; i++) {
      const key = keys[i];
      current[key] = current[key] || {};
      current = current[key];
    }
    current[keys[keys.length - 1]] = value;
  }
}
