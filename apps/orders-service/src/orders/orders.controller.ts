import {
  Body,
  Controller,
  Get,
  Logger,
  Param,
  Patch,
  Post,
  Req,
} from '@nestjs/common';
import { OrdersService } from './orders.service';
import { Auth, type AuthRequest } from '@ticketing/auth';
import { CreateOrderDto } from './dto/create-order.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Ticket } from './entities/ticket.entity';
import { Repository } from 'typeorm';
import { Ctx, EventPattern, Payload, RmqContext } from '@nestjs/microservices';
import {
  EventPatterns,
  TicketCreatedEvent,
  TicketUpdatedEvent,
} from '@ticketing/events';
import { NotFoundException } from '@nestjs/common';

@Controller('orders')
export class OrdersController {
  private readonly logger = new Logger(OrdersController.name);

  constructor(
    private readonly ordersService: OrdersService,
    @InjectRepository(Ticket)
    private readonly ticketRepository: Repository<Ticket>,
  ) {}

  @Auth()
  @Get()
  getOrders(@Req() req: AuthRequest) {
    return this.ordersService.getOrders(req.user?.userId);
  }

  @Auth()
  @Get(':id')
  getOrderById(@Param('id') id: string, @Req() req: AuthRequest) {
    return this.ordersService.getOrderById(id, req.user?.userId);
  }

  @Auth()
  @Post()
  createOrder(@Req() req: AuthRequest, @Body() dto: CreateOrderDto) {
    return this.ordersService.createOrder(dto, req.user?.userId);
  }

  @Auth()
  @Patch(':id/complete')
  completeOrder(@Param('id') id: string, @Req() req: AuthRequest) {
    return this.ordersService.completeOrder(id, req.user?.userId);
  }

  @Auth()
  @Patch(':id/cancel')
  cancelOrder(@Param('id') id: string, @Req() req: AuthRequest) {
    return this.ordersService.cancelOrder(id, req.user?.userId);
  }

  @EventPattern(EventPatterns.TicketCreated)
  async createdTicket(
    @Payload() data: TicketCreatedEvent['data'],
    @Ctx() context: RmqContext,
  ) {
    this.logger.log('Received TicketCreated event:', data);

    const channel = context.getChannelRef();
    const originalMsg = context.getMessage();

    const ticket = await this.ticketRepository.create({
      id: data.id,
      title: data.title,
      price: data.price,
      userId: data.userId,
      version: data.version,
    });

    await this.ticketRepository.save(ticket);

    channel.ack(originalMsg);
  }

  @EventPattern(EventPatterns.TicketUpdated)
  async updatedTicket(
    @Payload() data: TicketUpdatedEvent['data'],
    @Ctx() context: RmqContext,
  ) {
    this.logger.log('Received TicketUpdated event:', data);

    const channel = context.getChannelRef();
    const originalMsg = context.getMessage();

    const ticketId = data.id;

    const ticket = await this.ticketRepository.findOneBy({ id: ticketId });
    if (!ticket) {
      channel.nack(originalMsg, false, false);
      throw new NotFoundException('Ticket not found');
    }

    if (
      ticket.version !== data.version &&
      ticket.version + 1 !== data.version
    ) {
      channel.nack(originalMsg, false, true);
      throw new NotFoundException('Ticket version mismatch');
    }

    Object.assign(ticket, data);

    await this.ticketRepository.save(ticket);

    channel.ack(originalMsg);
  }

  @EventPattern(EventPatterns.OrderCancelled)
  async cancelledOrder(
    @Payload() data: TicketUpdatedEvent['data'],
    @Ctx() context: RmqContext,
  ) {
    this.logger.log('Received OrderCancelled event:', data);

    const channel = context.getChannelRef();
    const originalMsg = context.getMessage();

    await this.ordersService.cancelOrder(data.id, data.userId, true);

    channel.ack(originalMsg);
  }
}
