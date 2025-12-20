import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Ticket } from './ticket.entity';

@Entity('orders')
export class Order {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ enum: ['created', 'cancelled', 'complete'] })
  status!: string;

  @Column()
  userId!: string;

  @OneToOne(() => Ticket, (ticket) => ticket.order, { eager: true })
  @JoinColumn()
  ticket!: Ticket;

  @Column('timestamp')
  expiresAt!: Date;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
