import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { VendingMachine } from "../../devices/entities/vending-machine.entity";
import { Order } from "../../orders/entities/order.entity";
import { User } from "../../users/entities/user.entity";
import {
  MachineMetrics,
  SystemMetrics,
} from "../interfaces/dashboard.interface";
import { Report, ReportFilters } from "../interfaces/reports.interface";
import { OrderStatusEnum } from "../../orders/entities/order-status.entity";

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(VendingMachine)
    private vendingMachineRepository: Repository<VendingMachine>,
    @InjectRepository(Order)
    private orderRepository: Repository<Order>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async getDashboardMetrics(): Promise<SystemMetrics> {
    const [
      totalUsers,
      activeUsers,
      totalOrders,
      pendingOrders,
      totalRevenue,
      activeMachines,
      maintenanceRequired,
    ] = await Promise.all([
      this.userRepository.count(),
      this.userRepository.count({ where: { is_active: true } }),
      this.orderRepository.count(),
      this.orderRepository.count({
        where: { statuses: { status: OrderStatusEnum.PENDING } },
      }),
      this.calculateTotalRevenue(),
      this.vendingMachineRepository.count({ where: { is_active: true } }),
      this.getMaintenanceRequiredCount(),
    ]);

    return {
      totalUsers,
      activeUsers,
      totalOrders,
      pendingOrders,
      totalRevenue,
      activeMachines,
      maintenanceRequired,
    };
  }

  async getMachineMetrics(): Promise<MachineMetrics[]> {
    const machines = await this.vendingMachineRepository.find({
      relations: ["orders", "statuses"],
    });

    return machines.map((machine) => ({
      id: machine.id,
      serialNumber: machine.serial_number,
      location: machine.location,
      status:
        machine.statuses[machine.statuses.length - 1]?.status || "unknown",
      lastMaintenance: this.getLastMaintenance(machine),
      totalOrders: machine.orders?.length || 0,
      revenue: this.calculateMachineRevenue(machine),
      uptime: this.calculateMachineUptime(machine),
    }));
  }

  async generateReport(filters: ReportFilters): Promise<Report> {
    const queryBuilder = this.orderRepository.createQueryBuilder("order");

    queryBuilder
      .leftJoinAndSelect("order.machine", "machine")
      .leftJoinAndSelect("order.user", "user")
      .where("order.created_at BETWEEN :startDate AND :endDate", {
        startDate: filters.startDate,
        endDate: filters.endDate,
      });

    if (filters.machineId) {
      queryBuilder.andWhere("machine.id = :machineId", {
        machineId: filters.machineId,
      });
    }

    const orders = await queryBuilder.getMany();

    const reportData = this.processReportData(orders, filters.reportType);

    return {
      id: crypto.randomUUID(),
      type: filters.reportType,
      generatedAt: new Date(),
      periodStart: filters.startDate,
      periodEnd: filters.endDate,
      data: reportData,
      format: "JSON",
    };
  }

  private async calculateTotalRevenue(): Promise<number> {
    const result = await this.orderRepository
      .createQueryBuilder("order")
      .select("SUM(order.cost)", "total")
      .getRawOne();
    return result.total || 0;
  }

  private async getMaintenanceRequiredCount(): Promise<number> {
    const count = await this.vendingMachineRepository.count({
      where: { maintenance_required: true },
    });
    return count;
  }

  private getLastMaintenance(machine: VendingMachine): Date {
    const lastMaintenance = machine.maintenance_requests?.sort(
      (a, b) => b.requestDate.getTime() - a.requestDate.getTime(),
    )[0]?.requestDate;
    return lastMaintenance || new Date();
  }

  private calculateMachineUptime(machine: VendingMachine): number {
    const totalUptime = machine.statuses
      ?.filter((status) => status.status === "online")
      .reduce((sum, status) => sum + status.duration, 0);
    return totalUptime || 0;
  }

  private processReportData(orders: Order[], reportType: string): any {
    switch (reportType) {
      case "daily":
        return this.processDailyReport(orders);
      case "monthly":
        return this.processMonthlyReport(orders);
      default:
        return orders;
    }
  }

  private processDailyReport(orders: Order[]): any {
    return orders;
  }

  private processMonthlyReport(orders: Order[]): any {
    return orders;
  }

  private calculateMachineRevenue(machine: VendingMachine): number {
    return (
      machine.orders?.reduce((sum, order) => sum + Number(order.cost), 0) || 0
    );
  }

  async getMachinesRequiringMaintenance() {
    return Promise.resolve(undefined);
  }

  async getRecentOrders() {
    return [];
  }

  async getActiveAlerts() {
    return [];
  }
}
