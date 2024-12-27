import { IsString, IsObject } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class CreateVendingMachineDto {
  @ApiProperty()
  @IsString()
  serial_number: string;

  @ApiProperty()
  @IsString()
  location: string;

  @ApiProperty()
  @IsString()
  printer_model: string;

  @ApiProperty()
  @IsObject()
  configuration: Record<string, any>;
}
