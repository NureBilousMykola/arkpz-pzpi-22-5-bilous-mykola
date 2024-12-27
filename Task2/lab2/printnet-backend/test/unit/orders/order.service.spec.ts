import { Test, TestingModule } from "@nestjs/testing";
import { OrdersService } from "../../../src/modules/orders/services/orders.service";
import { getRepositoryToken } from "@nestjs/typeorm";
import { Order } from "../../../src/modules/orders/entities/order.entity";
import { OrderStatus } from "../../../src/modules/orders/entities/order-status.entity";
import { VendingMachinesService } from "../../../src/modules/devices/services/vending-machines.service";
import { PaymentsService } from "../../../src/modules/payments/services/payments.service";
import { BadRequestException, NotFoundException } from "@nestjs/common";

describe("OrdersService", () => {
  let service: OrdersService;

  const mockOrderRepository = {
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
  };

  const mockOrderStatusRepository = {
    create: jest.fn(),
    save: jest.fn(),
  };

  const mockVendingMachinesService = {
    findOne: jest.fn(),
  };

  const mockPaymentsService = {
    getWalletBalance: jest.fn(),
    updateWalletBalance: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrdersService,
        {
          provide: getRepositoryToken(Order),
          useValue: mockOrderRepository,
        },
        {
          provide: getRepositoryToken(OrderStatus),
          useValue: mockOrderStatusRepository,
        },
        {
          provide: VendingMachinesService,
          useValue: mockVendingMachinesService,
        },
        {
          provide: PaymentsService,
          useValue: mockPaymentsService,
        },
      ],
    }).compile();

    service = module.get<OrdersService>(OrdersService);

    // Скидаємо моки перед кожним тестом
    jest.clearAllMocks();
  });

  describe("create", () => {
    it("should create new order if user has sufficient balance", async () => {
      const createDto = {
        customer_id: "1",
        product_id: "PROD001",
        quantity: 1,
        machine_id: "1",
        model_file_url: "test.stl",
        print_settings: {},
        cost: 100,
      };

      const mockUser = {
        id: "1",
        email: "test@example.com",
      };

      const mockMachine = {
        id: "1",
        serial_number: "TEST001",
      };

      const mockOrder = {
        id: "1",
        ...createDto,
        user: mockUser,
        machine: mockMachine,
        statuses: [],
        payments: [],
      };

      mockVendingMachinesService.findOne.mockResolvedValue(mockMachine);
      mockPaymentsService.getWalletBalance.mockResolvedValue(200);
      mockOrderRepository.create.mockReturnValue(mockOrder);
      mockOrderRepository.save.mockResolvedValue(mockOrder);
      mockOrderRepository.findOne.mockResolvedValue(mockOrder);

      mockOrderStatusRepository.create.mockReturnValue({
        status: "created",
        description: "Замовлення створено",
      });

      const result = await service.create(createDto, mockUser);

      expect(result).toBeDefined();
      expect(result.id).toBe("1");
      expect(mockOrderRepository.create).toHaveBeenCalled();
      expect(mockOrderRepository.save).toHaveBeenCalled();
    });

    it("should throw BadRequestException if insufficient balance", async () => {
      const createDto = {
        customer_id: "1",
        product_id: "PROD001",
        quantity: 1,
        machine_id: "1",
        model_file_url: "test.stl",
        print_settings: {},
        cost: 100,
      };

      mockPaymentsService.getWalletBalance.mockResolvedValue(50);

      await expect(service.create(createDto, { id: "1" })).rejects.toThrow(
        BadRequestException,
      );
    });
  });
});
