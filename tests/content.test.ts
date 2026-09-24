import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { GERMAN_LEVELS, getAssessmentQuestions, getPublicLessonBySlug, getVocabularyById, listGermanCourses, listPublicLessons, listVocabulary } from "../infrastructure/catalog/lesson-content.ts";

describe("German A1-B1 starter content", () => {
  it("uses stable unique IDs and supports chapter-based courses at every level", () => {
    const courses = listGermanCourses();
    assert.deepEqual(courses.map((course) => course.levelCode), [...GERMAN_LEVELS]);
    assert.ok(courses.every((course) => course.languageCode === "de" && course.chapters.length >= 1));
    assert.ok(courses.every((course) => course.chapters.flatMap((chapter) => chapter.lessons).length >= 3));
    const ids = courses.flatMap((course) => course.chapters.flatMap((chapter) => chapter.lessons.map((lesson) => lesson.id)));
    assert.equal(new Set(ids).size, ids.length);
  });

  it("keeps answer keys out of the browser contract", () => {
    const authored = getAssessmentQuestions("lesson_de_a1_bakery", "quiz");
    const publicLesson = getPublicLessonBySlug("A1", "at-the-bakery");
    assert.ok(authored?.every((question) => question.choices.includes(question.correctAnswer)));
    assert.ok(publicLesson?.quiz.questions.every((question) => !("correctAnswer" in question)));
  });

  it("serves real A2 and B1 lesson contracts", () => {
    assert.equal(getPublicLessonBySlug("A2", "making-plans")?.levelCode, "A2");
    assert.equal(getPublicLessonBySlug("B1", "sharing-opinions")?.levelCode, "B1");
    assert.equal(getPublicLessonBySlug("B1", "sharing-opinions")?.chapterOrder, 1);
  });

  it("serves the second A2 chapter with stable course and chapter ordering", () => {
    const lessons = listPublicLessons("A2");
    const shopping = getPublicLessonBySlug("A2", "smart-shopping");
    const health = getPublicLessonBySlug("A2", "everyday-health-help");

    assert.equal(lessons.length, 42);
    assert.equal(shopping?.chapterTitle, "A practical day");
    assert.equal(shopping?.chapterOrder, 2);
    assert.equal(shopping?.chapterLessonOrder, 1);
    assert.equal(shopping?.order, 4);
    assert.equal(health?.chapterLessonOrder, 3);
    assert.equal(health?.order, 6);
  });

  it("finishes A2 with integrated communication and production review", () => {
    const reading = getPublicLessonBySlug("A2", "reading-connected-texts");
    const production = getPublicLessonBySlug("A2", "a2-speaking-and-writing-review");

    assert.equal(reading?.chapterTitle, "Integrated communication");
    assert.equal(reading?.chapterOrder, 13);
    assert.equal(reading?.order, 37);
    assert.equal(production?.chapterTitle, "A2 review and production");
    assert.equal(production?.chapterOrder, 14);
    assert.equal(production?.order, 42);
  });

  it("excludes quarantined synthetic A2 vocabulary while keeping authored lessons available", () => {
    const lessons = listPublicLessons("A2");
    const vocabulary = listVocabulary("A2");
    const authoredVocabularyCount = lessons.reduce((total, lesson) => total + lesson.vocabulary.length, 0);
    assert.ok(vocabulary.length >= authoredVocabularyCount);
    assert.ok(vocabulary.every((item) => item.vocabulary.languageFeatures.qualityStatus !== "quarantined"));
    assert.ok(lessons.reduce((total, lesson) => total + lesson.sentences.length, 0) >= 300);
    assert.ok((listGermanCourses().find((course) => course.levelCode === "A2")?.coreVocabulary ?? []).some((item) => item.languageFeatures.qualityStatus === "quarantined"));
    assert.equal(getVocabularyById("vocab_de_a2_core_0001"), undefined);
  });

  it("serves the second A1 chapter with stable course and chapter ordering", () => {
    const lessons = listPublicLessons("A1");
    const personalDetails = getPublicLessonBySlug("A1", "personal-details-and-numbers");
    const dailyRoutine = getPublicLessonBySlug("A1", "a-normal-day");

    assert.equal(lessons.length, 42);
    assert.equal(personalDetails?.chapterTitle, "My life and my day");
    assert.equal(personalDetails?.chapterOrder, 3);
    assert.equal(personalDetails?.chapterLessonOrder, 1);
    assert.equal(personalDetails?.order, 7);
    assert.equal(dailyRoutine?.chapterLessonOrder, 3);
    assert.equal(dailyRoutine?.order, 9);
  });

  it("starts A1 with sound, spelling, and sentence structure", () => {
    const alphabet = getPublicLessonBySlug("A1", "alphabet-and-spelling");
    const structure = getPublicLessonBySlug("A1", "building-first-sentences");

    assert.equal(alphabet?.chapterTitle, "Sound and structure");
    assert.equal(alphabet?.chapterOrder, 1);
    assert.equal(alphabet?.order, 1);
    assert.equal(structure?.chapterLessonOrder, 3);
    assert.equal(structure?.order, 3);
  });

  it("serves the third A1 chapter with stable course and chapter ordering", () => {
    const groceries = getPublicLessonBySlug("A1", "buying-groceries");
    const appointment = getPublicLessonBySlug("A1", "making-an-appointment");

    assert.equal(groceries?.chapterTitle, "Out and about");
    assert.equal(groceries?.chapterOrder, 4);
    assert.equal(groceries?.chapterLessonOrder, 1);
    assert.equal(groceries?.order, 10);
    assert.equal(appointment?.chapterLessonOrder, 3);
    assert.equal(appointment?.order, 12);
  });

  it("serves the fourth A1 chapter with stable course and chapter ordering", () => {
    const health = getPublicLessonBySlug("A1", "everyday-health-basics");
    const leisure = getPublicLessonBySlug("A1", "simple-leisure-plans");

    assert.equal(health?.chapterTitle, "Wellbeing and plans");
    assert.equal(health?.chapterOrder, 5);
    assert.equal(health?.chapterLessonOrder, 1);
    assert.equal(health?.order, 13);
    assert.equal(leisure?.chapterLessonOrder, 3);
    assert.equal(leisure?.order, 15);
  });

  it("serves the calendar and identity chapter after the practical foundation", () => {
    const dates = getPublicLessonBySlug("A1", "dates-and-birthdays");
    const forms = getPublicLessonBySlug("A1", "forms-and-contact-details");

    assert.equal(dates?.chapterTitle, "Calendar and identity");
    assert.equal(dates?.chapterOrder, 6);
    assert.equal(dates?.order, 16);
    assert.equal(forms?.chapterLessonOrder, 3);
    assert.equal(forms?.order, 18);
  });

  it("serves work and study with cumulative course ordering", () => {
    const classroom = getPublicLessonBySlug("A1", "in-the-classroom");
    const workday = getPublicLessonBySlug("A1", "a-simple-workday");

    assert.equal(classroom?.chapterTitle, "Work and study");
    assert.equal(classroom?.chapterOrder, 7);
    assert.equal(classroom?.order, 19);
    assert.equal(workday?.chapterLessonOrder, 3);
    assert.equal(workday?.order, 21);
  });

  it("serves home and neighborhood after work and study", () => {
    const rooms = getPublicLessonBySlug("A1", "rooms-and-furniture");
    const services = getPublicLessonBySlug("A1", "essential-local-services");

    assert.equal(rooms?.chapterTitle, "Home and neighborhood");
    assert.equal(rooms?.chapterOrder, 8);
    assert.equal(rooms?.order, 22);
    assert.equal(services?.chapterLessonOrder, 3);
    assert.equal(services?.order, 24);
  });

  it("serves food and shopping after neighborhood skills", () => {
    const meals = getPublicLessonBySlug("A1", "meals-and-preferences");
    const clothes = getPublicLessonBySlug("A1", "clothes-colors-and-sizes");

    assert.equal(meals?.chapterTitle, "Food and shopping");
    assert.equal(meals?.chapterOrder, 9);
    assert.equal(meals?.order, 25);
    assert.equal(clothes?.chapterLessonOrder, 3);
    assert.equal(clothes?.order, 27);
  });

  it("serves travel basics after food and shopping", () => {
    const station = getPublicLessonBySlug("A1", "at-the-train-station");
    const hotel = getPublicLessonBySlug("A1", "hotel-check-in");

    assert.equal(station?.chapterTitle, "Travel basics");
    assert.equal(station?.chapterOrder, 10);
    assert.equal(station?.chapterLessonOrder, 1);
    assert.equal(station?.order, 28);
    assert.equal(hotel?.chapterLessonOrder, 3);
    assert.equal(hotel?.order, 30);
  });

  it("finishes A1 with communication, consolidation, bridge, and production review", () => {
    const phone = getPublicLessonBySlug("A1", "phone-calls-and-messages");
    const past = getPublicLessonBySlug("A1", "talking-about-the-past");
    const weather = getPublicLessonBySlug("A1", "weather-seasons-and-plans");
    const speaking = getPublicLessonBySlug("A1", "speaking-through-a1-situations");

    assert.equal(phone?.chapterOrder, 11);
    assert.equal(phone?.order, 31);
    assert.equal(past?.chapterOrder, 12);
    assert.equal(past?.order, 36);
    assert.equal(weather?.chapterOrder, 13);
    assert.equal(weather?.order, 37);
    assert.equal(speaking?.chapterTitle, "A1 review and production");
    assert.equal(speaking?.chapterOrder, 14);
    assert.equal(speaking?.order, 42);
  });

  it("meets the reviewed A1 vocabulary and sentence coverage gates", () => {
    const lessons = listPublicLessons("A1");
    assert.equal(listVocabulary("A1").length, 1000);
    assert.equal(lessons.reduce((total, lesson) => total + lesson.sentences.length, 0), 300);
    assert.ok(listVocabulary("A1").some((item) => item.vocabulary.languageFeatures.coreVocabulary === true));
  });

  it("serves the second B1 chapter with stable course and chapter ordering", () => {
    const lessons = listPublicLessons("B1");
    const learning = getPublicLessonBySlug("B1", "learning-and-development");
    const community = getPublicLessonBySlug("B1", "taking-part-in-the-community");

    assert.equal(lessons.length, 42);
    assert.equal(learning?.chapterTitle, "Learning and participation");
    assert.equal(learning?.chapterOrder, 2);
    assert.equal(learning?.chapterLessonOrder, 1);
    assert.equal(learning?.order, 4);
    assert.equal(community?.order, 6);
  });

  it("starts the expanded B1 sequence with narration, professional communication, and consumer rights", () => {
    const turningPoints = getPublicLessonBySlug("B1", "turning-points");
    const applications = getPublicLessonBySlug("B1", "applications-and-career-profiles");
    const authorities = getPublicLessonBySlug("B1", "authorities-forms-and-procedures");

    assert.equal(turningPoints?.chapterTitle, "Stories and life changes");
    assert.equal(turningPoints?.chapterOrder, 3);
    assert.equal(turningPoints?.order, 7);
    assert.equal(applications?.chapterTitle, "Professional communication");
    assert.equal(applications?.chapterOrder, 4);
    assert.equal(applications?.order, 10);
    assert.equal(authorities?.chapterTitle, "Consumer rights and administration");
    assert.equal(authorities?.chapterOrder, 5);
    assert.equal(authorities?.order, 15);
  });

  it("continues B1 with travel, resilience, and social participation", () => {
    const travel = getPublicLessonBySlug("B1", "planning-complex-journeys");
    const health = getPublicLessonBySlug("B1", "healthcare-choices-and-second-opinions");
    const society = getPublicLessonBySlug("B1", "perspectives-in-a-diverse-society");
    const lessons = listPublicLessons("B1");

    assert.equal(lessons.length, 42);
    assert.equal(travel?.chapterTitle, "Travel and mobility");
    assert.equal(travel?.chapterOrder, 6);
    assert.equal(travel?.order, 16);
    assert.equal(health?.chapterTitle, "Health and resilience");
    assert.equal(health?.chapterOrder, 7);
    assert.equal(health?.order, 19);
    assert.equal(society?.chapterTitle, "Society and participation");
    assert.equal(society?.chapterOrder, 8);
    assert.equal(society?.order, 24);
  });

  it("continues B1 with sustainability, digital media, and relationship skills", () => {
    const environment = getPublicLessonBySlug("B1", "climate-choices-and-consequences");
    const media = getPublicLessonBySlug("B1", "checking-sources-and-claims");
    const relationships = getPublicLessonBySlug("B1", "generations-and-changing-roles");
    const lessons = listPublicLessons("B1");

    assert.equal(lessons.length, 42);
    assert.equal(environment?.chapterTitle, "Environment and sustainability");
    assert.equal(environment?.chapterOrder, 9);
    assert.equal(environment?.order, 25);
    assert.equal(media?.chapterTitle, "Media and digital life");
    assert.equal(media?.chapterOrder, 10);
    assert.equal(media?.order, 28);
    assert.equal(relationships?.chapterTitle, "Relationships and communication");
    assert.equal(relationships?.chapterOrder, 11);
    assert.equal(relationships?.order, 33);
  });

  it("finishes B1 with grammar precision, integrated communication, and production review", () => {
    const grammar = getPublicLessonBySlug("B1", "complex-clauses-and-connectors");
    const integrated = getPublicLessonBySlug("B1", "reading-longer-informative-texts");
    const final = getPublicLessonBySlug("B1", "b1-final-preparation-and-self-assessment");

    assert.equal(grammar?.chapterTitle, "Grammar precision");
    assert.equal(grammar?.chapterOrder, 12);
    assert.equal(grammar?.order, 34);
    assert.equal(integrated?.chapterTitle, "Integrated communication");
    assert.equal(integrated?.chapterOrder, 13);
    assert.equal(integrated?.order, 37);
    assert.equal(final?.chapterTitle, "B1 review and production");
    assert.equal(final?.chapterOrder, 14);
    assert.equal(final?.order, 42);
  });

  it("excludes quarantined synthetic B1 vocabulary while keeping authored lessons available", () => {
    const lessons = listPublicLessons("B1");
    const vocabulary = listVocabulary("B1");
    const authoredVocabularyCount = lessons.reduce((total, lesson) => total + lesson.vocabulary.length, 0);
    assert.ok(vocabulary.length >= authoredVocabularyCount);
    assert.ok(vocabulary.every((item) => item.vocabulary.languageFeatures.qualityStatus !== "quarantined"));
    assert.ok(lessons.reduce((total, lesson) => total + lesson.sentences.length, 0) >= 300);
    assert.ok((listGermanCourses().find((course) => course.levelCode === "B1")?.coreVocabulary ?? []).some((item) => item.languageFeatures.qualityStatus === "quarantined"));
  });
});
