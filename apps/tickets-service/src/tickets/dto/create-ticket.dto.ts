import { ApiProperty } from '@nestjs/swagger';
import { IsPositive, MinLength } from 'class-validator';

export class CreateTicketDto {
  @ApiProperty()
  @MinLength(3, {
    message: 'Title is too short. Minimum length is $constraint1 characters.',
  })
  title!: string;

  @ApiProperty()
  @IsPositive()
  price!: number;
}
