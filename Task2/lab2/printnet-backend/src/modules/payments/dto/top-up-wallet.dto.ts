import { IsNumber, Min } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class TopUpWalletDto {
  @ApiProperty({ description: "Сума поповнення" })
  @IsNumber()
  @Min(0)
  amount: number;
}
