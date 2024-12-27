import { ApiProperty } from "@nestjs/swagger";

export class WalletStatisticsDto {
  @ApiProperty()
  currentBalance: number;

  @ApiProperty()
  totalIncome: number;

  @ApiProperty()
  totalExpenses: number;

  @ApiProperty()
  lastTransaction: Date;

  @ApiProperty()
  transactionsCount: number;
}
