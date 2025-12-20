import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Ticket } from './entities/ticket.entity';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { UpdateTicketDto } from './dto/update-ticket.dto';
import { ClientProxy } from '@nestjs/microservices';
import { TicketCreatedPublisher } from './publishers/ticket-created.publisher';
import { TicketUpdatedPublisher } from './publishers/ticket-updated.publisher';

@Injectable()
export class TicketsService {
  constructor(
    @InjectRepository(Ticket)
    private readonly ticketRepository: Repository<Ticket>,
    @Inject('BROKER_SERVICE') private readonly client: ClientProxy,
  ) {}

  async getTickets(): Promise<Ticket[]> {
    return this.ticketRepository.find();
  }

  async getTicketById(id: string): Promise<Ticket> {
    const ticket = await this.ticketRepository.findOneBy({ id });
    if (!ticket) {
      throw new NotFoundException('Ticket not found');
    }
    return ticket;
  }

  async createTicket(dto: CreateTicketDto, userId: string): Promise<Ticket> {
    try {
      const ticket = this.ticketRepository.create({
        ...dto,
        userId,
      });

      await this.ticketRepository.save(ticket);

      new TicketCreatedPublisher(this.client).publish({
        id: ticket.id,
        title: ticket.title,
        price: ticket.price,
        userId: ticket.userId,
        version: ticket.version,
      });
      return ticket;
    } catch (error) {
      throw new BadRequestException('Failed to create ticket');
    }
  }

  async updateTicket(
    id: string,
    userId: string,
    dto: UpdateTicketDto,
  ): Promise<Ticket> {
    const ticket = await this.ticketRepository.findOne({ where: { id } });
    if (!ticket) {
      throw new BadRequestException('Ticket not found');
    }
    if (ticket.userId !== userId) {
      throw new UnauthorizedException(
        'You are not authorized to update this ticket',
      );
    }
    Object.assign(ticket, dto);

    await this.ticketRepository.save(ticket);

    new TicketUpdatedPublisher(this.client).publish({
      id: ticket.id,
      title: ticket.title,
      price: ticket.price,
      userId: ticket.userId,
      version: ticket.version,
    });
    return ticket;
  }
}
