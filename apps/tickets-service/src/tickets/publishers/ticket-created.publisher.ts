import {
  BasePublisher,
  EventPatterns,
  TicketCreatedEvent,
} from '@ticketing/events';

export class TicketCreatedPublisher extends BasePublisher<TicketCreatedEvent> {
  pattern: EventPatterns.TicketCreated = EventPatterns.TicketCreated;
}
