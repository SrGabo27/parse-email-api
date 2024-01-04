import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { AxiosRequestConfig, AxiosResponse, ResponseType } from 'axios';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class HttpHelper {
  constructor(private httpService: HttpService) {}

  public async downloadJsonFromUrl(url: string): Promise<unknown> {
    const res = await firstValueFrom(
      this.httpService.get(url, {
        responseType: 'json',
      }),
    );

    return res.data;
  }

  public fetchData(
    url: string,
    options?: AxiosRequestConfig,
  ): Promise<AxiosResponse> {
    return firstValueFrom(
      this.httpService.get(url, {
        ...options,
      }),
    );
  }
}
