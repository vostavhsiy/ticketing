import {
  BasePublisher,
  EventPatterns,
  OrderCompletedEvent,
} from '@ticketing/events';

export class OrderCompletedPublisher extends BasePublisher<OrderCompletedEvent> {
  pattern: EventPatterns.OrderCompleted = EventPatterns.OrderCompleted;
}
