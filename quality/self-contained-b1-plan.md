# Self-contained German A1 → strong B1 plan

## Product target

The app should give a motivated adult learner everything needed to progress from no German to strong B1/B1+ without requiring another course, textbook, flashcard app, or grammar reference. It may recommend real-world language use, but every explanation, model, task, review cycle, and assessment required by the course must exist inside the product.

This is an outcome target, not a promise that every learner will progress at the same speed. B1/B1+ is independent intermediate use; advanced CEFR proficiency begins above B1.

## Exit capabilities

A learner marked ready after B1 must be able to:

- understand the main points and important details in clear, normal-speed speech about familiar personal, public, educational, and professional topics;
- read connected factual texts, instructions, correspondence, news-style reports, and viewpoints without line-by-line translation;
- enter an unprepared conversation on familiar topics, manage travel and service problems, ask for clarification, and keep an exchange moving;
- speak in connected stretches about experiences, plans, processes, opinions, advantages, disadvantages, and causes;
- write connected messages, narratives, descriptions, complaints, applications, and simple arguments with usable paragraphing and connectors;
- mediate essential information by summarizing, explaining, or relaying it for another person;
- use repair strategies when a word or structure is unavailable.

## Honest baseline after the content-integrity audit

| Area | Current state | Release decision |
| --- | --- | --- |
| Course map | 42 lessons at each of A1, A2, and B1 | Structure is complete |
| Authored phrases | 300 A1, 318 A2, 318 B1 | Keep, then native-review |
| Published vocabulary | 1,000 A1, 352 A2, 351 B1 after reviewed batch one | A2 and B1 are below target |
| Synthetic vocabulary | 876 A2 and 876 B1 cards | Quarantined; never teach or assess |
| Reading | Mostly short translated dialogues | Insufficient for strong B1 |
| Listening | Device text-to-speech of written sentences | Useful for practice, insufficient as the only listening source |
| Writing and speaking | Controlled sentence production in finals | Insufficient for extended B1 performance |
| Interaction and mediation | Covered as topics, not consistently performed | Must become required tasks |
| Validation | Automated structural tests | Native review and real learner outcomes still required |

## Learner journey

The product should schedule a five-day learning week over approximately eight to nine months. A normal 60–90 minute study day should combine due spaced review, one lesson segment, listening or reading input, and an active writing or speaking task. Weekly consolidation should recycle older chapters, and every chapter should finish with an action-oriented mission. The app—not the learner—must decide what is due next and must route weak skills back into practice.

## Required build increments

### 1. Content integrity — active

- Keep synthetic combinations out of search, review, practice, and tests.
- Make quality status part of curriculum counts.
- Reject templated filler, duplicate sentences presented as words, broken case agreement, and unreviewed generated content.
- Track authored, reviewed, published, and quarantined content separately.
- Batch one has added 28 reviewed A2 items and 27 reviewed B1 items, each with a contextual example; replacement continues until the target is met without quarantined material.

### 2. Required four-skill work in every lesson

- Add listening-first comprehension and dictation before a transcript appears.
- Add a short reading without automatic line-by-line translation.
- Add constrained production followed by an open writing task.
- Add a timed speaking task and an interaction/repair prompt.
- Require completion of the skill work before the lesson can be mastered; multiple choice alone must never prove mastery.

### 3. Rebuild the A2 lexical and functional bank

- Replace all 876 quarantined cards with individually authored, level-appropriate lexemes and fixed chunks.
- Store nouns with gender and useful plural, verbs with valency and principal forms, and chunks only when they are natural reusable units.
- Provide a contextual example and translation for every item.
- Distribute items by lesson and review them cumulatively rather than exposing one flat list.

### 4. Rebuild the B1/B1+ lexical and functional bank

- Replace all 876 quarantined cards with high-value vocabulary for personal, public, educational, and professional domains.
- Prioritize collocations, verb-preposition government, discourse markers, register, word families, and paraphrase strategies.
- Include productive control of common items and receptive exposure to lower-frequency items; do not count inflected duplicates as new vocabulary.

### 5. Rich input and pronunciation

- Expand readings toward approximately 80–150 words at A1, 150–250 at A2, and 250–500 at B1, with varied formats and comprehension tasks.
- Add recorded normal-speed listening with multiple speakers, connected speech, announcements, messages, interviews, and discussions.
- Add pronunciation sequences for German vowels, umlauts, ich/ach sounds, r variants, final devoicing, stress, rhythm, and sentence melody.
- Keep device TTS only as a fallback.

### 6. Action-oriented capstones and assessment

- Add chapter missions and level portfolios that combine reception, production, interaction, and mediation.
- Evaluate extended writing and speaking with explicit task-completion, range, accuracy, coherence, interaction, and intelligibility rubrics.
- Sample the whole level rather than three items per skill.
- Require remediation for weak outcomes and a fresh attempt after review.

### 7. Evidence before the outcome claim

- Native German review of every published item and task.
- Accessibility and device testing, including microphone and audio fallback behavior.
- A multi-cohort learner pilot covering different first languages and starting abilities.
- Comparison with an independent CEFR-aligned B1 benchmark.

## Definition of done

The app can describe itself as a self-contained route to strong B1 only when no quarantined content is needed to meet a count, all lessons require active skill performance, long-form reading and recorded listening reach the targets above, B1 portfolios are rubric-scored, native review is complete, and learner evidence meets the documented pass criteria.
