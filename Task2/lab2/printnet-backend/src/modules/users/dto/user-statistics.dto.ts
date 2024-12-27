import { ApiProperty } from "@nestjs/swagger";
import { UserRoleEnum } from "../entities/user-role.entity";

export class UserStatisticsDto {
  @ApiProperty()
  userId: string;

  @ApiProperty()
  email: string;

  @ApiProperty({ enum: UserRoleEnum, isArray: true })
  roles: UserRoleEnum[];

  @ApiProperty()
  totalOrders: number;

  @ApiProperty()
  activeWallets: number;

  @ApiProperty()
  registrationDate: Date;

  @ApiProperty()
  lastActivity: Date;

  @ApiProperty()
  isActive: boolean;
}
