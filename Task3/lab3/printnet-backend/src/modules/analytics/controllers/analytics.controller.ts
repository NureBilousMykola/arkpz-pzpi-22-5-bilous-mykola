import { Controller, Get, Query, UseGuards } from "@nestjs/common";
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiQuery,
} from "@nestjs/swagger";
import { JwtAuthGuard } from "../../../core/guards/jwt-auth.guard";
import { RolesGuard } from "../../../core/guards/roles.guard";
import { Roles } from "../../../core/decorators/roles.decorator";
import { AnalyticsService } from "../services/analytics.service";

@ApiTags("analytics")
@Controller("analytics")
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles("admin")
@ApiBearerAuth()
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get("orders")
  @ApiOperation({ summary: "Get order analytics" })
  @ApiQuery({
    name: "startDate",
    required: true,
    type: String,
    example: "2024-01-01",
  })
  @ApiQuery({
    name: "endDate",
    required: true,
    type: String,
    example: "2024-01-31",
  })
  async getOrderAnalytics(
    @Query("startDate") startDate: string,
    @Query("endDate") endDate: string,
  ) {
    return await this.analyticsService.getOrderAnalytics(
      new Date(startDate),
      new Date(endDate),
    );
  }

  @Get("machines")
  @ApiOperation({ summary: "Get vending machine analytics" })
  @ApiQuery({
    name: "startDate",
    required: true,
    type: String,
    example: "2024-01-01",
  })
  @ApiQuery({
    name: "endDate",
    required: true,
    type: String,
    example: "2024-01-31",
  })
  async getMachineAnalytics(
    @Query("startDate") startDate: string,
    @Query("endDate") endDate: string,
  ) {
    return await this.analyticsService.getMachineAnalytics(
      new Date(startDate),
      new Date(endDate),
    );
  }

  @Get("revenue")
  @ApiOperation({ summary: "Get revenue analytics" })
  @ApiQuery({
    name: "startDate",
    required: true,
    type: String,
    example: "2024-01-01",
  })
  @ApiQuery({
    name: "endDate",
    required: true,
    type: String,
    example: "2024-01-31",
  })
  async getRevenueAnalytics(
    @Query("startDate") startDate: string,
    @Query("endDate") endDate: string,
  ) {
    return await this.analyticsService.getRevenueAnalytics(
      new Date(startDate),
      new Date(endDate),
    );
  }
}
