import { ApiProperty } from "@nestjs/swagger";
import { SystemMetrics } from "../interfaces/dashboard.interface";
import { MachineMetrics } from "../interfaces/dashboard.interface";

export class DashboardResponseDto {
  @ApiProperty()
  systemMetrics: SystemMetrics;

  @ApiProperty()
  machineMetrics: MachineMetrics[];

  @ApiProperty()
  recentOrders: any[];

  @ApiProperty()
  alerts: any[];
}
