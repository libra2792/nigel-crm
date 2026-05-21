import { getStore } from '@netlify/blobs';

export default async (req) => {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
  };

  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const key = url.searchParams.get('key');

    if (!key) {
      return new Response(JSON.stringify({ error: 'key required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const store = getStore('crm-documents');
    const result = await store.getWithMetadata(key, { type: 'arrayBuffer' });

    if (!result) {
      return new Response(JSON.stringify({ error: 'not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const fileName = result.metadata.fileName || 'download';
    const fileType = result.metadata.fileType || 'application/octet-stream';

    return new Response(result.data, {
      status: 200,
      headers: {
        ...corsHeaders,
        'Content-Type': fileType,
        'Content-Disposition': 'inline; filename="' + fileName + '"',
      },
    });

  } catch (err) {
    console.error('Download error:', err);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
};

export const config = { path: '/api/doc-download' };
