import { Logger } from '@nestjs/common'
import { Event } from './constants'
import { ClientProxy } from '@nestjs/microservices'

export abstract class BasePublisher<T extends Event> {
  abstract pattern: T['pattern'];

  protected logger = new Logger(BasePublisher.name);

  protected client!: ClientProxy;

  constructor(client: ClientProxy) {
    this.client = client;
  }

  async publish(data: T['data']): Promise<void> {
    this.logger.log(`Publishing event to pattern: ${this.pattern}`);
    this.client.emit<T['data']>(this.pattern, data);
  }
}
