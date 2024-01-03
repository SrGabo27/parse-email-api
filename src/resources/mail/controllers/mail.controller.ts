import { Controller, Post, Body } from '@nestjs/common';
import { MailService } from '../services/mail.service';
import { ParseMailDto } from '../dto/parse-mail.dto';

@Controller('mail')
export class MailController {
  constructor(private readonly mailService: MailService) {}

  @Post()
  parseMail(@Body() parseMailDto: ParseMailDto) {
    return this.mailService.parseMail(parseMailDto);
  }
}
