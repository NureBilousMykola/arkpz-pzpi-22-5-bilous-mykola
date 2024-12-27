import { Controller, Get, UseGuards, Query } from "@nestjs/common";
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiQuery,
} from "@nestjs/swagger";
import { JwtAuthGuard } from "@/core/guards/jwt-auth.guard";
import { RolesGuard } from "@/core/guards/roles.guard";
import { Roles } from "@/core/decorators/roles.decorator";
import { MonitoringService } from "@/modules/monitoring/services/monitoring.service";

@ApiTags("monitoring")
@Controller("monitoring")
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles("admin")
@ApiBearerAuth()
export class MonitoringController {
  constructor(private readonly monitoringService: MonitoringService) {}

  @Get("health")
  @ApiOperation({ summary: "Get system health status" })
  @ApiQuery({ name: "detail", required: false, type: Boolean, example: true })
  async getSystemHealth(@Query("detail") detail: boolean = false) {
    return await this.monitoringService.getSystemHealth();
  }

  @Get("alerts")
  @ApiOperation({ summary: "Get active alerts" })
  @ApiQuery({
    name: "severity",
    required: false,
    type: String,
    example: "high",
  })
  async getActiveAlerts(@Query("severity") severity: string) {
    const health = await this.monitoringService.getSystemHealth();
    return health.alerts.filter((alert) => alert.severity === severity);
  }
}
