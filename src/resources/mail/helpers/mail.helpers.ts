import { Injectable } from '@nestjs/common';
import { simpleParser } from 'mailparser';
import { Stream } from 'stream';

@Injectable()
export class MailHelper {
  public async parseMail(path: Stream) {
    const parsedEmail = await simpleParser(path);

    return parsedEmail;
  }

  public extractUrls(text: string) {
    const urlRegex = /https?:\/\/[^\s]+/g;
    return text.match(urlRegex) || [];
  }
}
