import { ApiSchema } from '@nestjs/swagger';
import {
  Column,
  CreateDateColumn,
  Entity,
  OneToOne,
  PrimaryColumn,
  UpdateDateColumn,
  VersionColumn,
} from 'typeorm';
import { Order } from './order.entity';

@ApiSchema()
@Entity('tickets')
export class Ticket {
  @PrimaryColumn()
  id!: string;

  @Column()
  title!: string;

  @Column('float')
  price!: number;

  @Column()
  userId!: string;

  @OneToOne(() => Order, (order) => order.ticket)
  order!: Order;

  @VersionColumn()
  version!: number;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
