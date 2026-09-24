import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

const batches = {
  A2: [
    ["lesson_de_a2_plans", "sich verabreden", "to arrange to meet", "reflexive verb", "", "Wir haben uns für Freitagabend verabredet.", "We arranged to meet on Friday evening."],
    ["lesson_de_a2_weekend", "die Jugendherberge", "youth hostel", "noun", "die Jugendherbergen", "Die Jugendherberge liegt direkt am See.", "The youth hostel is directly by the lake."],
    ["lesson_de_a2_flat", "die Nebenkosten", "additional rental costs", "plural noun", "", "Sind die Nebenkosten in der Miete enthalten?", "Are the additional costs included in the rent?"],
    ["lesson_de_a2_smart_shopping", "umtauschen", "to exchange", "verb", "", "Kann ich die Jacke gegen eine größere umtauschen?", "Can I exchange the jacket for a larger one?"],
    ["lesson_de_a2_finding_way", "sich verlaufen", "to get lost", "reflexive verb", "", "Wir haben uns in der Altstadt verlaufen.", "We got lost in the old town."],
    ["lesson_de_a2_health_help", "die Sprechstunde", "consultation hours", "noun", "die Sprechstunden", "Die offene Sprechstunde beginnt um acht Uhr.", "The walk-in consultation begins at eight."],
    ["lesson_de_a2_story_sequence", "anschließend", "afterwards", "adverb", "", "Anschließend sind wir noch etwas essen gegangen.", "Afterwards we went to get something to eat."],
    ["lesson_de_a2_past_background", "damals", "back then", "adverb", "", "Damals wohnte ich noch bei meinen Eltern.", "Back then I still lived with my parents."],
    ["lesson_de_a2_modal_past", "verpflichtet sein", "to be required", "verb phrase", "", "Ich war verpflichtet, den Termin abzusagen.", "I was required to cancel the appointment."],
    ["lesson_de_a2_neighbors", "Rücksicht nehmen auf", "to be considerate of", "verb phrase", "", "Bitte nehmen Sie Rücksicht auf die Nachbarn.", "Please be considerate of the neighbors."],
    ["lesson_de_a2_repairs", "undicht", "leaking / not watertight", "adjective", "", "Das Fenster ist undicht und muss repariert werden.", "The window is leaking and must be repaired."],
    ["lesson_de_a2_moving", "einpacken", "to pack", "separable verb", "", "Wir müssen die Bücher noch einpacken.", "We still have to pack the books."],
    ["lesson_de_a2_workplace", "rechtzeitig", "in time", "adverb", "", "Bitte schicken Sie den Bericht rechtzeitig.", "Please send the report in time."],
    ["lesson_de_a2_course", "eine Prüfung bestehen", "to pass an exam", "verb phrase", "", "Sie hat die Prüfung beim ersten Versuch bestanden.", "She passed the exam on her first attempt."],
    ["lesson_de_a2_professional_messages", "sich melden bei", "to contact / report to", "verb phrase", "", "Bitte melden Sie sich morgen bei Frau Klein.", "Please contact Ms Klein tomorrow."],
    ["lesson_de_a2_returns", "der Kassenbon", "receipt", "noun", "die Kassenbons", "Für den Umtausch brauche ich den Kassenbon.", "I need the receipt for the exchange."],
    ["lesson_de_a2_bank_post", "überweisen", "to transfer money", "verb", "", "Ich überweise die Miete am Monatsanfang.", "I transfer the rent at the beginning of the month."],
    ["lesson_de_a2_appointments_services", "erreichbar", "reachable / available", "adjective", "", "Wann sind Sie telefonisch erreichbar?", "When can you be reached by phone?"],
    ["lesson_de_a2_tickets", "der Bahnsteig", "platform", "noun", "die Bahnsteige", "Der Zug fährt heute von Bahnsteig sieben ab.", "The train leaves from platform seven today."],
    ["lesson_de_a2_accommodation", "die Rezeption", "reception desk", "noun", "die Rezeptionen", "Bitte geben Sie den Schlüssel an der Rezeption ab.", "Please leave the key at reception."],
    ["lesson_de_a2_disruptions", "der Schienenersatzverkehr", "rail replacement service", "noun", "", "Wegen der Baustelle gibt es Schienenersatzverkehr.", "There is a rail replacement service because of construction."],
    ["lesson_de_a2_doctor", "die Überweisung", "medical referral", "noun", "die Überweisungen", "Für den Facharzt brauche ich eine Überweisung.", "I need a referral for the specialist."],
    ["lesson_de_a2_advice", "sich schonen", "to take it easy", "reflexive verb", "", "Sie sollten sich ein paar Tage schonen.", "You should take it easy for a few days."],
    ["lesson_de_a2_balance", "abschalten", "to switch off / unwind", "separable verb", "", "Beim Spazierengehen kann ich gut abschalten.", "I can unwind well while walking."],
    ["lesson_de_a2_invitations", "absagen", "to cancel / decline", "separable verb", "", "Leider muss ich die Einladung kurzfristig absagen.", "Unfortunately I have to decline the invitation at short notice."],
    ["lesson_de_a2_feelings", "enttäuscht", "disappointed", "adjective", "", "Ich war von der Reaktion ziemlich enttäuscht.", "I was quite disappointed by the reaction."],
    ["lesson_de_a2_relationships", "sich vertragen", "to get along / make up", "reflexive verb", "", "Nach dem Gespräch haben wir uns wieder vertragen.", "After the conversation we made up again."],
    ["lesson_de_a2_devices", "neu starten", "to restart", "verb phrase", "", "Starten Sie das Gerät bitte neu.", "Please restart the device."],
    ["lesson_de_a2_online_messages", "vertraulich", "confidential", "adjective", "", "Diese persönlichen Daten sind vertraulich.", "This personal data is confidential."],
    ["lesson_de_a2_media_habits", "die Schlagzeile", "headline", "noun", "die Schlagzeilen", "Die Schlagzeile klingt dramatischer als der Artikel.", "The headline sounds more dramatic than the article."],
    ["lesson_de_a2_subordinate", "sofern", "provided that", "conjunction", "", "Du kannst mitkommen, sofern du rechtzeitig fertig bist.", "You can come along provided that you finish in time."],
    ["lesson_de_a2_cases_prepositions", "gegenüber", "opposite / toward", "preposition", "", "Die Apotheke liegt dem Bahnhof gegenüber.", "The pharmacy is opposite the station."],
    ["lesson_de_a2_adjectives", "gebraucht", "used / second-hand", "adjective", "", "Wir suchen einen gebrauchten Schreibtisch.", "We are looking for a used desk."],
    ["lesson_de_a2_future", "vorhaben", "to intend / plan", "verb", "", "Was hast du am Wochenende vor?", "What are you planning for the weekend?"],
    ["lesson_de_a2_compare", "im Gegensatz zu", "in contrast to", "connector", "", "Im Gegensatz zum Bus ist die Bahn schneller.", "In contrast to the bus, the train is faster."],
    ["lesson_de_a2_negotiate", "jemandem entgegenkommen", "to accommodate someone", "verb phrase", "", "Könnten Sie mir beim Preis etwas entgegenkommen?", "Could you accommodate me a little on the price?"],
    ["lesson_de_a2_longer_reading", "dem Text zufolge", "according to the text", "reading phrase", "", "Dem Text zufolge wurde der Termin verschoben.", "According to the text, the appointment was postponed."],
    ["lesson_de_a2_writing", "im Voraus", "in advance", "adverbial phrase", "", "Vielen Dank im Voraus für Ihre Antwort.", "Thank you in advance for your reply."],
    ["lesson_de_a2_speaking", "zunächst", "first of all", "adverb", "", "Zunächst möchte ich die Situation kurz erklären.", "First of all, I would like to explain the situation briefly."],
    ["lesson_de_a2_listening", "heraushören", "to pick out by listening", "separable verb", "", "Ich konnte die Adresse nicht klar heraushören.", "I could not clearly pick out the address."],
    ["lesson_de_a2_problem_solving", "eine Lösung finden", "to find a solution", "verb phrase", "", "Gemeinsam finden wir bestimmt eine Lösung.", "Together we will surely find a solution."],
    ["lesson_de_a2_production", "rückblickend", "in retrospect", "adverb", "", "Rückblickend habe ich besonders viel beim Sprechen gelernt.", "In retrospect, I learned especially much through speaking."],
  ],
  B1: [
    ["lesson_de_b1_opinions", "der Standpunkt", "point of view", "noun", "die Standpunkte", "Ich kann deinen Standpunkt nachvollziehen.", "I can understand your point of view."],
    ["lesson_de_b1_work", "die Qualifikation", "qualification", "noun", "die Qualifikationen", "Für die Stelle sind mehrere Qualifikationen erforderlich.", "Several qualifications are required for the position."],
    ["lesson_de_b1_news", "die Berichterstattung", "news coverage", "noun", "", "Die Berichterstattung war ausführlich und sachlich.", "The news coverage was detailed and factual."],
    ["lesson_de_b1_learning_goals", "eigenständig", "independently", "adjective", "", "Die Teilnehmenden bearbeiten die Aufgabe eigenständig.", "The participants complete the task independently."],
    ["lesson_de_b1_travel_changes", "umbuchen", "to rebook", "verb", "", "Wir mussten den Rückflug kurzfristig umbuchen.", "We had to rebook the return flight at short notice."],
    ["lesson_de_b1_community", "sich einsetzen für", "to advocate for", "verb phrase", "", "Sie setzt sich für bessere Radwege ein.", "She advocates for better cycle paths."],
    ["lesson_de_b1_turning_points", "im Nachhinein", "in hindsight", "adverbial phrase", "", "Im Nachhinein war die Entscheidung genau richtig.", "In hindsight, the decision was exactly right."],
    ["lesson_de_b1_experiences_reactions", "überwältigt", "overwhelmed", "adjective", "", "Von den vielen Eindrücken war ich zunächst überwältigt.", "At first I was overwhelmed by the many impressions."],
    ["lesson_de_b1_biography", "prägend", "formative / influential", "adjective", "", "Diese Erfahrung war für ihren weiteren Weg prägend.", "This experience shaped her future path."],
    ["lesson_de_b1_applications", "aussagekräftig", "informative / compelling", "adjective", "", "Ein aussagekräftiger Lebenslauf nennt konkrete Erfolge.", "A compelling CV mentions concrete achievements."],
    ["lesson_de_b1_meetings", "der Beschluss", "resolution / decision", "noun", "die Beschlüsse", "Der Beschluss wurde einstimmig angenommen.", "The resolution was adopted unanimously."],
    ["lesson_de_b1_workplace_conflict", "deeskalieren", "to de-escalate", "verb", "", "Ein ruhiges Gespräch kann den Konflikt deeskalieren.", "A calm conversation can de-escalate the conflict."],
    ["lesson_de_b1_contracts", "die Kündigungsfrist", "notice period", "noun", "die Kündigungsfristen", "Beachten Sie bitte die Kündigungsfrist im Vertrag.", "Please note the notice period in the contract."],
    ["lesson_de_b1_complaints", "der Schadensersatz", "compensation for damages", "noun", "", "Unter bestimmten Bedingungen besteht Anspruch auf Schadensersatz.", "Under certain conditions there is a right to compensation."],
    ["lesson_de_b1_authorities", "die Zuständigkeit", "responsibility / jurisdiction", "noun", "die Zuständigkeiten", "Welche Behörde ist für den Antrag zuständig?", "Which authority is responsible for the application?"],
    ["lesson_de_b1_journey_planning", "die Reiseroute", "travel route", "noun", "die Reiserouten", "Wir haben die Reiseroute an das Wetter angepasst.", "We adapted the travel route to the weather."],
    ["lesson_de_b1_disruption", "Anspruch haben auf", "to be entitled to", "verb phrase", "", "Bei großer Verspätung haben Sie Anspruch auf Erstattung.", "In case of a major delay, you are entitled to reimbursement."],
    ["lesson_de_b1_places_culture", "die Gepflogenheit", "custom / convention", "noun", "die Gepflogenheiten", "Informiere dich vorher über die örtlichen Gepflogenheiten.", "Find out about local customs beforehand."],
    ["lesson_de_b1_healthcare_choices", "eine Diagnose stellen", "to make a diagnosis", "verb phrase", "", "Nach der Untersuchung konnte die Ärztin eine Diagnose stellen.", "After the examination the doctor was able to make a diagnosis."],
    ["lesson_de_b1_stress_boundaries", "Grenzen setzen", "to set boundaries", "verb phrase", "", "Im Arbeitsalltag muss ich klare Grenzen setzen.", "I have to set clear boundaries in everyday work."],
    ["lesson_de_b1_wellbeing_habits", "die Belastbarkeit", "resilience / capacity", "noun", "", "Regelmäßige Pausen verbessern langfristig die Belastbarkeit.", "Regular breaks improve resilience in the long term."],
    ["lesson_de_b1_volunteering", "gemeinnützig", "non-profit / charitable", "adjective", "", "Der Verein verfolgt gemeinnützige Ziele.", "The association pursues charitable goals."],
    ["lesson_de_b1_education_opportunity", "die Chancengleichheit", "equal opportunity", "noun", "", "Gute Bildungsangebote fördern die Chancengleichheit.", "Good educational opportunities promote equal opportunity."],
    ["lesson_de_b1_diverse_society", "die Zugehörigkeit", "belonging", "noun", "", "Sprache kann das Gefühl der Zugehörigkeit stärken.", "Language can strengthen the feeling of belonging."],
    ["lesson_de_b1_climate_choices", "klimafreundlich", "climate-friendly", "adjective", "", "Viele Beschäftigte möchten klimafreundlicher pendeln.", "Many employees want to commute in a more climate-friendly way."],
    ["lesson_de_b1_resources", "wiederverwertbar", "recyclable", "adjective", "", "Die Verpackung besteht aus wiederverwertbarem Material.", "The packaging is made of recyclable material."],
    ["lesson_de_b1_local_projects", "die Bürgerinitiative", "citizens’ initiative", "noun", "die Bürgerinitiativen", "Eine Bürgerinitiative plant einen Gemeinschaftsgarten.", "A citizens’ initiative is planning a community garden."],
    ["lesson_de_b1_source_checking", "glaubwürdig", "credible", "adjective", "", "Die Behauptung wirkt ohne Quellenangabe nicht glaubwürdig.", "The claim does not seem credible without a source."],
    ["lesson_de_b1_privacy_algorithms", "die Datenspur", "digital footprint", "noun", "die Datenspuren", "Jede Online-Suche kann eine Datenspur hinterlassen.", "Every online search can leave a digital footprint."],
    ["lesson_de_b1_online_debate", "sachlich bleiben", "to remain objective", "verb phrase", "", "Auch bei Widerspruch sollten wir sachlich bleiben.", "Even when disagreeing, we should remain objective."],
    ["lesson_de_b1_friendship_boundaries", "gegenseitig", "mutual / one another", "adjective", "", "Vertrauen entsteht, wenn man sich gegenseitig unterstützt.", "Trust develops when people support one another."],
    ["lesson_de_b1_mediation", "vermitteln", "to mediate", "verb", "", "Eine neutrale Person kann zwischen beiden Seiten vermitteln.", "A neutral person can mediate between both sides."],
    ["lesson_de_b1_generations", "der Rollenwandel", "change in social roles", "noun", "", "Der Rollenwandel betrifft Arbeit und Familienleben.", "Changes in social roles affect work and family life."],
    ["lesson_de_b1_complex_clauses", "wohingegen", "whereas", "conjunction", "", "Die Stadt ist gut angebunden, wohingegen das Dorf ruhiger ist.", "The city is well connected, whereas the village is quieter."],
    ["lesson_de_b1_relative_passive", "durchgeführt werden", "to be carried out", "passive phrase", "", "Die Befragung wird anonym durchgeführt.", "The survey is carried out anonymously."],
    ["lesson_de_b1_verb_preposition_precision", "beruhen auf", "to be based on", "verb phrase", "", "Die Entscheidung beruht auf aktuellen Daten.", "The decision is based on current data."],
    ["lesson_de_b1_extended_reading", "der Sachtext", "informational text", "noun", "die Sachtexte", "Der Sachtext erklärt die wichtigsten Zusammenhänge.", "The informational text explains the main connections."],
    ["lesson_de_b1_extended_listening", "der Redebeitrag", "spoken contribution", "noun", "die Redebeiträge", "Im zweiten Redebeitrag wird ein Gegenargument genannt.", "A counterargument is mentioned in the second contribution."],
    ["lesson_de_b1_structured_writing", "die Stellungnahme", "written statement / opinion", "noun", "die Stellungnahmen", "Die Stellungnahme enthält eine klare Begründung.", "The written statement contains clear reasoning."],
    ["lesson_de_b1_presentation", "hervorheben", "to emphasize", "separable verb", "", "Zum Schluss möchte ich einen Vorteil hervorheben.", "Finally, I would like to emphasize one advantage."],
    ["lesson_de_b1_interaction", "einen Kompromiss aushandeln", "to negotiate a compromise", "verb phrase", "", "Nach längerer Diskussion konnten wir einen Kompromiss aushandeln.", "After a longer discussion we were able to negotiate a compromise."],
    ["lesson_de_b1_final_preparation", "der Lernbedarf", "learning need", "noun", "", "Die Auswertung zeigt meinen weiteren Lernbedarf.", "The evaluation shows my further learning needs."],
  ],
};

const fileByLevel = { A2: "everyday-connections.json", B1: "independent-life.json" };

for (const [level, rows] of Object.entries(batches)) {
  const path = resolve(process.cwd(), `content/languages/de/${level}/books/${fileByLevel[level]}`);
  const book = JSON.parse(await readFile(path, "utf8"));
  const lessons = new Map(book.chapters.flatMap((chapter) => chapter.lessons).map((lesson) => [lesson.id, lesson]));
  const existing = new Set(book.chapters.flatMap((chapter) => chapter.lessons).flatMap((lesson) => lesson.vocabulary).map((item) => normalize(item.lemma)));
  const retainedCore = (book.coreVocabulary ?? []).filter((item) => !item.id.startsWith(`vocab_de_${level.toLowerCase()}_reviewed_`));
  const reviewed = [];

  for (const [sourceLessonId, lemma, translation, partOfSpeech, plural, exampleSentence, exampleTranslation] of rows) {
    if (!lessons.has(sourceLessonId)) throw new Error(`${level}: missing source lesson ${sourceLessonId}`);
    if (existing.has(normalize(lemma))) continue;
    const article = lemma.match(/^(der|die|das)\s/iu)?.[1]?.toLocaleLowerCase("de-DE");
    const languageFeatures = {
      coreVocabulary: true,
      topic: lessons.get(sourceLessonId).title,
      qualityStatus: "reviewed",
      ...(article ? { gender: article === "der" ? "masculine" : article === "die" ? "feminine" : "neuter" } : {}),
      ...(plural ? { plural } : {}),
    };
    reviewed.push({
      id: `vocab_de_${level.toLowerCase()}_reviewed_${String(reviewed.length + 1).padStart(4, "0")}`,
      lemma,
      translation,
      pronunciation: "audio",
      partOfSpeech,
      languageFeatures,
      exampleSentence,
      exampleTranslation,
      sourceLessonId,
    });
    existing.add(normalize(lemma));
  }

  book.coreVocabulary = [...reviewed, ...retainedCore];
  book.revision += 1;
  await writeFile(path, `${JSON.stringify(book, null, 2)}\n`, "utf8");
  console.log(`${level}: published ${reviewed.length} reviewed vocabulary cards in batch one.`);
}

function normalize(value) {
  return value.normalize("NFKC").trim().toLocaleLowerCase("de-DE");
}
