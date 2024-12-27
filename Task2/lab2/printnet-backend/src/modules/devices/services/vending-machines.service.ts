import {
  Injectable,
  NotFoundException,
  ConflictException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { VendingMachine } from "../entities/vending-machine.entity";
import {
  DeviceStatus,
  DeviceStatusEnum,
} from "../entities/device-status.entity";
import { PrinterConfig } from "../entities/printer-config.entity";
import { CreateVendingMachineDto } from "../dto/create-vending-machine.dto";
import { UpdateVendingMachineDto } from "../dto/update-vending-machine.dto";

@Injectable()
export class VendingMachinesService {
  constructor(
    @InjectRepository(VendingMachine)
    private vendingMachineRepository: Repository<VendingMachine>,
    @InjectRepository(DeviceStatus)
    private deviceStatusRepository: Repository<DeviceStatus>,
    @InjectRepository(PrinterConfig)
    private printerConfigRepository: Repository<PrinterConfig>,
  ) {}

  async create(createDto: CreateVendingMachineDto): Promise<VendingMachine> {
    // Перевірка на унікальність серійного номера
    const existing = await this.vendingMachineRepository.findOne({
      where: { serial_number: createDto.serial_number },
    });

    if (existing) {
      throw new ConflictException("Машина з таким серійним номером вже існує");
    }

    const machine = this.vendingMachineRepository.create({
      serial_number: createDto.serial_number,
      location: createDto.location,
      is_active: true,
    });

    await this.vendingMachineRepository.save(machine);

    // Створення початкової конфігурації принтера
    const configData = {
      machine,
      printer_model: createDto.printer_model,
      configuration: createDto.configuration,
    };

    const config = this.printerConfigRepository.create(configData);
    await this.printerConfigRepository.save(config);

    // Створення початкового статусу
    const statusData = {
      machine,
      status: DeviceStatusEnum.OFFLINE,
      telemetry: {},
    };

    const status = this.deviceStatusRepository.create(statusData);
    await this.deviceStatusRepository.save(status);

    return this.findOne(machine.id);
  }

  async update(
    id: string,
    updateDto: UpdateVendingMachineDto,
  ): Promise<VendingMachine> {
    const machine = await this.findOne(id);

    // Перевірка на унікальність серійного номера при зміні
    if (
      updateDto.serial_number &&
      updateDto.serial_number !== machine.serial_number
    ) {
      const existing = await this.vendingMachineRepository.findOne({
        where: { serial_number: updateDto.serial_number },
      });

      if (existing) {
        throw new ConflictException(
          "Машина з таким серійним номером вже існує",
        );
      }
    }

    Object.assign(machine, updateDto);
    await this.vendingMachineRepository.save(machine);

    // Оновлення конфігурації принтера якщо вона надана
    if (updateDto.printer_model || updateDto.configuration) {
      const config = await this.printerConfigRepository.findOne({
        where: { machine: { id } },
        order: { updated_at: "DESC" },
      });

      if (config) {
        Object.assign(config, {
          printer_model: updateDto.printer_model || config.printer_model,
          configuration: updateDto.configuration || config.configuration,
        });
        await this.printerConfigRepository.save(config);
      }
    }

    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    const machine = await this.findOne(id);
    machine.is_active = false;
    await this.vendingMachineRepository.save(machine);
  }

  async restore(id: string): Promise<VendingMachine> {
    const machine = await this.findOne(id);
    machine.is_active = true;
    return await this.vendingMachineRepository.save(machine);
  }

  async findAll(includeInactive: boolean = false): Promise<VendingMachine[]> {
    return await this.vendingMachineRepository.find({
      where: includeInactive ? {} : { is_active: true },
      relations: ["printer_configs", "statuses", "orders"],
      order: { created_at: "DESC" },
    });
  }

  async findOne(id: string): Promise<VendingMachine> {
    const machine = await this.vendingMachineRepository.findOne({
      where: { id },
      relations: ["printer_configs", "statuses", "orders"],
    });

    if (!machine) {
      throw new NotFoundException(`Вендингова машина з ID "${id}" не знайдена`);
    }

    return machine;
  }

  async updateStatus(
    id: string,
    status: DeviceStatusEnum,
    telemetry: any,
  ): Promise<DeviceStatus> {
    const machine = await this.findOne(id);

    const statusData = {
      machine,
      status,
      telemetry,
    };

    const deviceStatus = this.deviceStatusRepository.create(statusData);
    return await this.deviceStatusRepository.save(deviceStatus);
  }

  async getLatestStatus(id: string): Promise<DeviceStatus> {
    return await this.deviceStatusRepository.findOne({
      where: { machine: { id } },
      order: { created_at: "DESC" },
    });
  }

  async findByLocation(location: string): Promise<VendingMachine[]> {
    return await this.vendingMachineRepository.find({
      where: { location, is_active: true },
      relations: ["printer_configs", "statuses"],
    });
  }

  async getStatistics(id: string) {
    const machine = await this.findOne(id);
    const latestStatus = await this.getLatestStatus(id);

    return {
      id: machine.id,
      serial_number: machine.serial_number,
      location: machine.location,
      status: latestStatus?.status || DeviceStatusEnum.OFFLINE,
      total_orders: machine.orders?.length || 0,
      uptime_percentage: await this.calculateUptime(id),
      last_maintenance: await this.getLastMaintenance(id),
    };
  }

  private async calculateUptime(id: string): Promise<number> {
    const statuses = await this.deviceStatusRepository.find({
      where: { machine: { id } },
      order: { created_at: "ASC" },
    });

    if (statuses.length === 0) {
      return 0;
    }

    const totalDuration = statuses.reduce((acc, status, index) => {
      if (index === 0) return acc;
      const prevStatus = statuses[index - 1];
      const duration =
        (status.created_at.getTime() - prevStatus.created_at.getTime()) / 1000;
      if (prevStatus.status === DeviceStatusEnum.ONLINE) {
        return acc + duration;
      }
      return acc;
    }, 0);

    const totalTime =
      (statuses[statuses.length - 1].created_at.getTime() -
        statuses[0].created_at.getTime()) /
      1000;
    return (totalDuration / totalTime) * 100;
  }

  private async getLastMaintenance(id: string): Promise<Date | null> {
    const status = await this.deviceStatusRepository.findOne({
      where: { machine: { id }, status: DeviceStatusEnum.MAINTENANCE },
      order: { created_at: "DESC" },
    });

    return status ? status.created_at : null;
  }

  async updateTelemetry(deviceId: string, data: any): Promise<void> {
    const machine = await this.findOne(deviceId);

    const statusData = {
      machine,
      status: DeviceStatusEnum.ONLINE, // Assuming the status is online when telemetry is updated
      telemetry: data,
    };

    const deviceStatus = this.deviceStatusRepository.create(statusData);
    await this.deviceStatusRepository.save(deviceStatus);
  }
}
