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
const THEMES_DEFAULT = {
  snow:  { label: 'Snow',  emoji: '❄️',  bg: '#f4f8fb', accent: '#7fb3cc', text: '#2a3d4a', hero: 'linear-gradient(135deg, #eaf4fa 0%, #d6eaf5 100%)', card: '#ffffff', img: 'https://images.unsplash.com/photo-1491002052546-bf38f186af56?w=800&q=80' },
  show:  { label: 'Show',  emoji: '🎭',  bg: '#fdf6ff', accent: '#b57ecf', text: '#2d1a3a', hero: 'linear-gradient(135deg, #f9eeff 0%, #eedff7 100%)', card: '#ffffff', img: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&q=80' },
  grow:  { label: 'Grow',  emoji: '🌱',  bg: '#f5faf2', accent: '#72b06a', text: '#1e2e1a', hero: 'linear-gradient(135deg, #eaf5e6 0%, #d8edcf 100%)', card: '#ffffff', img: 'https://images.unsplash.com/photo-1466692476868-aef1dfb1e735?w=800&q=80' },
  throw: { label: 'Throw', emoji: '🎯',  bg: '#fdf8f4', accent: '#d4845a', text: '#2d1e14', hero: 'linear-gradient(135deg, #fdf0e6 0%, #f5ddc8 100%)', card: '#ffffff', img: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=800&q=80' },
  know:  { label: 'Know',  emoji: '📖',  bg: '#fafaf7', accent: '#9c7c5e', text: '#221a10', hero: 'linear-gradient(135deg, #fdf6ec 0%, #f5e9d0 100%)', card: '#ffffff', img: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=800&q=80' },
  flow:  { label: 'Flow',  emoji: '☕',  bg: '#fdf8f3', accent: '#a67c5b', text: '#1a1a1a', hero: 'linear-gradient(135deg, #fdf8f3 0%, #f0e6d8 100%)', card: '#ffffff', img: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=800&q=80' },
  glow:  { label: 'Glow',  emoji: '✨',  bg: '#fdfaf2', accent: '#c9973a', text: '#261d08', hero: 'linear-gradient(135deg, #fdf8e1 0%, #f7edbc 100%)', card: '#ffffff', img: 'https://images.unsplash.com/photo-1524117074681-31bd4de22ad3?w=800&q=80' },
  slow:  { label: 'Slow',  emoji: '🌙',  bg: '#f4f5fb', accent: '#8892d4', text: '#1e2040', hero: 'linear-gradient(135deg, #eaedf8 0%, #d8ddf0 100%)', card: '#ffffff', img: 'https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?w=800&q=80' },
};

let THEMES = { ...THEMES_DEFAULT };

async function loadThemes() {
  const data = await fbGet('themes');
  if (data) {
    // update existing defaults
    Object.keys(THEMES_DEFAULT).forEach(key => {
      if (data[key]) THEMES[key] = { ...THEMES_DEFAULT[key], ...data[key] };
    });
    // load custom themes (not in defaults)
    Object.keys(data).forEach(key => {
      if (!THEMES_DEFAULT[key] && data[key] && data[key]._custom) {
        THEMES[key] = data[key];
      }
    });
  }
  return THEMES;
}

async function saveTheme(key, data) {
  return fbSet(`themes/${key}`, data);
}

async function deleteTheme(key) {
  return fbDelete(`themes/${key}`);
}

async function resetTheme(key) {
  return fbDelete(`themes/${key}`);
}

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
