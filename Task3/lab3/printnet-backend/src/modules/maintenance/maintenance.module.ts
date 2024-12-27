import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { MaintenanceService } from "./services/maintenance.service";
import { MaintenanceRequest } from "../devices/entities/maintenance-request.entity";
import { VendingMachine } from "../devices/entities/vending-machine.entity";

@Module({
  imports: [TypeOrmModule.forFeature([MaintenanceRequest, VendingMachine])],
  providers: [MaintenanceService],
  exports: [MaintenanceService],
})
export class MaintenanceModule {}
