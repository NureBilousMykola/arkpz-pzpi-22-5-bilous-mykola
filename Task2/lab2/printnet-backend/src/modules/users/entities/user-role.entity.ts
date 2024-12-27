import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
} from "typeorm";
import { User } from "./user.entity";

export enum UserRoleEnum {
  CLIENT = "client",
  ADMIN = "admin",
}

@Entity("user_roles")
export class UserRole {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ type: "enum", enum: UserRoleEnum })
  role: UserRoleEnum;

  @ManyToOne(() => User, (user) => user.roles)
  user: User;

  @CreateDateColumn()
  created_at: Date;
}
