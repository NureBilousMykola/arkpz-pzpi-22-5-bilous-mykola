import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { UsersController } from "./controllers/users.controller";
import { UsersService } from "./services/users.service";
import { User } from "./entities/user.entity";
import { UserRole } from "./entities/user-role.entity";

@Module({
  imports: [TypeOrmModule.forFeature([User, UserRole])],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService, TypeOrmModule],
})
export class UsersModule {}
