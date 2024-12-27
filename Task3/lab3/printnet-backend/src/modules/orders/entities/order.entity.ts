import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
} from "typeorm";
import { User } from "../../users/entities/user.entity";
import { VendingMachine } from "../../devices/entities/vending-machine.entity";
import { OrderStatus } from "./order-status.entity";
import { Payment } from "../../payments/entities/payment.entity";

@Entity("orders")
export class Order {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @ManyToOne(() => User, (user) => user.orders)
  user: User;

  @ManyToOne(() => VendingMachine, (machine) => machine.orders)
  machine: VendingMachine;

  @Column()
  model_file_url: string;

  @Column({ type: "jsonb" })
  print_settings: Record<string, any>;

  @Column({ type: "decimal", precision: 10, scale: 2 })
  cost: number;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @OneToMany(() => OrderStatus, (status) => status.order)
  statuses: OrderStatus[];

  @OneToMany(() => Payment, (payment) => payment.order)
  payments: Payment[];
}
