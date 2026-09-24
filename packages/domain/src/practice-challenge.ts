import { gradeAttempt, type SubmittedAnswer } from "./assessment.ts";

export type PracticeVocabulary = Readonly<{ id: string; lemma: string; translation: string }>;
export type PracticeSentence = Readonly<{ id: string; text: string; translation: string }>;
export type PracticeSource = Readonly<{ vocabulary: readonly PracticeVocabulary[]; sentences: readonly PracticeSentence[] }>;
export type ChallengeType = "word_scramble" | "sentence_builder" | "matching" | "missing_word";

type ChallengeBase = Readonly<{
  id: string;
  type: ChallengeType;
  instruction: string;
  prompt: string;
  correctAnswer: string;
  explanation: string;
}>;

export type ChallengeQuestion =
  | (ChallengeBase & { type: "word_scramble"; clue: string; scrambled: string })
  | (ChallengeBase & { type: "sentence_builder"; translation: string; tokens: readonly { id: string; label: string }[] })
  | (ChallengeBase & { type: "matching"; source: string; choices: readonly string[] })
  | (ChallengeBase & { type: "missing_word"; sentenceWithBlank: string; choices: readonly string[] });

export type PracticeChallenge = Readonly<{
  id: string;
  seed: string;
  languageCode: "de";
  levelCode: "A1" | "A2" | "B1";
  policyVersion: 1;
  passThreshold: 70;
  questions: readonly ChallengeQuestion[];
}>;

export type PublicChallengeQuestion = ChallengeQuestion extends infer Question
  ? Question extends ChallengeQuestion ? Omit<Question, "correctAnswer" | "explanation"> : never
  : never;
export type PublicPracticeChallenge = Omit<PracticeChallenge, "questions"> & { questions: readonly PublicChallengeQuestion[] };

export function generatePracticeChallenge(source: PracticeSource, seed: string, levelCode: PracticeChallenge["levelCode"] = "A1"): PracticeChallenge {
  if (source.vocabulary.length < 6 || source.sentences.length < 4) throw new Error("Practice content is incomplete.");
  const random = seededRandom(seed);
  const vocabulary = shuffle(source.vocabulary, random);
  const sentences = shuffle(source.sentences, random);
  const questions: ChallengeQuestion[] = [];

  vocabulary.slice(0, 2).forEach((entry) => {
    questions.push({
      id: `challenge:${seed}:scramble:${entry.id}`,
      type: "word_scramble",
      instruction: "Unscramble the German word",
      prompt: `Build the German for “${entry.translation}”.`,
      clue: entry.translation,
      scrambled: scramblePhrase(entry.lemma, random),
      correctAnswer: entry.lemma,
      explanation: `${entry.lemma} means “${entry.translation}.”`,
    });
  });

  sentences.slice(0, 2).forEach((entry) => {
    const words = entry.text.split(/\s+/u);
    questions.push({
      id: `challenge:${seed}:builder:${entry.id}`,
      type: "sentence_builder",
      instruction: "Put the sentence in order",
      prompt: entry.translation,
      translation: entry.translation,
      tokens: shuffle(words.map((label, index) => ({ id: `${entry.id}:${index}`, label })), random),
      correctAnswer: entry.text,
      explanation: `The natural order is: ${entry.text}`,
    });
  });

  vocabulary.slice(2, 4).forEach((entry) => {
    const distractors = shuffle(vocabulary.filter((candidate) => candidate.id !== entry.id), random).slice(0, 3).map((candidate) => candidate.translation);
    questions.push({
      id: `challenge:${seed}:match:${entry.id}`,
      type: "matching",
      instruction: "Match the meaning",
      prompt: entry.lemma,
      source: entry.lemma,
      choices: shuffle([entry.translation, ...distractors], random),
      correctAnswer: entry.translation,
      explanation: `${entry.lemma} matches “${entry.translation}.”`,
    });
  });

  sentences.slice(2, 4).forEach((entry, index) => {
    const words = entry.text.split(/\s+/u);
    const answerIndex = chooseMissingWordIndex(words);
    const correctAnswer = stripPunctuation(words[answerIndex]);
    const sentenceWithBlank = words.map((word, wordIndex) => wordIndex === answerIndex ? "____" : word).join(" ");
    const distractorPool = source.sentences.flatMap((sentence) => sentence.text.split(/\s+/u).map(stripPunctuation)).filter((word) => word.length > 2 && normalize(word) !== normalize(correctAnswer));
    const choices = shuffle(unique(distractorPool), random).slice(0, 3);
    questions.push({
      id: `challenge:${seed}:missing:${entry.id}`,
      type: "missing_word",
      instruction: "Choose the missing word",
      prompt: entry.translation,
      sentenceWithBlank,
      choices: shuffle([correctAnswer, ...choices], random),
      correctAnswer,
      explanation: `${entry.text} — ${entry.translation}`,
    });
    if (index === 1 && questions.length !== 8) throw new Error("Practice challenge generation failed.");
  });

  return { id: `practice:de:${levelCode}:${seed}:v1`, seed, languageCode: "de", levelCode, policyVersion: 1, passThreshold: 70, questions };
}

export function toPublicPracticeChallenge(challenge: PracticeChallenge): PublicPracticeChallenge {
  return { ...challenge, questions: challenge.questions.map((question) => {
    const publicQuestion = { ...question } as Record<string, unknown>;
    delete publicQuestion.correctAnswer;
    delete publicQuestion.explanation;
    return publicQuestion as PublicChallengeQuestion;
  }) };
}

export function gradePracticeChallenge(challenge: PracticeChallenge, answers: readonly SubmittedAnswer[]) {
  return gradeAttempt(challenge.questions, answers, challenge.passThreshold);
}

function chooseMissingWordIndex(words: readonly string[]): number {
  let bestIndex = 0;
  words.forEach((word, index) => {
    if (stripPunctuation(word).length > stripPunctuation(words[bestIndex]).length) bestIndex = index;
  });
  return bestIndex;
}

function scramblePhrase(phrase: string, random: () => number): string {
  const scrambled = phrase.split(" ").map((word) => shuffle(Array.from(word), random).join("")).join(" ");
  if (normalize(scrambled) !== normalize(phrase)) return scrambled;
  return phrase.split(" ").map((word) => Array.from(word).reverse().join("")).join(" ");
}

function stripPunctuation(value: string): string { return value.replace(/^[^\p{L}\p{N}]+|[^\p{L}\p{N}]+$/gu, ""); }
function normalize(value: string): string { return value.normalize("NFKC").toLocaleLowerCase("de-DE"); }
function unique(values: readonly string[]): string[] {
  const seen = new Set<string>();
  const result: string[] = [];
  for (const value of values) {
    const normalized = normalize(value);
    if (seen.has(normalized)) continue;
    seen.add(normalized);
    result.push(value);
  }
  return result;
}

function seededRandom(seed: string): () => number {
  let state = 2166136261;
  for (const character of seed) { state ^= character.codePointAt(0) ?? 0; state = Math.imul(state, 16777619); }
  return () => { state ^= state << 13; state ^= state >>> 17; state ^= state << 5; return (state >>> 0) / 4294967296; };
}

function shuffle<T>(values: readonly T[], random: () => number): T[] {
  const result = [...values];
  for (let index = result.length - 1; index > 0; index -= 1) { const swapIndex = Math.floor(random() * (index + 1)); [result[index], result[swapIndex]] = [result[swapIndex], result[index]]; }
  return result;
}
