import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
} from "typeorm";
import { User } from "../../users/entities/user.entity";
import { Order } from "../../orders/entities/order.entity";

export enum PaymentStatusEnum {
  PENDING = "pending",
  COMPLETED = "completed",
  FAILED = "failed",
}

@Entity("payments")
export class Payment {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @ManyToOne(() => Order, (order) => order.payments)
  order: Order;

  @ManyToOne(() => User)
  user: User;

  @Column()
  payment_method: string;

  @Column({ type: "decimal", precision: 10, scale: 2 })
  amount: number;

  @Column({ type: "enum", enum: PaymentStatusEnum })
  status: PaymentStatusEnum;

  @CreateDateColumn()
  created_at: Date;
}
