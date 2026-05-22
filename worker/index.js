// Cloudflare Worker — Anthropic API proxy for Flow Events AI assist
// Deploy at: https://dash.cloudflare.com > Workers & Pages > Create Worker
// Set secret: wrangler secret put ANTHROPIC_KEY  (value: sk-ant-api03-...)

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

export default {
  async fetch(request, env) {
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: CORS });
    }

    if (request.method !== 'POST') {
      return new Response('Method not allowed', { status: 405 });
    }

    let body;
    try {
      body = await request.json();
    } catch {
      return new Response('Invalid JSON', { status: 400 });
    }

    const { text, mode } = body;
    if (!text || !mode) {
      return new Response('Missing text or mode', { status: 400 });
    }

    const prompts = {
      spelling: `Controleer de volgende Nederlandse tekst op spelling- en grammaticafouten en geef de gecorrigeerde versie terug. Verander de toon of inhoud NIET, alleen fouten corrigeren. Geef alleen de gecorrigeerde tekst terug, zonder uitleg.\n\nTekst:\n${text}`,
      enthusiastic: `Herschrijf de volgende Nederlandse tekst in een enthousiaste, uitnodigende toon die mensen aanspoort om te komen. Behoud de kern van de boodschap maar maak het levendiger en pakkender. Geef alleen de herschreven tekst terug, zonder uitleg.\n\nTekst:\n${text}`,
      friendly: `Herschrijf de volgende Nederlandse tekst in een warme, vriendelijke en persoonlijke toon. Behoud de kern van de boodschap maar maak het toegankelijker en persoonlijker. Geef alleen de herschreven tekst terug, zonder uitleg.\n\nTekst:\n${text}`,
    };

    const prompt = prompts[mode];
    if (!prompt) {
      return new Response('Invalid mode', { status: 400 });
    }

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': env.ANTHROPIC_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 1024,
        messages: [{ role: 'user', content: prompt }],
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      return new Response(`Anthropic error: ${err}`, { status: 502, headers: CORS });
    }

    const data = await response.json();
    const result = data.content?.[0]?.text || '';

    return new Response(JSON.stringify({ result }), {
      headers: { ...CORS, 'Content-Type': 'application/json' },
    });
  },
};
