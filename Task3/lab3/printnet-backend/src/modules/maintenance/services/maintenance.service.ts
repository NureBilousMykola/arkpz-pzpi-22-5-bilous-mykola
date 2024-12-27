import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { MaintenanceRequest } from "../../devices/entities/maintenance-request.entity";
import { VendingMachine } from "../../devices/entities/vending-machine.entity";

@Injectable()
export class MaintenanceService {
  constructor(
    @InjectRepository(MaintenanceRequest)
    private maintenanceRequestRepository: Repository<MaintenanceRequest>,
    @InjectRepository(VendingMachine)
    private vendingMachineRepository: Repository<VendingMachine>,
  ) {}

  async createMaintenance() {
    return "Create maintenance";
  }

  async updateMaintenance() {
    return "Update maintenance";
  }

  async deleteMaintenance() {
    return "Delete maintenance";
  }

  async findAll() {
    return "Find all maintenance";
  }

  async findOne() {
    return "Find one maintenance";
  }

  async createMaintenanceRequest(param: {
    machineId: string;
    requestDate: Date;
  }) {
    const machine = await this.vendingMachineRepository.findOne({
      where: { id: param.machineId },
    });
    if (!machine) {
      throw new Error("Vending machine not found");
    }

    const maintenanceRequest = this.maintenanceRequestRepository.create({
      machine,
      requestDate: param.requestDate,
    });

    await this.maintenanceRequestRepository.save(maintenanceRequest);
    return maintenanceRequest;
  }
}
