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

  try {
    const store = getStore('crm-data');

    // Load all three data slices in parallel
    const [contactsRaw, giftsRaw, pipelineRaw] = await Promise.all([
      store.get('contacts', { type: 'json' }).catch(() => null),
      store.get('gifts', { type: 'json' }).catch(() => null),
      store.get('pipeline', { type: 'json' }).catch(() => null),
    ]);

    return new Response(JSON.stringify({
      contacts: contactsRaw || [],
      gifts: giftsRaw || {},
      pipeline: pipelineRaw || [],
    }), { status: 200, headers: corsHeaders });

  } catch (err) {
    console.error('Load error:', err);
    return new Response(JSON.stringify({ error: err.message, contacts: [], gifts: {}, pipeline: [] }), {
      status: 500,
      headers: corsHeaders,
    });
  }
};

export const config = { path: '/api/load' };
