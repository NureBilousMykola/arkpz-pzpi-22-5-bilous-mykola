import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  UpdateDateColumn,
  ManyToOne,
} from "typeorm";
import { VendingMachine } from "./vending-machine.entity";

@Entity("printer_configs")
export class PrinterConfig {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @ManyToOne(() => VendingMachine, (machine) => machine.printer_configs)
  machine: VendingMachine;

  @Column()
  printer_model: string;

  @Column({ type: "jsonb" })
  configuration: Record<string, any>;

  @UpdateDateColumn()
  updated_at: Date;
}
