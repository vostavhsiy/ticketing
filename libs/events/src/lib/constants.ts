export enum EventPatterns {
  TicketCreated = 'ticket.created',
  TicketUpdated = 'ticket.updated',
  OrderCreated = 'order.created',
  OrderCompleted = 'order.completed',
  OrderCancelled = 'order.cancelled',
}

export interface Event {
  pattern: EventPatterns;
  data: any;
}

export interface TicketCreatedEvent extends Event {
  pattern: EventPatterns.TicketCreated;
  data: {
    id: string;
    title: string;
    price: number;
    userId: string;
    version: number;
  };
}

export interface TicketUpdatedEvent extends Event {
  pattern: EventPatterns.TicketUpdated;
  data: {
    id: string;
    title: string;
    price: number;
    userId: string;
    version: number;
  };
}

export interface OrderCreatedEvent extends Event {
  pattern: EventPatterns.OrderCreated;
  data: {
    id: string;
    ticketId: string;
    userId: string;
    status: string;
    expiresAt: Date;
  };
}

export interface OrderCancelledEvent extends Event {
  pattern: EventPatterns.OrderCancelled;
  data: {
    id: string;
    ticketId: string;
    userId: string;
    status: string;
    expiresAt: Date;
  };
}

export interface OrderCompletedEvent extends Event {
  pattern: EventPatterns.OrderCompleted;
  data: {
    id: string;
    ticketId: string;
    userId: string;
    status: string;
    expiresAt: Date;
  };
}
