import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
} from "typeorm";
import { VendingMachine } from "./vending-machine.entity";

export enum DeviceStatusEnum {
  ONLINE = "online",
  OFFLINE = "offline",
  MAINTENANCE = "maintenance",
  ERROR = "error",
}

@Entity("device_statuses")
export class DeviceStatus {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @ManyToOne(() => VendingMachine, (machine) => machine.statuses)
  machine: VendingMachine;

  @Column({ type: "enum", enum: DeviceStatusEnum })
  status: DeviceStatusEnum;

  @Column()
  duration: number;

  @Column({ type: "jsonb" })
  telemetry: Record<string, any>;

  @CreateDateColumn()
  created_at: Date;
}
