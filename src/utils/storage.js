const SESSIONS_KEY = 'focusToFlora.sessions';
const TAGS_KEY = 'focusToFlora.tags';
const THEME_KEY = 'focusToFlora.theme';

export const defaultTags = [
  'lab',
  'coding',
  'reading',
  'writing',
  'admin',
  'language study',
  'other',
];

export const themes = ['dark', 'light', 'forest', 'minimal', 'lab notebook'];

function readJson(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function writeJson(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

export function loadSessions() {
  const sessions = readJson(SESSIONS_KEY, []);
  return Array.isArray(sessions) ? sessions : [];
}

export function saveSessions(sessions) {
  writeJson(SESSIONS_KEY, sessions);
}

export function loadTags() {
  const tags = readJson(TAGS_KEY, defaultTags);
  if (!Array.isArray(tags)) return defaultTags;
  return [...new Set([...defaultTags, ...tags.filter(Boolean).map(String)])];
}

export function saveTags(tags) {
  writeJson(TAGS_KEY, [...new Set(tags.filter(Boolean).map((tag) => tag.trim()).filter(Boolean))]);
}

export function loadTheme() {
  const theme = localStorage.getItem(THEME_KEY);
  return themes.includes(theme) ? theme : 'dark';
}

export function saveTheme(theme) {
  localStorage.setItem(THEME_KEY, themes.includes(theme) ? theme : 'dark');
}

export function buildBackup(sessions, tags, theme) {
  return {
    app: 'Focus to Flora',
    version: 1,
    exportedAt: new Date().toISOString(),
    sessions,
    tags,
    theme,
  };
}

function isValidSession(session) {
  return (
    session &&
    typeof session.id === 'string' &&
    typeof session.startedAt === 'string' &&
    typeof session.endedAt === 'string' &&
    Number.isFinite(Number(session.plannedMinutes)) &&
    Number.isFinite(Number(session.actualMinutes)) &&
    ['completed', 'cancelled'].includes(session.status) &&
    typeof session.tag === 'string' &&
    typeof session.note === 'string' &&
    typeof session.plantType === 'string' &&
    typeof session.createdAt === 'string'
  );
}

export function validateBackup(data) {
  if (!data || typeof data !== 'object') {
    return { ok: false, message: 'The selected file is not valid JSON backup data.' };
  }

  if (!Array.isArray(data.sessions) || !data.sessions.every(isValidSession)) {
    return { ok: false, message: 'Backup sessions are missing required fields.' };
  }

  if (!Array.isArray(data.tags) || !data.tags.every((tag) => typeof tag === 'string')) {
    return { ok: false, message: 'Backup tags must be a list of text labels.' };
  }

  if (data.theme && !themes.includes(data.theme)) {
    return { ok: false, message: 'Backup theme is not recognized.' };
  }

  return { ok: true };
}
