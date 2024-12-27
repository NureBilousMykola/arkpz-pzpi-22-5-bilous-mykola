import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  ForbiddenException,
} from "@nestjs/common";
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiBody,
  ApiQuery,
} from "@nestjs/swagger";
import { UsersService } from "../services/users.service";
import { UpdateUserDto } from "../dto/update-user.dto";
import { UserFiltersDto } from "../dto/user-filters.dto";
import { ChangePasswordDto } from "../dto/change-password.dto";
import { JwtAuthGuard } from "../../../core/guards/jwt-auth.guard";
import { RolesGuard } from "../../../core/guards/roles.guard";
import { Roles } from "../../../core/decorators/roles.decorator";
import { User } from "../../../core/decorators/user.decorator";
import { UserRoleEnum } from "../entities/user-role.entity";

@ApiTags("users")
@Controller("users")
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @Roles("admin")
  @ApiOperation({ summary: "Get a list of users" })
  @ApiQuery({
    name: "role",
    required: false,
    type: String,
    example: "user",
  })
  async findAll(@Query() filters: UserFiltersDto) {
    return await this.usersService.findAll(filters);
  }

  @Get("profile")
  @ApiOperation({ summary: "Get the current user's profile" })
  async getProfile(@User() user) {
    return await this.usersService.findOne(user.id);
  }

  @Get(":id")
  @Roles("admin")
  @ApiOperation({ summary: "Get user information" })
  async findOne(@Param("id") id: string) {
    return await this.usersService.findOne(id);
  }

  @Put(":id")
  @ApiOperation({ summary: "Update user information" })
  @ApiBody({
    type: UpdateUserDto,
    examples: {
      example1: {
        summary: "Example update",
        value: {
          name: "John Doe",
          email: "john.doe@example.com",
        },
      },
    },
  })
  async update(
    @Param("id") id: string,
    @Body() updateDto: UpdateUserDto,
    @User() user,
  ) {
    if (user.id !== id && !user.roles.includes("admin")) {
      throw new ForbiddenException("You do not have access to this operation");
    }
    return await this.usersService.update(id, updateDto);
  }

  @Delete(":id")
  @Roles("admin")
  @ApiOperation({ summary: "Deactivate a user" })
  async deactivate(@Param("id") id: string) {
    await this.usersService.deactivate(id);
    return { message: "User deactivated" };
  }

  @Post(":id/activate")
  @Roles("admin")
  @ApiOperation({ summary: "Activate a user" })
  async activate(@Param("id") id: string) {
    return await this.usersService.activate(id);
  }

  @Post(":id/roles")
  @Roles("admin")
  @ApiOperation({ summary: "Assign a role to a user" })
  @ApiBody({
    schema: {
      type: "object",
      properties: {
        role: {
          type: "string",
          enum: Object.values(UserRoleEnum),
          example: "admin",
        },
      },
    },
  })
  async assignRole(@Param("id") id: string, @Body("role") role: UserRoleEnum) {
    await this.usersService.assignRole(id, role);
    return { message: "Role assigned successfully" };
  }

  @Delete(":id/roles/:role")
  @Roles("admin")
  @ApiOperation({ summary: "Remove a user's role" })
  async removeRole(@Param("id") id: string, @Param("role") role: UserRoleEnum) {
    await this.usersService.removeRole(id, role);
    return { message: "Role removed successfully" };
  }

  @Post("change-password")
  @ApiOperation({ summary: "Change password" })
  @ApiBody({
    type: ChangePasswordDto,
    examples: {
      example1: {
        summary: "Example change password",
        value: {
          oldPassword: "oldPassword123",
          newPassword: "newPassword123",
        },
      },
    },
  })
  async changePassword(
    @User() user,
    @Body() changePasswordDto: ChangePasswordDto,
  ) {
    await this.usersService.changePassword(
      user.id,
      changePasswordDto.oldPassword,
      changePasswordDto.newPassword,
    );
    return { message: "Password changed successfully" };
  }

  @Get(":id/statistics")
  @ApiOperation({ summary: "Get user statistics" })
  async getUserStatistics(@Param("id") id: string, @User() user) {
    if (user.id !== id && !user.roles.includes("admin")) {
      throw new ForbiddenException("You do not have access to this operation");
    }
    return await this.usersService.getUserStatistics(id);
  }
}
