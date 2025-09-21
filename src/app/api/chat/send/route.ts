import { NextRequest } from 'next/server'
import { randomUUID } from 'crypto'
import { supabaseAdmin } from '@/services/supabase'

export const dynamic = 'force-dynamic'
export const maxDuration = 300

export async function POST(request: NextRequest) {
  try {
    const chatWebhookUrl = process.env.N8N_CHAT_WEBHOOK_URL || process.env.N8N_WEBHOOK_URL
    if (!chatWebhookUrl) {
      return Response.json({ error: 'N8N_CHAT_WEBHOOK_URL is not configured' }, { status: 500 })
    }

    let body: any
    try {
      body = await request.json()
    } catch {
      return Response.json({ error: 'Invalid JSON body' }, { status: 400 })
    }

    const copyId: string | undefined = body?.copyId
    const message: string | undefined = body?.message
    const context: Array<{ role: string; content: string }> | undefined = Array.isArray(body?.context) ? body.context : undefined
    const improvedLead: string | undefined = typeof body?.improvedLead === 'string' ? body.improvedLead : undefined
    if (!copyId || !String(copyId).trim()) {
      return Response.json({ error: 'copyId is required' }, { status: 400 })
    }
    if (!message || !String(message).trim()) {
      return Response.json({ error: 'message is required' }, { status: 400 })
    }

    // Verify the copy exists (lead_results correlation_id)
    const { data: copyRow, error: findCopyErr } = await supabaseAdmin
      .from('lead_results')
      .select('correlation_id')
      .eq('correlation_id', copyId)
      .maybeSingle()

    if (findCopyErr) {
      return Response.json({ error: `Failed to check copy: ${findCopyErr.message}` }, { status: 500 })
    }
    if (!copyRow) {
      return Response.json({ error: 'copyId not found' }, { status: 404 })
    }

    // Persist user message immediately
    const { error: insertUserErr } = await supabaseAdmin
      .from('chat_messages')
      .insert({
        copy_id: copyId,
        role: 'user',
        content: String(message),
        status: 'ready',
      })

    if (insertUserErr) {
      return Response.json({ error: `Failed to save message: ${insertUserErr.message}` }, { status: 500 })
    }

    // Prepare async callback
    const baseUrl = process.env.NEXT_PUBLIC_IGNITER_API_URL || 'http://localhost:3000'
    const messageCorrelationId = randomUUID()
    const callbackUrl = `${baseUrl}/api/chat/callback`

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    }
    const authHeader = process.env.N8N_WEBHOOK_AUTH
    if (authHeader) headers['Authorization'] = authHeader

    const payload = {
      type: 'chat',
      copyId,
      message,
      messageCorrelationId,
      callbackUrl,
      context,
      improvedLead,
    }

    const chatResponse = await fetch(chatWebhookUrl, {
      method: 'POST',
      headers: {
        ...headers,
        ...(process.env.N8N_CALLBACK_SECRET ? { 'X-Callback-Secret': process.env.N8N_CALLBACK_SECRET } : {})
      },
      body: JSON.stringify(payload)
    })

    if (!chatResponse.ok) {
      const contentType = chatResponse.headers.get('content-type') || ''
      if (contentType.includes('application/json')) {
        const data = await chatResponse.json()
        return Response.json({ error: data?.error || 'n8n error' }, { status: 502 })
      }
      const text = await chatResponse.text()
      return Response.json({ error: text || 'n8n error' }, { status: 502 })
    }

    return Response.json({ ok: true, messageCorrelationId })
  } catch (error: any) {
    return Response.json({ error: error?.message || 'Unexpected error' }, { status: 500 })
  }
}


