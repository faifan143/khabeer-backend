import {
    Controller,
    Get,
    Post,
    Body,
    Param,
    Put,
    Delete,
    UseGuards,
    Request,
    ParseIntPipe,
    Query
} from '@nestjs/common';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderStatusDto, OrderStatus } from './dto/order-status.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('orders')
@UseGuards(JwtAuthGuard, RolesGuard)
export class OrdersController {
    constructor(private readonly ordersService: OrdersService) { }

    @Post()
    @Roles('USER')
    async create(@Body() createOrderDto: CreateOrderDto, @Request() req) {
        return this.ordersService.create(createOrderDto, req.user.userId);
    }

    @Get()
    async findAll(@Request() req, @Query('status') status?: string) {
        const orders = await this.ordersService.findAll(req.user.userId, req.user.role);

        if (status) {
            return orders.filter(order => order.status === status);
        }

        return orders;
    }

    @Get('stats')
    async getStats(@Request() req) {
        return this.ordersService.getOrderStats(req.user.userId, req.user.role);
    }

    @Get(':id')
    async findOne(@Param('id', ParseIntPipe) id: number, @Request() req) {
        return this.ordersService.findOne(id, req.user.userId, req.user.role);
    }

    @Put(':id/status')
    async updateStatus(
        @Param('id', ParseIntPipe) id: number,
        @Body() updateStatusDto: UpdateOrderStatusDto,
        @Request() req
    ) {
        return this.ordersService.updateStatus(id, updateStatusDto, req.user.userId, req.user.role);
    }

    @Put(':id/accept')
    @Roles('PROVIDER')
    async acceptOrder(
        @Param('id', ParseIntPipe) id: number,
        @Body() updateStatusDto: UpdateOrderStatusDto,
        @Request() req
    ) {
        updateStatusDto.status = OrderStatus.ACCEPTED;
        return this.ordersService.updateStatus(id, updateStatusDto, req.user.userId, req.user.role);
    }

    @Put(':id/reject')
    @Roles('PROVIDER')
    async rejectOrder(
        @Param('id', ParseIntPipe) id: number,
        @Body() updateStatusDto: UpdateOrderStatusDto,
        @Request() req
    ) {
        updateStatusDto.status = OrderStatus.CANCELLED;
        return this.ordersService.updateStatus(id, updateStatusDto, req.user.userId, req.user.role);
    }

    @Put(':id/start')
    @Roles('PROVIDER')
    async startOrder(
        @Param('id', ParseIntPipe) id: number,
        @Body() updateStatusDto: UpdateOrderStatusDto,
        @Request() req
    ) {
        updateStatusDto.status = OrderStatus.IN_PROGRESS;
        return this.ordersService.updateStatus(id, updateStatusDto, req.user.userId, req.user.role);
    }

    @Put(':id/complete')
    @Roles('PROVIDER')
    async completeOrder(
        @Param('id', ParseIntPipe) id: number,
        @Body() updateStatusDto: UpdateOrderStatusDto,
        @Request() req
    ) {
        updateStatusDto.status = OrderStatus.COMPLETED;
        return this.ordersService.updateStatus(id, updateStatusDto, req.user.userId, req.user.role);
    }

    @Put(':id/cancel')
    async cancelOrder(
        @Param('id', ParseIntPipe) id: number,
        @Request() req
    ) {
        return this.ordersService.cancel(id, req.user.userId, req.user.role);
    }
}
