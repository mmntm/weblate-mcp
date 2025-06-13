import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosInstance } from 'axios';

@Injectable()
export abstract class BaseWeblateService {
  protected readonly logger = new Logger(this.constructor.name);
  protected readonly apiClient: AxiosInstance;

  constructor(protected configService: ConfigService) {
    const rawApiUrl = this.configService.get<string>('WEBLATE_API_URL');
    const apiToken = this.configService.get<string>('WEBLATE_API_TOKEN');

    if (!rawApiUrl || !apiToken) {
      throw new Error(
        'WEBLATE_API_URL and WEBLATE_API_TOKEN must be configured',
      );
    }

    // Ensure the API URL ends with /api
    const apiUrl = rawApiUrl.endsWith('/api') ? rawApiUrl : rawApiUrl + '/api';

    this.apiClient = axios.create({
      baseURL: apiUrl,
      headers: {
        Authorization: `Token ${apiToken}`,
        'Content-Type': 'application/json',
      },
      timeout: 10000, // 10 second timeout
    });

    // Logging disabled for STDIO MCP compatibility
  }
} 