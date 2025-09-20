import { NextRequest } from 'next/server'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const n8nUrl = process.env.N8N_WEBHOOK_URL
    if (!n8nUrl) {
      return Response.json({ error: 'N8N_WEBHOOK_URL is not configured' }, { status: 500 })
    }

    let payload: any
    try {
      payload = await request.json()
    } catch {
      return Response.json({ error: 'Invalid JSON body' }, { status: 400 })
    }

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    }

    const authHeader = process.env.N8N_WEBHOOK_AUTH
    if (authHeader) headers['Authorization'] = authHeader

    const n8nResponse = await fetch(n8nUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload)
    })

    const contentType = n8nResponse.headers.get('content-type') || ''
    const status = n8nResponse.status

    if (contentType.includes('application/json')) {
      const data = await n8nResponse.json()
      return Response.json(data, { status })
    }

    const text = await n8nResponse.text()
    return new Response(text, {
      status,
      headers: { 'Content-Type': contentType || 'text/plain' }
    })
  } catch (error: any) {
    return Response.json({ error: error?.message || 'Unexpected error' }, { status: 500 })
  }
}

export async function GET() {
  const configured = Boolean(process.env.N8N_WEBHOOK_URL)
  return Response.json({ ok: true, configured })
}


