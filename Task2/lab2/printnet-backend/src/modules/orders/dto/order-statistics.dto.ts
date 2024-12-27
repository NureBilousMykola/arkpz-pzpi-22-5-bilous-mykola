import { ApiProperty } from "@nestjs/swagger";
import { OrderStatusEnum } from "../entities/order-status.entity";

export class StatusHistoryDto {
  @ApiProperty({ enum: OrderStatusEnum })
  status: OrderStatusEnum;

  @ApiProperty()
  timestamp: Date;

  @ApiProperty()
  description: string;
}

export class OrderStatisticsDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  totalCost: number;

  @ApiProperty()
  processingTime: number;

  @ApiProperty({ type: [StatusHistoryDto] })
  statusHistory: StatusHistoryDto[];

  @ApiProperty({ enum: OrderStatusEnum })
  currentStatus: OrderStatusEnum;
}
