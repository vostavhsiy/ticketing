# Ticketing

📚 This repository represents [Nx](https://nx.dev) monorepo with [NestJS](https://nestjs.com) microservices with [RabbitMQ](https://www.rabbitmq.com) Event-Based communication.

It shows:

- using `TypeOrm` with `NestJS`
- microservices setup for interaction by events with `RabbitMQ`
- setup for MSA development with `Docker`
- auth strategy with `MSA`
- production setup with `MSA`
- isolated microservice testing

## Useful commands

```bash
# Start docker containers with services databases and rabbitmq
npm run setup:dev

# In development each service starts from its own context
cd ./apps/SERVICE-NAME
npm run dev

# Down docker containers with services databases and rabbitmq
npm run setup:dev:down

# Start production build (builds serices and runs all containers)
npm run prod

```
