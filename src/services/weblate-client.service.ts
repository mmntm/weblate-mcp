import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient } from '../client/client/client';
import type { Client } from '../client/client/types';

@Injectable()
export class WeblateClientService {
  private readonly client: Client;

  constructor(private configService: ConfigService) {
    const apiUrl = this.configService.get<string>('WEBLATE_API_URL');
    const apiToken = this.configService.get<string>('WEBLATE_API_TOKEN');

    if (!apiUrl || !apiToken) {
      throw new Error(
        'WEBLATE_API_URL and WEBLATE_API_TOKEN must be configured',
      );
    }

    // Ensure the API URL ends with /api
    const baseUrl = apiUrl.endsWith('/api') ? apiUrl : apiUrl + '/api';

    this.client = createClient({
      baseUrl,
      headers: {
        'Authorization': `Token ${apiToken}`,
        'Content-Type': 'application/json',
      },
    });
  }

  getClient(): Client {
    return this.client;
  }
} 