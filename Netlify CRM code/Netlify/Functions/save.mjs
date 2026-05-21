import { getStore } from '@netlify/blobs';

export default async (req) => {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json',
  };

  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'POST only' }), { status: 405, headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const store = getStore('crm-data');

    // Save whichever slices were sent
    const saves = [];
    if (body.contacts !== undefined) {
      saves.push(store.setJSON('contacts', body.contacts));
    }
    if (body.gifts !== undefined) {
      saves.push(store.setJSON('gifts', body.gifts));
    }
    if (body.pipeline !== undefined) {
      saves.push(store.setJSON('pipeline', body.pipeline));
    }

    await Promise.all(saves);

    return new Response(JSON.stringify({ ok: true, saved: saves.length }), {
      status: 200,
      headers: corsHeaders,
    });

  } catch (err) {
    console.error('Save error:', err);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: corsHeaders,
    });
  }
};

export const config = { path: '/api/save' };
