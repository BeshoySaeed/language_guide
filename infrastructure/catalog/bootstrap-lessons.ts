export const bootstrapLessons = {
  "at-the-bakery": {
    id: "lesson_de_a1_bakery",
    languageCode: "de",
    level: "A1",
    chapter: "Everyday essentials",
    title: "At the bakery",
    summary: "Order breakfast, ask about prices, and use polite requests with confidence.",
    estimatedMinutes: 12,
    sections: [
      { id: "warmup", label: "Warm-up", state: "complete" },
      { id: "vocabulary", label: "Vocabulary", state: "current" },
      { id: "sentences", label: "Useful sentences", state: "upcoming" },
      { id: "grammar", label: "Polite requests", state: "upcoming" },
      { id: "practice", label: "Practice", state: "upcoming" },
      { id: "quiz", label: "Quick quiz", state: "upcoming" },
    ],
    vocabulary: [
      { id: "brot", word: "das Brot", translation: "bread", pronunciation: "broht" },
      { id: "broetchen", word: "das Brötchen", translation: "bread roll", pronunciation: "BRURT-hyen" },
      { id: "bitte", word: "bitte", translation: "please / you're welcome", pronunciation: "BIT-uh" },
    ],
  },
} as const;

