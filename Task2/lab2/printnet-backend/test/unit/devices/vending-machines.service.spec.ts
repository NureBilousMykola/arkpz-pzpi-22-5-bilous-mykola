import { Test, TestingModule } from "@nestjs/testing";
import { VendingMachinesService } from "../../../src/modules/devices/services/vending-machines.service";
import { getRepositoryToken } from "@nestjs/typeorm";
import { VendingMachine } from "../../../src/modules/devices/entities/vending-machine.entity";
import { DeviceStatus } from "../../../src/modules/devices/entities/device-status.entity";
import { PrinterConfig } from "../../../src/modules/devices/entities/printer-config.entity";
import { Repository } from "typeorm";
import { ConflictException, NotFoundException } from "@nestjs/common";

describe("VendingMachinesService", () => {
  let service: VendingMachinesService;
  let vendingMachineRepository: Repository<VendingMachine>;

  const mockVendingMachineRepository = {
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
    find: jest.fn(),
  };

  const mockDeviceStatusRepository = {
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
  };

  const mockPrinterConfigRepository = {
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        VendingMachinesService,
        {
          provide: getRepositoryToken(VendingMachine),
          useValue: mockVendingMachineRepository,
        },
        {
          provide: getRepositoryToken(DeviceStatus),
          useValue: mockDeviceStatusRepository,
        },
        {
          provide: getRepositoryToken(PrinterConfig),
          useValue: mockPrinterConfigRepository,
        },
      ],
    }).compile();

    service = module.get<VendingMachinesService>(VendingMachinesService);
    vendingMachineRepository = module.get<Repository<VendingMachine>>(
      getRepositoryToken(VendingMachine),
    );

    // Скидаємо моки перед кожним тестом
    jest.clearAllMocks();
  });

  describe("create", () => {
    it("should successfully create a vending machine", async () => {
      const createDto = {
        serial_number: "TEST001",
        location: "Test Location",
        printer_model: "Test Printer",
        configuration: {},
      };

      const mockMachine = {
        id: "1",
        ...createDto,
        is_active: true,
      };

      mockVendingMachineRepository.findOne.mockResolvedValueOnce(null);
      mockVendingMachineRepository.create.mockReturnValue(mockMachine);
      mockVendingMachineRepository.save.mockResolvedValue(mockMachine);

      // Налаштовуємо мок для повторного виклику findOne
      mockVendingMachineRepository.findOne.mockResolvedValueOnce({
        ...mockMachine,
        printer_configs: [],
        statuses: [],
        orders: [],
      });

      const result = await service.create(createDto);

      expect(result).toBeDefined();
      expect(result.serial_number).toBe(createDto.serial_number);
      expect(mockVendingMachineRepository.create).toHaveBeenCalled();
      expect(mockVendingMachineRepository.save).toHaveBeenCalled();
    });

    it("should throw ConflictException when serial number already exists", async () => {
      const createDto = {
        serial_number: "TEST001",
        location: "Test Location",
        printer_model: "Test Printer",
        configuration: {},
      };

      mockVendingMachineRepository.findOne.mockResolvedValue({ id: "1" });

      await expect(service.create(createDto)).rejects.toThrow(
        ConflictException,
      );
    });
  });

  describe("findOne", () => {
    it("should return a vending machine if it exists", async () => {
      const mockMachine = {
        id: "1",
        serial_number: "TEST001",
        location: "Test Location",
        printer_configs: [],
        statuses: [],
        orders: [],
      };

      mockVendingMachineRepository.findOne.mockResolvedValue(mockMachine);

      const result = await service.findOne("1");

      expect(result).toBeDefined();
      expect(result.id).toBe("1");
    });

    it("should throw NotFoundException if machine does not exist", async () => {
      mockVendingMachineRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne("1")).rejects.toThrow(NotFoundException);
    });
  });
});
