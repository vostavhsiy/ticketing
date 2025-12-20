import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, MinLength } from 'class-validator';

export class SignUpDto {
  @ApiProperty()
  @IsEmail(undefined, { message: 'Invalid email address' })
  email!: string;

  @ApiProperty()
  @MinLength(6, {
    message: 'Password must be at least 6 characters long',
  })
  password!: string;
}
