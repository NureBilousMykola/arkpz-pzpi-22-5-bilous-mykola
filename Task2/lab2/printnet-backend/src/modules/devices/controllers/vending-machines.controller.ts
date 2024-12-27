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
} from "@nestjs/common";
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiQuery,
  ApiBody,
} from "@nestjs/swagger";
import { VendingMachinesService } from "../services/vending-machines.service";
import { CreateVendingMachineDto } from "../dto/create-vending-machine.dto";
import { UpdateVendingMachineDto } from "../dto/update-vending-machine.dto";
import { UpdateStatusDto } from "../dto/update-status.dto";
import { JwtAuthGuard } from "../../../core/guards/jwt-auth.guard";
import { RolesGuard } from "../../../core/guards/roles.guard";
import { Roles } from "../../../core/decorators/roles.decorator";

@ApiTags("vending-machines")
@Controller("vending-machines")
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class VendingMachinesController {
  constructor(
    private readonly vendingMachinesService: VendingMachinesService,
  ) {}

  @Post()
  @Roles("admin")
  @ApiOperation({ summary: "Create a new vending machine" })
  @ApiBody({
    type: CreateVendingMachineDto,
    examples: {
      example1: {
        summary: "Example vending machine",
        value: {
          serial_number: "VM123456",
          location: "Main Street 123",
          model: "Model X",
        },
      },
    },
  })
  async create(@Body() createDto: CreateVendingMachineDto) {
    return await this.vendingMachinesService.create(createDto);
  }

  @Get()
  @ApiOperation({ summary: "Get a list of all vending machines" })
  @ApiQuery({
    name: "includeInactive",
    required: false,
    type: Boolean,
    example: false,
  })
  async findAll(@Query("includeInactive") includeInactive: boolean = false) {
    return await this.vendingMachinesService.findAll(includeInactive);
  }

  @Get(":id")
  @ApiOperation({ summary: "Get information about a specific machine" })
  async findOne(@Param("id") id: string) {
    return await this.vendingMachinesService.findOne(id);
  }

  @Put(":id")
  @Roles("admin")
  @ApiOperation({ summary: "Update information about a vending machine" })
  @ApiBody({
    type: UpdateVendingMachineDto,
    examples: {
      example1: {
        summary: "Example update",
        value: {
          location: "New Street 456",
          model: "Model Y",
        },
      },
    },
  })
  async update(
    @Param("id") id: string,
    @Body() updateDto: UpdateVendingMachineDto,
  ) {
    return await this.vendingMachinesService.update(id, updateDto);
  }

  @Delete(":id")
  @Roles("admin")
  @ApiOperation({ summary: "Deactivate a vending machine" })
  async remove(@Param("id") id: string) {
    await this.vendingMachinesService.remove(id);
    return { message: "Machine deactivated" };
  }

  @Post(":id/restore")
  @Roles("admin")
  @ApiOperation({ summary: "Restore a vending machine" })
  async restore(@Param("id") id: string) {
    return await this.vendingMachinesService.restore(id);
  }

  @Post(":id/status")
  @Roles("admin")
  @ApiOperation({ summary: "Update the status of a machine" })
  @ApiBody({
    type: UpdateStatusDto,
    examples: {
      example1: {
        summary: "Example status update",
        value: {
          status: "active",
          telemetry: { temperature: 22, humidity: 50 },
        },
      },
    },
  })
  async updateStatus(
    @Param("id") id: string,
    @Body() updateStatusDto: UpdateStatusDto,
  ) {
    return await this.vendingMachinesService.updateStatus(
      id,
      updateStatusDto.status,
      updateStatusDto.telemetry,
    );
  }

  @Get(":id/status")
  @ApiOperation({ summary: "Get the current status of a machine" })
  async getStatus(@Param("id") id: string) {
    return await this.vendingMachinesService.getLatestStatus(id);
  }

  @Get("location/:location")
  @ApiOperation({ summary: "Find machines by location" })
  async findByLocation(@Param("location") location: string) {
    return await this.vendingMachinesService.findByLocation(location);
  }

  @Get(":id/statistics")
  @ApiOperation({ summary: "Get machine statistics" })
  async getStatistics(@Param("id") id: string) {
    return await this.vendingMachinesService.getStatistics(id);
  }
}
