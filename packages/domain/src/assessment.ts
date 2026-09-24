export type ScorableQuestion = Readonly<{
  id: string;
  prompt: string;
  correctAnswer: string;
  acceptedAnswers?: readonly string[];
  gradingMode?: "exact" | "production_text" | "production_speech";
}>;

export type SubmittedAnswer = Readonly<{
  exerciseId: string;
  response: string;
}>;

export type GradedAnswer = Readonly<{
  exerciseId: string;
  promptSnapshot: string;
  response: string;
  correct: boolean;
  score: number;
  feedbackCode: "correct" | "close" | "incorrect" | "missing";
  matchPercent?: number;
}>;

export type AttemptGrade = Readonly<{
  answers: readonly GradedAnswer[];
  score: number;
  maxScore: number;
  percent: number;
  passed: boolean;
}>;

export function normalizeAnswer(value: string): string {
  return value
    .normalize("NFKC")
    .trim()
    .toLocaleLowerCase("de-DE")
    .replace(/[.!?]+$/u, "")
    .replace(/\s+/gu, " ");
}

export function gradeAttempt(
  questions: readonly ScorableQuestion[],
  submitted: readonly SubmittedAnswer[],
  passThreshold: number,
): AttemptGrade {
  const submittedById = new Map(submitted.map((answer) => [answer.exerciseId, answer.response]));
  const answers = questions.map((question) => {
    const response = submittedById.get(question.id) ?? "";
    const normalizedResponse = normalizeAnswer(response);
    const accepted = [question.correctAnswer, ...(question.acceptedAnswers ?? [])].map(normalizeAnswer);
    const productionMode = question.gradingMode === "production_text" || question.gradingMode === "production_speech";
    const matchPercent = productionMode && normalizedResponse.length > 0
      ? Math.max(...accepted.map((answer) => productionMatchPercent(answer, normalizedResponse)))
      : undefined;
    const threshold = question.gradingMode === "production_speech" ? 80 : 88;
    const correct = normalizedResponse.length > 0 && (productionMode ? (matchPercent ?? 0) >= threshold : accepted.includes(normalizedResponse));
    const feedbackCode = normalizedResponse.length === 0
      ? "missing" as const
      : correct
        ? "correct" as const
        : productionMode && (matchPercent ?? 0) >= 60
          ? "close" as const
          : "incorrect" as const;
    return {
      exerciseId: question.id,
      promptSnapshot: question.prompt,
      response,
      correct,
      score: correct ? 1 : 0,
      feedbackCode,
      ...(matchPercent === undefined ? {} : { matchPercent }),
    };
  });
  const score = answers.reduce((total, answer) => total + answer.score, 0);
  const maxScore = questions.length;
  const percent = maxScore === 0 ? 0 : Math.round((score / maxScore) * 100);
  return { answers, score, maxScore, percent, passed: percent >= passThreshold };
}

/**
 * Scores constrained sentence production against a model answer. This is
 * intentionally deterministic: it tolerates punctuation, small recognition
 * errors, and minor typos while still rewarding German word order.
 */
export function productionMatchPercent(expected: string, response: string): number {
  const normalizedExpected = normalizeProductionAnswer(expected);
  const normalizedResponse = normalizeProductionAnswer(response);
  if (!normalizedExpected || !normalizedResponse) return 0;
  if (normalizedExpected === normalizedResponse) return 100;

  const expectedTokens = normalizedExpected.split(" ");
  const responseTokens = normalizedResponse.split(" ");
  const characterSimilarity = 1 - (levenshteinDistance(normalizedExpected, normalizedResponse) / Math.max(normalizedExpected.length, normalizedResponse.length));
  const tokenCoverage = multisetOverlap(expectedTokens, responseTokens) / Math.max(expectedTokens.length, responseTokens.length);
  const orderedCoverage = longestCommonSubsequenceLength(expectedTokens, responseTokens) / Math.max(expectedTokens.length, responseTokens.length);

  return Math.max(0, Math.min(100, Math.round((characterSimilarity * 0.55 + tokenCoverage * 0.2 + orderedCoverage * 0.25) * 100)));
}

function normalizeProductionAnswer(value: string): string {
  return normalizeAnswer(value)
    .replace(/ß/gu, "ss")
    .replace(/[\p{P}\p{S}]+/gu, " ")
    .replace(/\s+/gu, " ")
    .trim();
}

function multisetOverlap(left: readonly string[], right: readonly string[]): number {
  const remaining = new Map<string, number>();
  for (const token of right) remaining.set(token, (remaining.get(token) ?? 0) + 1);
  let overlap = 0;
  for (const token of left) {
    const count = remaining.get(token) ?? 0;
    if (count > 0) {
      overlap += 1;
      remaining.set(token, count - 1);
    }
  }
  return overlap;
}

function longestCommonSubsequenceLength(left: readonly string[], right: readonly string[]): number {
  const previous = new Array<number>(right.length + 1).fill(0);
  for (const leftToken of left) {
    const current = new Array<number>(right.length + 1).fill(0);
    for (let index = 1; index <= right.length; index += 1) {
      current[index] = leftToken === right[index - 1]
        ? previous[index - 1] + 1
        : Math.max(previous[index], current[index - 1]);
    }
    for (let index = 0; index < current.length; index += 1) previous[index] = current[index];
  }
  return previous[right.length];
}

function levenshteinDistance(left: string, right: string): number {
  const previous = Array.from({ length: right.length + 1 }, (_, index) => index);
  for (let leftIndex = 1; leftIndex <= left.length; leftIndex += 1) {
    const current = [leftIndex];
    for (let rightIndex = 1; rightIndex <= right.length; rightIndex += 1) {
      const substitution = previous[rightIndex - 1] + (left[leftIndex - 1] === right[rightIndex - 1] ? 0 : 1);
      current[rightIndex] = Math.min(previous[rightIndex] + 1, current[rightIndex - 1] + 1, substitution);
    }
    for (let index = 0; index < current.length; index += 1) previous[index] = current[index];
  }
  return previous[right.length];
}
