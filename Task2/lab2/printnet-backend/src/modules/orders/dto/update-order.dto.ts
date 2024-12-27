import { IsString, IsObject, IsNumber, IsOptional } from "class-validator";
import { ApiPropertyOptional } from "@nestjs/swagger";

export class UpdateOrderDto {
  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  model_file_url?: string;

  @ApiPropertyOptional()
  @IsObject()
  @IsOptional()
  print_settings?: Record<string, any>;

  @ApiPropertyOptional()
  @IsNumber()
  @IsOptional()
  cost?: number;
}
