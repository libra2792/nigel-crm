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
    const formData = await req.formData();
    const file = formData.get('file');
    const contactId = formData.get('contactId');
    const category = formData.get('category') || 'misc';

    if (!file || !contactId) {
      return new Response(JSON.stringify({ error: 'file and contactId required' }), { status: 400, headers: corsHeaders });
    }

    const docId = 'doc-' + Date.now() + '-' + Math.random().toString(36).slice(2, 8);
    const key = contactId + '/' + docId + '/' + file.name;
    const store = getStore('crm-documents');

    const arrayBuffer = await file.arrayBuffer();
    await store.set(key, arrayBuffer, {
      metadata: {
        fileName: file.name,
        fileType: file.type,
        fileSize: String(file.size),
        contactId,
        category,
        docId,
        uploadDate: new Date().toISOString(),
      },
    });

    return new Response(JSON.stringify({
      ok: true,
      doc: {
        id: docId,
        key,
        fileName: file.name,
        fileType: file.type,
        fileSize: file.size,
        category,
        uploadDate: new Date().toISOString(),
      },
    }), { status: 200, headers: corsHeaders });

  } catch (err) {
    console.error('Upload error:', err);
    return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: corsHeaders });
  }
};

export const config = { path: '/api/doc-upload' };
