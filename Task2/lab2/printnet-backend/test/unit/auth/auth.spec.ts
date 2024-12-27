import { Test, TestingModule } from "@nestjs/testing";
import { AuthService } from "../../../src/modules/auth/services/auth.service";
import { JwtService } from "@nestjs/jwt";
import { UsersService } from "../../../src/modules/users/services/users.service";
import * as bcrypt from "bcrypt";

describe("AuthService", () => {
  let service: AuthService;
  let usersService: UsersService;

  const mockUsersService = {
    findByEmail: jest.fn(),
  };

  const mockJwtService = {
    sign: jest.fn(() => "test-token"),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    usersService = module.get<UsersService>(UsersService);
  });

  describe("validateUser", () => {
    it("should return user object when credentials are valid", async () => {
      const testPassword = "testPassword";
      const hashedPassword = await bcrypt.hash(testPassword, 10);
      const testUser = {
        id: "1",
        email: "test@example.com",
        password_hash: hashedPassword,
        roles: [{ role: "user" }],
      };

      mockUsersService.findByEmail.mockResolvedValue(testUser);

      const result = await service.validateUser(
        "test@example.com",
        testPassword,
      );

      expect(result).toBeDefined();
      expect(result.password_hash).toBeUndefined();
      expect(result.email).toBe(testUser.email);
    });

    it("should return null when user is not found", async () => {
      mockUsersService.findByEmail.mockResolvedValue(null);

      const result = await service.validateUser(
        "nonexistent@example.com",
        "password",
      );

      expect(result).toBeNull();
    });

    it("should return null when password is invalid", async () => {
      const testUser = {
        email: "test@example.com",
        password_hash: await bcrypt.hash("correctPassword", 10),
      };

      mockUsersService.findByEmail.mockResolvedValue(testUser);

      const result = await service.validateUser(
        "test@example.com",
        "wrongPassword",
      );

      expect(result).toBeNull();
    });
  });

  describe("login", () => {
    it("should return JWT token when login is successful", async () => {
      const testUser = {
        id: "1",
        email: "test@example.com",
        roles: [{ role: "user" }],
      };

      const result = await service.login(testUser);

      expect(result.access_token).toBeDefined();
      expect(result.access_token).toBe("test-token");
      expect(mockJwtService.sign).toHaveBeenCalled();
    });
  });
});
