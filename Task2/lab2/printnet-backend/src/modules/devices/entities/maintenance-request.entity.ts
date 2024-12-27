import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
} from "typeorm";
import { VendingMachine } from "./vending-machine.entity";

@Entity("maintenance_requests")
export class MaintenanceRequest {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @ManyToOne(() => VendingMachine, (machine) => machine.maintenance_requests)
  machine: VendingMachine;

  @Column()
  requestDate: Date;

  @CreateDateColumn()
  createdAt: Date;
}
