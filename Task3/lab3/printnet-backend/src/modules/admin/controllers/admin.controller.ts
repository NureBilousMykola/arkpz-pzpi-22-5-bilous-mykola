import { Controller, Get, Post, Body, UseGuards } from "@nestjs/common";
import { ApiTags, ApiOperation, ApiBearerAuth, ApiBody } from "@nestjs/swagger";
import { JwtAuthGuard } from "../../../core/guards/jwt-auth.guard";
import { RolesGuard } from "../../../core/guards/roles.guard";
import { Roles } from "../../../core/decorators/roles.decorator";
import { AdminService } from "../services/admin.service";
import { DashboardResponseDto } from "../dto/dashboard.dto";
import { GenerateReportDto } from "../dto/generate-report.dto";

@ApiTags("admin")
@Controller("admin")
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles("admin")
@ApiBearerAuth()
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get("dashboard")
  @ApiOperation({ summary: "Get metrics for admin dashboard" })
  async getDashboard(): Promise<DashboardResponseDto> {
    const [systemMetrics, machineMetrics] = await Promise.all([
      this.adminService.getDashboardMetrics(),
      this.adminService.getMachineMetrics(),
    ]);

    return {
      systemMetrics,
      machineMetrics,
      recentOrders: await this.adminService.getRecentOrders(), // Implemented fetching recent orders
      alerts: await this.adminService.getActiveAlerts(), // Implemented fetching active alerts
    };
  }

  @Post("reports/generate")
  @ApiOperation({ summary: "Generate a report" })
  @ApiBody({
    type: GenerateReportDto,
    examples: {
      example1: {
        summary: "Example report generation",
        value: {
          startDate: "2024-01-01",
          endDate: "2024-01-31",
          reportType: "monthly",
        },
      },
    },
  })
  async generateReport(@Body() generateReportDto: GenerateReportDto) {
    return await this.adminService.generateReport(generateReportDto);
  }

  @Get("maintenance/required")
  @ApiOperation({
    summary: "Get list of machines requiring maintenance",
  })
  async getMaintenanceRequired() {
    return await this.adminService.getMachinesRequiringMaintenance(); // Implemented fetching machines requiring maintenance
  }
}
