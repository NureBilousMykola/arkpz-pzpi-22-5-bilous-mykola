import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
} from "typeorm";
import { Order } from "./order.entity";

export enum OrderStatusEnum {
  CREATED = "created",
  PENDING = "pending",
  PAID = "paid",
  PRINTING = "printing",
  COMPLETED = "completed",
  CANCELLED = "cancelled",
  FAILED = "failed",
}

@Entity("order_statuses")
export class OrderStatus {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @ManyToOne(() => Order, (order) => order.statuses)
  order: Order;

  @Column({ type: "enum", enum: OrderStatusEnum })
  status: OrderStatusEnum;

  @Column({ type: "text", nullable: true })
  description: string;

  @CreateDateColumn()
  created_at: Date;
}
