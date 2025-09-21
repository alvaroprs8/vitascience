'use client'

import * as React from 'react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { Send, MessageSquare, FileText, Loader2 } from 'lucide-react'

type CopyItem = {
  id: string
  title?: string | null
  status: string
  receivedAt: number | null
  hasImproved: boolean
}

type ChatMessage = {
  id: string
  copy_id: string
  role: 'user' | 'assistant' | 'system'
  content: string
  message_correlation_id?: string | null
  status?: string | null
  created_at: string
}

export default function ChatPage() {
  const [copies, setCopies] = useState<CopyItem[]>([])
  const [selectedCopyId, setSelectedCopyId] = useState<string | null>(null)
  const [loadingCopies, setLoadingCopies] = useState(false)

  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [isLoadingMessages, setIsLoadingMessages] = useState(false)
  const [input, setInput] = useState('')
  const [isSending, setIsSending] = useState(false)

  const scrollRef = useRef<HTMLDivElement | null>(null)

  const loadCopies = async () => {
    setLoadingCopies(true)
    try {
      const res = await fetch('/api/lead/list?limit=100', { cache: 'no-store' })
      const data = await res.json()
      setCopies(Array.isArray(data.items) ? data.items : [])
    } catch {
      setCopies([])
    } finally {
      setLoadingCopies(false)
    }
  }

  const loadMessages = async (copyId: string) => {
    setIsLoadingMessages(true)
    try {
      const res = await fetch(`/api/chat/history?copyId=${encodeURIComponent(copyId)}`, { cache: 'no-store' })
      const data = await res.json()
      setMessages(Array.isArray(data.items) ? data.items : [])
    } catch {
      setMessages([])
    } finally {
      setIsLoadingMessages(false)
    }
  }

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  useEffect(() => {
    loadCopies().catch(() => {})
  }, [])

  useEffect(() => {
    if (!selectedCopyId) return
    loadMessages(selectedCopyId).catch(() => {})
  }, [selectedCopyId])

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedCopyId) return
    if (!input.trim()) return
    setIsSending(true)
    try {
      const res = await fetch('/api/chat/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ copyId: selectedCopyId, message: input.trim() })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data?.error || 'Falha ao enviar')

      setInput('')

      // Optimistic update: add user message immediately
      setMessages((prev) => ([
        ...prev,
        {
          id: `temp-${Date.now()}`,
          copy_id: selectedCopyId,
          role: 'user',
          content: input.trim(),
          message_correlation_id: data?.messageCorrelationId || null,
          status: 'ready',
          created_at: new Date().toISOString(),
        } as ChatMessage
      ]))

      // Start short polling to fetch assistant reply
      let attempts = 0
      const maxAttempts = 30
      const interval = setInterval(async () => {
        attempts += 1
        await loadMessages(selectedCopyId)
        if (attempts >= maxAttempts) clearInterval(interval)
      }, 2000)
    } catch (err: any) {
      console.error(err)
    } finally {
      setIsSending(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-slate-50 py-6">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Sidebar */}
          <div className="md:col-span-4 lg:col-span-3">
            <Card className="bg-white border-slate-200">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <FileText className="h-4 w-4" /> Copies
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {loadingCopies && (
                    <div className="text-sm text-slate-500 flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" /> Carregando...
                    </div>
                  )}
                  {!loadingCopies && copies.length === 0 && (
                    <div className="text-sm text-slate-500">Nenhuma copy encontrada.</div>
                  )}
                  <div className="max-h-[60vh] overflow-auto pr-1 space-y-2">
                    {copies.map((c) => (
                      <button
                        key={c.id}
                        onClick={() => setSelectedCopyId(c.id)}
                        className={`w-full text-left border rounded-md p-2 hover:bg-slate-50 ${selectedCopyId === c.id ? 'border-slate-400 bg-slate-50' : 'border-slate-200'}`}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <div className="truncate text-sm font-medium">{c.title || 'Sem título'}</div>
                          {c.hasImproved && <Badge variant="outline">Lead</Badge>}
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">{c.status}</div>
                      </button>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Chat panel */}
          <div className="md:col-span-8 lg:col-span-9">
            <Card className="bg-white border-slate-200">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <MessageSquare className="h-4 w-4" /> AI Chat — Clone do Eugene
                </CardTitle>
              </CardHeader>
              <CardContent>
                {!selectedCopyId ? (
                  <div className="text-sm text-slate-500">Selecione uma copy na coluna esquerda para conversar.</div>
                ) : (
                  <div className="flex flex-col h-[70vh]">
                    <div ref={scrollRef} className="flex-1 overflow-auto pr-4">
                      <div className="space-y-3">
                        {isLoadingMessages && (
                          <div className="text-sm text-slate-500 flex items-center gap-2">
                            <Loader2 className="h-4 w-4 animate-spin" /> Carregando mensagens...
                          </div>
                        )}
                        {messages.map((m) => (
                          <div key={m.id} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[80%] rounded-lg px-3 py-2 text-sm whitespace-pre-wrap ${m.role === 'user' ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-900'}`}>
                              {m.content}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                    <Separator className="my-3" />
                    <form onSubmit={handleSend} className="flex items-center gap-2">
                      <Input
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Digite sua mensagem..."
                      />
                      <Button type="submit" disabled={!selectedCopyId || isSending} className="gap-2">
                        {isSending ? (
                          <><Loader2 className="h-4 w-4 animate-spin" /> Enviando...</>
                        ) : (
                          <><Send className="h-4 w-4" /> Enviar</>
                        )}
                      </Button>
                    </form>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}


