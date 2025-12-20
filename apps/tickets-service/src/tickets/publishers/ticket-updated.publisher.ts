import {
  BasePublisher,
  EventPatterns,
  TicketUpdatedEvent,
} from '@ticketing/events';

export class TicketUpdatedPublisher extends BasePublisher<TicketUpdatedEvent> {
  pattern: EventPatterns.TicketUpdated = EventPatterns.TicketUpdated;
}
