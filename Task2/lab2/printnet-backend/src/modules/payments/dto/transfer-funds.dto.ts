import { IsNumber, IsUUID, Min } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class TransferFundsDto {
  @ApiProperty({ description: "ID користувача-отримувача" })
  @IsUUID()
  targetUserId: string;

  @ApiProperty({ description: "Сума переказу" })
  @IsNumber()
  @Min(0)
  amount: number;
}
