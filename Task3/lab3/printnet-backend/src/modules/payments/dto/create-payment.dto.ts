import { IsString, IsNumber, IsUUID } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class CreatePaymentDto {
  @ApiProperty()
  @IsUUID()
  order_id: string;

  @ApiProperty()
  @IsString()
  payment_method: string;

  @ApiProperty()
  @IsNumber()
  amount: number;
}
