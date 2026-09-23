export type RecordedLearningActivity = Readonly<{
  occurredAt: string;
  durationMs: number;
  kind: "assessment" | "challenge" | "review";
}>;

export type LearningActivityDay = Readonly<{
  dateKey: string;
  label: string;
  active: boolean;
  actions: number;
  trackedMinutes: number;
}>;

export type LearningActivitySummary = Readonly<{
  currentStreak: number;
  activeDaysThisWeek: number;
  todayActions: number;
  todayTrackedMinutes: number;
  totalTrackedMinutes: number;
  week: readonly LearningActivityDay[];
}>;

const MAX_RECORDED_SESSION_MS = 2 * 60 * 60 * 1_000;

export function summarizeLearningActivity(
  activities: readonly RecordedLearningActivity[],
  now: Date,
  timeZone: string,
): LearningActivitySummary {
  const byDay = new Map<string, { actions: number; durationMs: number }>();
  for (const activity of activities) {
    const occurredAt = new Date(activity.occurredAt);
    if (Number.isNaN(occurredAt.getTime()) || occurredAt.getTime() > now.getTime() + 60_000) continue;
    const dateKey = calendarDateKey(occurredAt, timeZone);
    const current = byDay.get(dateKey) ?? { actions: 0, durationMs: 0 };
    current.actions += 1;
    current.durationMs += clamp(activity.durationMs, 0, MAX_RECORDED_SESSION_MS);
    byDay.set(dateKey, current);
  }

  const todayKey = calendarDateKey(now, timeZone);
  const currentWeekStart = addCalendarDays(todayKey, -(calendarWeekday(todayKey) - 1));
  const week = Array.from({ length: 7 }, (_, index) => {
    const dateKey = addCalendarDays(currentWeekStart, index);
    const activity = byDay.get(dateKey);
    return {
      dateKey,
      label: weekdayLabel(dateKey),
      active: Boolean(activity),
      actions: activity?.actions ?? 0,
      trackedMinutes: toMinutes(activity?.durationMs ?? 0),
    };
  });

  const mostRecentCandidate = byDay.has(todayKey) ? todayKey : addCalendarDays(todayKey, -1);
  let currentStreak = 0;
  let cursor = mostRecentCandidate;
  while (byDay.has(cursor)) {
    currentStreak += 1;
    cursor = addCalendarDays(cursor, -1);
  }

  const today = byDay.get(todayKey);
  const totalDurationMs = [...byDay.values()].reduce((total, day) => total + day.durationMs, 0);
  return {
    currentStreak,
    activeDaysThisWeek: week.filter((day) => day.active).length,
    todayActions: today?.actions ?? 0,
    todayTrackedMinutes: toMinutes(today?.durationMs ?? 0),
    totalTrackedMinutes: toMinutes(totalDurationMs),
    week,
  };
}

function calendarDateKey(date: Date, timeZone: string): string {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);
  const value = (type: Intl.DateTimeFormatPartTypes) => parts.find((part) => part.type === type)?.value ?? "";
  return `${value("year")}-${value("month")}-${value("day")}`;
}

function addCalendarDays(dateKey: string, days: number): string {
  const [year, month, day] = dateKey.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day + days));
  return date.toISOString().slice(0, 10);
}

function calendarWeekday(dateKey: string): number {
  const [year, month, day] = dateKey.split("-").map(Number);
  const weekday = new Date(Date.UTC(year, month - 1, day)).getUTCDay();
  return weekday === 0 ? 7 : weekday;
}

function weekdayLabel(dateKey: string): string {
  const [year, month, day] = dateKey.split("-").map(Number);
  return new Intl.DateTimeFormat("en", { weekday: "short", timeZone: "UTC" }).format(new Date(Date.UTC(year, month - 1, day))).slice(0, 1);
}

function toMinutes(durationMs: number): number {
  return durationMs > 0 ? Math.max(1, Math.round(durationMs / 60_000)) : 0;
}

function clamp(value: number, minimum: number, maximum: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.min(maximum, Math.max(minimum, value));
}
