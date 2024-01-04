import { HttpService } from '@nestjs/axios';
import { HttpException, Injectable } from '@nestjs/common';
import { firstValueFrom } from 'rxjs';
import { ParseMailDto } from '../dto/parse-mail.dto';
import { MailHelper } from '../helpers/mail.helpers';
import { HttpHelper } from '../helpers/http.helper';
import puppeteer from 'puppeteer';

@Injectable()
export class MailService {
  constructor(
    private _mailHelper: MailHelper,
    private httpService: HttpService,
    private _httpHelper: HttpHelper,
  ) {}

  public async parseMail(parseMailDto: ParseMailDto): Promise<unknown> {
    try {
      // Download email
      const res = await firstValueFrom(
        this.httpService.get(parseMailDto.mailPath, {
          responseType: 'stream',
        }),
      );

      const parsedEmail = await this._mailHelper.parseMail(res.data);

      if (parsedEmail.attachments.length === 0) {
        const url = this._mailHelper.extractUrls(parsedEmail.text)[0];

        const response = await this._httpHelper.fetchData(url);

        if (typeof response.data === 'object') return response.data;

        if (response.headers['content-type'].indexOf('text/html') !== -1) {
          return await this.extractJsonFromWebsite(url);
        }

        throw new HttpException('No json links found ', 401);
      }

      if (parsedEmail.attachments.length > 0) {
        const attachmentBuffer = parsedEmail.attachments.find(
          (attachment) => attachment.contentType === 'application/json',
        ).content;

        const jsonAttachment = JSON.parse(attachmentBuffer.toString());

        return jsonAttachment;
      }
    } catch (error) {
      throw error;
    }
  }

  private async extractJsonFromWebsite(url: string) {
    const browser = await puppeteer.launch({ headless: true });

    const page = await browser.newPage();

    await page.goto(url);

    const links = await page.$$eval('a', (elements) =>
      elements.map((link) => link.href),
    );

    const jsonLinks = links.filter(
      (link) =>
        link.indexOf('.json') !== -1 ||
        link.toLowerCase().indexOf('download') !== -1,
    );

    if (jsonLinks.length === 0) {
      throw new HttpException('No json links found', 401);
    }

    let json: object;

    for (const link of jsonLinks) {
      const res = await this._httpHelper.fetchData(link, {
        responseType: 'json',
      });

      if (typeof res.data === 'object') {
        json = res.data;
        break;
      }
    }

    if (!json) throw new HttpException('No json links found', 401);

    return json;
  }
}
