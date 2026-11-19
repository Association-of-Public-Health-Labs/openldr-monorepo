export function offlineDurationMs(start: string, end: string | null, now: Date = new Date()): number {
  const startMs = new Date(start).getTime();
  const endMs = end ? new Date(end).getTime() : now.getTime();
  return Math.max(0, endMs - startMs);
}

export function humanizeDuration(ms: number): string {
  const totalMinutes = ms / 60_000;
  if (totalMinutes < 60) {
    const m = Math.max(0, Math.round(totalMinutes));
    return `${m} ${m === 1 ? "minuto" : "minutos"}`;
  }
  const totalHours = ms / 3_600_000;
  if (totalHours < 24) {
    const h = Math.round(totalHours);
    return `${h} ${h === 1 ? "hora" : "horas"}`;
  }
  const d = Math.round(ms / 86_400_000);
  return `${d} ${d === 1 ? "dia" : "dias"}`;
}
