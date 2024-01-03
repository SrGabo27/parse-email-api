import { ApiProperty } from '@nestjs/swagger';

export class ParseMailDto {
  @ApiProperty()
  mailPath: string;
}
