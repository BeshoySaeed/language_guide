export const CEFR_LEVELS = ["A1", "A2", "B1"] as const;

export type CefrLevel = (typeof CEFR_LEVELS)[number];
export type LanguageCode = "de";
export type TextDirection = "ltr" | "rtl";

export type Language = Readonly<{
  code: LanguageCode;
  name: string;
  nativeName: string;
  flag: string;
  direction: TextDirection;
  availableLevels: readonly CefrLevel[];
}>;

export function isCefrLevel(value: string): value is CefrLevel {
  return CEFR_LEVELS.includes(value as CefrLevel);
}

export function assertSupportedLevel(language: Language, level: CefrLevel): void {
  if (!language.availableLevels.includes(level)) {
    throw new Error(`${level} is not available for ${language.name}.`);
  }
}
