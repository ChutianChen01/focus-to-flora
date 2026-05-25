export function formatDateTime(value) {
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value));
}

export function formatShortDate(value) {
  return new Intl.DateTimeFormat(undefined, {
    month: 'short',
    day: 'numeric',
  }).format(new Date(value));
}

export function formatMinutes(minutes) {
  const rounded = Math.round(Number(minutes) || 0);
  const hours = Math.floor(rounded / 60);
  const mins = rounded % 60;

  if (hours && mins) return `${hours}h ${mins}m`;
  if (hours) return `${hours}h`;
  return `${mins}m`;
}

export function formatTimer(seconds) {
  const safeSeconds = Math.max(0, Math.ceil(seconds));
  const mins = Math.floor(safeSeconds / 60);
  const secs = safeSeconds % 60;
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

export function startOfDay(date = new Date()) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

export function startOfWeek(date = new Date()) {
  const day = date.getDay();
  const diff = day === 0 ? 6 : day - 1;
  return new Date(date.getFullYear(), date.getMonth(), date.getDate() - diff);
}

export function startOfMonth(date = new Date()) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}
