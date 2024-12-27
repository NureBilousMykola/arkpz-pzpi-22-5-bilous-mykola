import { Test, TestingModule } from "@nestjs/testing";
import { MonitoringService } from "../../../src/modules/monitoring/services/monitoring.service";
import { getRepositoryToken } from "@nestjs/typeorm";
import { VendingMachine } from "../../../src/modules/devices/entities/vending-machine.entity";
import { DeviceStatus } from "../../../src/modules/devices/entities/device-status.entity";
import { EventEmitter2 } from "@nestjs/event-emitter";

describe("MonitoringService", () => {
  let service: MonitoringService;
  let eventEmitter: EventEmitter2;

  const mockVendingMachineRepository = {
    find: jest.fn(),
    count: jest.fn(),
  };

  const mockDeviceStatusRepository = {
    find: jest.fn(),
    findOne: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MonitoringService,
        {
          provide: getRepositoryToken(VendingMachine),
          useValue: mockVendingMachineRepository,
        },
        {
          provide: getRepositoryToken(DeviceStatus),
          useValue: mockDeviceStatusRepository,
        },
        {
          provide: EventEmitter2,
          useValue: { emit: jest.fn() },
        },
      ],
    }).compile();

    service = module.get<MonitoringService>(MonitoringService);
    eventEmitter = module.get<EventEmitter2>(EventEmitter2);

    // Скидаємо моки перед кожним тестом
    jest.clearAllMocks();
  });

  describe("getSystemHealth", () => {
    it("should return system health status", async () => {
      const mockMachines = [
        {
          id: "1",
          statuses: [
            {
              status: "online",
              created_at: new Date(),
            },
          ],
        },
        {
          id: "2",
          statuses: [
            {
              status: "offline",
              created_at: new Date(Date.now() - 360000), // 6 minutes ago
            },
          ],
        },
      ];

      mockVendingMachineRepository.find.mockResolvedValue(mockMachines);

      const result = await service.getSystemHealth();

      expect(result).toBeDefined();
      expect(result.totalMachines).toBe(2);
      expect(result.onlineMachines).toBe(1);
      expect(result.systemStatus).toBe("WARNING");
      expect(Array.isArray(result.alerts)).toBeTruthy();
    });

    it("should return CRITICAL status when many machines are offline", async () => {
      const mockMachines = Array(10).fill({
        id: "1",
        statuses: [
          {
            status: "offline",
            created_at: new Date(Date.now() - 360000), // 6 minutes ago
          },
        ],
      });

      mockVendingMachineRepository.find.mockResolvedValue(mockMachines);

      const result = await service.getSystemHealth();
      expect(result.systemStatus).toBe("CRITICAL");
      expect(result.onlineMachines).toBe(0);
    });
  });
});
