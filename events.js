// ─── FIREBASE ───
const DB_URL = 'https://flow-events-2e877-default-rtdb.europe-west1.firebasedatabase.app';

async function fbGet(path) {
  const res = await fetch(`${DB_URL}/${path}.json`);
  return res.ok ? res.json() : null;
}

async function fbSet(path, data) {
  await fetch(`${DB_URL}/${path}.json`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

async function fbPush(path, data) {
  const res = await fetch(`${DB_URL}/${path}.json`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
  return res.json();
}

async function fbPatch(path, data) {
  await fetch(`${DB_URL}/${path}.json`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}

async function fbDelete(path) {
  await fetch(`${DB_URL}/${path}.json`, { method: 'DELETE' });
}

// ─── THEMES ───
const THEMES = {
  snow:  { label: 'Snow',  emoji: '❄️',  bg: '#f0f4f8', accent: '#4a90b8', text: '#1a2a3a', hero: 'linear-gradient(135deg, #e8f4fd 0%, #d0e8f5 100%)', card: '#ffffff' },
  show:  { label: 'Show',  emoji: '🎭',  bg: '#1a0a2e', accent: '#e040fb', text: '#f3e5ff', hero: 'linear-gradient(135deg, #2d0050 0%, #1a0a2e 100%)', card: '#2a1040' },
  grow:  { label: 'Grow',  emoji: '🌱',  bg: '#f4f9f0', accent: '#4caf50', text: '#1a2d1a', hero: 'linear-gradient(135deg, #e8f5e9 0%, #dcedc8 100%)', card: '#ffffff' },
  throw: { label: 'Throw', emoji: '🎯',  bg: '#fff8f0', accent: '#ff6b35', text: '#2d1a00', hero: 'linear-gradient(135deg, #fff3e0 0%, #ffe0b2 100%)', card: '#ffffff' },
  know:  { label: 'Know',  emoji: '📖',  bg: '#fafaf7', accent: '#795548', text: '#1a1208', hero: 'linear-gradient(135deg, #fdf6ec 0%, #f5e9d0 100%)', card: '#ffffff' },
  flow:  { label: 'Flow',  emoji: '☕',  bg: '#fdf8f3', accent: '#a67c5b', text: '#1a1a1a', hero: 'linear-gradient(135deg, #fdf8f3 0%, #f0e6d8 100%)', card: '#ffffff' },
  glow:  { label: 'Glow',  emoji: '✨',  bg: '#fffbf0', accent: '#f9a825', text: '#1a1200', hero: 'linear-gradient(135deg, #fffde7 0%, #fff9c4 100%)', card: '#ffffff' },
  slow:  { label: 'Slow',  emoji: '🌙',  bg: '#0d1117', accent: '#7c8cf8', text: '#e6edf3', hero: 'linear-gradient(135deg, #161b22 0%, #0d1117 100%)', card: '#161b22' },
};

function applyTheme(themeKey) {
  const theme = THEMES[themeKey] || THEMES.flow;
  const root = document.documentElement;
  root.style.setProperty('--theme-bg', theme.bg);
  root.style.setProperty('--theme-accent', theme.accent);
  root.style.setProperty('--theme-text', theme.text);
  root.style.setProperty('--theme-hero', theme.hero);
  root.style.setProperty('--theme-card', theme.card);
  document.body.style.background = theme.bg;
  document.body.style.color = theme.text;
}

// ─── EVENTS DB ───
async function getEvents() {
  const data = await fbGet('events');
  if (!data) return [];
  return Object.entries(data).map(([id, ev]) => ({ ...ev, id }));
}

async function getEvent(id) {
  const data = await fbGet(`events/${id}`);
  return data ? { ...data, id } : null;
}

async function createEvent(eventData) {
  return fbPush('events', { ...eventData, createdAt: new Date().toISOString() });
}

async function updateEvent(id, fields) {
  return fbPatch(`events/${id}`, fields);
}

async function deleteEvent(id) {
  return fbDelete(`events/${id}`);
}

async function getRegistrations(eventId) {
  const data = await fbGet(`events/${eventId}/registrations`);
  if (!data) return [];
  return Object.entries(data).map(([id, reg]) => ({ ...reg, id }));
}

async function registerForEvent(eventId, regData) {
  return fbPush(`events/${eventId}/registrations`, {
    ...regData,
    registeredAt: new Date().toISOString(),
  });
}

function formatDate(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  return d.toLocaleDateString('nl-BE', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
}

function spotsLeft(event, registrations) {
  if (!event.maxAttendees) return null;
  return Math.max(0, event.maxAttendees - registrations.length);
}
