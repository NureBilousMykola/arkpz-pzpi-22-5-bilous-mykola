import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { AdminController } from "./controllers/admin.controller";
import { AdminService } from "./services/admin.service";
import { VendingMachine } from "../devices/entities/vending-machine.entity";
import { Order } from "../orders/entities/order.entity";
import { User } from "../users/entities/user.entity";

@Module({
  imports: [TypeOrmModule.forFeature([VendingMachine, Order, User])],
  controllers: [AdminController],
  providers: [AdminService],
  exports: [AdminService],
})
export class AdminModule {}
