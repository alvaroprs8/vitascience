import { NextRequest } from 'next/server'
import { randomUUID } from 'crypto'

export const dynamic = 'force-dynamic'
export const maxDuration = 300

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

    // Async mode: include correlationId and callbackUrl so n8n can call back when ready
    const baseUrl = process.env.NEXT_PUBLIC_IGNITER_API_URL || 'http://localhost:3000'
    const correlationId = randomUUID()
    const callbackUrl = `${baseUrl}/api/lead/callback`

    // Mapear para o formato esperado pelo n8n: vsl_copy
    const baseInput = {
      vsl_copy: payload.vsl_copy || payload.lead,
      title: payload.title,
      metadata: payload.metadata,
    }

    const asyncPayload = { ...baseInput, correlationId, callbackUrl }

    const n8nResponse = await fetch(n8nUrl, {
      method: 'POST',
      headers: {
        ...headers,
        ...(process.env.N8N_CALLBACK_SECRET ? { 'X-Callback-Secret': process.env.N8N_CALLBACK_SECRET } : {})
      },
      body: JSON.stringify(asyncPayload)
    })

    // We don't block on n8n processing; return the correlationId immediately
    if (!n8nResponse.ok) {
      const contentType = n8nResponse.headers.get('content-type') || ''
      if (contentType.includes('application/json')) {
        const data = await n8nResponse.json()
        return Response.json({ error: data?.error || 'n8n error' }, { status: 502 })
      }
      const text = await n8nResponse.text()
      return Response.json({ error: text || 'n8n error' }, { status: 502 })
    }

    return Response.json({ ok: true, correlationId })
  } catch (error: any) {
    return Response.json({ error: error?.message || 'Unexpected error' }, { status: 500 })
  }
}

export async function GET() {
  const configured = Boolean(process.env.N8N_WEBHOOK_URL)
  return Response.json({ ok: true, configured })
}


