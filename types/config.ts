export interface WordCategory {
  name: string;
  words: string[];
}

export interface WordsConfig {
  categories: Record<string, WordCategory>;
  defaultCategory: string;
}

export interface Category {
  id: string;
  name: string;
}