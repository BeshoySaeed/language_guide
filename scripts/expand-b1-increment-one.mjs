import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

const path = resolve(process.cwd(), "content/languages/de/B1/books/independent-life.json");
const book = JSON.parse(await readFile(path, "utf8"));

const chapterSpecs = [
  ["stories_changes", "Stories and life changes", "Narrate connected events, turning points, and personal development.", [
    ["turning_points", "turning-points", "Turning points", "Explain what had happened before an important change.", "The past perfect with nachdem", "Use hatte or war plus a past participle for an event that happened before another past event. Nachdem sends its conjugated verb to the end.", "Nachdem + subject + ... + participle + hatte/war, past event",
      "der Wendepunkt|turning point|noun;die Entscheidung|decision|noun;sich verändern|to change|verb;aufgeben|to give up|verb;wagen|to dare|verb;rückblickend|in retrospect|adverb;nachdem|after|conjunction;zuvor|previously|adverb",
      "Nachdem ich die Prüfung bestanden hatte, zog ich nach Berlin.|After I had passed the exam, I moved to Berlin.;Zuvor hatte ich lange über die Entscheidung nachgedacht.|Previously I had thought about the decision for a long time.;Der Umzug war ein wichtiger Wendepunkt.|The move was an important turning point.;Anfangs fiel mir die Veränderung schwer.|At first I found the change difficult.;Trotzdem wollte ich etwas Neues wagen.|Nevertheless I wanted to dare to try something new.;Ich gab meine alte Stelle nicht leichtfertig auf.|I did not give up my old position carelessly.;Mit der Zeit fühlte ich mich immer sicherer.|Over time I felt increasingly confident.;Rückblickend war es die richtige Entscheidung.|In retrospect it was the right decision."],
    ["experiences_reactions", "experiences-and-reactions", "Experiences and reactions", "Describe one-time experiences and repeated situations precisely.", "Als and wenn in past narration", "Use als for a single period or event in the past. Use wenn for repeated past situations, conditions, and future events.", "als + one-time past event; wenn + repeated event or condition",
      "die Erfahrung|experience|noun;ungewohnt|unfamiliar|adjective;beeindruckend|impressive|adjective;enttäuschend|disappointing|adjective;sich gewöhnen an|to get used to|verb phrase;damals|at that time|adverb;jedes Mal|every time|phrase;unerwartet|unexpected|adjective",
      "Als ich zum ersten Mal allein reiste, war ich nervös.|When I travelled alone for the first time, I was nervous.;Die neue Umgebung war zunächst ungewohnt.|The new environment was unfamiliar at first.;Besonders beeindruckend fand ich die Offenheit der Menschen.|I found the openness of the people especially impressive.;Wenn ich Hilfe brauchte, erklärte mir jemand den Weg.|Whenever I needed help, someone explained the way.;Jedes Mal lernte ich etwas Neues über mich selbst.|Every time I learned something new about myself.;Eine Begegnung verlief leider enttäuschend.|Unfortunately one encounter was disappointing.;Mit solchen Situationen musste ich mich erst vertraut machen.|I first had to become familiar with such situations.;Am Ende war die Erfahrung besser als erwartet.|In the end the experience was better than expected."],
    ["biography", "biographies-and-milestones", "Biographies and milestones", "Present a person's life as a clear chronological account.", "Written narration with the simple past", "Biographies and reports frequently use the simple past. Strong verbs change their stem, while regular verbs use -te endings.", "time phrase + simple-past verb + complement",
      "der Lebenslauf|biography / CV|noun;die Herkunft|origin|noun;aufwachsen|to grow up|verb;gründen|to found|verb;veröffentlichen|to publish|verb;gelingen|to succeed|verb;der Meilenstein|milestone|noun;prägen|to shape|verb",
      "Sie wuchs in einer kleinen Stadt auf.|She grew up in a small town.;Schon früh interessierte sie sich für Technik.|She became interested in technology at an early age.;Nach dem Studium gründete sie ein eigenes Unternehmen.|After university she founded her own company.;Zwei Jahre später veröffentlichte sie ihr erstes Buch.|Two years later she published her first book.;Der internationale Erfolg gelang ihr nicht sofort.|International success did not come to her immediately.;Ein wichtiger Meilenstein war die Eröffnung eines zweiten Standorts.|An important milestone was the opening of a second location.;Ihre Erfahrungen im Ausland prägten ihre Arbeit.|Her experiences abroad shaped her work.;Heute unterstützt sie junge Gründerinnen und Gründer.|Today she supports young founders."]
  ]],
  ["professional_communication", "Professional communication", "Apply, collaborate, make decisions, and resolve workplace difficulties.", [
    ["applications", "applications-and-career-profiles", "Applications and career profiles", "Present experience, motivation, and evidence in an application.", "Participle adjectives", "Present and past participles can describe nouns: überzeugende Erfahrung describes an active quality, while abgeschlossene Ausbildung describes a completed action.", "participle + adjective ending + noun",
      "die Bewerbung|application|noun;die Qualifikation|qualification|noun;die Voraussetzung|requirement|noun;die Berufserfahrung|professional experience|noun;überzeugend|convincing|adjective;abgeschlossen|completed|adjective;hervorheben|to emphasize|verb;belegen|to demonstrate|verb",
      "Mit großem Interesse bewerbe ich mich um die ausgeschriebene Stelle.|I am applying for the advertised position with great interest.;Die geforderten Voraussetzungen erfülle ich vollständig.|I fully meet the required conditions.;Ich verfüge über mehrjährige Berufserfahrung im Vertrieb.|I have several years of professional experience in sales.;Meine abgeschlossene Ausbildung passt gut zum Aufgabenbereich.|My completed training fits the area of responsibility well.;Im Anschreiben hebe ich meine wichtigsten Qualifikationen hervor.|In the cover letter I emphasize my most important qualifications.;Konkrete Beispiele belegen meine selbstständige Arbeitsweise.|Specific examples demonstrate my independent way of working.;Besonders überzeugend ist meine Erfahrung mit internationalen Kunden.|My experience with international clients is particularly convincing.;Über die Einladung zu einem Gespräch würde ich mich sehr freuen.|I would be very pleased to receive an invitation to an interview."],
    ["meetings", "meetings-and-decisions", "Meetings and decisions", "Summarize positions, evaluate options, and document a decision.", "Reporting statements with dass and sollen", "Use dass clauses for neutral reports and sollen when reporting an unconfirmed claim or expectation. The reporting frame makes the source clear.", "source + reporting verb + dass/sollen + reported content",
      "die Tagesordnung|agenda|noun;der Tagesordnungspunkt|agenda item|noun;der Einwand|objection|noun;abstimmen|to vote|verb;beschließen|to decide formally|verb;festhalten|to record|verb;die Mehrheit|majority|noun;der Vorschlag|proposal|noun",
      "Auf der Tagesordnung stehen heute drei Punkte.|There are three items on today's agenda.;Zunächst stellt die Projektleitung ihren Vorschlag vor.|First the project management presents its proposal.;Mehrere Kollegen äußern einen Einwand gegen den Zeitplan.|Several colleagues raise an objection to the schedule.;Die Leitung erklärt, dass eine Verschiebung zusätzliche Kosten verursacht.|Management explains that a delay causes additional costs.;Der neue Ablauf soll deutlich effizienter sein.|The new process is said to be considerably more efficient.;Nach der Diskussion stimmen wir über beide Möglichkeiten ab.|After the discussion we vote on both options.;Die Mehrheit beschließt, den Start um eine Woche zu verschieben.|The majority decides to postpone the start by one week.;Das Ergebnis wird anschließend im Protokoll festgehalten.|The result is then recorded in the minutes."],
    ["workplace_conflict", "workplace-problems-and-conflict", "Workplace problems and conflict", "Raise a concern, understand perspectives, and agree on next steps.", "Alternatives with statt zu and ohne zu", "Statt zu describes a rejected alternative; ohne zu describes an action that does not happen. Both use an infinitive construction when the subject stays the same.", "statt/ohne + ... + zu + infinitive",
      "der Konflikt|conflict|noun;die Belastung|workload / strain|noun;die Erwartung|expectation|noun;ansprechen|to address|verb;missverstehen|to misunderstand|verb;vermitteln|to mediate|verb;entgegenkommen|to accommodate|verb;die Vereinbarung|agreement|noun",
      "Ich möchte ein Problem bei der Aufgabenverteilung ansprechen.|I would like to address a problem with the distribution of tasks.;In letzter Zeit ist meine Belastung deutlich gestiegen.|Recently my workload has increased significantly.;Wir sollten die Erwartungen klären, statt einander Vorwürfe zu machen.|We should clarify expectations instead of blaming each other.;Mein Hinweis wurde missverstanden, ohne dass ich nachfragen konnte.|My comment was misunderstood without my being able to ask further.;Die Teamleitung bietet an, zwischen uns zu vermitteln.|The team lead offers to mediate between us.;Beide Seiten erklären ruhig ihre Sichtweise.|Both sides calmly explain their perspective.;Das Unternehmen kommt uns bei der Arbeitszeit entgegen.|The company accommodates us regarding working hours.;Zum Schluss halten wir die neue Vereinbarung schriftlich fest.|At the end we record the new agreement in writing."]
  ]],
  ["consumer_admin", "Consumer rights and administration", "Understand agreements, assert consumer rights, and handle official procedures.", [
    ["contracts", "contracts-and-subscriptions", "Contracts and subscriptions", "Identify obligations, deadlines, and cancellation conditions.", "Modal verbs in the passive", "Combine a modal verb with passive werden when something must, may, or can be done. The participle and werden remain together at the end.", "subject + modal + ... + participle + werden",
      "der Vertrag|contract|noun;die Laufzeit|term / duration|noun;die Kündigungsfrist|notice period|noun;sich verlängern|to renew / extend|verb;widerrufen|to withdraw / revoke|verb;die Bedingung|condition|noun;verbindlich|binding|adjective;fristgerecht|within the deadline|adjective",
      "Vor der Unterschrift sollte der Vertrag genau geprüft werden.|The contract should be checked carefully before signing.;Die Mindestlaufzeit beträgt zwölf Monate.|The minimum term is twelve months.;Danach verlängert sich das Abonnement automatisch.|After that the subscription renews automatically.;Die Kündigungsfrist muss unbedingt eingehalten werden.|The notice period must be observed without fail.;Unter bestimmten Bedingungen kann der Vertrag widerrufen werden.|Under certain conditions the contract can be revoked.;Diese Vereinbarung ist für beide Seiten verbindlich.|This agreement is binding for both sides.;Die Kündigung muss schriftlich eingereicht werden.|The cancellation must be submitted in writing.;Ich habe den Vertrag fristgerecht beendet.|I ended the contract within the deadline."],
    ["complaints", "formal-complaints-and-remedies", "Formal complaints and remedies", "Document a service failure and request an appropriate remedy.", "Concession with zwar ... aber", "Zwar acknowledges one fact, while aber introduces the stronger contrasting point. This structure makes a complaint balanced but firm.", "zwar + statement, aber + decisive contrast",
      "die Beschwerde|complaint|noun;der Mangel|defect|noun;die Leistung|service / performance|noun;beanstanden|to object to / complain about|verb;die Nachbesserung|remedial work|noun;die Entschädigung|compensation|noun;angemessen|appropriate|adjective;nachweisen|to prove|verb",
      "Hiermit möchte ich mich über die erbrachte Leistung beschweren.|I hereby wish to complain about the service provided.;Die Lieferung kam zwar pünktlich, aber mehrere Teile waren beschädigt.|The delivery arrived on time, but several parts were damaged.;Den Mangel kann ich mit Fotos nachweisen.|I can prove the defect with photographs.;Bereits am selben Tag habe ich den Schaden beanstandet.|I complained about the damage on the same day.;Bisher wurde mir keine angemessene Lösung angeboten.|So far I have not been offered an appropriate solution.;Ich bitte daher um eine kostenlose Nachbesserung.|I therefore request remedial work free of charge.;Alternativ halte ich eine Entschädigung für gerechtfertigt.|Alternatively I consider compensation justified.;Bitte teilen Sie mir innerhalb von sieben Tagen mit, wie Sie vorgehen.|Please inform me within seven days how you will proceed."],
    ["authorities", "authorities-forms-and-procedures", "Authorities, forms, and procedures", "Request information and complete an official process confidently.", "Nominalized verbs and adjectives", "German often turns verbs and adjectives into nouns in official language. Nominalized forms are capitalized and usually used with an article or preposition.", "preposition/article + capitalized nominalized form",
      "die Behörde|authority|noun;der Antrag|application / request|noun;der Nachweis|proof / document|noun;einreichen|to submit|verb;bearbeiten|to process|verb;genehmigen|to approve|verb;zuständig|responsible|adjective;die Voraussetzung|requirement|noun",
      "Für die Anmeldung ist diese Behörde zuständig.|This authority is responsible for the registration.;Den Antrag können Sie online oder persönlich einreichen.|You can submit the application online or in person.;Zum Ausfüllen benötigen Sie Ihre Versicherungsnummer.|You need your insurance number to fill it in.;Außerdem muss ein gültiger Nachweis beigefügt werden.|In addition a valid proof document must be attached.;Die Bearbeitung dauert in der Regel zwei Wochen.|Processing normally takes two weeks.;Ich möchte wissen, ob mein Antrag bereits genehmigt wurde.|I would like to know whether my application has already been approved.;Welche Voraussetzungen müssen noch erfüllt werden?|Which requirements still have to be met?;Nach erfolgreicher Prüfung erhalten Sie einen schriftlichen Bescheid.|After successful review you will receive a written decision."]
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
    grammar: { id: "grammar_" + prefix, title: grammarTitle, explanation, pattern, examples: grammarExamples, commonMistake: "Keep the intended relationship between clauses clear and check the complete verb frame before finishing." },
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

book.revision = Math.max(book.revision, 2);
book.provenance.reviewedBy = "B1 increment-one scope and progression review";
book.provenance.reviewedAt = "2026-09-23";
await writeFile(path, JSON.stringify(book, null, 2) + "\n", "utf8");
console.log("B1 increment one contains " + book.chapters.length + " chapters and " + book.chapters.flatMap((chapter) => chapter.lessons).length + " lessons.");
