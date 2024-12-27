import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { VendingMachine } from "./entities/vending-machine.entity";
import { PrinterConfig } from "./entities/printer-config.entity";
import { DeviceStatus } from "./entities/device-status.entity";
import { VendingMachinesService } from "./services/vending-machines.service";
import { VendingMachinesController } from "./controllers/vending-machines.controller";
import { MqttService } from "./services/mqtt/mqtt.service";

@Module({
  imports: [
    TypeOrmModule.forFeature([VendingMachine, PrinterConfig, DeviceStatus]),
  ],
  controllers: [VendingMachinesController],
  providers: [VendingMachinesService, MqttService],
  exports: [VendingMachinesService, MqttService],
})
export class VendingMachinesModule {}
