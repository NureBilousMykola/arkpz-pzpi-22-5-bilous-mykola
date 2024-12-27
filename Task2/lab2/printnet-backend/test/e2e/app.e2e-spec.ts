import { Test, TestingModule } from "@nestjs/testing";
import { INestApplication, ValidationPipe } from "@nestjs/common";
import * as request from "supertest";
import { AppModule } from "../../src/app.module";
import { JwtService } from "@nestjs/jwt";
import { getRepositoryToken } from "@nestjs/typeorm";
import { User } from "../../src/modules/users/entities/user.entity";
import * as bcrypt from "bcrypt";

describe("API (e2e)", () => {
  let app: INestApplication;
  let jwtService: JwtService;
  let adminToken: string;
  let userToken: string;
  let testMachineId: string;
  let testOrderId: string;

  // Мок дані для тестів
  const testAdmin = {
    email: "admin@test.com",
    password: "admin123",
    roles: ["admin"],
  };

  const testUser = {
    email: "user@test.com",
    password: "user123",
    roles: ["client"],
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());

    jwtService = app.get<JwtService>(JwtService);

    // Створення тестових токенів
    adminToken = jwtService.sign({
      sub: "1",
      email: testAdmin.email,
      roles: testAdmin.roles,
    });

    userToken = jwtService.sign({
      sub: "2",
      email: testUser.email,
      roles: testUser.roles,
    });

    await app.init();
  });

  describe("Auth (e2e)", () => {
    it("/auth/login (POST) - should authenticate user", () => {
      return request(app.getHttpServer())
        .post("/auth/login")
        .send({
          email: testUser.email,
          password: testUser.password,
        })
        .expect(201)
        .expect((res) => {
          expect(res.body.access_token).toBeDefined();
        });
    });

    it("/auth/login (POST) - should fail with wrong credentials", () => {
      return request(app.getHttpServer())
        .post("/auth/login")
        .send({
          email: testUser.email,
          password: "wrongpassword",
        })
        .expect(401);
    });
  });

  describe("Vending Machines (e2e)", () => {
    it("/vending-machines (POST) - admin should create machine", () => {
      return request(app.getHttpServer())
        .post("/vending-machines")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          serial_number: "TEST001",
          location: "Test Location",
          printer_model: "Test Printer",
          configuration: {
            maxTemp: 200,
            bedSize: "200x200",
          },
        })
        .expect(201)
        .expect((res) => {
          expect(res.body.data.id).toBeDefined();
          testMachineId = res.body.data.id;
        });
    });

    it("/vending-machines (GET) - should get all machines", () => {
      return request(app.getHttpServer())
        .get("/vending-machines")
        .set("Authorization", `Bearer ${userToken}`)
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body.data)).toBeTruthy();
          expect(res.body.data.length).toBeGreaterThan(0);
        });
    });

    it("/vending-machines/:id/status (POST) - should update machine status", () => {
      return request(app.getHttpServer())
        .post(`/vending-machines/${testMachineId}/status`)
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          status: "online",
          telemetry: {
            temperature: 25,
            filamentRemaining: 80,
          },
        })
        .expect(200);
    });
  });

  describe("Orders (e2e)", () => {
    it("/orders (POST) - should create new order", () => {
      return request(app.getHttpServer())
        .post("/orders")
        .set("Authorization", `Bearer ${userToken}`)
        .send({
          machine_id: testMachineId,
          model_file_url: "https://example.com/model.stl",
          print_settings: {
            material: "PLA",
            quality: "high",
          },
          cost: 50,
        })
        .expect(201)
        .expect((res) => {
          expect(res.body.data.id).toBeDefined();
          testOrderId = res.body.data.id;
        });
    });

    it("/orders/:id (GET) - should get order details", () => {
      return request(app.getHttpServer())
        .get(`/orders/${testOrderId}`)
        .set("Authorization", `Bearer ${userToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.data.id).toBe(testOrderId);
        });
    });

    it("/orders/:id/status (POST) - admin should update order status", () => {
      return request(app.getHttpServer())
        .post(`/orders/${testOrderId}/status`)
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          status: "printing",
          description: "Order is being printed",
        })
        .expect(200);
    });
  });

  describe("Payments (e2e)", () => {
    it("/payments/wallet/balance (GET) - should get wallet balance", () => {
      return request(app.getHttpServer())
        .get("/payments/wallet/balance")
        .set("Authorization", `Bearer ${userToken}`)
        .expect(200)
        .expect((res) => {
          expect(typeof res.body.data.balance).toBe("number");
        });
    });

    it("/payments/wallet/top-up (POST) - should top up wallet", () => {
      return request(app.getHttpServer())
        .post("/payments/wallet/top-up")
        .set("Authorization", `Bearer ${userToken}`)
        .send({
          amount: 100,
        })
        .expect(200)
        .expect((res) => {
          expect(res.body.data.balance).toBeDefined();
        });
    });
  });

  afterAll(async () => {
    await app.close();
  });
});
