import { Module } from '@nestjs/common';
import { TicketsService } from './tickets.service';
import { TicketsController } from './tickets.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Ticket } from './entities/ticket.entity';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    TypeOrmModule.forFeature([Ticket]),
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
  controllers: [TicketsController],
  providers: [TicketsService],
})
export class TicketsModule {}
