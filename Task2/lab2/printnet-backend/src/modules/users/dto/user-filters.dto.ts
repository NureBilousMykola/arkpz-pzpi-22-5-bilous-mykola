import { IsBoolean, IsEnum, IsString, IsOptional } from "class-validator";
import { ApiPropertyOptional } from "@nestjs/swagger";
import { UserRoleEnum } from "../entities/user-role.entity";

export class UserFiltersDto {
  @ApiPropertyOptional()
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @ApiPropertyOptional({ enum: UserRoleEnum })
  @IsEnum(UserRoleEnum)
  @IsOptional()
  role?: UserRoleEnum;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  search?: string;
}
