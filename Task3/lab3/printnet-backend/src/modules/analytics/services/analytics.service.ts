import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, Between } from "typeorm";
import { Order } from "../../orders/entities/order.entity";
import { VendingMachine } from "../../devices/entities/vending-machine.entity";
import { Payment } from "../../payments/entities/payment.entity";

@Injectable()
export class AnalyticsService {
  constructor(
    @InjectRepository(Order)
    private orderRepository: Repository<Order>,
    @InjectRepository(VendingMachine)
    private machineRepository: Repository<VendingMachine>,
    @InjectRepository(Payment)
    private paymentRepository: Repository<Payment>,
  ) {}

  async getOrderAnalytics(startDate: Date, endDate: Date) {
    const orders = await this.orderRepository.find({
      where: {
        created_at: Between(startDate, endDate),
      },
      relations: ["machine", "user", "payments"],
    });

    return {
      totalOrders: orders.length,
      totalRevenue: orders.reduce((sum, order) => sum + Number(order.cost), 0),
      averageOrderValue:
        orders.length > 0
          ? orders.reduce((sum, order) => sum + Number(order.cost), 0) /
            orders.length
          : 0,
      ordersByStatus: this.groupOrdersByStatus(orders),
      ordersByMachine: this.groupOrdersByMachine(orders),
      peakOrderTimes: this.analyzePeakOrderTimes(orders),
    };
  }

  async getMachineAnalytics(startDate: Date, endDate: Date) {
    const machines = await this.machineRepository.find({
      relations: ["orders", "statuses"],
    });

    return machines.map((machine) => ({
      id: machine.id,
      serial_number: machine.serial_number,
      location: machine.location,
      metrics: {
        totalOrders: machine.orders?.length || 0,
        revenue:
          machine.orders?.reduce((sum, order) => sum + Number(order.cost), 0) ||
          0,
        utilization: this.calculateMachineUtilization(
          machine,
          startDate,
          endDate,
        ),
        maintenanceFrequency: this.calculateMaintenanceFrequency(machine),
        averageOrderTime: this.calculateAverageOrderTime(machine.orders || []),
      },
    }));
  }

  async getRevenueAnalytics(startDate: Date, endDate: Date) {
    const payments = await this.paymentRepository.find({
      where: {
        created_at: Between(startDate, endDate),
      },
      relations: ["order"],
    });

    return {
      totalRevenue: payments.reduce(
        (sum, payment) => sum + Number(payment.amount),
        0,
      ),
      revenueByDay: this.groupRevenueByDay(payments),
      revenueByPaymentMethod: this.groupRevenueByPaymentMethod(payments),
      projectedRevenue: await this.calculateProjectedRevenue(payments),
    };
  }

  private groupOrdersByStatus(orders: Order[]) {
    const statusGroups = {};
    orders.forEach((order) => {
      const latestStatus =
        order.statuses?.[order.statuses.length - 1]?.status || "unknown";
      statusGroups[latestStatus] = (statusGroups[latestStatus] || 0) + 1;
    });
    return statusGroups;
  }

  private groupOrdersByMachine(orders: Order[]) {
    const machineGroups = {};
    orders.forEach((order) => {
      const machineId = order.machine?.id || "unknown";
      machineGroups[machineId] = (machineGroups[machineId] || 0) + 1;
    });
    return machineGroups;
  }

  private analyzePeakOrderTimes(orders: Order[]) {
    const hourlyDistribution = new Array(24).fill(0);
    orders.forEach((order) => {
      const hour = new Date(order.created_at).getHours();
      hourlyDistribution[hour]++;
    });
    return hourlyDistribution;
  }

  private calculateMachineUtilization(
    machine: VendingMachine,
    startDate: Date,
    endDate: Date,
  ): number {
    // Розрахунок використання машини на основі часу роботи
    return 0;
  }

  private calculateMaintenanceFrequency(machine: VendingMachine): number {
    // Розрахунок частоти обслуговування
    return 0;
  }

  private calculateAverageOrderTime(orders: Order[]): number {
    if (orders.length === 0) return 0;
    // Розрахунок середнього часу виконання замовлення
    return 0;
  }

  private groupRevenueByDay(payments: Payment[]) {
    const dailyRevenue = {};
    payments.forEach((payment) => {
      const date = payment.created_at.toISOString().split("T")[0];
      dailyRevenue[date] = (dailyRevenue[date] || 0) + Number(payment.amount);
    });
    return dailyRevenue;
  }

  private groupRevenueByPaymentMethod(payments: Payment[]) {
    const methodRevenue = {};
    payments.forEach((payment) => {
      methodRevenue[payment.payment_method] =
        (methodRevenue[payment.payment_method] || 0) + Number(payment.amount);
    });
    return methodRevenue;
  }

  private async calculateProjectedRevenue(
    payments: Payment[],
  ): Promise<number> {
    // Розрахунок прогнозованого доходу на основі історичних даних
    return 0;
  }
}
