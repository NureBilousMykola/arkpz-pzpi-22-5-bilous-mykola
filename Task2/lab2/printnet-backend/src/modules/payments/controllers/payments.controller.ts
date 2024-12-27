import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
} from "@nestjs/common";
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiBody,
  ApiQuery,
} from "@nestjs/swagger";
import { PaymentsService } from "../services/payments.service";
import { CreatePaymentDto } from "../dto/create-payment.dto";
import { TopUpWalletDto } from "../dto/top-up-wallet.dto";
import { TransferFundsDto } from "../dto/transfer-funds.dto";
import { TransactionFiltersDto } from "../dto/transaction-filters.dto";
import { JwtAuthGuard } from "@/core/guards/jwt-auth.guard";
import { RolesGuard } from "@/core/guards/roles.guard";
import { Roles } from "@/core/decorators/roles.decorator";
import { User } from "@/core/decorators/user.decorator";

@ApiTags("payments")
@Controller("payments")
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post()
  @ApiOperation({ summary: "Create a new payment" })
  @ApiBody({
    type: CreatePaymentDto,
    examples: {
      example1: {
        summary: "Example payment",
        value: {
          amount: 100,
          currency: "USD",
          method: "credit_card",
        },
      },
    },
  })
  async createPayment(@Body() createDto: CreatePaymentDto, @User() user) {
    return await this.paymentsService.createPayment(createDto, user);
  }

  @Post(":id/confirm")
  @Roles("admin")
  @ApiOperation({ summary: "Confirm a payment" })
  async confirmPayment(@Param("id") id: string) {
    return await this.paymentsService.confirmPayment(id);
  }

  @Post(":id/cancel")
  @ApiOperation({ summary: "Cancel a payment" })
  @ApiBody({
    schema: {
      type: "object",
      properties: {
        reason: { type: "string", example: "User requested cancellation" },
      },
    },
  })
  async cancelPayment(
    @Param("id") id: string,
    @Body("reason") reason: string,
    @User() user,
  ) {
    return await this.paymentsService.cancelPayment(id);
  }

  @Post("wallet/create")
  @ApiOperation({ summary: "Create a wallet" })
  async createWallet(@User() user) {
    return await this.paymentsService.createWallet(user);
  }

  @Post("wallet/top-up")
  @ApiOperation({ summary: "Top up wallet" })
  @ApiBody({
    type: TopUpWalletDto,
    examples: {
      example1: {
        summary: "Example top-up",
        value: {
          amount: 50,
          currency: "USD",
        },
      },
    },
  })
  async topUpWallet(@Body() dto: TopUpWalletDto, @User() user) {
    return await this.paymentsService.topUpWallet(user.id, dto);
  }

  @Post("wallet/transfer")
  @ApiOperation({ summary: "Transfer funds to another user" })
  @ApiBody({
    type: TransferFundsDto,
    examples: {
      example1: {
        summary: "Example transfer",
        value: {
          recipientId: "user123",
          amount: 20,
          currency: "USD",
        },
      },
    },
  })
  async transferFunds(@Body() dto: TransferFundsDto, @User() user) {
    return await this.paymentsService.transferFunds(user.id, dto);
  }

  @Get("wallet/balance")
  @ApiOperation({ summary: "Get wallet balance" })
  async getWalletBalance(@User() user) {
    return {
      balance: await this.paymentsService.getWalletBalance(user.id),
    };
  }

  @Get("wallet/transactions")
  @ApiOperation({ summary: "Get transaction history" })
  @ApiQuery({
    name: "startDate",
    required: false,
    type: String,
    example: "2024-01-01",
  })
  @ApiQuery({
    name: "endDate",
    required: false,
    type: String,
    example: "2024-01-31",
  })
  async getTransactions(@User() user, @Query() filters: TransactionFiltersDto) {
    return await this.paymentsService.getWalletTransactions(
      user.id,
      filters.startDate ? new Date(filters.startDate) : undefined,
      filters.endDate ? new Date(filters.endDate) : undefined,
    );
  }

  @Get("admin/transactions")
  @Roles("admin")
  @ApiOperation({ summary: "Get all transactions (admin)" })
  @ApiQuery({
    name: "startDate",
    required: false,
    type: String,
    example: "2024-01-01",
  })
  @ApiQuery({
    name: "endDate",
    required: false,
    type: String,
    example: "2024-01-31",
  })
  async getAllTransactions(@Query() filters: TransactionFiltersDto) {
    const queryBuilder =
      this.paymentsService.paymentRepository.createQueryBuilder("payment");

    if (filters.startDate && filters.endDate) {
      queryBuilder.andWhere(
        "payment.created_at BETWEEN :startDate AND :endDate",
        {
          startDate: new Date(filters.startDate),
          endDate: new Date(filters.endDate),
        },
      );
    }

    return await queryBuilder.orderBy("payment.created_at", "DESC").getMany();
  }

  @Get("admin/statistics")
  @Roles("admin")
  @ApiOperation({ summary: "Get payment statistics (admin)" })
  async getPaymentStatistics() {
    const totalPayments = await this.paymentsService.paymentRepository.count();
    const totalAmount = await this.paymentsService.paymentRepository
      .createQueryBuilder("payment")
      .select("SUM(payment.amount)", "sum")
      .getRawOne();

    return {
      totalPayments,
      totalAmount: totalAmount.sum,
    };
  }
}
