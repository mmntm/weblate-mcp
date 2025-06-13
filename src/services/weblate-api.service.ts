import { Injectable } from '@nestjs/common';
import {
  WeblateProjectsService,
  WeblateComponentsService,
  WeblateLanguagesService,
  WeblateTranslationsService,
} from './weblate';
import {
  WeblateProject,
  WeblateComponent,
  WeblateLanguage,
  WeblateTranslation,
  WeblateSearchResult,
  SearchIn,
} from '../types';

@Injectable()
export class WeblateApiService {
  constructor(
    private readonly projectsService: WeblateProjectsService,
    private readonly componentsService: WeblateComponentsService,
    private readonly languagesService: WeblateLanguagesService,
    private readonly translationsService: WeblateTranslationsService,
  ) {}

  // Project methods
  async listProjects(): Promise<WeblateProject[]> {
    return this.projectsService.listProjects();
  }

  async getProject(projectSlug: string): Promise<WeblateProject> {
    return this.projectsService.getProject(projectSlug);
  }

  // Component methods
  async listComponents(projectSlug: string): Promise<WeblateComponent[]> {
    return this.componentsService.listComponents(projectSlug);
  }

  // Language methods
  async listLanguages(projectSlug: string): Promise<WeblateLanguage[]> {
    return this.languagesService.listLanguages(projectSlug);
  }

  // Translation methods
  async searchTranslations(
    projectSlug: string,
    componentSlug?: string,
    languageCode?: string,
    query?: string,
    source?: string,
    target?: string,
  ): Promise<WeblateSearchResult> {
    return this.translationsService.searchTranslations(
      projectSlug,
      componentSlug,
      languageCode,
      query,
      source,
      target,
    );
  }

  async getTranslationByKey(
    projectSlug: string,
    componentSlug: string,
    languageCode: string,
    key: string,
  ): Promise<WeblateTranslation | null> {
    return this.translationsService.getTranslationByKey(
      projectSlug,
      componentSlug,
      languageCode,
      key,
    );
  }

  async searchStringInProject(
    projectSlug: string,
    searchValue: string,
    searchIn: SearchIn = 'both',
  ): Promise<WeblateTranslation[]> {
    return this.translationsService.searchStringInProject(
      projectSlug,
      searchValue,
      searchIn,
    );
  }

  async findBestTranslationMatch(
    projectSlug: string,
    searchValue: string,
    context?: string,
  ): Promise<WeblateTranslation[]> {
    return this.translationsService.findBestTranslationMatch(
      projectSlug,
      searchValue,
      context,
    );
  }

  async writeTranslation(
    projectSlug: string,
    componentSlug: string,
    languageCode: string,
    key: string,
    value: string,
    markAsApproved: boolean = false,
  ): Promise<WeblateTranslation> {
    return this.translationsService.writeTranslation(
      projectSlug,
      componentSlug,
      languageCode,
      key,
      value,
      markAsApproved,
    );
  }

  async searchTranslationsByKey(
    projectSlug: string,
    keyPattern: string,
    componentSlug?: string,
    languageCode?: string,
    exactMatch: boolean = false,
  ): Promise<WeblateTranslation[]> {
    return this.translationsService.searchTranslationsByKey(
      projectSlug,
      keyPattern,
      componentSlug,
      languageCode,
      exactMatch,
    );
  }

  async findTranslationsForKey(
    projectSlug: string,
    key: string,
  ): Promise<WeblateTranslation[]> {
    return this.translationsService.findTranslationsForKey(projectSlug, key);
  }

  async listTranslationKeys(
    projectSlug: string,
    componentSlug?: string,
    languageCode?: string,
  ): Promise<string[]> {
    return this.translationsService.listTranslationKeys(
      projectSlug,
      componentSlug,
      languageCode,
    );
  }

  async searchTranslationKeys(
    projectSlug: string,
    keyPattern: string,
    componentSlug?: string,
  ): Promise<string[]> {
    return this.translationsService.searchTranslationKeys(
      projectSlug,
      keyPattern,
      componentSlug,
    );
  }
}
