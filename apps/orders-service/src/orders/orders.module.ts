import { Module } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { OrdersController } from './orders.controller';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Order } from './entities/order.entity';
import { Ticket } from './entities/ticket.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Order, Ticket]),
    ClientsModule.registerAsync([
      {
        imports: [ConfigModule],
        name: 'BROKER_SERVICE',
        useFactory: async (configService: ConfigService) => {
          const brokerUrl = configService.get<string>('BROKER_URL');
          if (!brokerUrl) {
            throw new Error(
              'BROKER_URL is not defined in environment variables',
            );
          }
          return {
            transport: Transport.RMQ,
            options: {
              urls: [brokerUrl],
              exchange: 'ticketing',
              exchangeType: 'topic',
              wildcards: true,
            },
          };
        },
        inject: [ConfigService],
      },
    ]),
  ],
  controllers: [OrdersController],
  providers: [OrdersService],
})
export class OrdersModule {}
