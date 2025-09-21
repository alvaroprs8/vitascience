import { NextRequest } from 'next/server'
import { supabaseAdmin } from '@/services/supabase'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const providedSecret = request.headers.get('x-callback-secret') || request.headers.get('X-Callback-Secret')
    const expectedSecret = process.env.N8N_CALLBACK_SECRET
    if (!expectedSecret || providedSecret !== expectedSecret) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    let payload: any
    try {
      payload = await request.json()
    } catch {
      return Response.json({ error: 'Invalid JSON body' }, { status: 400 })
    }

    const { messageCorrelationId, copyId, reply, status } = payload || {}
    if (!messageCorrelationId) {
      return Response.json({ error: 'Missing messageCorrelationId' }, { status: 400 })
    }
    if (!copyId) {
      return Response.json({ error: 'Missing copyId' }, { status: 400 })
    }

    const { error } = await supabaseAdmin
      .from('chat_messages')
      .insert({
        copy_id: String(copyId),
        role: 'assistant',
        content: typeof reply === 'string' ? reply : JSON.stringify(reply),
        message_correlation_id: String(messageCorrelationId),
        status: status || 'ready',
      })

    if (error) {
      return Response.json({ error: error.message }, { status: 500 })
    }

    return Response.json({ ok: true })
  } catch (error: any) {
    return Response.json({ error: error?.message || 'Unexpected error' }, { status: 500 })
  }
}


