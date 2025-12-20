import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  if (!process.env.BROKER_URL) {
    throw new Error('BROKER_URL must be defined');
  }

  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    AppModule,
    {
      transport: Transport.RMQ,
      options: {
        urls: [process.env.BROKER_URL],
        exchange: 'ticketing',
        exchangeType: 'topic',
        queue: 'expiration-service',
        routingKey: 'order.*',
        queueOptions: { durable: true },
        noAck: false,
      },
    },
  );

  await app.listen();
  Logger.log(`🚀 Microservice is listening`);
}

bootstrap();
