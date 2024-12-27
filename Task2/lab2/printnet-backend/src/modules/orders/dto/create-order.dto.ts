import { ApiProperty } from "@nestjs/swagger";
import { IsJSON, IsNumber, IsString } from "class-validator";

export class CreateOrderDto {
  @ApiProperty()
  @IsString()
  customer_id: string;

  @ApiProperty()
  @IsString()
  product_id: string;

  @ApiProperty()
  @IsNumber()
  quantity: number;

  @ApiProperty()
  @IsString()
  machine_id: string;

  @ApiProperty()
  @IsNumber()
  cost: number;

  @ApiProperty()
  @IsString()
  model_file_url: string;

  @ApiProperty()
  @IsJSON()
  print_settings: Record<string, any>;
}
