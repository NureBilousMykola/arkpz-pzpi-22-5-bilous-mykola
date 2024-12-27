import { Module } from "@nestjs/common";
import { ScheduleModule } from "@nestjs/schedule";
import { TypeOrmModule } from "@nestjs/typeorm";
import { SchedulerService } from "./services/scheduler.service";
import { VendingMachine } from "../devices/entities/vending-machine.entity";
import { AdminModule } from "../admin/admin.module";
import { MonitoringModule } from "../monitoring/monitoring.module";
import { VendingMachinesModule } from "../devices/vending-machines.module";
import { NotificationsModule } from "../notifications/notifications.module";
import { MaintenanceModule } from "../maintenance/maintenance.module";

@Module({
  imports: [
    ScheduleModule.forRoot(),
    TypeOrmModule.forFeature([VendingMachine]),
    AdminModule,
    MonitoringModule,
    VendingMachinesModule,
    NotificationsModule,
    MaintenanceModule,
  ],
  providers: [SchedulerService],
  exports: [SchedulerService],
})
export class SchedulerModule {}
