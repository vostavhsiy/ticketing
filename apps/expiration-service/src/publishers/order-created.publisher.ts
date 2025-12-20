import {
  BasePublisher,
  EventPatterns,
  OrderCreatedEvent,
} from '@ticketing/events';

export class OrderCreatedPublisher extends BasePublisher<OrderCreatedEvent> {
  pattern: EventPatterns.OrderCreated = EventPatterns.OrderCreated;
}
