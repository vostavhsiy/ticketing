import { ConfigModule, ConfigService } from '@nestjs/config';
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ScheduleModule } from '@nestjs/schedule';
import { ClientsModule, Transport } from '@nestjs/microservices';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    ClientsModule.registerAsync([
      {
        name: 'BROKER_SERVICE',
        imports: [ConfigModule],
        inject: [ConfigService],
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
      },
    ]),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
