import { Injectable, OnModuleInit } from "@nestjs/common";
import { Cron, CronExpression } from "@nestjs/schedule";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { VendingMachine } from "../../devices/entities/vending-machine.entity";
import { AdminService } from "../../admin/services/admin.service";
import { MonitoringService } from "../../monitoring/services/monitoring.service";
import { NotificationsService } from "../../notifications/services/notifications.service";
import { DeviceStatusEnum } from "../../devices/entities/device-status.entity";
import { MaintenanceService } from "../../maintenance/services/maintenance.service";
import { ReportType } from "../../admin/interfaces/reports.interface";

@Injectable()
export class SchedulerService implements OnModuleInit {
  constructor(
    @InjectRepository(VendingMachine)
    private vendingMachineRepository: Repository<VendingMachine>,
    private adminService: AdminService,
    private monitoringService: MonitoringService,
    private notificationService: NotificationsService,
    private maintenanceService: MaintenanceService,
  ) {}

  onModuleInit() {
    // Ініціалізація планувальника
    console.log("SchedulerService has been initialized");
  }

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async handleDailyReports() {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    await this.adminService.generateReport({
      startDate: yesterday,
      endDate: new Date(),
      reportType: ReportType.DAILY,
    });
  }

  @Cron(CronExpression.EVERY_WEEK)
  async handleWeeklyReports() {
    const lastWeek = new Date();
    lastWeek.setDate(lastWeek.getDate() - 7);

    await this.adminService.generateReport({
      startDate: lastWeek,
      endDate: new Date(),
      reportType: ReportType.WEEKLY,
    });
  }

  @Cron(CronExpression.EVERY_HOUR)
  async checkMachinesHealth() {
    const health = await this.monitoringService.getSystemHealth();

    if (health.systemStatus === "CRITICAL") {
      await this.notificationService.handleMonitoringAlert({
        message: "System health is critical!",
        timestamp: new Date(),
      });
    }
  }

  @Cron(CronExpression.EVERY_DAY_AT_4AM)
  async scheduleMaintenanceChecks() {
    const machines = await this.vendingMachineRepository.find({
      relations: ["statuses"],
    });

    for (const machine of machines) {
      const needsMaintenance = this.checkMaintenanceNeeded(machine);

      if (needsMaintenance) {
        await this.maintenanceService.createMaintenanceRequest({
          machineId: machine.id,
          requestDate: new Date(),
        });
      }
    }
  }

  private checkMaintenanceNeeded(machine: VendingMachine): boolean {
    const lastStatus = machine.statuses[machine.statuses.length - 1];

    if (
      lastStatus.status === DeviceStatusEnum.OFFLINE ||
      lastStatus.status === DeviceStatusEnum.ERROR
    ) {
      return true;
    }

    const lastMaintenance = machine.statuses.find(
      (status) => status.status === DeviceStatusEnum.MAINTENANCE,
    );
    if (lastMaintenance) {
      const daysSinceLastMaintenance =
        (new Date().getTime() -
          new Date(lastMaintenance.created_at).getTime()) /
        (1000 * 3600 * 24);
      if (daysSinceLastMaintenance > 30) {
        return true;
      }
    }

    return false;
  }
}
