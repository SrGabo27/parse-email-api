import { Module } from '@nestjs/common';
import { MailController } from './controllers/mail.controller';
import { MailService } from './services/mail.service';
import { MailHelper } from './helpers/mail.helpers';
import { HttpModule } from '@nestjs/axios';
import { HttpHelper } from './helpers/http.helper';

@Module({
  imports: [HttpModule],
  controllers: [MailController],
  providers: [MailService, MailHelper, HttpHelper],
})
export class MailModule {}
