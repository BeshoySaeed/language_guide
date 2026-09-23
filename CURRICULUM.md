# German A1–B1 curriculum program

The application architecture and learning loop are ready, but the authored curriculum is still being expanded. A level is not considered complete merely because it has a course page or a level test.

Run `npm run curriculum:audit` for current counts. Run `npm run curriculum:audit -- --strict` only as a release gate; it intentionally fails until every content, native-review, and learner-pilot requirement passes.

## Phase gates

### 10.6 — Complete A1

- At least 1,000 authored vocabulary cards
- At least 300 authored useful-sentence cards
- Grammar, reading, practice, and quiz material distributed across practical A1 topics
- A seven-skill A1 final with recognition, listening, writing, and speaking production
- Automated schema and stable-ID validation
- Internal editorial review for every A1 book

The internally reviewed A1 book now contains all 14 planned chapters, 42 lessons, 1,000 vocabulary/form cards, 300 reusable sentence cards, 42 grammar topics, and 336 lesson questions. The sequence starts with sound and sentence structure, develops practical situations and core grammar, and ends with reading, writing, speaking, and cumulative production. Automated coverage is complete; native-speaker approval and real learner evidence remain external release gates. See `A1_CURRICULUM_AUDIT.md`.

### 10.7 — Complete A2

- At least 1,200 additional A2 vocabulary cards
- At least 300 additional A2 useful-sentence cards
- Broader everyday, travel, work, social, and service interactions
- A five-skill level test with at least 15 questions
- Automated validation and internal editorial review

### 10.8 — Complete B1

- At least 1,200 additional B1 vocabulary cards
- At least 300 additional B1 useful-sentence cards
- Independent-life topics with connected speech, opinions, narration, problem-solving, work, study, travel, and participation
- A five-skill level test with at least 15 questions
- Automated validation and internal editorial review

### 10.9 — External validation and release

- A qualified German native speaker reviews every book in full and records their name, German locale, date, scope, and approval in the book provenance
- At least 10 real pilot learners complete the defined pilot journey
- All pilot participants finish the journey, and critical or high-severity learning blockers are resolved
- Accessibility, mobile, offline, authentication, progress, and speech regression checks pass

Native-speaker approval and learner outcomes must come from real people. They cannot be inferred from automated tests or replaced by generated review text.

## Recording native review

After a real full-book review, add this optional object to that book's `provenance`. Do not add it before approval:

```json
"nativeReview": {
  "reviewer": "Reviewer’s real name",
  "locale": "de-DE",
  "reviewedAt": "YYYY-MM-DD",
  "scope": "full_book",
  "status": "approved"
}
```

The content validator checks this structure, and the curriculum audit requires it for every book.

## Recording the learner pilot

Copy `quality/learner-pilot-results.example.json` to `quality/learner-pilot-results.json` only when a real pilot begins. Use anonymous participant IDs, keep personal data outside the repository, and set `status` to `passed` only after every participant finishes and all release-blocking findings are closed.

## Counting rules

- Vocabulary counts authored vocabulary cards, not tokenized words in explanations or dialogues.
- Sentence counts authored useful-sentence cards, not reading-dialogue lines.
- Grammar topics count distinct authored grammar IDs.
- Lesson questions include practice and lesson-quiz questions.
- A1 level-test questions are generated independently and cover vocabulary, sentences, grammar, reading, listening, writing, and speaking. A2 and B1 currently use five-skill checkpoints.
