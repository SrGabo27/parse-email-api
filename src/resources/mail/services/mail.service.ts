import { HttpService } from '@nestjs/axios';
import { HttpException, Injectable } from '@nestjs/common';
import { firstValueFrom } from 'rxjs';
import { ParseMailDto } from '../dto/parse-mail.dto';
import { MailHelper } from '../helpers/mail.helpers';
import { HttpHelper } from '../helpers/http.helper';

@Injectable()
export class MailService {
  constructor(
    private _mailHelper: MailHelper,
    private httpService: HttpService,
    private _httpHelper: HttpHelper,
  ) {}

  public async parseMail(parseMailDto: ParseMailDto): Promise<unknown> {
    try {
      const res = await firstValueFrom(
        this.httpService.get(parseMailDto.mailPath, {
          responseType: 'stream',
        }),
      );

      const parsedEmail = await this._mailHelper.parseMail(res.data);

      if (parsedEmail.attachments.length === 0) {
        const url = this._mailHelper.extractUrls(parsedEmail.text)[0];

        const json = await this._httpHelper.downloadJsonFromUrl(url);

        return json;
      }

      const attachmentBuffer = parsedEmail.attachments.find(
        (attachment) => attachment.contentType === 'application/json',
      ).content;

      const jsonAttachment = JSON.parse(attachmentBuffer.toString());

      return jsonAttachment;
    } catch (error) {
      console.log(error);
      throw new HttpException('Error parsing email', 500, { cause: error });
    }
  }
}
