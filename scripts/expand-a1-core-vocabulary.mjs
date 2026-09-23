import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

const path = resolve(process.cwd(), "content/languages/de/A1/books/everyday-essentials.json");
const book = JSON.parse(await readFile(path, "utf8"));
const lessons = book.chapters.flatMap((chapter) => chapter.lessons);
const bySlug = new Map(lessons.map((lesson) => [lesson.slug, lesson]));

for (const lesson of lessons) lesson.vocabulary = lesson.vocabulary.filter((item) => !item.id.startsWith("vocab_de_a1_core_"));

const candidates = [];
const add = (lemma, translation, partOfSpeech, sources) => candidates.push({ lemma, translation, partOfSpeech, sources: Array.isArray(sources) ? sources : [sources] });
const addGroup = (sources, partOfSpeech, rows) => rows.trim().split("\n").map((row) => row.trim()).filter(Boolean).forEach((row) => {
  const [lemma, translation] = row.split("|");
  add(lemma, translation, partOfSpeech, sources);
});

const numberWords = ["null","eins","zwei","drei","vier","fünf","sechs","sieben","acht","neun","zehn","elf","zwölf","dreizehn","vierzehn","fünfzehn","sechzehn","siebzehn","achtzehn","neunzehn"];
const tens = { 20: "zwanzig", 30: "dreißig", 40: "vierzig", 50: "fünfzig", 60: "sechzig", 70: "siebzig", 80: "achtzig", 90: "neunzig" };
function numberWord(number) {
  if (number < 20) return numberWords[number];
  if (number === 100) return "hundert";
  const ten = Math.floor(number / 10) * 10;
  const unit = number % 10;
  return unit === 0 ? tens[ten] : `${unit === 1 ? "ein" : numberWords[unit]}und${tens[ten]}`;
}
for (let number = 0; number <= 100; number += 1) add(numberWord(number), String(number), "number", ["personal-details-and-numbers", "dates-and-birthdays", "making-an-appointment"]);

function ordinal(number) {
  const irregular = { 1: "ersten", 3: "dritten", 7: "siebten", 8: "achten" };
  if (irregular[number]) return irregular[number];
  const base = numberWord(number);
  return `${base}${number < 20 ? "ten" : "sten"}`;
}
for (let number = 1; number <= 31; number += 1) add(`am ${ordinal(number)}`, `on the ${number}${number % 10 === 1 && number !== 11 ? "st" : number % 10 === 2 && number !== 12 ? "nd" : number % 10 === 3 && number !== 13 ? "rd" : "th"}`, "date phrase", ["dates-and-birthdays", "making-an-appointment"]);

const verbs = `
arbeiten|arbeitet|hat gearbeitet|to work|he/she works|worked
lernen|lernt|hat gelernt|to learn|he/she learns|learned
wohnen|wohnt|hat gewohnt|to live|he/she lives|lived
leben|lebt|hat gelebt|to live|he/she lives|lived
machen|macht|hat gemacht|to do / make|he/she does / makes|did / made
spielen|spielt|hat gespielt|to play|he/she plays|played
fragen|fragt|hat gefragt|to ask|he/she asks|asked
antworten|antwortet|hat geantwortet|to answer|he/she answers|answered
sagen|sagt|hat gesagt|to say|he/she says|said
erzählen|erzählt|hat erzählt|to tell|he/she tells|told
hören|hört|hat gehört|to hear / listen|he/she hears|heard
sehen|sieht|hat gesehen|to see|he/she sees|saw
lesen|liest|hat gelesen|to read|he/she reads|read
schreiben|schreibt|hat geschrieben|to write|he/she writes|wrote
sprechen|spricht|hat gesprochen|to speak|he/she speaks|spoke
verstehen|versteht|hat verstanden|to understand|he/she understands|understood
kennen|kennt|hat gekannt|to know / be familiar with|he/she knows|knew
wissen|weiß|hat gewusst|to know a fact|he/she knows|knew
denken|denkt|hat gedacht|to think|he/she thinks|thought
glauben|glaubt|hat geglaubt|to believe / think|he/she believes|believed
finden|findet|hat gefunden|to find|he/she finds|found
suchen|sucht|hat gesucht|to look for|he/she looks for|looked for
brauchen|braucht|hat gebraucht|to need|he/she needs|needed
haben|hat|hat gehabt|to have|he/she has|had
sein|ist|ist gewesen|to be|he/she is|was / has been
werden|wird|ist geworden|to become|he/she becomes|became
geben|gibt|hat gegeben|to give|he/she gives|gave
nehmen|nimmt|hat genommen|to take|he/she takes|took
bringen|bringt|hat gebracht|to bring|he/she brings|brought
holen|holt|hat geholt|to fetch / get|he/she fetches|fetched
kaufen|kauft|hat gekauft|to buy|he/she buys|bought
bezahlen|bezahlt|hat bezahlt|to pay|he/she pays|paid
kosten|kostet|hat gekostet|to cost|it costs|cost
bestellen|bestellt|hat bestellt|to order|he/she orders|ordered
essen|isst|hat gegessen|to eat|he/she eats|ate
trinken|trinkt|hat getrunken|to drink|he/she drinks|drank
kochen|kocht|hat gekocht|to cook|he/she cooks|cooked
schlafen|schläft|hat geschlafen|to sleep|he/she sleeps|slept
aufstehen|steht auf|ist aufgestanden|to get up|he/she gets up|got up
anfangen|fängt an|hat angefangen|to begin|it begins|began
aufhören|hört auf|hat aufgehört|to stop|he/she stops|stopped
öffnen|öffnet|hat geöffnet|to open|he/she opens|opened
schließen|schließt|hat geschlossen|to close|he/she closes|closed
bleiben|bleibt|ist geblieben|to stay|he/she stays|stayed
gehen|geht|ist gegangen|to go / walk|he/she goes|went
kommen|kommt|ist gekommen|to come|he/she comes|came
fahren|fährt|ist gefahren|to travel / drive|he/she travels|travelled
fliegen|fliegt|ist geflogen|to fly|he/she flies|flew
laufen|läuft|ist gelaufen|to run / walk|he/she runs|ran
reisen|reist|ist gereist|to travel|he/she travels|travelled
ankommen|kommt an|ist angekommen|to arrive|he/she arrives|arrived
abfahren|fährt ab|ist abgefahren|to depart|it departs|departed
einsteigen|steigt ein|ist eingestiegen|to get in / board|he/she boards|boarded
aussteigen|steigt aus|ist ausgestiegen|to get out|he/she gets out|got out
umsteigen|steigt um|ist umgestiegen|to change transport|he/she changes|changed transport
besuchen|besucht|hat besucht|to visit|he/she visits|visited
treffen|trifft|hat getroffen|to meet|he/she meets|met
helfen|hilft|hat geholfen|to help|he/she helps|helped
zeigen|zeigt|hat gezeigt|to show|he/she shows|showed
erklären|erklärt|hat erklärt|to explain|he/she explains|explained
wiederholen|wiederholt|hat wiederholt|to repeat|he/she repeats|repeated
buchstabieren|buchstabiert|hat buchstabiert|to spell|he/she spells|spelled
anrufen|ruft an|hat angerufen|to call|he/she calls|called
zurückrufen|ruft zurück|hat zurückgerufen|to call back|he/she calls back|called back
schicken|schickt|hat geschickt|to send|he/she sends|sent
bekommen|bekommt|hat bekommen|to receive / get|he/she receives|received
tragen|trägt|hat getragen|to wear / carry|he/she wears|wore
waschen|wäscht|hat gewaschen|to wash|he/she washes|washed
duschen|duscht|hat geduscht|to shower|he/she showers|showered
putzen|putzt|hat geputzt|to clean|he/she cleans|cleaned
feiern|feiert|hat gefeiert|to celebrate|he/she celebrates|celebrated
tanzen|tanzt|hat getanzt|to dance|he/she dances|danced
singen|singt|hat gesungen|to sing|he/she sings|sang
schwimmen|schwimmt|ist geschwommen|to swim|he/she swims|swam
wandern|wandert|ist gewandert|to hike|he/she hikes|hiked
regnen|regnet|hat geregnet|to rain|it rains|rained
schneien|schneit|hat geschneit|to snow|it snows|snowed
scheinen|scheint|hat geschienen|to shine|it shines|shone
vergessen|vergisst|hat vergessen|to forget|he/she forgets|forgot
verlieren|verliert|hat verloren|to lose|he/she loses|lost
gewinnen|gewinnt|hat gewonnen|to win|he/she wins|won
reservieren|reserviert|hat reserviert|to reserve|he/she reserves|reserved
unterschreiben|unterschreibt|hat unterschrieben|to sign|he/she signs|signed
ausfüllen|füllt aus|hat ausgefüllt|to fill in|he/she fills in|filled in
`.trim().split("\n").map((row) => row.trim().split("|"));
const verbSources = ["a-normal-day", "present-modal-and-separable-verbs", "talking-about-the-past", "speaking-through-a1-situations", "asking-for-clarification"];
for (const [infinitive, present, perfect, infinitiveEnglish, presentEnglish, perfectEnglish] of verbs) {
  add(infinitive, infinitiveEnglish, "verb", verbSources);
  add(`er/sie ${present}`, presentEnglish, "verb form", verbSources);
  add(perfect, perfectEnglish, "past-tense chunk", ["talking-about-the-past", "reading-notices-and-short-emails"]);
}

addGroup(["family-and-home", "people-things-and-comparisons", "forms-and-contact-details"], "noun", `
die Eltern|parents
die Mutter|mother
der Vater|father
die Schwester|sister
der Bruder|brother
die Tochter|daughter
der Sohn|son
die Großmutter|grandmother
der Großvater|grandfather
die Großeltern|grandparents
die Tante|aunt
der Onkel|uncle
die Cousine|female cousin
der Cousin|male cousin
die Ehefrau|wife
der Ehemann|husband
die Partnerin|female partner
der Partner|male partner
die Nachbarin|female neighbor
der Nachbar|male neighbor
die Freundin|female friend / girlfriend
der Freund|male friend / boyfriend
der Vorname|first name
der Nachname|surname
das Alter|age
der Geburtstag|birthday
der Geburtsort|place of birth
die Staatsangehörigkeit|nationality
die Unterschrift|signature
das Geschlecht|gender
`);

addGroup(["everyday-health-basics", "emergencies-and-help"], "noun", `
der Körper|body
der Kopf|head
das Gesicht|face
das Auge|eye
das Ohr|ear
die Nase|nose
der Mund|mouth
der Zahn|tooth
der Hals|throat / neck
der Arm|arm
die Hand|hand
der Finger|finger
der Bauch|stomach / belly
der Rücken|back
das Bein|leg
der Fuß|foot
das Herz|heart
die Gesundheit|health
die Krankheit|illness
die Erkältung|cold
der Husten|cough
das Fieber|fever
der Schmerz|pain
die Tablette|tablet / pill
das Rezept|prescription
die Praxis|doctor's practice
die Versicherung|insurance
die Versichertenkarte|health insurance card
der Termin|appointment
die Untersuchung|examination
`);

addGroup(["meals-and-preferences", "at-a-restaurant", "buying-groceries"], "noun", `
das Frühstück|breakfast
das Mittagessen|lunch
das Abendessen|dinner
das Brot|bread
das Brötchen|bread roll
die Butter|butter
der Käse|cheese
die Wurst|sausage / cold cuts
das Ei|egg
das Fleisch|meat
der Fisch|fish
das Hähnchen|chicken
das Gemüse|vegetables
das Obst|fruit
der Apfel|apple
die Banane|banana
die Orange|orange
die Kartoffel|potato
die Tomate|tomato
die Zwiebel|onion
der Salat|salad
die Suppe|soup
der Reis|rice
die Nudel|noodle / pasta
der Kuchen|cake
die Schokolade|chocolate
das Salz|salt
der Zucker|sugar
das Wasser|water
der Saft|juice
die Milch|milk
der Tee|tea
der Kaffee|coffee
das Bier|beer
der Wein|wine
der Hunger|hunger
der Durst|thirst
die Speisekarte|menu
die Rechnung|bill
das Trinkgeld|tip
`);

addGroup(["rooms-and-furniture", "where-things-are", "family-and-home"], "noun", `
das Haus|house
die Wohnung|apartment
das Zimmer|room
das Wohnzimmer|living room
das Schlafzimmer|bedroom
das Badezimmer|bathroom
die Küche|kitchen
der Flur|hallway
der Balkon|balcony
der Garten|garden
die Tür|door
das Fenster|window
die Wand|wall
der Boden|floor
die Treppe|stairs
der Tisch|table
der Stuhl|chair
das Sofa|sofa
das Bett|bed
der Schrank|cupboard / wardrobe
das Regal|shelf
die Lampe|lamp
der Kühlschrank|refrigerator
der Herd|stove
die Waschmaschine|washing machine
der Schlüssel|key
die Miete|rent
der Strom|electricity
das Licht|light
der Müll|rubbish
`);

addGroup(["clothes-colors-and-sizes", "buying-groceries", "people-things-and-comparisons"], "noun", `
die Kleidung|clothing
das Hemd|shirt
die Bluse|blouse
das T-Shirt|T-shirt
der Pullover|sweater
die Jacke|jacket
der Mantel|coat
die Hose|trousers
der Rock|skirt
das Kleid|dress
der Schuh|shoe
der Stiefel|boot
die Socke|sock
die Mütze|cap / beanie
der Hut|hat
der Schal|scarf
der Handschuh|glove
die Tasche|bag
der Gürtel|belt
die Brille|glasses
die Größe|size
die Farbe|color
der Stoff|fabric
die Umkleidekabine|changing room
der Kassenbon|receipt
`);

addGroup(["essential-local-services", "walking-directions", "where-things-are"], "noun", `
die Stadt|city
das Dorf|village
die Straße|street
der Platz|square / place
die Kreuzung|intersection
die Ampel|traffic light
der Weg|way / path
die Ecke|corner
die Brücke|bridge
der Park|park
der Spielplatz|playground
das Geschäft|shop
der Supermarkt|supermarket
die Bäckerei|bakery
die Metzgerei|butcher's shop
die Apotheke|pharmacy
das Krankenhaus|hospital
die Schule|school
der Kindergarten|nursery school
die Bibliothek|library
das Museum|museum
das Kino|cinema
das Restaurant|restaurant
das Café|café
das Hotel|hotel
die Kirche|church
die Post|post office
die Bank|bank
das Rathaus|town hall
die Toilette|toilet
`);

addGroup(["at-the-train-station", "walking-directions", "hotel-check-in"], "noun", `
die Reise|journey
der Urlaub|holiday
der Bahnhof|train station
der Flughafen|airport
die Haltestelle|stop
der Bahnsteig|platform
das Gleis|track / platform number
der Zug|train
der Bus|bus
die Straßenbahn|tram
die U-Bahn|underground
das Taxi|taxi
das Fahrrad|bicycle
das Auto|car
das Ticket|ticket
die Fahrkarte|travel ticket
die Hinfahrt|outward journey
die Rückfahrt|return journey
die Abfahrt|departure
die Ankunft|arrival
die Verspätung|delay
der Fahrplan|timetable
der Koffer|suitcase
der Pass|passport
die Rezeption|reception
die Reservierung|reservation
das Einzelzimmer|single room
das Doppelzimmer|double room
der Aufzug|lift / elevator
die Etage|floor / storey
`);

addGroup(["in-the-classroom", "learning-and-study-habits", "a-simple-workday"], "noun", `
die Arbeit|work
der Beruf|profession
die Firma|company
das Büro|office
der Arbeitsplatz|workplace
der Chef|male boss
die Chefin|female boss
der Kollege|male colleague
die Kollegin|female colleague
der Kunde|male customer
die Kundin|female customer
die Pause|break
die Besprechung|meeting
die Aufgabe|task
das Projekt|project
der Computer|computer
der Drucker|printer
die E-Mail|email
die Schule|school
der Kurs|course
die Klasse|class
der Lehrer|male teacher
die Lehrerin|female teacher
der Schüler|male pupil
die Schülerin|female pupil
das Buch|book
das Heft|notebook
der Stift|pen
die Hausaufgabe|homework
die Prüfung|exam
`);

addGroup(["dates-and-birthdays", "making-an-appointment", "a-normal-day"], "noun", `
die Zeit|time
die Uhr|clock / o'clock
die Stunde|hour
die Minute|minute
der Tag|day
die Woche|week
das Wochenende|weekend
der Monat|month
das Jahr|year
der Morgen|morning
der Vormittag|late morning
der Mittag|midday
der Nachmittag|afternoon
der Abend|evening
die Nacht|night
der Montag|Monday
der Dienstag|Tuesday
der Mittwoch|Wednesday
der Donnerstag|Thursday
der Freitag|Friday
der Samstag|Saturday
der Sonntag|Sunday
der Januar|January
der Februar|February
der März|March
der April|April
der Mai|May
der Juni|June
der Juli|July
der August|August
der September|September
der Oktober|October
der November|November
der Dezember|December
`);

addGroup(["weather-seasons-and-plans", "simple-leisure-plans", "speaking-through-a1-situations"], "noun", `
die Freizeit|free time
das Hobby|hobby
der Sport|sport
der Fußball|football
das Tennis|tennis
das Schwimmbad|swimming pool
der Spaziergang|walk
die Musik|music
das Lied|song
der Film|film
die Zeitung|newspaper
das Fernsehen|television
das Internet|internet
das Foto|photo
das Spiel|game
die Party|party
die Natur|nature
der Baum|tree
die Blume|flower
der Berg|mountain
der See|lake
das Meer|sea
der Himmel|sky
die Wolke|cloud
die Sonne|sun
der Regen|rain
der Schnee|snow
der Wind|wind
die Temperatur|temperature
die Jahreszeit|season
`);

addGroup(["at-a-restaurant", "clothes-colors-and-sizes", "buying-groceries"], "noun", `
das Geld|money
der Euro|euro
der Cent|cent
der Preis|price
das Angebot|special offer
der Rabatt|discount
die Kasse|checkout
die Karte|card
das Bargeld|cash
die Münze|coin
der Schein|banknote
das Kilo|kilogram
das Gramm|gram
der Liter|liter
die Flasche|bottle
die Packung|packet
das Stück|piece
das Pfund|half-kilo / pound
der Einkaufszettel|shopping list
der Markt|market
der Verkäufer|male salesperson
die Verkäuferin|female salesperson
der Umtausch|exchange
die Auswahl|selection
die Qualität|quality
`);

addGroup(["phone-calls-and-messages", "forms-and-contact-details", "asking-for-clarification"], "noun", `
das Telefon|telephone
das Handy|mobile phone
der Anruf|phone call
die Telefonnummer|telephone number
die Nachricht|message
der Brief|letter
die Adresse|address
die Hausnummer|house number
die Postleitzahl|postal code
der Ort|town / place
das Land|country
das Formular|form
die Frage|question
die Antwort|answer
das Wort|word
der Satz|sentence
die Sprache|language
die Bedeutung|meaning
das Beispiel|example
das Gespräch|conversation
die Stimme|voice
der Name|name
der Kontakt|contact
das Problem|problem
die Lösung|solution
`);

addGroup(["people-things-and-comparisons", "rooms-and-furniture", "weather-seasons-and-plans"], "adjective", `
gut|good
schlecht|bad
groß|large / tall
klein|small / short
lang|long
kurz|short
alt|old
jung|young
neu|new
schön|beautiful / nice
hässlich|ugly
hell|bright
dunkel|dark
laut|loud
leise|quiet
schnell|fast
langsam|slow
leicht|easy / light
schwer|difficult / heavy
einfach|simple
schwierig|difficult
richtig|correct
falsch|wrong
wichtig|important
interessant|interesting
langweilig|boring
freundlich|friendly
unfreundlich|unfriendly
nett|nice
lustig|funny
ernst|serious
ruhig|calm / quiet
nervös|nervous
müde|tired
wach|awake
krank|ill
gesund|healthy
hungrig|hungry
durstig|thirsty
glücklich|happy
traurig|sad
zufrieden|satisfied
frei|free / available
besetzt|occupied / busy
offen|open
geschlossen|closed
warm|warm
kalt|cold
heiß|hot
kühl|cool
trocken|dry
nass|wet
sauber|clean
schmutzig|dirty
voll|full
leer|empty
teuer|expensive
billig|cheap
kostenlos|free of charge
fertig|ready / finished
`);

addGroup(["building-first-sentences", "asking-for-clarification", "speaking-through-a1-situations"], "adverb / phrase", `
ja|yes
nein|no
bitte|please / you're welcome
danke|thank you
gern|gladly
vielleicht|perhaps
natürlich|of course
leider|unfortunately
wirklich|really
genau|exactly
auch|also
nur|only
schon|already
noch|still / another
wieder|again
zusammen|together
allein|alone
hier|here
dort|there
links|left
rechts|right
geradeaus|straight ahead
oben|upstairs / above
unten|downstairs / below
drinnen|inside
draußen|outside
heute|today
gestern|yesterday
morgen|tomorrow
jetzt|now
sofort|immediately
später|later
früh|early
spät|late
immer|always
oft|often
manchmal|sometimes
selten|rarely
nie|never
zuerst|first
dann|then
danach|after that
zum Schluss|finally
sehr|very
etwas|a little / something
mehr|more
weniger|less
viel|much / a lot
wenig|little / few
genug|enough
`);

addGroup(["first-greetings", "personal-details-and-numbers", "asking-for-clarification", "speaking-through-a1-situations"], "useful phrase", `
Guten Morgen!|Good morning!
Guten Tag!|Hello / good afternoon!
Guten Abend!|Good evening!
Gute Nacht!|Good night!
Hallo!|Hello!
Tschüss!|Bye!
Auf Wiedersehen!|Goodbye!
Bis bald!|See you soon!
Bis später!|See you later!
Bis morgen!|See you tomorrow!
Wie geht es Ihnen?|How are you? (formal)
Wie geht es dir?|How are you? (informal)
Mir geht es gut.|I am well.
Nicht so gut.|Not so well.
Freut mich.|Nice to meet you.
Herzlich willkommen!|A warm welcome!
Entschuldigung.|Excuse me / sorry.
Kein Problem.|No problem.
Vielen Dank.|Thank you very much.
Gern geschehen.|You're welcome.
Ich weiß es nicht.|I do not know.
Ich verstehe nicht.|I do not understand.
Noch einmal, bitte.|Once again, please.
Langsamer, bitte.|More slowly, please.
Wie bitte?|Pardon?
Was bedeutet das?|What does that mean?
Wie sagt man das auf Deutsch?|How do you say that in German?
Wie schreibt man das?|How do you spell that?
Können Sie mir helfen?|Can you help me?
Einen Moment, bitte.|One moment, please.
Das stimmt.|That is correct.
Das stimmt nicht.|That is not correct.
Ich glaube schon.|I think so.
Ich glaube nicht.|I do not think so.
Gute Idee!|Good idea!
Das klingt gut.|That sounds good.
Schade!|What a pity!
Viel Spaß!|Have fun!
Gute Besserung!|Get well soon!
Guten Appetit!|Enjoy your meal!
Prost!|Cheers!
Herzlichen Glückwunsch!|Congratulations!
Alles Gute!|All the best!
Viel Glück!|Good luck!
Keine Ahnung.|No idea.
Natürlich nicht.|Of course not.
Ich bin gleich da.|I will be there shortly.
Ich komme später.|I am coming later.
Das passt mir gut.|That suits me well.
Das passt leider nicht.|Unfortunately that does not suit me.
`);

const existingLemmas = new Set(lessons.flatMap((lesson) => lesson.vocabulary.map((item) => item.lemma.normalize("NFKC").toLocaleLowerCase("de-DE"))));
const seen = new Set();
const uniqueCandidates = candidates.filter((item) => {
  const normalized = item.lemma.normalize("NFKC").toLocaleLowerCase("de-DE");
  if (existingLemmas.has(normalized) || seen.has(normalized)) return false;
  seen.add(normalized);
  return true;
});
const existingCount = lessons.reduce((total, lesson) => total + lesson.vocabulary.length, 0);
const needed = 1000 - existingCount;
if (uniqueCandidates.length < needed) throw new Error(`Need ${needed} core cards, but only ${uniqueCandidates.length} unique candidates are available.`);

const category = (item) => item.partOfSpeech === "number" ? "numbers"
  : item.partOfSpeech === "date phrase" ? "dates"
    : ["verb", "verb form", "past-tense chunk"].includes(item.partOfSpeech) ? "verbs"
      : item.partOfSpeech === "noun" ? "nouns"
        : item.partOfSpeech === "adjective" ? "adjectives"
          : item.partOfSpeech === "adverb / phrase" ? "connectors"
            : "phrases";
const quotas = { numbers: 80, dates: 25, verbs: 180, nouns: 230, adjectives: 55, connectors: 40, phrases: 28 };
const selected = [];
const selectedKeys = new Set();
for (const [name, quota] of Object.entries(quotas)) {
  for (const item of uniqueCandidates.filter((candidate) => category(candidate) === name).slice(0, quota)) {
    const key = item.lemma.normalize("NFKC").toLocaleLowerCase("de-DE");
    selected.push(item);
    selectedKeys.add(key);
  }
}
for (const item of uniqueCandidates) {
  if (selected.length >= needed) break;
  const key = item.lemma.normalize("NFKC").toLocaleLowerCase("de-DE");
  if (!selectedKeys.has(key)) { selected.push(item); selectedKeys.add(key); }
}
if (selected.length < needed) throw new Error(`Balanced selection produced only ${selected.length} cards for a ${needed}-card target.`);

book.coreVocabulary = selected.slice(0, needed).map((item, index) => {
  const source = item.sources[index % item.sources.length];
  const lesson = bySlug.get(source);
  if (!lesson) throw new Error(`Unknown source lesson: ${source}`);
  return {
    id: `vocab_de_a1_core_${String(index + 1).padStart(4, "0")}`,
    lemma: item.lemma,
    translation: item.translation,
    pronunciation: "audio",
    partOfSpeech: item.partOfSpeech,
    languageFeatures: { coreVocabulary: true, topic: lesson.title },
    sourceLessonId: lesson.id,
  };
});

book.revision = Math.max(book.revision, 12);
await writeFile(path, `${JSON.stringify(book, null, 2)}\n`, "utf8");
console.log(`Added ${needed} unique core vocabulary cards; A1 now contains 1000 vocabulary cards.`);
