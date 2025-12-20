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
import { TicketsService } from './tickets.service';
import { Auth, type AuthRequest } from '@ticketing/auth';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { Ctx, EventPattern, Payload, RmqContext } from '@nestjs/microservices';
import {
  EventPatterns,
  OrderCancelledEvent,
  OrderCompletedEvent,
  OrderCreatedEvent,
} from '@ticketing/events';
import { InjectRepository } from '@nestjs/typeorm';
import { Ticket } from './entities/ticket.entity';
import { Repository } from 'typeorm';

@Controller('tickets')
export class TicketsController {
  private readonly logger = new Logger(TicketsController.name);

  constructor(
    private readonly ticketsService: TicketsService,
    @InjectRepository(Ticket)
    private readonly ticketRepository: Repository<Ticket>,
  ) {}

  @Get()
  getTickets() {
    return this.ticketsService.getTickets();
  }

  @Get(':id')
  getTicketById(@Param('id') id: string) {
    return this.ticketsService.getTicketById(id);
  }

  @Auth()
  @Post()
  createTicket(@Req() req: AuthRequest, @Body() dto: CreateTicketDto) {
    return this.ticketsService.createTicket(dto, req.user?.userId);
  }

  @Auth()
  @Patch(':id')
  updateTicket(
    @Req() req: AuthRequest,
    @Param('id') id: string,
    @Body() dto: CreateTicketDto,
  ) {
    return this.ticketsService.updateTicket(id, req.user?.userId, dto);
  }

  @EventPattern(EventPatterns.OrderCreated)
  async createdOrder(
    @Payload() data: OrderCreatedEvent['data'],
    @Ctx() context: RmqContext,
  ) {
    this.logger.log('Received OrderCreated event:', data);

    const channel = context.getChannelRef();
    const originalMsg = context.getMessage();

    const ticketId = data.ticketId;

    const ticket = await this.ticketRepository.findOneBy({ id: ticketId });

    if (!ticket) {
      channel.ack(originalMsg);
      return;
    }

    ticket.orderId = data.id;

    await this.ticketRepository.save(ticket);

    channel.ack(originalMsg);
  }

  @EventPattern(EventPatterns.OrderCancelled)
  async cancelledOrder(
    @Payload() data: OrderCancelledEvent['data'],
    @Ctx() context: RmqContext,
  ) {
    this.logger.log('Received OrderCancelled event:', data);

    const channel = context.getChannelRef();
    const originalMsg = context.getMessage();

    const ticketId = data.ticketId;

    const ticket = await this.ticketRepository.findOneBy({ id: ticketId });

    if (!ticket) {
      channel.ack(originalMsg);
      return;
    }

    ticket.orderId = undefined;

    await this.ticketRepository.save(ticket);

    channel.ack(originalMsg);
  }

  @EventPattern(EventPatterns.OrderCompleted)
  async completedOrder(
    @Payload() data: OrderCompletedEvent['data'],
    @Ctx() context: RmqContext,
  ) {
    this.logger.log('Received OrderCompleted event:', data);

    const channel = context.getChannelRef();
    const originalMsg = context.getMessage();

    const ticketId = data.ticketId;

    const ticket = await this.ticketRepository.findOneBy({ id: ticketId });

    if (!ticket) {
      channel.ack(originalMsg);
      return;
    }

    ticket.orderId = undefined;

    await this.ticketRepository.save(ticket);

    channel.ack(originalMsg);
  }
}
