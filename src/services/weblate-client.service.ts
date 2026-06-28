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

    // Normalize: strip trailing slashes, then ensure exactly one /api suffix.
    // Avoids a broken double "//api" base URL when WEBLATE_API_URL is given
    // with a trailing slash (e.g. "https://host/api/"), which makes every
    // request 404 against the web UI instead of the REST API.
    const trimmed = apiUrl.replace(/\/+$/, '');
    const baseUrl = trimmed.endsWith('/api') ? trimmed : `${trimmed}/api`;

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