export interface WeblateProject {
  id: number;
  slug: string;
  name: string;
  web: string;
  web_url: string;
  url: string;
  check_flags: string;
  components_list_url: string;
  repository_url: string;
  statistics_url: string;
  categories_url: string;
  changes_list_url: string;
  languages_url: string;
  labels_url: string;
  credits_url: string;
  translation_review: boolean;
  source_review: boolean;
  set_language_team: boolean;
  instructions: string;
  enable_hooks: boolean;
  language_aliases: string;
  secondary_language: string | null;
  enforced_2fa: boolean;
  machinery_settings: string;
}

export interface WeblateComponent {
  id: number;
  slug: string;
  name: string;
  project: {
    slug: string;
    name: string;
  };
  source_language: {
    code: string;
    name: string;
  };
  language_code_style: string;
  url: string;
  web_url: string;
  repository_url: string;
  git_export_url: string;
  statistics_url: string;
  lock_url: string;
  links_url: string;
  changes_list_url: string;
  units_list_url: string;
  translations_url: string;
  categories_url: string;
  labels_url: string;
  alerts_url: string;
  translation_info_url: string;
}

export interface WeblateLanguage {
  code: string;
  name: string;
  url: string;
  translate_url: string;
  total: number;
  total_words: number;
  total_chars: number;
  last_change: string;
  recent_changes: number;
  translated: number;
  translated_words: number;
  translated_percent: number;
  translated_words_percent: number;
  translated_chars: number;
  translated_chars_percent: number;
  fuzzy: number;
  fuzzy_percent: number;
  fuzzy_words: number;
  fuzzy_words_percent: number;
  fuzzy_chars: number;
  fuzzy_chars_percent: number;
  failing: number;
  failing_percent: number;
  approved: number;
  approved_percent: number;
  approved_words: number;
  approved_words_percent: number;
  approved_chars: number;
  approved_chars_percent: number;
  readonly: number;
  readonly_percent: number;
  readonly_words: number;
  readonly_words_percent: number;
  readonly_chars: number;
  readonly_chars_percent: number;
  suggestions: number;
  comments: number;
}

export interface WeblateTranslation {
  id: number;
  translation: string;
  language_code: string;
  source: string[];
  previous_source: string;
  target: string[];
  id_hash: number;
  content_hash: number;
  location: string;
  context: string;
  note: string;
  flags: string;
  labels: string[];
  state: number;
  fuzzy: boolean;
  translated: boolean;
  approved: boolean;
  position: number;
  has_suggestion: boolean;
  has_comment: boolean;
  has_failing_check: boolean;
  num_words: number;
  source_unit: string;
  priority: number;
  web_url: string;
  url: string;
  explanation: string;
  extra_flags: string;
  pending: boolean;
  timestamp: string;
  last_updated: string;
}

export interface WeblateSearchResult {
  count: number;
  next: string | null;
  previous: string | null;
  results: WeblateTranslation[];
}

export type SearchIn = 'source' | 'target' | 'both'; 