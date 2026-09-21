import type { Language, LanguageCode } from "@/packages/domain/src/language";
import type { LanguageRepository } from "@/packages/application/src/ports/language-repository";

const configuredLanguages = [
  { code: "en", name: "English", nativeName: "English", flag: "🇬🇧", direction: "ltr", availableLevels: ["A1", "A2", "B1", "B2"] },
  { code: "de", name: "German", nativeName: "Deutsch", flag: "🇩🇪", direction: "ltr", availableLevels: ["A1", "A2", "B1", "B2"] },
  { code: "es", name: "Spanish", nativeName: "Español", flag: "🇪🇸", direction: "ltr", availableLevels: ["A1", "A2", "B1", "B2"] },
] as const satisfies readonly Language[];

class ConfiguredLanguageRepository implements LanguageRepository {
  async list(): Promise<readonly Language[]> {
    return configuredLanguages;
  }

  async findByCode(code: LanguageCode): Promise<Language | null> {
    return configuredLanguages.find((language) => language.code === code) ?? null;
  }
}

export const languageRepository = new ConfiguredLanguageRepository();

