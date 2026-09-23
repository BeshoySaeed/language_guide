export type ScorableQuestion = Readonly<{
  id: string;
  prompt: string;
  correctAnswer: string;
  acceptedAnswers?: readonly string[];
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
  feedbackCode: "correct" | "incorrect" | "missing";
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
    const correct = normalizedResponse.length > 0 && accepted.includes(normalizedResponse);
    return {
      exerciseId: question.id,
      promptSnapshot: question.prompt,
      response,
      correct,
      score: correct ? 1 : 0,
      feedbackCode: normalizedResponse.length === 0 ? "missing" as const : correct ? "correct" as const : "incorrect" as const,
    };
  });
  const score = answers.reduce((total, answer) => total + answer.score, 0);
  const maxScore = questions.length;
  const percent = maxScore === 0 ? 0 : Math.round((score / maxScore) * 100);
  return { answers, score, maxScore, percent, passed: percent >= passThreshold };
}
