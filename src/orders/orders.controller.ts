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

    @Get('history')
    @UseGuards(JwtAuthGuard)
    async getOrderHistory(
        @Request() req,
        @Query('page') page?: number,
        @Query('limit') limit?: number
    ) {
        return this.ordersService.getOrderHistory(req.user.userId, req.user.role, page || 1, limit || 10);
    }

    @Get('analytics')
    @UseGuards(JwtAuthGuard)
    async getOrderAnalytics(
        @Request() req,
        @Query('startDate') startDate?: string,
        @Query('endDate') endDate?: string
    ) {
        const start = startDate ? new Date(startDate) : undefined;
        const end = endDate ? new Date(endDate) : undefined;
        return this.ordersService.getOrderAnalytics(req.user.userId, req.user.role, start, end);
    }

    @Get('date-range')
    @UseGuards(JwtAuthGuard)
    async getOrdersByDateRange(
        @Request() req,
        @Query('startDate') startDate: string,
        @Query('endDate') endDate: string
    ) {
        return this.ordersService.getOrdersByDateRange(
            req.user.userId,
            req.user.role,
            new Date(startDate),
            new Date(endDate)
        );
    }

    @Get('status/:status')
    @UseGuards(JwtAuthGuard)
    async getOrdersByStatus(
        @Request() req,
        @Param('status') status: string
    ) {
        return this.ordersService.getOrdersByStatus(req.user.userId, req.user.role, status as any);
    }

    @Get('upcoming')
    @UseGuards(JwtAuthGuard)
    async getUpcomingOrders(@Request() req) {
        return this.ordersService.getUpcomingOrders(req.user.userId, req.user.role);
    }

    @Get('overdue')
    @UseGuards(JwtAuthGuard)
    async getOverdueOrders(@Request() req) {
        return this.ordersService.getOverdueOrders(req.user.userId, req.user.role);
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

    @Put('bulk-update')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('PROVIDER')
    async bulkUpdateStatus(
        @Request() req,
        @Body() body: { orderIds: number[]; status: string }
    ) {
        return this.ordersService.bulkUpdateStatus(
            body.orderIds,
            body.status as any,
            req.user.userId,
            req.user.role
        );
    }
}
