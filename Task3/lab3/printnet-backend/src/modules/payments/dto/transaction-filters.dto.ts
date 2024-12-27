import { IsDateString, IsOptional } from "class-validator";
import { ApiPropertyOptional } from "@nestjs/swagger";

export class TransactionFiltersDto {
  @ApiPropertyOptional()
  @IsDateString()
  @IsOptional()
  startDate?: string;

  @ApiPropertyOptional()
  @IsDateString()
  @IsOptional()
  endDate?: string;
}
