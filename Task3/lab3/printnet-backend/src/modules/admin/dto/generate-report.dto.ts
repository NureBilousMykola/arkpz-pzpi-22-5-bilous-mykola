import { IsEnum, IsDate, IsOptional, IsUUID } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";
import { ReportType } from "../interfaces/reports.interface";

export class GenerateReportDto {
  @ApiProperty()
  @IsDate()
  startDate: Date;

  @ApiProperty()
  @IsDate()
  endDate: Date;

  @ApiProperty({ enum: ReportType })
  @IsEnum(ReportType)
  reportType: ReportType;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsUUID()
  machineId?: string;
}
