import { Test, TestingModule } from '@nestjs/testing';
import { WeblateTranslationsService } from './translations.service';
import { WeblateClientService } from '../weblate-client.service';
import * as sdk from '../../client/sdk.gen';

describe('WeblateTranslationsService', () => {
  let service: WeblateTranslationsService;
  let mockClient: any;

  beforeEach(async () => {
    mockClient = {};

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WeblateTranslationsService,
        {
          provide: WeblateClientService,
          useValue: { getClient: jest.fn().mockReturnValue(mockClient) },
        },
      ],
    }).compile();

    service = module.get<WeblateTranslationsService>(
      WeblateTranslationsService,
    );
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('createTranslationUnit', () => {
    it('should create a monolingual unit with key and value', async () => {
      const mockUnit = {
        id: 42,
        context: '',
        source: ['Hello'],
        target: [],
        web_url:
          'https://weblate.example.com/translate/my-project/my-component/en/?checksum=abc123',
      };

      jest
        .spyOn(sdk, 'translationsUnitsCreate')
        .mockResolvedValue({ data: mockUnit, error: undefined } as any);

      const result = await service.createTranslationUnit(
        'my-project',
        'my-component',
        'en',
        { key: 'greeting', value: ['Hello'] },
      );

      expect(result).toEqual(mockUnit);
      expect(sdk.translationsUnitsCreate).toHaveBeenCalledWith({
        client: mockClient,
        path: {
          component__project__slug: 'my-project',
          component__slug: 'my-component',
          language__code: 'en',
        },
        body: { key: 'greeting', value: ['Hello'] },
      });
    });

    it('should create a bilingual unit with context, source, and target', async () => {
      const mockUnit = {
        id: 43,
        context: 'greeting_message',
        source: ['Hello'],
        target: ['Hola'],
        web_url:
          'https://weblate.example.com/translate/my-project/my-component/es/?checksum=def456',
      };

      jest
        .spyOn(sdk, 'translationsUnitsCreate')
        .mockResolvedValue({ data: mockUnit, error: undefined } as any);

      const result = await service.createTranslationUnit(
        'my-project',
        'my-component',
        'es',
        { context: 'greeting_message', source: ['Hello'], target: ['Hola'] },
      );

      expect(result).toEqual(mockUnit);
      expect(sdk.translationsUnitsCreate).toHaveBeenCalledWith({
        client: mockClient,
        path: {
          component__project__slug: 'my-project',
          component__slug: 'my-component',
          language__code: 'es',
        },
        body: {
          context: 'greeting_message',
          source: ['Hello'],
          target: ['Hola'],
        },
      });
    });

    it('should pass state parameter when provided', async () => {
      const mockUnit = { id: 44, context: '', source: ['Hi'], target: [] };

      jest
        .spyOn(sdk, 'translationsUnitsCreate')
        .mockResolvedValue({ data: mockUnit, error: undefined } as any);

      await service.createTranslationUnit('proj', 'comp', 'en', {
        key: 'hi',
        value: ['Hi'],
        state: 20,
      });

      expect(sdk.translationsUnitsCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          body: { key: 'hi', value: ['Hi'], state: 20 },
        }),
      );
    });

    it('should throw on API error response', async () => {
      jest.spyOn(sdk, 'translationsUnitsCreate').mockResolvedValue({
        data: undefined,
        error: { detail: 'Not found' },
      } as any);

      await expect(
        service.createTranslationUnit('proj', 'comp', 'en', {
          key: 'test',
          value: ['Test'],
        }),
      ).rejects.toThrow('Failed to create translation unit');
    });

    it('should throw on network error', async () => {
      jest
        .spyOn(sdk, 'translationsUnitsCreate')
        .mockRejectedValue(new Error('Network error'));

      await expect(
        service.createTranslationUnit('proj', 'comp', 'en', {
          key: 'test',
          value: ['Test'],
        }),
      ).rejects.toThrow('Failed to create translation unit');
    });
  });
});
