import { Injectable, OnModuleInit } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { VendingMachine } from "../../devices/entities/vending-machine.entity";
import { DeviceStatus } from "../../devices/entities/device-status.entity";
import { EventEmitter2 } from "@nestjs/event-emitter";

@Injectable()
export class MonitoringService implements OnModuleInit {
  private readonly alertThresholds = {
    offlineTimeout: 300000, // 5 minutes in milliseconds
    maintenanceInterval: 7 * 24 * 60 * 60 * 1000, // 7 days in milliseconds
    lowMaterialThreshold: 20, // percentage
  };

  constructor(
    @InjectRepository(VendingMachine)
    private vendingMachineRepository: Repository<VendingMachine>,
    @InjectRepository(DeviceStatus)
    private deviceStatusRepository: Repository<DeviceStatus>,
    private eventEmitter: EventEmitter2,
  ) {}

  onModuleInit() {
    this.startMonitoring();
  }

  private startMonitoring() {
    setInterval(() => {
      this.checkMachinesStatus();
    }, 60000); // Перевірка кожну хвилину
  }

  async checkMachinesStatus() {
    const machines = await this.vendingMachineRepository.find({
      relations: ["statuses"],
    });

    for (const machine of machines) {
      await this.checkMachineStatus(machine);
    }
  }

  private async checkMachineStatus(machine: VendingMachine) {
    const latestStatus = machine.statuses[machine.statuses.length - 1];

    if (!latestStatus) {
      this.emitAlert("NO_STATUS", machine.id);
      return;
    }

    const now = new Date().getTime();
    const statusTime = new Date(latestStatus.created_at).getTime();

    // Перевірка офлайн статусу
    if (now - statusTime > this.alertThresholds.offlineTimeout) {
      this.emitAlert("OFFLINE", machine.id);
    }

    // Перевірка необхідності обслуговування
    if (this.checkMaintenanceRequired(machine)) {
      this.emitAlert("MAINTENANCE_REQUIRED", machine.id);
    }

    // Перевірка рівня матеріалів
    if (this.checkLowMaterials(latestStatus)) {
      this.emitAlert("LOW_MATERIALS", machine.id);
    }
  }

  private checkMaintenanceRequired(machine: VendingMachine): boolean {
    // Логіка перевірки необхідності обслуговування
    return false;
  }

  private checkLowMaterials(status: DeviceStatus): boolean {
    if (!status.telemetry || !status.telemetry.materials) {
      return false;
    }

    return Object.values(status.telemetry.materials).some(
      (level: number) => level < this.alertThresholds.lowMaterialThreshold,
    );
  }

  private emitAlert(type: string, machineId: string) {
    this.eventEmitter.emit("monitoring.alert", {
      type,
      machineId,
      timestamp: new Date(),
    });
  }

  async getSystemHealth() {
    const machines = await this.vendingMachineRepository.find({
      relations: ["statuses"],
    });

    return {
      totalMachines: machines.length,
      onlineMachines: machines.filter((m) => this.isMachineOnline(m)).length,
      alerts: await this.getActiveAlerts(),
      systemStatus: this.calculateSystemStatus(machines),
    };
  }

  private isMachineOnline(machine: VendingMachine): boolean {
    const latestStatus = machine.statuses[machine.statuses.length - 1];
    if (!latestStatus) return false;

    const statusTime = new Date(latestStatus.created_at).getTime();
    const now = new Date().getTime();

    return now - statusTime <= this.alertThresholds.offlineTimeout;
  }

  async getActiveAlerts() {
    const machines = await this.vendingMachineRepository.find({
      relations: ["statuses"],
    });

    const alerts = [];
    for (const machine of machines) {
      const latestStatus = machine.statuses[machine.statuses.length - 1];

      if (!this.isMachineOnline(machine)) {
        alerts.push({
          type: "OFFLINE",
          machineId: machine.id,
          timestamp: new Date(),
        });
      }

      if (this.checkMaintenanceRequired(machine)) {
        alerts.push({
          type: "MAINTENANCE_REQUIRED",
          machineId: machine.id,
          timestamp: new Date(),
        });
      }

      if (latestStatus && this.checkLowMaterials(latestStatus)) {
        alerts.push({
          type: "LOW_MATERIALS",
          machineId: machine.id,
          timestamp: new Date(),
        });
      }
    }

    return alerts;
  }

  private calculateSystemStatus(
    machines: VendingMachine[],
  ): "HEALTHY" | "WARNING" | "CRITICAL" {
    const onlineMachines = machines.filter((m) =>
      this.isMachineOnline(m),
    ).length;
    const totalMachines = machines.length;

    if (onlineMachines === totalMachines) {
      return "HEALTHY";
    } else if (onlineMachines >= totalMachines * 0.8) {
      return "WARNING";
    } else {
      return "CRITICAL";
    }
  }
}
