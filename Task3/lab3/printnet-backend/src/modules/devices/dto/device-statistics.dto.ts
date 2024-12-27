import { ApiProperty } from "@nestjs/swagger";
import { DeviceStatusEnum } from "../entities/device-status.entity";

export class DeviceStatisticsDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  serial_number: string;

  @ApiProperty()
  location: string;

  @ApiProperty({ enum: DeviceStatusEnum })
  status: DeviceStatusEnum;

  @ApiProperty()
  total_orders: number;

  @ApiProperty()
  uptime_percentage: number;

  @ApiProperty()
  last_maintenance: Date | null;
}
