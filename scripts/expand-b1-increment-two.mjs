import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

const path = resolve(process.cwd(), "content/languages/de/B1/books/independent-life.json");
const book = JSON.parse(await readFile(path, "utf8"));

const chapterSpecs = [
  ["travel_mobility", "Travel and mobility", "Plan complex journeys, respond to disruption, and discuss responsible travel.", [
    ["journey_planning", "planning-complex-journeys", "Planning complex journeys", "Evaluate routes, costs, time, and environmental impact.", "Proportional comparisons with je ... desto", "Je ... desto connects two developments. A comparative appears in both halves, and the second clause uses verb-second order.", "je + comparative + clause, desto + comparative + verb + subject",
      "die Reiseroute|travel route|noun;die Anbindung|transport connection|noun;der Zwischenstopp|stopover|noun;die Reisezeit|travel time|noun;der Aufwand|effort|noun;umweltfreundlich|environmentally friendly|adjective;abwägen|to weigh up|verb;berücksichtigen|to consider|verb",
      "Für die Reise kommen mehrere Routen infrage.|Several routes are possible for the journey.;Je früher wir buchen, desto größer ist die Auswahl.|The earlier we book, the greater the choice.;Eine direkte Verbindung spart zwar Zeit, ist aber teurer.|A direct connection saves time but is more expensive.;Bei einem Zwischenstopp verlängert sich die Reisezeit erheblich.|With a stopover the travel time increases considerably.;Wir sollten auch die Anbindung am Ziel berücksichtigen.|We should also consider the transport connections at the destination.;Je weniger Gepäck wir mitnehmen, desto einfacher wird der Umstieg.|The less luggage we take, the easier the transfer becomes.;Ich wäge Kosten, Aufwand und Umweltwirkung gegeneinander ab.|I weigh cost, effort, and environmental impact against each other.;Am Ende entscheiden wir uns für die umweltfreundlichere Route.|In the end we decide on the more environmentally friendly route."],
    ["disruption", "rights-during-travel-disruption", "Rights during travel disruption", "Request information, rebooking, and compensation after major delays.", "The passive in several tenses", "Use wird plus participle for a current process, wurde plus participle for a past event, and ist plus participle plus worden for a completed passive event.", "wird/wurde/ist ... worden + past participle",
      "die Annullierung|cancellation|noun;die Erstattung|refund|noun;die Entschädigung|compensation|noun;umbuchen|to rebook|verb;betroffen|affected|adjective;beanspruchen|to claim|verb;der Ersatzverkehr|replacement transport|noun;die Fahrgastrechte|passenger rights|noun",
      "Unser Flug wurde kurzfristig annulliert.|Our flight was cancelled at short notice.;Alle betroffenen Reisenden wurden per E-Mail informiert.|All affected travellers were informed by email.;Uns wird eine alternative Verbindung angeboten.|We are being offered an alternative connection.;Das Gepäck ist bereits auf den neuen Flug umgebucht worden.|The luggage has already been rebooked onto the new flight.;Wegen der langen Wartezeit können wir eine Entschädigung beanspruchen.|Because of the long wait we can claim compensation.;Wo kann der Antrag auf Erstattung gestellt werden?|Where can the refund request be submitted?;Für den ausgefallenen Zug wurde ein Ersatzverkehr eingerichtet.|Replacement transport was arranged for the cancelled train.;Ich informiere mich genau über meine Fahrgastrechte.|I am finding out exactly about my passenger rights."],
    ["places_culture", "regions-culture-and-respectful-travel", "Regions, culture, and respectful travel", "Describe a region and behave thoughtfully as a visitor.", "Prepositional relative clauses", "When a relative clause requires a preposition, place it before the relative pronoun. The pronoun's case is determined by that preposition.", "noun, preposition + relative pronoun + ... + verb",
      "die Region|region|noun;die Landschaft|landscape|noun;das Kulturerbe|cultural heritage|noun;die Bevölkerung|population|noun;respektvoll|respectful|adjective;sich anpassen an|to adapt to|verb phrase;bewahren|to preserve|verb;beitragen zu|to contribute to|verb phrase",
      "Wir besuchen eine Region, für die der Weinbau besonders wichtig ist.|We are visiting a region for which wine-growing is especially important.;Die Landschaft, von der viele Reisende schwärmen, ist geschützt.|The landscape that many travellers rave about is protected.;In kleinen Orten sollte man lokale Regeln respektieren.|In small towns one should respect local rules.;Ich informiere mich über Bräuche, an die ich mich als Gast anpasse.|I learn about customs to which I adapt as a guest.;Das Kulturerbe soll auch für kommende Generationen bewahrt werden.|The cultural heritage should be preserved for future generations too.;Regionale Unterkünfte tragen zur lokalen Wirtschaft bei.|Regional accommodation contributes to the local economy.;Mit der Bevölkerung sprechen wir freundlich und respektvoll.|We speak to the local population in a friendly and respectful way.;Verantwortungsvolles Reisen bedeutet, die eigene Wirkung zu beachten.|Responsible travel means paying attention to one's own impact."]
  ]],
  ["health_resilience", "Health and resilience", "Communicate about treatment, stress, recovery, and sustainable wellbeing.", [
    ["healthcare_choices", "healthcare-choices-and-second-opinions", "Healthcare choices and second opinions", "Understand options and discuss a medical decision carefully.", "Hypothetical advice with Konjunktiv II", "Use würde, könnte, sollte, and wäre to discuss hypothetical options, cautious advice, and preferences without presenting them as facts.", "subject + Konjunktiv II + ... + infinitive/complement",
      "die Diagnose|diagnosis|noun;die Behandlungsmöglichkeit|treatment option|noun;die Nebenwirkung|side effect|noun;die Zweitmeinung|second opinion|noun;abwarten|to wait and see|verb;infrage kommen|to be an option|phrase;sich beraten lassen|to seek advice|verb;die Entscheidung|decision|noun",
      "Die Ärztin erklärt mir zwei mögliche Behandlungen.|The doctor explains two possible treatments to me.;Eine Operation käme erst später infrage.|An operation would only be an option later.;Zunächst könnte ich eine andere Therapie ausprobieren.|Initially I could try another therapy.;Welche Nebenwirkungen wären dabei zu erwarten?|What side effects would be expected?;An Ihrer Stelle würde ich noch eine Zweitmeinung einholen.|In your position I would seek a second opinion.;Ich möchte mich ausführlich beraten lassen.|I would like to receive detailed advice.;Vielleicht sollten wir die Entwicklung noch etwas abwarten.|Perhaps we should wait and see how things develop.;Danach kann ich eine informierte Entscheidung treffen.|After that I can make an informed decision."],
    ["stress_boundaries", "stress-boundaries-and-recovery", "Stress, boundaries, and recovery", "Explain overload and negotiate healthier limits.", "Results with sodass and so ... dass", "Sodass introduces a consequence. So plus an adjective or adverb followed by dass emphasizes the degree that causes the result.", "cause, sodass + result / so + adjective, dass + result",
      "die Überlastung|overload|noun;die Erschöpfung|exhaustion|noun;die Grenze|boundary / limit|noun;abschalten|to switch off / unwind|verb;sich erholen|to recover|verb;übernehmen|to take on|verb;ablehnen|to decline|verb;ausgeglichen|balanced|adjective",
      "In den letzten Wochen habe ich zu viele Aufgaben übernommen.|In recent weeks I have taken on too many tasks.;Die Belastung war so hoch, dass ich kaum abschalten konnte.|The strain was so high that I could hardly unwind.;Ich war ständig erschöpft, sodass ich schlechter arbeitete.|I was constantly exhausted, so I worked less effectively.;Deshalb möchte ich meine Grenzen früher erkennen.|That is why I want to recognize my limits earlier.;Zusätzliche Aufgaben muss ich manchmal freundlich ablehnen.|Sometimes I have to politely decline additional tasks.;Nach Feierabend schalte ich berufliche Nachrichten aus.|After work I switch off work-related messages.;Am Wochenende nehme ich mir bewusst Zeit, mich zu erholen.|At the weekend I consciously take time to recover.;Ein ausgeglichener Alltag verbessert auch meine Konzentration.|A balanced daily routine also improves my concentration."],
    ["wellbeing_habits", "building-sustainable-wellbeing", "Building sustainable wellbeing", "Explain how habits influence energy and resilience.", "Means and method with indem and dadurch, dass", "Indem and dadurch, dass explain how a result is achieved. In both subordinate clauses the conjugated verb goes to the end.", "result, indem/dadurch dass + method + verb",
      "die Widerstandskraft|resilience|noun;die Routine|routine|noun;achtsam|mindful|adjective;beibehalten|to maintain|verb;vernachlässigen|to neglect|verb;stärken|to strengthen|verb;indem|by / by means of|conjunction;dadurch|through that|adverb",
      "Ich stärke meine Widerstandskraft, indem ich regelmäßig Pausen mache.|I strengthen my resilience by taking regular breaks.;Eine feste Morgenroutine hilft mir, ruhig zu beginnen.|A fixed morning routine helps me start calmly.;Dadurch, dass ich genug schlafe, habe ich tagsüber mehr Energie.|By getting enough sleep, I have more energy during the day.;Gesunde Gewohnheiten wirken nur, wenn ich sie langfristig beibehalte.|Healthy habits only work if I maintain them long-term.;In stressigen Phasen vernachlässige ich Bewegung leider schnell.|During stressful periods I unfortunately neglect exercise quickly.;Achtsames Atmen hilft mir, mich wieder zu konzentrieren.|Mindful breathing helps me concentrate again.;Ich plane Erholung genauso bewusst wie berufliche Aufgaben.|I plan recovery as consciously as work tasks.;Kleine Veränderungen können das Wohlbefinden deutlich verbessern.|Small changes can significantly improve wellbeing."]
  ]],
  ["society_participation", "Society and participation", "Discuss volunteering, educational opportunity, and life in a diverse society.", [
    ["volunteering", "volunteering-and-civic-engagement", "Volunteering and civic engagement", "Describe social needs and organize meaningful participation.", "General relative clauses with wer and was", "Wer introduces a person without naming them; was can refer to an entire idea or an indefinite expression. The following clause treats that reference as a unit.", "Wer + ... + verb, main clause / das, was + ... + verb",
      "das Ehrenamt|volunteering|noun;sich engagieren|to get involved|verb;die Initiative|initiative|noun;der Bedarf|need / demand|noun;unterstützen|to support|verb;mitgestalten|to help shape|verb;die Verantwortung|responsibility|noun;gemeinnützig|charitable / nonprofit|adjective",
      "Wer sich ehrenamtlich engagiert, übernimmt Verantwortung.|Anyone who volunteers takes responsibility.;Unsere Initiative unterstützt Menschen, die neu in der Stadt sind.|Our initiative supports people who are new to the city.;Was viele unterschätzen, ist der organisatorische Aufwand.|What many underestimate is the organizational effort.;Zuerst prüfen wir, wo der größte Bedarf besteht.|First we check where the greatest need exists.;Freiwillige können die Angebote aktiv mitgestalten.|Volunteers can actively help shape the services.;Das, was wir gemeinsam erreichen, motiviert das ganze Team.|What we achieve together motivates the whole team.;Auch wenige Stunden im Monat können viel bewirken.|Even a few hours a month can make a big difference.;Die Organisation arbeitet gemeinnützig und transparent.|The organization works on a nonprofit and transparent basis."],
    ["education_opportunity", "education-and-equal-opportunity", "Education and equal opportunity", "Discuss barriers, support, and access to learning.", "Noun-verb combinations in formal discussion", "Formal discussion often uses fixed combinations such as Zugang ermöglichen, Unterstützung leisten, eine Chance bieten, and Maßnahmen ergreifen.", "noun + conventional verb",
      "die Chancengleichheit|equal opportunity|noun;der Zugang|access|noun;die Förderung|support / funding|noun;die Voraussetzung|prerequisite|noun;ermöglichen|to enable|verb;benachteiligen|to disadvantage|verb;Maßnahmen ergreifen|to take measures|phrase;Unterstützung leisten|to provide support|phrase",
      "Bildung sollte allen Menschen gleiche Chancen bieten.|Education should offer equal opportunities to everyone.;Nicht alle Lernenden haben denselben Zugang zu digitalen Geräten.|Not all learners have the same access to digital devices.;Fehlende Sprachkenntnisse können den Einstieg zusätzlich erschweren.|A lack of language skills can make getting started even harder.;Gezielte Förderung ermöglicht eine bessere Teilnahme.|Targeted support enables better participation.;Niemand sollte wegen seiner Herkunft benachteiligt werden.|No one should be disadvantaged because of their origin.;Schulen müssen frühzeitig geeignete Maßnahmen ergreifen.|Schools must take suitable measures at an early stage.;Ehrenamtliche leisten bei der Lernbegleitung wichtige Unterstützung.|Volunteers provide important support with learning.;Chancengleichheit entsteht nicht von allein.|Equal opportunity does not arise by itself."],
    ["diverse_society", "perspectives-in-a-diverse-society", "Perspectives in a diverse society", "Compare viewpoints and respond to cultural differences thoughtfully.", "Contrast with während and wohingegen", "Während and wohingegen can contrast two simultaneous facts or viewpoints. In their subordinate clauses the conjugated verb stands at the end.", "statement, während/wohingegen + contrasting statement + verb",
      "die Vielfalt|diversity|noun;die Perspektive|perspective|noun;die Zugehörigkeit|belonging|noun;das Vorurteil|prejudice|noun;gegenseitig|mutual|adjective;wahrnehmen|to perceive|verb;hinterfragen|to question critically|verb;wohingegen|whereas|conjunction",
      "Eine vielfältige Gesellschaft bringt unterschiedliche Perspektiven zusammen.|A diverse society brings different perspectives together.;Manche Menschen fühlen sich sofort zugehörig, während andere mehr Zeit brauchen.|Some people feel they belong immediately, while others need more time.;Was als höflich gilt, wird kulturell verschieden wahrgenommen.|What is considered polite is perceived differently across cultures.;Ich versuche, meine eigenen Vorurteile kritisch zu hinterfragen.|I try to question my own prejudices critically.;Offene Fragen fördern gegenseitiges Verständnis.|Open questions encourage mutual understanding.;Die eine Person spricht sehr direkt, wohingegen die andere vorsichtiger formuliert.|One person speaks very directly, whereas the other phrases things more cautiously.;Unterschiede müssen nicht automatisch zu Konflikten führen.|Differences do not automatically have to lead to conflicts.;Respekt entsteht, wenn alle Seiten einander aufmerksam zuhören.|Respect develops when all sides listen carefully to one another."]
  ]]
];

function rows(value) {
  return value.split(";").map((row) => row.trim()).filter(Boolean).map((row) => row.split("|"));
}

function idPart(value) {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/ß/g, "ss").replace(/[^a-zA-Z0-9]+/g, "_").replace(/^_|_$/g, "").toLowerCase();
}

function choices(correct, alternatives) {
  const values = [correct, ...alternatives].filter((value, index, all) => all.indexOf(value) === index).slice(0, 3);
  if (values.length !== 3) throw new Error("Could not create three choices for " + correct);
  return values;
}

function buildLesson(item) {
  const [key, slug, title, summary, grammarTitle, explanation, pattern, vocabRows, sentenceRows] = item;
  const prefix = "de_b1_" + key;
  const vocabulary = rows(vocabRows).map(([lemma, translation, partOfSpeech], index) => ({
    id: "vocab_" + prefix + "_" + idPart(lemma) + "_" + (index + 1),
    lemma, translation, pronunciation: "audio", partOfSpeech, languageFeatures: {},
  }));
  const sentences = rows(sentenceRows).map(([text, translation], index) => ({
    id: "sentence_" + prefix + "_" + (index + 1), text, translation,
    note: index < 5 ? "Use this as a connected B1 expression." : "Adapt this structure to explain your own position or experience.",
  }));
  const grammarExamples = [sentences[0], sentences[3]].map(({ text: source, translation }) => ({ source, translation }));
  const question = (id, instruction, prompt, answerChoices, correctAnswer, questionExplanation, skill) => ({ id, type: "multiple_choice", instruction, prompt, choices: answerChoices, correctAnswer, explanation: questionExplanation, skill });
  const vocabChoices = (index) => choices(vocabulary[index].translation, [vocabulary[(index + 3) % vocabulary.length].translation, vocabulary[(index + 5) % vocabulary.length].translation]);
  const grammarChoices = (index) => choices(grammarExamples[index].source, sentences.map((sentence) => sentence.text).filter((text) => text !== grammarExamples[index].source));
  const readingChoices = choices(sentences[0].translation, [sentences[3].translation, sentences[6].translation]);
  return {
    id: "lesson_" + prefix, slug, title, summary, estimatedMinutes: 20, status: "published", revision: 1,
    heroTitle: summary, completionTitle: "You can now handle " + title.toLowerCase() + " in independent German.",
    objectives: [summary, "Use " + grammarTitle.toLowerCase() + " accurately", "Produce a connected response with reasons and detail"],
    vocabulary, sentences,
    grammar: { id: "grammar_" + prefix, title: grammarTitle, explanation, pattern, examples: grammarExamples, commonMistake: "Keep the relationship between ideas explicit and check the final position of verbs in subordinate clauses." },
    reading: { id: "reading_" + prefix, title: title + ": a connected text", lines: sentences.slice(0, 6).map((sentence, index) => ({ speaker: index % 2 ? "B" : "A", text: sentence.text, translation: sentence.translation })) },
    practice: { id: "practice_" + prefix, passThreshold: 67, questions: [
      question("practice_" + prefix + "_1", "Choose the matching meaning.", vocabulary[0].lemma, vocabChoices(0), vocabulary[0].translation, vocabulary[0].lemma + " means " + vocabulary[0].translation + ".", "vocabulary"),
      question("practice_" + prefix + "_2", "Choose the sentence that demonstrates the lesson pattern.", grammarExamples[0].translation, grammarChoices(0), grammarExamples[0].source, explanation, "grammar"),
      question("practice_" + prefix + "_3", "Recall the connected text.", "Which statement appears in the text?", readingChoices, sentences[0].translation, "The text includes: " + sentences[0].text, "reading"),
    ] },
    quiz: { id: "quiz_" + prefix, title: title + " check", passThreshold: 80, questions: [
      question("quiz_" + prefix + "_1", "Choose the matching meaning.", vocabulary[1].lemma, vocabChoices(1), vocabulary[1].translation, vocabulary[1].lemma + " means " + vocabulary[1].translation + ".", "vocabulary"),
      question("quiz_" + prefix + "_2", "Choose the matching meaning.", vocabulary[6].lemma, vocabChoices(6), vocabulary[6].translation, vocabulary[6].lemma + " means " + vocabulary[6].translation + ".", "vocabulary"),
      question("quiz_" + prefix + "_3", "Choose the sentence that demonstrates the lesson pattern.", grammarExamples[0].translation, grammarChoices(0), grammarExamples[0].source, explanation, "grammar"),
      question("quiz_" + prefix + "_4", "Choose the second correct example of the lesson pattern.", grammarExamples[1].translation, grammarChoices(1), grammarExamples[1].source, explanation, "grammar"),
      question("quiz_" + prefix + "_5", "Recall the connected text.", "Which statement appears in the text?", readingChoices, sentences[0].translation, "The text includes: " + sentences[0].text, "reading"),
    ] },
  };
}

for (const [key, title, description, lessons] of chapterSpecs) {
  const generated = { id: "chapter_de_b1_" + key, slug: key.replaceAll("_", "-"), title, description, lessons: lessons.map(buildLesson) };
  const index = book.chapters.findIndex((chapter) => chapter.id === generated.id);
  if (index >= 0) book.chapters.splice(index, 1, generated);
  else book.chapters.push(generated);
}

book.revision = Math.max(book.revision, 3);
book.provenance.reviewedBy = "B1 increment-two scope and progression review";
book.provenance.reviewedAt = "2026-09-23";
await writeFile(path, JSON.stringify(book, null, 2) + "\n", "utf8");
console.log("B1 increment two contains " + book.chapters.length + " chapters and " + book.chapters.flatMap((chapter) => chapter.lessons).length + " lessons.");
