import {
  BasePublisher,
  EventPatterns,
  OrderCancelledEvent,
} from '@ticketing/events';

export class OrderCancelledPublisher extends BasePublisher<OrderCancelledEvent> {
  pattern: EventPatterns.OrderCancelled = EventPatterns.OrderCancelled;
}
