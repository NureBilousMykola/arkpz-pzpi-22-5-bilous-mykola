import { IsEnum, IsObject } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";
import { DeviceStatusEnum } from "../entities/device-status.entity";

export class UpdateStatusDto {
  @ApiProperty({ enum: DeviceStatusEnum })
  @IsEnum(DeviceStatusEnum)
  status: DeviceStatusEnum;

  @ApiProperty()
  @IsObject()
  telemetry: Record<string, any>;
}
