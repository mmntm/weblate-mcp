import { Injectable } from '@nestjs/common';
import {
  WeblateProjectsService,
  WeblateComponentsService,
  WeblateLanguagesService,
  WeblateTranslationsService,
  WeblateChangesService,
} from './weblate';
import {
  type Project,
  type Component,
  type Language,
  type Unit,
  type Change,
} from '../client';
import { SearchIn } from '../types';

@Injectable()
export class WeblateApiService {
  constructor(
    private readonly projectsService: WeblateProjectsService,
    private readonly componentsService: WeblateComponentsService,
    private readonly languagesService: WeblateLanguagesService,
    private readonly translationsService: WeblateTranslationsService,
    private readonly changesService: WeblateChangesService,
  ) {}

  // Project methods
  async listProjects(): Promise<Project[]> {
    return this.projectsService.listProjects();
  }

  async getProject(projectSlug: string): Promise<Project> {
    return this.projectsService.getProject(projectSlug);
  }

  // Component methods
  async listComponents(projectSlug: string): Promise<Component[]> {
    return this.componentsService.listComponents(projectSlug);
  }

  // Language methods
  async listLanguages(projectSlug: string): Promise<Language[]> {
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
  ): Promise<{ results: Unit[]; count: number; next?: string; previous?: string }> {
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
  ): Promise<Unit | null> {
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
  ): Promise<Unit[]> {
    return this.translationsService.searchStringInProject(
      projectSlug,
      searchValue,
      searchIn,
    );
  }

  async writeTranslation(
    projectSlug: string,
    componentSlug: string,
    languageCode: string,
    key: string,
    value: string,
    markAsApproved: boolean = false,
  ): Promise<Unit | null> {
    return this.translationsService.writeTranslation(
      projectSlug,
      componentSlug,
      languageCode,
      key,
      value,
      markAsApproved,
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

  async findTranslationsForKey(
    projectSlug: string,
    key: string,
    componentSlug?: string,
  ): Promise<Unit[]> {
    return this.translationsService.findTranslationsForKey(
      projectSlug,
      key,
      componentSlug,
    );
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

  // Change tracking methods
  async listRecentChanges(
    limit: number = 50,
    user?: string,
    timestampAfter?: string,
    timestampBefore?: string,
  ): Promise<{ results: Change[]; count: number; next?: string; previous?: string }> {
    return this.changesService.listRecentChanges(limit, user, timestampAfter, timestampBefore);
  }

  async getProjectChanges(projectSlug: string) {
    return this.changesService.getProjectChanges(projectSlug);
  }

  async getComponentChanges(projectSlug: string, componentSlug: string) {
    return this.changesService.getComponentChanges(projectSlug, componentSlug);
  }

  async getChangesByAction(actionCodes: number[], limit: number = 50) {
    return this.changesService.getChangesByAction(actionCodes, limit);
  }

  async getChangesByUser(user: string, limit: number = 50) {
    return this.changesService.getChangesByUser(user, limit);
  }
}
