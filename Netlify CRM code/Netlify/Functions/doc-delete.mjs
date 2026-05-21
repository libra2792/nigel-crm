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
    const { key } = body;

    if (!key) {
      return new Response(JSON.stringify({ error: 'key required' }), { status: 400, headers: corsHeaders });
    }

    const store = getStore('crm-documents');
    await store.delete(key);

    return new Response(JSON.stringify({ ok: true }), { status: 200, headers: corsHeaders });

  } catch (err) {
    console.error('Delete error:', err);
    return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: corsHeaders });
  }
};

export const config = { path: '/api/doc-delete' };
