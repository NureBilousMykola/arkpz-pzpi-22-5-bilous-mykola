import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Payment, PaymentStatusEnum } from "../entities/payment.entity";
import { Wallet } from "../entities/wallet.entity";
import { CreatePaymentDto } from "../dto/create-payment.dto";
import { TopUpWalletDto } from "../dto/top-up-wallet.dto";
import { TransferFundsDto } from "../dto/transfer-funds.dto";

@Injectable()
export class PaymentsService {
  constructor(
    @InjectRepository(Payment)
    public paymentRepository: Repository<Payment>,
    @InjectRepository(Wallet)
    private walletRepository: Repository<Wallet>,
  ) {}

  // Методи для роботи з платежами
  async createPayment(
    createDto: CreatePaymentDto,
    user: any,
  ): Promise<Payment> {
    // Перевірка наявності достатньої суми на гаманці
    const wallet = await this.findUserWallet(user.id);
    if (wallet.balance < createDto.amount) {
      throw new BadRequestException("Недостатньо коштів на балансі");
    }

    const payment = this.paymentRepository.create({
      order: { id: createDto.order_id },
      user,
      payment_method: createDto.payment_method,
      amount: createDto.amount,
      status: PaymentStatusEnum.PENDING,
    });

    await this.paymentRepository.save(payment);

    // Блокуємо кошти на гаманці
    await this.updateWalletBalance(user.id, -payment.amount);

    return payment;
  }

  async confirmPayment(id: string): Promise<Payment> {
    const payment = await this.findPayment(id);

    if (payment.status !== PaymentStatusEnum.PENDING) {
      throw new ConflictException("Платіж вже оброблено");
    }

    payment.status = PaymentStatusEnum.COMPLETED;
    return await this.paymentRepository.save(payment);
  }

  async cancelPayment(id: string): Promise<Payment> {
    const payment = await this.findPayment(id);

    if (payment.status !== PaymentStatusEnum.PENDING) {
      throw new ConflictException("Платіж вже оброблено");
    }

    payment.status = PaymentStatusEnum.FAILED;
    await this.paymentRepository.save(payment);

    // Повертаємо кошти на гаманець
    await this.updateWalletBalance(payment.user.id, payment.amount);

    return payment;
  }

  // Методи для роботи з гаманцями
  async createWallet(user: any): Promise<Wallet> {
    const existingWallet = await this.walletRepository.findOne({
      where: { user: { id: user.id } },
    });

    if (existingWallet) {
      throw new ConflictException("Гаманець для цього користувача вже існує");
    }

    const wallet = this.walletRepository.create({
      user,
      balance: 0,
    });

    return await this.walletRepository.save(wallet);
  }

  async topUpWallet(userId: string, dto: TopUpWalletDto): Promise<Wallet> {
    if (dto.amount <= 0) {
      throw new BadRequestException("Сума поповнення має бути більше 0");
    }

    const wallet = await this.findUserWallet(userId);
    wallet.balance += dto.amount;
    wallet.last_transaction = new Date();

    return await this.walletRepository.save(wallet);
  }

  async transferFunds(userId: string, dto: TransferFundsDto): Promise<void> {
    const sourceWallet = await this.findUserWallet(userId);
    const targetWallet = await this.findUserWallet(dto.targetUserId);

    if (sourceWallet.balance < dto.amount) {
      throw new BadRequestException("Недостатньо коштів для переказу");
    }

    await this.updateWalletBalance(userId, -dto.amount);
    await this.updateWalletBalance(dto.targetUserId, dto.amount);
  }

  async getWalletBalance(userId: string): Promise<number> {
    const wallet = await this.findUserWallet(userId);
    return wallet.balance;
  }

  async getWalletTransactions(
    userId: string,
    startDate?: Date,
    endDate?: Date,
  ) {
    const queryBuilder = this.paymentRepository
      .createQueryBuilder("payment")
      .where("payment.user.id = :userId", { userId });

    if (startDate && endDate) {
      queryBuilder.andWhere(
        "payment.created_at BETWEEN :startDate AND :endDate",
        {
          startDate,
          endDate,
        },
      );
    }

    return await queryBuilder.orderBy("payment.created_at", "DESC").getMany();
  }

  // Службові методи
  private async findPayment(id: string): Promise<Payment> {
    const payment = await this.paymentRepository.findOne({
      where: { id },
      relations: ["user", "order"],
    });

    if (!payment) {
      throw new NotFoundException(`Платіж з ID "${id}" не знайдено`);
    }

    return payment;
  }

  private async findUserWallet(userId: string): Promise<Wallet> {
    const wallet = await this.walletRepository.findOne({
      where: { user: { id: userId } },
    });

    if (!wallet) {
      throw new NotFoundException(
        `Гаманець користувача з ID "${userId}" не знайдено`,
      );
    }

    return wallet;
  }

  async updateWalletBalance(userId: string, amount: number): Promise<void> {
    const wallet = await this.findUserWallet(userId);
    const newBalance = wallet.balance + amount;

    if (newBalance < 0) {
      throw new BadRequestException("Недостатньо коштів на балансі");
    }

    wallet.balance = newBalance;
    wallet.last_transaction = new Date();
    await this.walletRepository.save(wallet);
  }
}
