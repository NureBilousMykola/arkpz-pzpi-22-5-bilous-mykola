import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Order } from "../entities/order.entity";
import { OrderStatus, OrderStatusEnum } from "../entities/order-status.entity";
import { CreateOrderDto } from "../dto/create-order.dto";
import { UpdateOrderDto } from "../dto/update-order.dto";
import { VendingMachinesService } from "../../devices/services/vending-machines.service";
import { PaymentsService } from "../../payments/services/payments.service";

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order)
    private orderRepository: Repository<Order>,
    @InjectRepository(OrderStatus)
    private orderStatusRepository: Repository<OrderStatus>,
    private vendingMachinesService: VendingMachinesService,
    private paymentsService: PaymentsService,
  ) {}

  async create(createDto: CreateOrderDto, user: any): Promise<Order> {
    // Перевірка наявності машини
    const machine = await this.vendingMachinesService.findOne(
      createDto.machine_id,
    );

    // Перевірка балансу користувача
    const userBalance = await this.paymentsService.getWalletBalance(user.id);
    if (userBalance < createDto.cost) {
      throw new BadRequestException("Недостатньо коштів на балансі");
    }

    const order = this.orderRepository.create({
      user,
      machine,
      model_file_url: createDto.model_file_url,
      print_settings: createDto.print_settings,
      cost: createDto.cost,
    });

    await this.orderRepository.save(order);

    // Створення початкового статусу замовлення
    await this.createOrderStatus(
      order.id,
      OrderStatusEnum.CREATED,
      "Замовлення створено",
    );

    return this.findOne(order.id);
  }

  async update(id: string, updateDto: UpdateOrderDto): Promise<Order> {
    const order = await this.findOne(id);

    // Перевірка можливості оновлення
    if (
      order.statuses.some((status) =>
        [OrderStatusEnum.COMPLETED, OrderStatusEnum.CANCELLED].includes(
          status.status,
        ),
      )
    ) {
      throw new BadRequestException(
        "Неможливо оновити завершене або скасоване замовлення",
      );
    }

    Object.assign(order, updateDto);
    await this.orderRepository.save(order);

    return this.findOne(id);
  }

  async cancel(id: string, reason: string): Promise<Order> {
    const order = await this.findOne(id);

    // Перевірка можливості скасування
    if (
      order.statuses.some((status) =>
        [OrderStatusEnum.COMPLETED, OrderStatusEnum.CANCELLED].includes(
          status.status,
        ),
      )
    ) {
      throw new BadRequestException(
        "Неможливо скасувати завершене або вже скасоване замовлення",
      );
    }

    await this.createOrderStatus(id, OrderStatusEnum.CANCELLED, reason);

    // Повернення коштів користувачу
    await this.paymentsService.updateWalletBalance(order.user.id, order.cost);

    return this.findOne(id);
  }

  async findAll(filters?: any): Promise<Order[]> {
    const queryBuilder = this.orderRepository
      .createQueryBuilder("order")
      .leftJoinAndSelect("order.user", "user")
      .leftJoinAndSelect("order.machine", "machine")
      .leftJoinAndSelect("order.statuses", "status")
      .leftJoinAndSelect("order.payments", "payment");

    if (filters?.userId) {
      queryBuilder.andWhere("user.id = :userId", { userId: filters.userId });
    }

    if (filters?.machineId) {
      queryBuilder.andWhere("machine.id = :machineId", {
        machineId: filters.machineId,
      });
    }

    if (filters?.status) {
      queryBuilder.andWhere((qb) => {
        const subQuery = qb
          .subQuery()
          .select("s2.order_id")
          .from(OrderStatus, "s2")
          .where("s2.status = :status", { status: filters.status })
          .getQuery();
        return "order.id IN " + subQuery;
      });
    }

    if (filters?.dateFrom) {
      queryBuilder.andWhere("order.created_at >= :dateFrom", {
        dateFrom: filters.dateFrom,
      });
    }

    if (filters?.dateTo) {
      queryBuilder.andWhere("order.created_at <= :dateTo", {
        dateTo: filters.dateTo,
      });
    }

    return await queryBuilder.getMany();
  }

  async findOne(id: string): Promise<Order> {
    const order = await this.orderRepository.findOne({
      where: { id },
      relations: ["user", "machine", "statuses", "payments"],
    });

    if (!order) {
      throw new NotFoundException(`Замовлення з ID "${id}" не знайдено`);
    }

    return order;
  }

  async createOrderStatus(
    orderId: string,
    status: OrderStatusEnum,
    description?: string,
  ): Promise<OrderStatus> {
    const order = await this.findOne(orderId);

    const orderStatus = this.orderStatusRepository.create({
      order,
      status,
      description,
    });

    return await this.orderStatusRepository.save(orderStatus);
  }

  async getOrderStatistics(orderId: string) {
    const order = await this.findOne(orderId);
    const statuses = order.statuses.sort(
      (a, b) => a.created_at.getTime() - b.created_at.getTime(),
    );

    return {
      id: order.id,
      totalCost: order.cost,
      processingTime: this.calculateProcessingTime(statuses),
      statusHistory: statuses.map((status) => ({
        status: status.status,
        timestamp: status.created_at,
        description: status.description,
      })),
      currentStatus: statuses[statuses.length - 1]?.status,
    };
  }

  private calculateProcessingTime(statuses: OrderStatus[]): number {
    const startStatus = statuses.find(
      (s) => s.status === OrderStatusEnum.CREATED,
    );
    const endStatus = statuses.find((s) =>
      [OrderStatusEnum.COMPLETED, OrderStatusEnum.CANCELLED].includes(s.status),
    );

    if (!startStatus || !endStatus) return 0;

    return endStatus.created_at.getTime() - startStatus.created_at.getTime();
  }
}
