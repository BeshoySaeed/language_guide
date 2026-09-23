export type VocabularySource = Readonly<{
  id: string;
  lemma: string;
  translation: string;
}>;

export type GeneratedChoiceQuestion = Readonly<{
  id: string;
  sourceId: string;
  prompt: string;
  choices: readonly string[];
  correctAnswer: string;
  policyVersion: 1;
}>;

export function generateVocabularyQuestions(
  entries: readonly VocabularySource[],
  options: Readonly<{ seed: string; count: number }>,
): readonly GeneratedChoiceQuestion[] {
  const uniqueEntries = entries.filter((entry, index) => entries.findIndex((candidate) => candidate.translation === entry.translation) === index);
  if (uniqueEntries.length < 3 || options.count <= 0) return [];
  const random = seededRandom(options.seed);
  const shuffled = shuffle(uniqueEntries, random);
  return shuffled.slice(0, Math.min(options.count, shuffled.length)).map((entry, index) => {
    const distractors = shuffle(uniqueEntries.filter((candidate) => candidate.id !== entry.id), random).slice(0, 2).map((candidate) => candidate.translation);
    return {
      id: `generated:${options.seed}:${index}:${entry.id}`,
      sourceId: entry.id,
      prompt: entry.lemma,
      choices: shuffle([entry.translation, ...distractors], random),
      correctAnswer: entry.translation,
      policyVersion: 1,
    };
  });
}

function seededRandom(seed: string): () => number {
  let state = 2166136261;
  for (const character of seed) {
    state ^= character.codePointAt(0) ?? 0;
    state = Math.imul(state, 16777619);
  }
  return () => {
    state ^= state << 13;
    state ^= state >>> 17;
    state ^= state << 5;
    return (state >>> 0) / 4294967296;
  };
}

function shuffle<T>(values: readonly T[], random: () => number): T[] {
  const result = [...values];
  for (let index = result.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(random() * (index + 1));
    [result[index], result[swapIndex]] = [result[swapIndex], result[index]];
  }
  return result;
}
