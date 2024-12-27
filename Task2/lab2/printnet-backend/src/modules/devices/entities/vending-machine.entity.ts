import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from "typeorm";
import { PrinterConfig } from "./printer-config.entity";
import { DeviceStatus } from "./device-status.entity";
import { Order } from "../../orders/entities/order.entity";
import { MaintenanceRequest } from "./maintenance-request.entity";

@Entity("vending_machines")
export class VendingMachine {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column()
  maintenance_required: boolean;

  @Column({ unique: true })
  serial_number: string;

  @Column()
  location: string;

  @Column({ default: true })
  is_active: boolean;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @OneToMany(() => PrinterConfig, (config) => config.machine)
  printer_configs: PrinterConfig[];

  @OneToMany(() => DeviceStatus, (status) => status.machine)
  statuses: DeviceStatus[];

  @OneToMany(() => Order, (order) => order.machine)
  orders: Order[];

  @OneToMany(() => MaintenanceRequest, (maintenance) => maintenance.machine)
  maintenance_requests: MaintenanceRequest[];
}
