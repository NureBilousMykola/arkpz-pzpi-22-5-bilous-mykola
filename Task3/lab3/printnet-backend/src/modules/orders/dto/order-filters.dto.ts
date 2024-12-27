import { IsUUID, IsEnum, IsDateString, IsOptional } from "class-validator";
import { ApiPropertyOptional } from "@nestjs/swagger";
import { OrderStatusEnum } from "../entities/order-status.entity";

export class OrderFiltersDto {
  @ApiPropertyOptional()
  @IsUUID()
  @IsOptional()
  userId?: string;

  @ApiPropertyOptional()
  @IsUUID()
  @IsOptional()
  machineId?: string;

  @ApiPropertyOptional({ enum: OrderStatusEnum })
  @IsEnum(OrderStatusEnum)
  @IsOptional()
  status?: OrderStatusEnum;

  @ApiPropertyOptional()
  @IsDateString()
  @IsOptional()
  dateFrom?: string;

  @ApiPropertyOptional()
  @IsDateString()
  @IsOptional()
  dateTo?: string;
}
