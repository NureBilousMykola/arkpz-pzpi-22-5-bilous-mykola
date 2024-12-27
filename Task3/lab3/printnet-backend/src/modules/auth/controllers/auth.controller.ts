import { Controller, Post, Body, UnauthorizedException } from "@nestjs/common";
import { AuthService } from "../services/auth.service";
import { ApiTags, ApiOperation, ApiBody } from "@nestjs/swagger";
import { CreateUserDto } from "@/modules/users/dto/create-user.dto";
import { UsersService } from "@/modules/users/services/users.service";

@ApiTags("auth")
@Controller("auth")
export class AuthController {
  constructor(
    private authService: AuthService,
    private usersService: UsersService,
  ) {}

  @Post("login")
  @ApiOperation({ summary: "User login" })
  @ApiBody({
    schema: {
      type: "object",
      properties: {
        email: { type: "string", example: "user@example.com" },
        password: { type: "string", example: "password123" },
      },
    },
  })
  async login(@Body() loginDto: { email: string; password: string }) {
    const user = await this.authService.validateUser(
      loginDto.email,
      loginDto.password,
    );
    if (!user) {
      throw new UnauthorizedException("Invalid credentials");
    }
    return this.authService.login(user);
  }

  @Post()
  @ApiOperation({ summary: "Create a new user" })
  @ApiBody({
    type: CreateUserDto,
    examples: {
      example1: {
        summary: "Example user",
        value: {
          email: "newuser@example.com",
          password: "newpassword123",
          firstName: "John",
          lastName: "Doe",
        },
      },
    },
  })
  async create(@Body() createDto: CreateUserDto) {
    return await this.usersService.create(createDto);
  }
}
