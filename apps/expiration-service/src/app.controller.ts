import { EventPatterns, OrderCreatedEvent } from '@ticketing/events';
import { Controller, Logger } from '@nestjs/common';
import { AppService } from './app.service';
import { Ctx, EventPattern, Payload, RmqContext } from '@nestjs/microservices';

@Controller()
export class AppController {
  private readonly logger = new Logger('Expiration Service');

  constructor(private readonly appService: AppService) {}

  @EventPattern(EventPatterns.OrderCreated)
  createdOrder(
    @Payload() data: OrderCreatedEvent['data'],
    @Ctx() context: RmqContext,
  ) {
    this.logger.log(`Start expiration for orderId: ${data.id}`);

    const channel = context.getChannelRef();
    const originalMsg = context.getMessage();

    this.appService.handleOrderCreated(data);

    channel.ack(originalMsg);
  }
}
