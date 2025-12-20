import { ApiProperty } from '@nestjs/swagger';
import { SignUpDto } from './sign-up.dto';

export class SignInDto extends SignUpDto {
  @ApiProperty()
  override password!: string;
}
