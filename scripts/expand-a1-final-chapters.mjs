import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

const path = resolve(process.cwd(), "content/languages/de/A1/books/everyday-essentials.json");
const book = JSON.parse(await readFile(path, "utf8"));

const chapters = [
  {
    key: "communication_safety", slug: "communication-and-safety", title: "Communication and safety",
    description: "Handle calls and messages, repair misunderstandings, and ask for help in urgent situations.",
    lessons: [
      {
        key: "phone", slug: "phone-calls-and-messages", title: "Phone calls and messages",
        summary: "Make a simple call, leave a message, and arrange when someone should call back.",
        objectives: ["Open and close a basic phone call", "Leave and understand a short message", "Place time expressions naturally in a sentence"],
        vocab: [["der Anruf","phone call","noun"],["anrufen","to call","verb"],["das Handy","mobile phone","noun"],["die Nachricht","message","noun"],["hinterlassen","to leave behind","verb"],["zurückrufen","to call back","verb"],["erreichbar","reachable","adjective"],["besetzt","busy / engaged","adjective"],["die Nummer","number","noun"],["sprechen","to speak","verb"],["verbinden","to connect","verb"],["später","later","adverb"]],
        sentences: [["Guten Tag, hier ist Samir Hassan.","Hello, this is Samir Hassan."],["Kann ich bitte Frau Weber sprechen?","May I speak to Ms Weber, please?"],["Sie ist gerade nicht erreichbar.","She is not available right now."],["Möchten Sie eine Nachricht hinterlassen?","Would you like to leave a message?"],["Bitte rufen Sie mich heute Nachmittag zurück.","Please call me back this afternoon."],["Meine Nummer ist null eins sieben sechs, vier zwei acht neun.","My number is 0176 4289."],["Die Leitung ist leider besetzt.","Unfortunately, the line is busy."],["Ich rufe später noch einmal an.","I will call again later."],["Wann kann ich Sie erreichen?","When can I reach you?"],["Können Sie mich mit Herrn Klein verbinden?","Can you connect me to Mr Klein?"],["Vielen Dank für Ihren Anruf.","Thank you for your call." ]],
        grammar: ["Time–manner–place in a main clause","After the conjugated verb, German normally puts time before manner and place. A short time expression can also come first; the verb still stays in position two.","subject + verb + time + manner + place",["Ich rufe Sie morgen aus dem Büro an.","I will call you tomorrow from the office."],["Heute Abend schreibe ich dir.","I will write to you this evening."],"When a time phrase starts the sentence, put the subject after the verb: Heute rufe ich an, not Heute ich rufe an."],
        dialogue: [["Rezeption","Praxis Berger, guten Tag.","Berger medical practice, hello."],["Samir","Guten Tag, hier ist Samir Hassan. Kann ich Frau Berger sprechen?","Hello, this is Samir Hassan. May I speak to Ms Berger?"],["Rezeption","Sie ist gerade nicht erreichbar.","She is not available right now."],["Samir","Kann ich eine Nachricht hinterlassen?","Can I leave a message?"],["Rezeption","Natürlich. Wann soll sie zurückrufen?","Of course. When should she call back?"],["Samir","Bitte heute Nachmittag. Vielen Dank.","This afternoon, please. Thank you." ]],
        grammarTests: [["Heute Abend ___ ich dich an.",["rufe","ich rufe","anrufe"],"rufe","The verb stays second after Heute Abend."],["Choose the natural order.",["Ich rufe dich morgen aus dem Büro an.","Ich morgen rufe dich aus dem Büro an.","Ich rufe aus dem Büro dich morgen an."],"Ich rufe dich morgen aus dem Büro an.","Time normally comes before place in the middle field."]],
        readingCheck: ["When should Ms Berger call back?",["This afternoon","Tomorrow morning","Immediately"],"This afternoon","Samir asks her to call back this afternoon."]
      },
      {
        key: "clarification", slug: "asking-for-clarification", title: "Asking for clarification",
        summary: "Keep a conversation going by asking for repetition, spelling, and simpler explanations.",
        objectives: ["Ask someone to repeat or slow down", "Check spelling and meaning politely", "Use question words and denn naturally"],
        vocab: [["wiederholen","to repeat","verb"],["langsamer","more slowly","adverb"],["buchstabieren","to spell","verb"],["verstehen","to understand","verb"],["bedeuten","to mean","verb"],["erklären","to explain","verb"],["noch einmal","once again","phrase"],["genau","exactly","adverb"],["das Wort","word","noun"],["der Satz","sentence","noun"],["richtig","correct","adjective"],["meinen","to mean / intend","verb"]],
        sentences: [["Entschuldigung, das habe ich nicht verstanden.","Excuse me, I did not understand that."],["Können Sie das bitte wiederholen?","Could you repeat that, please?"],["Bitte sprechen Sie etwas langsamer.","Please speak a little more slowly."],["Wie schreibt man das?","How do you spell that?"],["Können Sie das bitte buchstabieren?","Could you spell that, please?"],["Was bedeutet dieses Wort?","What does this word mean?"],["Was meinen Sie genau?","What exactly do you mean?"],["Ist dieser Satz richtig?","Is this sentence correct?"],["Können Sie ein Beispiel geben?","Can you give an example?"],["Jetzt verstehe ich es.","Now I understand it."],["Danke für die Erklärung.","Thank you for the explanation." ]],
        grammar: ["Friendly questions with denn","In spoken German, denn can make a question sound interested and less abrupt. It does not change the normal question word order.","question word + verb + subject + denn ...?",["Wie heißt du denn?","What is your name, then?"],["Was bedeutet das denn?","So what does that mean?"],"Denn does not mean because in these questions; do not move the verb away from its normal question position."],
        dialogue: [["Mitarbeiterin","Bitte füllen Sie das Formular digital aus.","Please complete the form digitally."],["Rami","Entschuldigung, was bedeutet digital?","Excuse me, what does digital mean?"],["Mitarbeiterin","Am Computer oder am Handy, nicht auf Papier.","On a computer or phone, not on paper."],["Rami","Können Sie das bitte noch einmal langsamer sagen?","Could you say that again more slowly, please?"],["Mitarbeiterin","Natürlich. Sie füllen das Formular am Computer aus.","Of course. You complete the form on a computer."],["Rami","Jetzt verstehe ich es. Vielen Dank.","Now I understand. Thank you very much." ]],
        grammarTests: [["Was ___ dieses Wort denn?",["bedeutet","bedeuten","du bedeutest"],"bedeutet","The singular subject dieses Wort takes bedeutet."],["Choose the polite repair question.",["Können Sie das bitte wiederholen?","Wiederholen du das?","Sie das wiederholen?"],"Können Sie das bitte wiederholen?","Können Sie ...? is a polite request." ]],
        readingCheck: ["How should the form be completed?",["On a computer or phone","Only on paper","By telephone"],"On a computer or phone","The employee explains that digital means on a computer or phone."]
      },
      {
        key: "emergency", slug: "emergencies-and-help", title: "Emergencies and help",
        summary: "Recognize urgent language, describe a simple problem, and request immediate help.",
        objectives: ["Call for help and identify an emergency", "Give a location and describe a basic problem", "Use müssen and the formal imperative in urgent situations"],
        vocab: [["der Notfall","emergency","noun"],["die Hilfe","help","noun"],["helfen","to help","verb"],["die Polizei","police","noun"],["die Feuerwehr","fire brigade","noun"],["der Krankenwagen","ambulance","noun"],["verletzt","injured","adjective"],["gefährlich","dangerous","adjective"],["brennen","to burn","verb"],["warten","to wait","verb"],["sofort","immediately","adverb"],["ruhig","calm","adjective"]],
        sentences: [["Hilfe! Das ist ein Notfall.","Help! This is an emergency."],["Rufen Sie bitte einen Krankenwagen.","Please call an ambulance."],["Eine Person ist verletzt.","One person is injured."],["Wir sind vor dem Bahnhof.","We are in front of the station."],["Hier brennt es.","There is a fire here."],["Bitte bleiben Sie ruhig.","Please remain calm."],["Sie müssen hier warten.","You must wait here."],["Die Polizei kommt sofort.","The police are coming immediately."],["Ist jemand in Gefahr?","Is anyone in danger?"],["Ich brauche dringend Hilfe.","I urgently need help."],["Gehen Sie nicht in das Gebäude.","Do not go into the building." ]],
        grammar: ["Necessity with müssen","Use müssen for something necessary or required. The conjugated modal is in position two and the main infinitive goes to the end.","subject + müssen + ... + infinitive",["Wir müssen einen Arzt rufen.","We must call a doctor."],["Sie müssen draußen warten.","You must wait outside."],"Do not conjugate the second verb: say Sie müssen warten, not Sie müssen warten Sie."],
        dialogue: [["Leitstelle","Notruf. Wo sind Sie?","Emergency services. Where are you?"],["Anrufer","Wir sind vor dem Bahnhof. Eine Person ist verletzt.","We are in front of the station. One person is injured."],["Leitstelle","Ist die Person bei Bewusstsein?","Is the person conscious?"],["Anrufer","Ja, aber sie braucht Hilfe.","Yes, but she needs help."],["Leitstelle","Ein Krankenwagen kommt sofort. Bleiben Sie ruhig.","An ambulance is coming immediately. Stay calm."],["Anrufer","Gut. Wir warten hier.","Good. We will wait here." ]],
        grammarTests: [["Wir ___ einen Arzt rufen.",["müssen","muss","müsst"],"müssen","Wir takes müssen."],["Choose the correct urgent instruction.",["Bleiben Sie ruhig.","Sie bleiben ruhig!","Ruhig Sie bleiben."],"Bleiben Sie ruhig.","The formal imperative begins with the verb, followed by Sie." ]],
        readingCheck: ["Where are the callers?",["In front of the station","At a hospital","Inside a hotel"],"In front of the station","The caller gives the location as vor dem Bahnhof."]
      }
    ]
  },
  {
    key: "grammar_consolidation", slug: "grammar-consolidation", title: "Grammar consolidation",
    description: "Connect the core A1 case, verb, and past-time patterns in complete everyday sentences.",
    lessons: [
      {
        key: "cases", slug: "articles-cases-and-pronouns", title: "Articles, cases, and pronouns",
        summary: "Review who does what to whom with nominative, accusative, and essential dative forms.",
        objectives: ["Identify subjects and direct objects", "Choose frequent accusative and dative articles", "Replace known nouns with personal pronouns"],
        vocab: [["der Mann","man","noun"],["die Frau","woman","noun"],["das Kind","child","noun"],["geben","to give","verb"],["zeigen","to show","verb"],["bringen","to bring","verb"],["ihm","to him","pronoun"],["ihr","to her","pronoun"],["ihn","him","pronoun"],["sie","her / them","pronoun"],["uns","us / to us","pronoun"],["euch","you (plural) / to you","pronoun"]],
        sentences: [["Der Mann kauft einen Kaffee.","The man buys a coffee."],["Die Frau sieht das Kind.","The woman sees the child."],["Ich gebe dem Kind einen Apfel.","I give the child an apple."],["Kannst du mir den Weg zeigen?","Can you show me the way?"],["Wir bringen ihr die Schlüssel.","We bring her the keys."],["Kennst du den neuen Kollegen? Ja, ich kenne ihn.","Do you know the new colleague? Yes, I know him."],["Wo ist die Tasche? Ich sehe sie nicht.","Where is the bag? I do not see it."],["Der Lehrer erklärt uns die Aufgabe.","The teacher explains the task to us."],["Ich helfe dem Mann.","I help the man."],["Sie gibt ihm ihre Nummer.","She gives him her number."],["Das Geschenk ist für euch.","The gift is for you all." ]],
        grammar: ["Nominative, accusative, and dative","The nominative marks the subject. The accusative usually marks a direct object. The dative often marks a recipient and follows verbs such as helfen.","subject (nom.) + verb + recipient (dat.) + thing (acc.)",["Die Frau gibt dem Kind den Ball.","The woman gives the child the ball."],["Ich helfe ihm.","I help him."],"Do not choose a case only from word order; identify the role or the governing verb or preposition."],
        dialogue: [["Lina","Kannst du mir bitte die Adresse zeigen?","Can you show me the address, please?"],["Tom","Ja, ich zeige sie dir auf dem Handy.","Yes, I will show it to you on the phone."],["Lina","Kennst du den Mann dort?","Do you know the man over there?"],["Tom","Ja, ich kenne ihn. Er heißt Paul.","Yes, I know him. His name is Paul."],["Lina","Gibst du ihm bitte dieses Paket?","Will you give him this parcel, please?"],["Tom","Natürlich. Ich bringe es ihm.","Of course. I will bring it to him." ]],
        grammarTests: [["Ich gebe ___ Kind einen Apfel.",["dem","den","das"],"dem","The recipient Kind is dative: dem Kind."],["Ich kenne den Mann. Ich kenne ___.",["ihn","ihm","er"],"ihn","The masculine direct object becomes ihn." ]],
        readingCheck: ["What should Tom give Paul?",["A parcel","An address","A phone"],"A parcel","Lina asks Tom to give Paul the parcel."]
      },
      {
        key: "verbs", slug: "present-modal-and-separable-verbs", title: "Present, modal, and separable verbs",
        summary: "Control present-tense endings, modal frames, and separable prefixes in statements and questions.",
        objectives: ["Use regular and frequent irregular present forms", "Build modal sentences with an end infinitive", "Place separable prefixes correctly"],
        vocab: [["anfangen","to begin","verb"],["aufstehen","to get up","verb"],["einkaufen","to shop","verb"],["mitkommen","to come along","verb"],["können","can / to be able","verb"],["wollen","to want","verb"],["dürfen","may / to be allowed","verb"],["sollen","should / to be supposed","verb"],["müssen","must / to have to","verb"],["nehmen","to take","verb"],["fahren","to travel / drive","verb"],["lesen","to read","verb"]],
        sentences: [["Der Kurs fängt um neun Uhr an.","The course begins at nine."],["Ich stehe jeden Tag um sieben Uhr auf.","I get up at seven every day."],["Wir kaufen am Samstag ein.","We shop on Saturday."],["Willst du heute mitkommen?","Do you want to come along today?"],["Ich kann gut Deutsch lesen.","I can read German well."],["Hier dürfen Sie nicht parken.","You may not park here."],["Du sollst den Arzt anrufen.","You should call the doctor."],["Wir müssen den Bus nehmen.","We have to take the bus."],["Er fährt morgen nach Berlin.","He is travelling to Berlin tomorrow."],["Wann fängt der Film an?","When does the film begin?"],["Sie liest jeden Abend ein Buch.","She reads a book every evening." ]],
        grammar: ["Verb frames in the present","A normal present verb is conjugated in position two. A separable prefix goes to the end. With a modal, the modal is conjugated and the full infinitive goes to the end.","verb second + ... + prefix/infinitive",["Der Zug kommt um acht Uhr an.","The train arrives at eight."],["Wir können heute länger bleiben.","We can stay longer today."],"Do not separate a verb that follows a modal: say Wir müssen einkaufen, not Wir müssen kaufen ein."],
        dialogue: [["Nora","Wann fängt dein Kurs morgen an?","When does your course begin tomorrow?"],["Ben","Er fängt um acht Uhr an.","It begins at eight."],["Nora","Musst du früh aufstehen?","Do you have to get up early?"],["Ben","Ja, ich muss um sechs Uhr aufstehen.","Yes, I have to get up at six."],["Nora","Willst du nach dem Kurs mitkommen?","Do you want to come along after the course?"],["Ben","Gern, aber ich muss zuerst einkaufen.","Gladly, but I must shop first." ]],
        grammarTests: [["Der Kurs ___ um neun Uhr ___.",["fängt ... an","anfängt ... —","fangen ... an"],"fängt ... an","The prefix an goes to the end in a main clause."],["Wir müssen heute ___.",["einkaufen","kaufen ein","eingekauft"],"einkaufen","After müssen, use the full infinitive at the end." ]],
        readingCheck: ["Why can Ben not go immediately after class?",["He has to shop first","He has to work","He is travelling"],"He has to shop first","Ben says he must shop first."]
      },
      {
        key: "perfect", slug: "talking-about-the-past", title: "Talking about the past",
        summary: "Use the conversational perfect tense to report completed everyday actions and experiences.",
        objectives: ["Build the perfect with haben or sein", "Form common past participles", "Tell a short sequence of past events"],
        vocab: [["gestern","yesterday","adverb"],["letzte Woche","last week","phrase"],["gemacht","done / made","participle"],["gekauft","bought","participle"],["gesehen","seen","participle"],["gegessen","eaten","participle"],["getrunken","drunk","participle"],["gegangen","gone / walked","participle"],["gefahren","travelled / driven","participle"],["gekommen","come / arrived","participle"],["geblieben","stayed","participle"],["besucht","visited","participle"]],
        sentences: [["Was hast du gestern gemacht?","What did you do yesterday?"],["Ich habe lange gearbeitet.","I worked for a long time."],["Danach habe ich Freunde besucht.","After that I visited friends."],["Wir haben zusammen gegessen.","We ate together."],["Ich bin mit dem Bus gefahren.","I travelled by bus."],["Wann bist du nach Hause gekommen?","When did you come home?"],["Ich bin bis zehn Uhr geblieben.","I stayed until ten."],["Hast du den neuen Film gesehen?","Did you see the new film?"],["Sie hat Brot und Milch gekauft.","She bought bread and milk."],["Am Sonntag sind wir spazieren gegangen.","On Sunday we went for a walk."],["Letzte Woche habe ich viel Deutsch gelernt.","Last week I studied a lot of German." ]],
        grammar: ["The conversational perfect tense","Use a present-tense form of haben or sein in position two and a past participle at the end. Most verbs use haben; movement from one place to another and changes of state often use sein.","subject + haben/sein + ... + past participle",["Ich habe Kaffee getrunken.","I drank coffee."],["Wir sind nach Hause gegangen.","We went home."],"Do not put the participle next to the auxiliary in a main clause; it normally closes the sentence."],
        dialogue: [["Mia","Was hast du gestern gemacht?","What did you do yesterday?"],["Omar","Ich habe am Vormittag gearbeitet.","I worked in the morning."],["Mia","Und am Abend?","And in the evening?"],["Omar","Ich bin zu Freunden gefahren. Wir haben zusammen gekocht.","I went to friends. We cooked together."],["Mia","Wann bist du nach Hause gekommen?","When did you come home?"],["Omar","Erst um elf. Ich bin lange geblieben.","Not until eleven. I stayed a long time." ]],
        grammarTests: [["Ich ___ gestern Brot gekauft.",["habe","bin","hat"],"habe","Kaufen forms the perfect with haben."],["Wir ___ nach Hause gegangen.",["sind","haben","seid"],"sind","Gehen uses sein for movement." ]],
        readingCheck: ["What did Omar do with his friends?",["They cooked together","They watched a film","They studied German"],"They cooked together","Omar says they cooked together."]
      }
    ]
  },
  {
    key: "a1_bridge", slug: "a1-bridge", title: "A1 bridge",
    description: "Combine A1 language in weather, social plans, and personal descriptions that prepare you for A2.",
    lessons: [
      {
        key: "bridge_weather", slug: "weather-seasons-and-plans", title: "Weather, seasons, and plans",
        summary: "Understand a simple forecast, compare seasons, and adjust an everyday plan to the weather.",
        objectives: ["Describe common weather conditions", "Name seasons and temperatures", "Connect a reason with denn"],
        vocab: [["das Wetter","weather","noun"],["die Sonne","sun","noun"],["der Regen","rain","noun"],["der Schnee","snow","noun"],["der Wind","wind","noun"],["bewölkt","cloudy","adjective"],["warm","warm","adjective"],["kalt","cold","adjective"],["der Frühling","spring","noun"],["der Sommer","summer","noun"],["der Herbst","autumn","noun"],["der Winter","winter","noun"]],
        sentences: [["Wie ist das Wetter heute?","What is the weather like today?"],["Heute scheint die Sonne.","The sun is shining today."],["Es ist warm und trocken.","It is warm and dry."],["Morgen regnet es.","It will rain tomorrow."],["Im Winter schneit es manchmal.","It sometimes snows in winter."],["Im Herbst ist es oft windig.","It is often windy in autumn."],["Wie viel Grad sind es?","How many degrees is it?"],["Es sind zwölf Grad.","It is twelve degrees."],["Nimm eine Jacke mit, denn es ist kalt.","Take a jacket because it is cold."],["Wir bleiben zu Hause, denn es regnet.","We are staying home because it is raining."],["Bei gutem Wetter gehen wir in den Park.","In good weather we go to the park." ]],
        grammar: ["Giving a reason with denn","Denn joins two main clauses and means because. Word order after denn stays like a normal main clause, with the verb in position two.","main clause + denn + subject + verb + ...",["Ich nehme einen Schirm, denn es regnet.","I am taking an umbrella because it is raining."],["Wir gehen schwimmen, denn es ist warm.","We are going swimming because it is warm."],"Do not send the verb to the end after denn; that pattern belongs to weil at a later stage."],
        dialogue: [["Lea","Wie ist das Wetter morgen?","What is the weather like tomorrow?"],["Jonas","Am Vormittag ist es bewölkt, später regnet es.","It is cloudy in the morning; later it rains."],["Lea","Dann können wir nicht im Park essen.","Then we cannot eat in the park."],["Jonas","Wir können ins Café gehen.","We can go to the café."],["Lea","Gute Idee. Ich nehme eine Jacke mit, denn es ist kalt.","Good idea. I will take a jacket because it is cold."],["Jonas","Treffen wir uns um drei?","Shall we meet at three?" ]],
        grammarTests: [["Ich nehme einen Schirm, denn es ___.",["regnet","es regnet","regnen"],"regnet","After denn, the subject es is already present and the verb is second."],["Choose the correct reason clause.",["denn es ist kalt","denn kalt es ist","denn es kalt ist"],"denn es ist kalt","Denn keeps main-clause word order." ]],
        readingCheck: ["Where will Lea and Jonas go?",["To a café","To the park","To the swimming pool"],"To a café","They change the plan because rain is expected."]
      },
      {
        key: "invitations", slug: "invitations-and-social-plans", title: "Invitations and social plans",
        summary: "Invite someone, accept or decline naturally, and agree on the practical details.",
        objectives: ["Make and answer an invitation", "Suggest a time and meeting point", "Use accusative personal pronouns in conversation"],
        vocab: [["die Einladung","invitation","noun"],["einladen","to invite","verb"],["die Feier","celebration / party","noun"],["Zeit haben","to have time","phrase"],["Lust haben","to feel like","phrase"],["zusammen","together","adverb"],["leider","unfortunately","adverb"],["vielleicht","perhaps","adverb"],["passen","to suit / fit","verb"],["absagen","to cancel / decline","verb"],["mitbringen","to bring along","verb"],["sich treffen","to meet","verb"]],
        sentences: [["Ich möchte dich zu meiner Feier einladen.","I would like to invite you to my party."],["Hast du am Samstag Zeit?","Do you have time on Saturday?"],["Hast du Lust auf einen Kaffee?","Do you feel like having a coffee?"],["Ja, sehr gern!","Yes, I would love to!"],["Leider kann ich nicht kommen.","Unfortunately, I cannot come."],["Vielleicht passt es am Sonntag.","Perhaps Sunday works."],["Wann und wo treffen wir uns?","When and where shall we meet?"],["Wir treffen uns vor dem Kino.","We will meet in front of the cinema."],["Soll ich etwas mitbringen?","Should I bring anything?"],["Kannst du mich um sieben abholen?","Can you pick me up at seven?"],["Ich rufe dich später an.","I will call you later." ]],
        grammar: ["Accusative personal pronouns","Use mich, dich, ihn, sie, es, uns, euch, and Sie to replace a direct object that is already known.","subject + verb + accusative pronoun",["Sie lädt mich ein.","She is inviting me."],["Ich hole dich um sieben ab.","I will pick you up at seven."],"Do not use mir or dir for a direct object: abholen takes mich or dich."],
        dialogue: [["Nina","Hast du am Samstag Lust auf einen Film?","Do you feel like seeing a film on Saturday?"],["Ali","Ja, gern. Wann treffen wir uns?","Yes, gladly. When shall we meet?"],["Nina","Passt dir halb sieben?","Does half past six suit you?"],["Ali","Leider nicht. Ich arbeite bis sieben.","Unfortunately not. I work until seven."],["Nina","Dann hole ich dich um halb acht ab.","Then I will pick you up at half past seven."],["Ali","Perfekt. Ich freue mich!","Perfect. I am looking forward to it!" ]],
        grammarTests: [["Nina lädt ___ ein.",["mich","mir","ich"],"mich","Einladen takes a direct accusative object."],["Ich hole ___ um sieben ab.",["dich","dir","du"],"dich","Abholen takes the accusative pronoun dich." ]],
        readingCheck: ["Why is half past six not possible for Ali?",["He works until seven","He has no ticket","He is ill"],"He works until seven","Ali explains that he works until seven."]
      },
      {
        key: "description", slug: "people-things-and-comparisons", title: "People, things, and comparisons",
        summary: "Describe appearance and character, identify possessions, and make simple comparisons.",
        objectives: ["Describe people and everyday objects", "Use possessive determiners", "Make basic comparative statements"],
        vocab: [["freundlich","friendly","adjective"],["hilfsbereit","helpful","adjective"],["ruhig","quiet / calm","adjective"],["lustig","funny","adjective"],["jung","young","adjective"],["alt","old","adjective"],["groß","tall / large","adjective"],["klein","short / small","adjective"],["schnell","fast","adjective"],["langsam","slow","adjective"],["besser","better","comparative"],["als","than","conjunction"]],
        sentences: [["Meine Schwester ist sehr freundlich.","My sister is very friendly."],["Sein Bruder ist groß und ruhig.","His brother is tall and quiet."],["Ist das deine Jacke?","Is that your jacket?"],["Nein, meine Jacke ist blau.","No, my jacket is blue."],["Unser Auto ist alt, aber zuverlässig.","Our car is old but reliable."],["Der Zug ist schneller als der Bus.","The train is faster than the bus."],["Heute ist das Wetter besser als gestern.","The weather is better today than yesterday."],["Mia ist jünger als Paul.","Mia is younger than Paul."],["Dieses Zimmer ist größer.","This room is larger."],["Welche Tasche gehört dir?","Which bag belongs to you?"],["Die schwarze Tasche ist meine.","The black bag is mine." ]],
        grammar: ["Simple comparisons with als","Many adjectives add -er for the comparative. Use als after the comparative when naming what you compare with. Some frequent forms change, such as gut to besser.","A + ist + comparative + als + B",["Der Zug ist schneller als der Bus.","The train is faster than the bus."],["Deutsch ist leichter als ich dachte.","German is easier than I thought."],"Use als, not wie, after a comparative such as größer or besser."],
        dialogue: [["Sara","Ist das dein neuer Kollege?","Is that your new colleague?"],["Lukas","Ja, er heißt Jan. Er ist sehr freundlich und hilfsbereit.","Yes, his name is Jan. He is very friendly and helpful."],["Sara","Ist er jünger als du?","Is he younger than you?"],["Lukas","Nein, er ist zwei Jahre älter.","No, he is two years older."],["Sara","Und wessen schwarze Tasche ist das?","And whose black bag is that?"],["Lukas","Das ist seine Tasche. Meine ist blau.","That is his bag. Mine is blue." ]],
        grammarTests: [["Der Zug ist schneller ___ der Bus.",["als","wie","denn"],"als","Use als after a comparative."],["gut → ___",["besser","guter","mehr gut"],"besser","Gut has the irregular comparative besser." ]],
        readingCheck: ["What color is Lukas's bag?",["Blue","Black","Red"],"Blue","Lukas says that his bag is blue."]
      }
    ]
  },
  {
    key: "a1_review", slug: "a1-review", title: "A1 review and production",
    description: "Apply the complete A1 foundation in practical reading, writing, listening, and speaking tasks.",
    lessons: [
      {
        key: "notices", slug: "reading-notices-and-short-emails", title: "Reading notices and short emails",
        summary: "Find times, places, actions, and restrictions in signs, notices, timetables, and short emails.",
        objectives: ["Scan a text for key facts", "Recognize common public signs and instructions", "Use context to understand unfamiliar details"],
        vocab: [["der Hinweis","notice / note","noun"],["der Eingang","entrance","noun"],["der Ausgang","exit","noun"],["geöffnet","open","adjective"],["geschlossen","closed","adjective"],["verboten","forbidden","adjective"],["kostenlos","free of charge","adjective"],["die Anmeldung","registration","noun"],["ausfallen","to be cancelled","verb"],["stattfinden","to take place","verb"],["beachten","to observe / note","verb"],["wegen","because of","preposition"]],
        sentences: [["Der Eingang ist auf der linken Seite.","The entrance is on the left-hand side."],["Bitte benutzen Sie den anderen Ausgang.","Please use the other exit."],["Am Sonntag bleibt das Geschäft geschlossen.","The shop remains closed on Sunday."],["Das Fotografieren ist hier verboten.","Photography is forbidden here."],["Der Eintritt ist für Kinder kostenlos.","Admission is free for children."],["Eine Anmeldung ist bis Freitag möglich.","Registration is possible until Friday."],["Der Kurs fällt heute aus.","The course is cancelled today."],["Das Treffen findet im Raum zwölf statt.","The meeting takes place in room twelve."],["Bitte beachten Sie die neuen Öffnungszeiten.","Please note the new opening hours."],["Wegen des Wetters fährt der Bus später.","Because of the weather, the bus runs later."],["Lesen Sie zuerst die Überschrift.","Read the heading first." ]],
        grammar: ["Reading compound words","German often joins nouns into one word. The final noun gives the gender and main meaning; the earlier part adds detail.","detail noun + main noun = compound noun",["Öffnung + Zeit = die Öffnungszeit","opening + time = opening time"],["Bahn + Hof = der Bahnhof","railway + yard = train station"],"Read long compounds from the end to find the main noun; do not translate each part in isolation first."],
        dialogue: [["E-Mail","Hallo Mia, unser Deutschkurs fällt heute aus.","Hello Mia, our German course is cancelled today."],["E-Mail","Das nächste Treffen findet am Donnerstag statt.","The next meeting takes place on Thursday."],["E-Mail","Wir beginnen um 18 Uhr in Raum zwölf.","We begin at 6 p.m. in room twelve."],["E-Mail","Bitte bring das neue Kursbuch mit.","Please bring the new coursebook."],["Mia","Der Kurs ist also nicht heute, sondern am Donnerstag.","So the course is not today, but on Thursday."],["Mia","Ich schreibe den Termin sofort in meinen Kalender.","I will write the appointment in my calendar immediately." ]],
        grammarTests: [["What is the main noun in Öffnungszeiten?",["Zeiten","Öffnung","Öffnungs"],"Zeiten","The final noun gives the main meaning."],["Der Kurs ___ heute ___.",["fällt ... aus","ausfällt ... —","fallen ... aus"],"fällt ... aus","Ausfallen is separable in a main clause." ]],
        readingCheck: ["When is the next German class?",["Thursday at 6 p.m.","Today at 6 p.m.","Friday at noon"],"Thursday at 6 p.m.","The email moves the class to Thursday at 18:00."]
      },
      {
        key: "writing", slug: "writing-everyday-messages", title: "Writing everyday messages",
        summary: "Write a clear A1 message with a greeting, reason, essential details, request, and closing.",
        objectives: ["Structure a short formal or informal message", "Give a reason and practical details", "Check capitalization, verb position, and punctuation"],
        vocab: [["die Anrede","salutation","noun"],["der Gruß","greeting / regards","noun"],["der Betreff","subject line","noun"],["die Information","information","noun"],["die Bitte","request","noun"],["der Grund","reason","noun"],["sich entschuldigen","to apologize","verb"],["bestätigen","to confirm","verb"],["antworten","to answer","verb"],["freundlich","polite / friendly","adjective"],["formell","formal","adjective"],["informell","informal","adjective"]],
        sentences: [["Liebe Anna, wie geht es dir?","Dear Anna, how are you?"],["Sehr geehrte Frau Klein, ...","Dear Ms Klein, ..."],["Ich schreibe, weil ich eine Frage habe.","I am writing because I have a question."],["Leider kann ich morgen nicht kommen.","Unfortunately, I cannot come tomorrow."],["Ich bin krank und muss zu Hause bleiben.","I am ill and have to stay home."],["Können wir einen neuen Termin vereinbaren?","Can we arrange a new appointment?"],["Bitte bestätigen Sie den Termin.","Please confirm the appointment."],["Vielen Dank für Ihre Hilfe.","Thank you very much for your help."],["Ich freue mich auf deine Antwort.","I look forward to your reply."],["Viele Grüße","Best wishes"],["Mit freundlichen Grüßen","Yours sincerely" ]],
        grammar: ["A clear short message","A useful A1 message has a suitable greeting, one reason, the essential time or place, a clear request, and a closing. Keep each sentence complete and direct.","greeting + reason + details + request + closing",["Liebe Mia, leider komme ich später. Der Bus hat Verspätung. Warte bitte am Eingang. Viele Grüße, Noor","Dear Mia, unfortunately I will arrive later. The bus is delayed. Please wait at the entrance. Best wishes, Noor"],["Sehr geehrter Herr Wolf, ich bin krank. Können wir den Termin verschieben? Mit freundlichen Grüßen, Ali Hassan","Dear Mr Wolf, I am ill. Can we postpone the appointment? Yours sincerely, Ali Hassan"],"Do not mix du and Sie forms in one message; choose the relationship and keep it consistent."],
        dialogue: [["Aufgabe","Schreiben Sie Ihrer Lehrerin: Sie sind krank.","Write to your teacher: you are ill."],["Aufgabe","Sie können morgen nicht zum Kurs kommen.","You cannot come to class tomorrow."],["Aufgabe","Fragen Sie nach den Hausaufgaben.","Ask about the homework."],["Antwort","Sehr geehrte Frau Koch, leider bin ich krank.","Dear Ms Koch, unfortunately I am ill."],["Antwort","Ich kann morgen nicht kommen. Welche Hausaufgaben gibt es?","I cannot come tomorrow. What homework is there?"],["Antwort","Vielen Dank. Mit freundlichen Grüßen, Samir Hassan","Thank you. Yours sincerely, Samir Hassan." ]],
        grammarTests: [["Choose the formal closing.",["Mit freundlichen Grüßen","Liebe Grüße","Bis später"],"Mit freundlichen Grüßen","Mit freundlichen Grüßen is the standard formal closing."],["Choose the consistent formal request.",["Können Sie mir bitte antworten?","Kannst Sie mir bitte antworten?","Können du mir bitte antworten?"],"Können Sie mir bitte antworten?","Formal address uses Sie with können." ]],
        readingCheck: ["What does the student ask about?",["The homework","A train ticket","A hotel room"],"The homework","The model message asks which homework there is."]
      },
      {
        key: "speaking", slug: "speaking-through-a1-situations", title: "Speaking through A1 situations",
        summary: "Link short sentences, respond to follow-up questions, and recover when a conversation becomes difficult.",
        objectives: ["Give a connected one-minute introduction", "Role-play common A1 transactions", "Use repair phrases instead of abandoning a conversation"],
        vocab: [["zuerst","first","adverb"],["dann","then","adverb"],["danach","after that","adverb"],["zum Schluss","finally","phrase"],["also","so / therefore","adverb"],["eigentlich","actually","adverb"],["natürlich","of course","adverb"],["einen Moment","one moment","phrase"],["keine Ahnung","no idea","phrase"],["ich glaube","I think","phrase"],["zum Beispiel","for example","phrase"],["das Gespräch","conversation","noun"]],
        sentences: [["Zuerst stelle ich mich kurz vor.","First I will briefly introduce myself."],["Dann erzähle ich von meiner Familie.","Then I will talk about my family."],["Danach beschreibe ich meinen Alltag.","After that I will describe my daily life."],["Zum Schluss spreche ich über meine Pläne.","Finally I will speak about my plans."],["Einen Moment, ich suche das richtige Wort.","One moment, I am looking for the right word."],["Ich glaube, der Termin ist am Dienstag.","I think the appointment is on Tuesday."],["Wie sagt man appointment auf Deutsch?","How do you say appointment in German?"],["Können Sie die Frage anders sagen?","Can you phrase the question differently?"],["Das weiß ich leider nicht.","Unfortunately, I do not know that."],["Zum Beispiel fahre ich gern Fahrrad.","For example, I like cycling."],["Ich möchte noch etwas hinzufügen.","I would like to add something." ]],
        grammar: ["Connecting a short spoken answer","Sequence words such as zuerst, dann, danach, and zum Schluss help you organize speech. When one begins a main clause, the conjugated verb stays second.","connector + verb + subject + ...",["Danach gehe ich zur Arbeit.","After that I go to work."],["Zum Schluss stelle ich eine Frage.","Finally I ask a question."],"After a first-position connector, invert the subject and verb: Danach gehe ich, not Danach ich gehe."],
        dialogue: [["Prüferin","Erzählen Sie bitte etwas über Ihren Alltag.","Please tell me something about your daily routine."],["Kandidat","Zuerst stehe ich um sieben Uhr auf. Dann frühstücke ich.","First I get up at seven. Then I have breakfast."],["Prüferin","Wie fahren Sie zur Arbeit?","How do you travel to work?"],["Kandidat","Entschuldigung, können Sie die Frage langsamer sagen?","Excuse me, could you say the question more slowly?"],["Prüferin","Wie kommen Sie zur Arbeit?","How do you get to work?"],["Kandidat","Ach so. Ich fahre mit dem Bus. Das dauert zwanzig Minuten.","I see. I take the bus. It takes twenty minutes." ]],
        grammarTests: [["Danach ___ ich zur Arbeit.",["gehe","ich gehe","gehen"],"gehe","The verb comes directly after a first-position connector."],["Choose the useful repair phrase.",["Können Sie die Frage anders sagen?","Ich stoppe Deutsch.","Keine sprechen."],"Können Sie die Frage anders sagen?","This politely asks the partner to rephrase." ]],
        readingCheck: ["How does the candidate travel to work?",["By bus","By train","By bicycle"],"By bus","The candidate says: Ich fahre mit dem Bus."]
      }
    ]
  }
];

function idPart(value) {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/ß/g, "ss").replace(/[^a-zA-Z0-9]+/g, "_").replace(/^_|_$/g, "").toLowerCase();
}

function lesson(spec) {
  const prefix = `de_a1_${spec.key}`;
  const vocab = spec.vocab.map(([lemma, translation, partOfSpeech], index) => ({
    id: `vocab_${prefix}_${idPart(lemma)}_${index + 1}`,
    lemma, translation, pronunciation: "audio", partOfSpeech, languageFeatures: {},
  }));
  const sentences = spec.sentences.map(([text, translation], index) => ({
    id: `sentence_${prefix}_${index + 1}`, text, translation,
    note: index < 6 ? "Use this as a complete conversational chunk." : "Reuse this pattern with your own details.",
  }));
  const [grammarTitle, explanation, pattern, ...grammarRest] = spec.grammar;
  const commonMistake = grammarRest.pop();
  const examples = grammarRest.map(([source, translation]) => ({ source, translation }));
  const vocabChoice = (index) => [vocab[index].translation, vocab[(index + 4) % vocab.length].translation, vocab[(index + 8) % vocab.length].translation];
  const question = (id, instruction, prompt, choices, correctAnswer, explanationText, skill) => ({ id, type: "multiple_choice", instruction, prompt, choices, correctAnswer, explanation: explanationText, skill });
  const [g1, g2] = spec.grammarTests;
  const read = spec.readingCheck;
  return {
    id: `lesson_${prefix}`, slug: spec.slug, title: spec.title, summary: spec.summary, estimatedMinutes: 18,
    status: "published", revision: 1, heroTitle: spec.summary, completionTitle: `You can now use ${spec.title.toLowerCase()} in practical German.`,
    objectives: spec.objectives, vocabulary: vocab, sentences,
    grammar: { id: `grammar_${prefix}`, title: grammarTitle, explanation, pattern, examples, commonMistake },
    reading: { id: `reading_${prefix}`, title: spec.title, lines: spec.dialogue.map(([speaker, text, translation]) => ({ speaker, text, translation })) },
    practice: { id: `practice_${prefix}`, passThreshold: 67, questions: [
      question(`practice_${prefix}_1`, "Choose the matching meaning.", vocab[0].lemma, vocabChoice(0), vocab[0].translation, `${vocab[0].lemma} means ${vocab[0].translation}.`, "vocabulary"),
      question(`practice_${prefix}_2`, "Complete the grammar pattern.", g1[0], g1[1], g1[2], g1[3], "grammar"),
      question(`practice_${prefix}_3`, "Recall the situation.", read[0], read[1], read[2], read[3], "reading"),
    ]},
    quiz: { id: `quiz_${prefix}`, title: `${spec.title} check`, passThreshold: 80, questions: [
      question(`quiz_${prefix}_1`, "Choose the matching meaning.", vocab[1].lemma, vocabChoice(1), vocab[1].translation, `${vocab[1].lemma} means ${vocab[1].translation}.`, "vocabulary"),
      question(`quiz_${prefix}_2`, "Choose the matching meaning.", vocab[6].lemma, vocabChoice(6), vocab[6].translation, `${vocab[6].lemma} means ${vocab[6].translation}.`, "vocabulary"),
      question(`quiz_${prefix}_3`, "Apply the lesson grammar.", g1[0], g1[1], g1[2], g1[3], "grammar"),
      question(`quiz_${prefix}_4`, "Apply the lesson grammar.", g2[0], g2[1], g2[2], g2[3], "grammar"),
      question(`quiz_${prefix}_5`, "Recall the situation.", read[0], read[1], read[2], read[3], "reading"),
    ]},
  };
}

for (const chapter of chapters) {
  const chapterId = `chapter_de_a1_${chapter.key}`;
  const generatedChapter = { id: chapterId, slug: chapter.slug, title: chapter.title, description: chapter.description, lessons: chapter.lessons.map(lesson) };
  const existingIndex = book.chapters.findIndex((candidate) => candidate.id === chapterId);
  if (existingIndex >= 0) book.chapters.splice(existingIndex, 1, generatedChapter);
  else book.chapters.push(generatedChapter);
}

book.revision = Math.max(book.revision, 11);
await writeFile(path, `${JSON.stringify(book, null, 2)}\n`, "utf8");
console.log(`A1 now contains ${book.chapters.length} chapters and ${book.chapters.flatMap((chapter) => chapter.lessons).length} lessons.`);
