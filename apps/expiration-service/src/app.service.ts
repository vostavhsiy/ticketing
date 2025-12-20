import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { SchedulerRegistry } from '@nestjs/schedule';
import { OrderCreatedEvent } from '@ticketing/events';
import { OrderCancelledPublisher } from './publishers/order-cancelled.publisher';

@Injectable()
export class AppService {
  constructor(
    private readonly schedulerRegistry: SchedulerRegistry,
    @Inject('BROKER_SERVICE') private readonly client: ClientProxy,
  ) {}

  handleOrderCreated(data: OrderCreatedEvent['data']) {
    const callback = () => {
      new OrderCancelledPublisher(this.client).publish({
        id: data.id,
        expiresAt: data.expiresAt,
        ticketId: data.ticketId,
        status: 'cancelled',
        userId: data.userId,
      });
    };

    const timeout = setTimeout(callback, 2 * 60 * 1000);
    this.schedulerRegistry.addTimeout(`order_expiration_${data.id}`, timeout);
  }
}
