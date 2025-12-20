import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Ticket } from './entities/ticket.entity';
import { Repository } from 'typeorm';
import { ClientProxy } from '@nestjs/microservices';
import { Order } from './entities/order.entity';
import { CreateOrderDto } from './dto/create-order.dto';
import { OrderCreatedPublisher } from './publishers/order-created.publisher';
import { OrderCancelledPublisher } from './publishers/order-cancelled.publisher';
import { OrderCompletedPublisher } from './publishers/order-completed.publisher';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    @InjectRepository(Ticket)
    private readonly ticketRepository: Repository<Ticket>,
    @Inject('BROKER_SERVICE') private readonly client: ClientProxy,
  ) {}

  async getOrders(userId: string): Promise<Order[]> {
    return this.orderRepository.find({ where: { userId } });
  }

  async getOrderById(id: string, userId: string): Promise<Order> {
    const order = await this.orderRepository.findOneBy({ id, userId });
    if (!order) {
      throw new NotFoundException('Order not found');
    }
    return order;
  }

  async createOrder(dto: CreateOrderDto, userId: string): Promise<Order> {
    try {
      const ticket = await this.ticketRepository.findOneBy({
        id: dto.ticketId,
      });
      if (!ticket) {
        throw new NotFoundException('Ticket not found');
      }
      const order = this.orderRepository.create({
        status: 'created',
        userId,
        ticket,
        expiresAt: new Date(Date.now() + 2 * 60 * 1000), // 2 minutes from now
      });

      await this.orderRepository.save(order);

      new OrderCreatedPublisher(this.client).publish({
        id: order.id,
        status: order.status,
        userId: order.userId,
        ticketId: dto.ticketId,
        expiresAt: order.expiresAt,
      });
      return order;
    } catch (error) {
      throw new BadRequestException('Failed to create order');
    }
  }

  async cancelOrder(
    id: string,
    userId: string,
    nonpublish?: boolean,
  ): Promise<Order> {
    const order = await this.orderRepository.findOne({ where: { id } });
    if (!order) {
      throw new BadRequestException('Order not found');
    }
    if (order.userId !== userId) {
      throw new UnauthorizedException(
        'You are not authorized to update this order',
      );
    }
    order.status = 'cancelled';

    await this.orderRepository.save(order);

    if (!nonpublish) {
      new OrderCancelledPublisher(this.client).publish({
        id: order.id,
        status: order.status,
        userId: order.userId,
        ticketId: order.ticket.id,
        expiresAt: order.expiresAt,
      });
    }
    return order;
  }

  async completeOrder(id: string, userId: string): Promise<Order> {
    const order = await this.orderRepository.findOne({ where: { id } });
    if (!order) {
      throw new BadRequestException('Order not found');
    }
    if (order.userId !== userId) {
      throw new UnauthorizedException(
        'You are not authorized to update this order',
      );
    }
    order.status = 'complete';

    await this.orderRepository.save(order);

    new OrderCompletedPublisher(this.client).publish({
      id: order.id,
      status: order.status,
      userId: order.userId,
      ticketId: order.ticket.id,
      expiresAt: order.expiresAt,
    });
    return order;
  }
}
