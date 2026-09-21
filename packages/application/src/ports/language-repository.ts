import type { Language, LanguageCode } from "../../../domain/src/language";

export interface LanguageRepository {
  list(): Promise<readonly Language[]>;
  findByCode(code: LanguageCode): Promise<Language | null>;
}

