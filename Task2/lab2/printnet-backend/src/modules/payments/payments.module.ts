import { Module } from "@nestjs/common";
import { PaymentsService } from "./services/payments.service";
import { PaymentsController } from "./controllers/payments.controller";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Payment } from "./entities/payment.entity";
import { Wallet } from "./entities/wallet.entity";

@Module({
  imports: [TypeOrmModule.forFeature([Payment, Wallet])],
  controllers: [PaymentsController],
  providers: [PaymentsService],
  exports: [PaymentsService],
})
export class PaymentsModule {}
