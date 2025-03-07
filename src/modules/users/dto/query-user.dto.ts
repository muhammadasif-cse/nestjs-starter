import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import { IsArray, IsNumber, IsOptional, IsString } from 'class-validator';

export class FilterUserDto {
  @ApiPropertyOptional({ type: [Number], example: [6] })
  @IsArray()
  @IsNumber({}, { each: true })
  @Transform(
    ({ value }) => {
      if (Array.isArray(value)) return value.map(Number);
      return [Number(value)];
    },
    { toClassOnly: true },
  )
  @IsOptional()
  roleIds?: number[];

  @ApiPropertyOptional({ type: [Number], example: [2] })
  @IsArray()
  @IsNumber({}, { each: true })
  @Transform(
    ({ value }) => (Array.isArray(value) ? value.map(Number) : [Number(value)]),
    { toClassOnly: true },
  )
  @IsOptional()
  statusIds?: number[];

  @ApiPropertyOptional({ type: String, example: 'Muhammad' })
  @IsString()
  @IsOptional()
  search?: string;
}

export class SortUserDto {
  @ApiPropertyOptional({ type: String, example: 'firstName' })
  orderBy: string;

  @ApiPropertyOptional({ enum: ['ASC', 'DESC'], example: 'ASC' })
  order: 'ASC' | 'DESC';
}

export class QueryUserDto {
  @ApiPropertyOptional({ type: () => FilterUserDto })
  @Type(() => FilterUserDto)
  @IsOptional()
  filters?: FilterUserDto;

  @ApiPropertyOptional({ type: () => [SortUserDto] })
  @Type(() => SortUserDto)
  @IsOptional()
  sort?: SortUserDto[];

  @ApiPropertyOptional({ type: Number, example: 1 })
  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  page?: number;

  @ApiPropertyOptional({ type: Number, example: 10 })
  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  limit?: number;
}
