import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { EventEmitterModule } from "@nestjs/event-emitter";
import { MonitoringService } from "./services/monitoring.service";
import { MonitoringController } from "./controllers/monitoring.controller";
import { VendingMachine } from "../devices/entities/vending-machine.entity";
import { DeviceStatus } from "../devices/entities/device-status.entity";

@Module({
  imports: [
    TypeOrmModule.forFeature([VendingMachine, DeviceStatus]),
    EventEmitterModule.forRoot(),
  ],
  controllers: [MonitoringController],
  providers: [MonitoringService],
  exports: [MonitoringService],
})
export class MonitoringModule {}
