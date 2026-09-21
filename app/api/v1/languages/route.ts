import { getLanguageCatalog } from "@/packages/application/src/get-language-catalog";
import { languageRepository } from "@/infrastructure/catalog/configured-language-repository";

export async function GET() {
  const languages = await getLanguageCatalog(languageRepository);
  return Response.json({ data: languages, meta: { count: languages.length } }, { headers: { "cache-control": "public, max-age=300" } });
}

