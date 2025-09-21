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
  const [improvedLead, setImprovedLead] = useState('')
  const [waitingCorrelationId, setWaitingCorrelationId] = useState<string | null>(null)

  const scrollRef = useRef<HTMLDivElement | null>(null)

  const latestUser = useMemo(() => {
    const list = messages.filter((m) => m.role === 'user')
    return list.length ? list[list.length - 1] : null
  }, [messages])

  const [showCurrentText, setShowCurrentText] = useState(false)
  const [editedLead, setEditedLead] = useState('')
  const [isSavingLead, setIsSavingLead] = useState(false)
  const [saveLeadMessage, setSaveLeadMessage] = useState<string | null>(null)

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

  // Load improved lead for the selected copy
  useEffect(() => {
    if (!selectedCopyId) {
      setImprovedLead('')
      setEditedLead('')
      return
    }
    ;(async () => {
      try {
        const res = await fetch(`/api/lead/get?id=${encodeURIComponent(selectedCopyId)}`, { cache: 'no-store' })
        const data = await res.json()
        if (!res.ok) throw new Error(data?.error || 'Falha ao carregar lead melhorada')
        if (typeof data?.improvedLead === 'string') {
          setImprovedLead(data.improvedLead)
          setEditedLead(data.improvedLead)
        } else {
          setImprovedLead('')
          setEditedLead('')
        }
      } catch {
        setImprovedLead('')
        setEditedLead('')
      }
    })()
  }, [selectedCopyId])

  const handleShowCurrentForCopy = (copyId: string) => {
    setSelectedCopyId(copyId)
    setShowCurrentText(true)
  }

  const handleSaveLead = async () => {
    if (!selectedCopyId) return
    setIsSavingLead(true)
    setSaveLeadMessage(null)
    try {
      const res = await fetch('/api/lead/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: selectedCopyId, improvedLead: editedLead })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data?.error || 'Falha ao salvar')
      setImprovedLead(editedLead)
      setSaveLeadMessage('Salvo com sucesso')
      setTimeout(() => setSaveLeadMessage(null), 2000)
    } catch (err: any) {
      setSaveLeadMessage(err?.message || 'Erro ao salvar')
    } finally {
      setIsSavingLead(false)
    }
  }

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedCopyId) return
    if (!input.trim()) return
    setIsSending(true)
    try {
      const contextPayload = messages.map((m) => ({ role: m.role, content: m.content }))
      const improvedLeadPayload = improvedLead || latestUser?.content || ''
      const formattedHistory = messages
        .map((m) => {
          const label = m.role === 'user' ? 'Usuário' : m.role === 'assistant' ? 'Assistente' : 'Sistema'
          return `${label}: ${m.content}`
        })
        .join('\n\n')
      const res = await fetch('/api/chat/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          copyId: selectedCopyId,
          message: input.trim(),
          context: contextPayload,
          improvedLead: improvedLeadPayload,
          history: formattedHistory,
        })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data?.error || 'Falha ao enviar')

      setInput('')
      // Refresh messages (user message saved server-side)
      await loadMessages(selectedCopyId)

      // Wait for assistant reply by correlation id
      const correlationId: string | null = data?.messageCorrelationId || null
      setWaitingCorrelationId(correlationId)

      let attempts = 0
      const maxAttempts = 60
      const pollDelayMs = 2000
      while (attempts < maxAttempts) {
        attempts += 1
        try {
          const resH = await fetch(`/api/chat/history?copyId=${encodeURIComponent(selectedCopyId)}`, { cache: 'no-store' })
          const dataH = await resH.json()
          const items: ChatMessage[] = Array.isArray(dataH.items) ? dataH.items : []
          // If assistant replied (match by correlation id or just new assistant msg)
          const hasReply = items.some((m) => m.role === 'assistant' && (!correlationId || m.message_correlation_id === correlationId))
          setMessages(items)
          if (hasReply) break
        } catch {}
        await new Promise((r) => setTimeout(r, pollDelayMs))
      }
    } catch (err: any) {
      console.error(err)
    } finally {
      setWaitingCorrelationId(null)
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
                        <div className="shrink-0 flex flex-col gap-2">
                          <Button 
                            size="sm" 
                            onClick={() => setSelectedCopyId(c.id)}
                            className=""
                          >
                            Selecionar
                          </Button>
                          <Button 
                            variant="outline"
                            size="sm"
                            onClick={() => handleShowCurrentForCopy(c.id)}
                          >
                            Mostrar texto atual
                          </Button>
                        </div>
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
                  <div className="grid gap-4 sm:grid-cols-3 h-[70vh] min-w-0">
                    <div className="sm:col-span-1 flex flex-col min-w-0 h-[70vh]">
                      {showCurrentText && (
                        <Card className="bg-white border-slate-200 h-full overflow-hidden">
                          <CardHeader className="pb-2">
                            <CardTitle className="text-sm">Texto atual</CardTitle>
                          </CardHeader>
                          <CardContent className="flex-1 flex flex-col gap-2 min-h-0 overflow-hidden">
                            <textarea
                              className="w-full flex-1 min-h-[200px] h-[60vh] resize-none rounded-md border border-slate-200 p-2 text-sm overflow-y-auto"
                              value={editedLead}
                              onChange={(e) => setEditedLead(e.target.value)}
                              placeholder="Edite a lead aqui..."
                            />
                            <div className="flex items-center justify-between gap-2 pt-1">
                              <div className="text-xs text-slate-500 h-5">{saveLeadMessage || ''}</div>
                              <Button size="sm" onClick={handleSaveLead} disabled={isSavingLead || !selectedCopyId}>
                                {isSavingLead ? <><Loader2 className="h-4 w-4 animate-spin" /> Salvando...</> : 'Salvar'}
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      )}
                    </div>
                    <div className="sm:col-span-2 flex flex-col min-w-0 max-h-[70vh]">
                      <div ref={scrollRef} className="flex-1 overflow-y-auto overflow-x-hidden pr-4 min-w-0 max-h-[60vh]">
                        <div className="space-y-3">
                          {isLoadingMessages && (
                            <div className="text-sm text-slate-500 flex items-center gap-2">
                              <Loader2 className="h-4 w-4 animate-spin" /> Carregando mensagens...
                            </div>
                          )}
                          {messages.map((m) => (
                            <div key={m.id} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'} min-w-0`}>
                              <div className={`max-w-[80%] rounded-lg px-3 py-2 text-sm whitespace-pre-wrap break-all overflow-x-hidden ${m.role === 'user' ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-900'}`}>
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
                  </div>
                )}
              </CardContent>
            </Card>
        </div>
      </div>
    </div>
  )
}


