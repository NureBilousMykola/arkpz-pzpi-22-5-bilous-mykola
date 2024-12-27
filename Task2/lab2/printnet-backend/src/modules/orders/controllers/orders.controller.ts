import {
  Controller,
  Get,
  Post,
  Put,
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
import { OrdersService } from "../services/orders.service";
import { CreateOrderDto } from "../dto/create-order.dto";
import { UpdateOrderDto } from "../dto/update-order.dto";
import { OrderFiltersDto } from "../dto/order-filters.dto";
import { JwtAuthGuard } from "@/core/guards/jwt-auth.guard";
import { RolesGuard } from "@/core/guards/roles.guard";
import { Roles } from "@/core/decorators/roles.decorator";
import { User } from "@/core/decorators/user.decorator";
import { OrderStatusEnum } from "../entities/order-status.entity";

@ApiTags("orders")
@Controller("orders")
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  @ApiOperation({ summary: "Create a new order" })
  @ApiBody({
    type: CreateOrderDto,
    examples: {
      example1: {
        summary: "Example order",
        value: {
          productId: "123",
          quantity: 2,
          address: "123 Main St",
        },
      },
    },
  })
  async create(@Body() createDto: CreateOrderDto, @User() user) {
    return await this.ordersService.create(createDto, user);
  }

  @Get()
  @ApiOperation({ summary: "Get a list of orders" })
  @ApiQuery({
    name: "status",
    required: false,
    type: String,
    example: "pending",
  })
  @ApiQuery({
    name: "startDate",
    required: false,
    type: String,
    example: "2024-01-01",
  })
  @ApiQuery({
    name: "endDate",
    required: false,
    type: String,
    example: "2024-01-31",
  })
  async findAll(@Query() filters: OrderFiltersDto, @User() user) {
    if (!user.roles.includes("admin")) {
      filters.userId = user.id;
    }
    return await this.ordersService.findAll(filters);
  }

  @Get(":id")
  @ApiOperation({ summary: "Get order details" })
  async findOne(@Param("id") id: string, @User() user) {
    const order = await this.ordersService.findOne(id);
    if (!user.roles.includes("admin") && order.user.id !== user.id) {
      throw new ForbiddenException("You do not have access to this order");
    }
    return order;
  }

  @Put(":id")
  @ApiOperation({ summary: "Update an order" })
  @ApiBody({
    type: UpdateOrderDto,
    examples: {
      example1: {
        summary: "Example update",
        value: {
          quantity: 3,
          address: "456 New St",
        },
      },
    },
  })
  async update(
    @Param("id") id: string,
    @Body() updateDto: UpdateOrderDto,
    @User() user,
  ) {
    const order = await this.ordersService.findOne(id);
    if (!user.roles.includes("admin") && order.user.id !== user.id) {
      throw new ForbiddenException("You do not have access to this order");
    }
    return await this.ordersService.update(id, updateDto);
  }

  @Post(":id/cancel")
  @ApiOperation({ summary: "Cancel an order" })
  @ApiBody({
    schema: {
      type: "object",
      properties: {
        reason: { type: "string", example: "Changed my mind" },
      },
    },
  })
  async cancel(
    @Param("id") id: string,
    @Body("reason") reason: string,
    @User() user,
  ) {
    const order = await this.ordersService.findOne(id);
    if (!user.roles.includes("admin") && order.user.id !== user.id) {
      throw new ForbiddenException("You do not have access to this order");
    }
    return await this.ordersService.cancel(id, reason);
  }

  @Post(":id/status")
  @Roles("admin")
  @ApiOperation({ summary: "Update order status" })
  @ApiBody({
    schema: {
      type: "object",
      properties: {
        status: {
          type: "string",
          enum: Object.values(OrderStatusEnum),
          example: "shipped",
        },
        description: { type: "string", example: "Order has been shipped" },
      },
    },
  })
  async updateStatus(
    @Param("id") id: string,
    @Body("status") status: OrderStatusEnum,
    @Body("description") description: string,
  ) {
    return await this.ordersService.createOrderStatus(id, status, description);
  }

  @Get(":id/statistics")
  @ApiOperation({ summary: "Get order statistics" })
  async getStatistics(@Param("id") id: string, @User() user) {
    const order = await this.ordersService.findOne(id);
    if (!user.roles.includes("admin") && order.user.id !== user.id) {
      throw new ForbiddenException("You do not have access to this order");
    }
    return await this.ordersService.getOrderStatistics(id);
  }
}
