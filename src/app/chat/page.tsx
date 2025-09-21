'use client'

import * as React from 'react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import { PromptInput, PromptInputTextarea, PromptInputActions } from '@/components/ui/prompt-input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { Send, MessageSquare, FileText, Loader2, Clock } from 'lucide-react'
import { useAnimatedText } from '@/components/ui/animated-text'

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

  const latestUser = useMemo(() => {
    const list = messages.filter((m) => m.role === 'user')
    return list.length ? list[list.length - 1] : null
  }, [messages])

  const latestAssistant = useMemo(() => {
    const list = messages.filter((m) => m.role === 'assistant')
    return list.length ? list[list.length - 1] : null
  }, [messages])

  const animatedAssistant = useAnimatedText(latestAssistant?.content || '', ' ')

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
        {/* Carrossel de copies no topo */}
        <div className="overflow-x-auto py-2">
          <div className="flex gap-4 snap-x snap-mandatory pb-2">
            {loadingCopies ? (
              <div className="text-sm text-slate-500 px-2 flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" /> Carregando...
              </div>
            ) : copies.length === 0 ? (
              <div className="text-sm text-slate-500 px-2">Nenhuma copy encontrada.</div>
            ) : (
              copies.slice(0, 20).map((c) => (
                <div key={c.id} className="snap-start shrink-0 w-[85%] sm:w-[420px]">
                  <Card className={`overflow-hidden bg-white border-slate-200 h-full ${selectedCopyId === c.id ? 'ring-2 ring-emerald-500' : ''}`}>
                    <CardContent className="p-3">
                      <div className="flex items-center justify-between gap-2">
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <div className="font-medium truncate text-sm">{c.title || 'Sem título'}</div>
                            {c.hasImproved && <Badge variant="outline" className="shrink-0">Lead</Badge>}
                          </div>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                            <Badge variant="secondary" className="text-xs font-normal">
                              {c.status}
                            </Badge>
                            {c.receivedAt && (
                              <div className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {new Date(c.receivedAt).toLocaleString()}
                              </div>
                            )}
                          </div>
                        </div>
                        <Button 
                          size="sm" 
                          onClick={() => setSelectedCopyId(c.id)}
                          className="shrink-0"
                        >
                          Selecionar
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Painel do chat */}
        <div className="mt-4">
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
                    {/* Painel de comparação: texto atual (usuário) x resposta IA */}
                    <div className="grid gap-4 sm:grid-cols-2 mb-4">
                      <Card className="bg-white border-slate-200">
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm">Texto atual</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="min-h-[96px] max-h-64 overflow-auto whitespace-pre-wrap text-sm">
                            {latestUser?.content || '—'}
                          </div>
                        </CardContent>
                      </Card>
                      <Card className="bg-white border-slate-200">
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm">Resposta da IA</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="min-h-[96px] max-h-64 overflow-auto whitespace-pre-wrap text-sm">
                            {animatedAssistant || '—'}
                          </div>
                        </CardContent>
                      </Card>
                    </div>
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
                    <PromptInput
                      isLoading={isSending}
                      value={input}
                      onValueChange={setInput}
                      onSubmit={(e?: any) => {
                        if (!selectedCopyId || isSending || !input.trim()) return
                        handleSend(e as any || { preventDefault: () => {} } as any)
                      }}
                      className=""
                    >
                      <div className="flex items-end gap-2">
                        <div className="flex-1">
                          <PromptInputTextarea
                            placeholder="Digite sua mensagem... (Enter para enviar, Shift+Enter para nova linha)"
                            maxLength={4000}
                          />
                        </div>
                        <PromptInputActions>
                          <Button
                            type="button"
                            disabled={!selectedCopyId || isSending || !input.trim()}
                            className="gap-2"
                            onClick={(e) => handleSend(e as any)}
                          >
                            {isSending ? (
                              <><Loader2 className="h-4 w-4 animate-spin" /> Enviando...</>
                            ) : (
                              <><Send className="h-4 w-4" /> Enviar</>
                            )}
                          </Button>
                        </PromptInputActions>
                      </div>
                    </PromptInput>
                  </div>
                )}
              </CardContent>
            </Card>
        </div>
      </div>
    </div>
  )
}


