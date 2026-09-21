import type { LanguageRepository } from "./ports/language-repository";

export async function getLanguageCatalog(repository: LanguageRepository) {
  return repository.list();
}

