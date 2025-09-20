'use client'

import * as React from 'react'
import { useEffect, useMemo, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { createSupabaseBrowserClient } from '@/lib/supabase/browser'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '@/components/ui/accordion'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { 
  BarChart3, 
  Brain, 
  ChevronRight, 
  Clock, 
  Code2, 
  Copy, 
  Download, 
  FileText, 
  Home, 
  Info, 
  Lightbulb, 
  LogOut, 
  MessageSquareText, 
  RotateCcw, 
  Send, 
  Upload 
} from 'lucide-react'

export default function LeadPage() {
  const supabase = React.useMemo(() => createSupabaseBrowserClient(), [])
  const [lead, setLead] = useState('')
  const [title, setTitle] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<any>(null)
  const [configured, setConfigured] = useState<boolean | null>(null)
  const [improvedLead, setImprovedLead] = useState('')
  const [showJson, setShowJson] = useState(false)
  const [correlationId, setCorrelationId] = useState<string | null>(null)
  const [isWaiting, setIsWaiting] = useState(false)
  const [showForm, setShowForm] = useState(false)

  useEffect(() => {
    fetch('/api/submit-lead').then(async (res) => {
      try {
        const data = await res.json()
        setConfigured(Boolean(data?.configured))
      } catch {
        setConfigured(false)
      }
    }).catch(() => setConfigured(false))
  }, [])

  // metadata removido conforme solicitação

  function extractImprovedLeadFromJson(data: any): string | undefined {
    if (!data) return undefined

    const priorityKeys = [
      'improvedLead', 'leadMelhorada', 'improved_lead', 'novaLead', 'newLead', 'leadRevisada', 'lead_melhorada',
      'lead', 'content', 'texto', 'text', 'output', 'result'
    ]

    for (const key of priorityKeys) {
      const value = (data as any)?.[key]
      if (typeof value === 'string' && value.trim()) return value
    }

    const wrappers = ['data', 'result', 'payload']
    for (const w of wrappers) {
      const nested = (data as any)?.[w]
      if (typeof nested === 'string' && nested.trim()) return nested
      if (nested && typeof nested === 'object') {
        const found = extractImprovedLeadFromJson(nested)
        if (found) return found
      }
    }

    if (Array.isArray(data)) {
      for (const item of data) {
        const found = extractImprovedLeadFromJson(item)
        if (found) return found
      }
    }

    if (typeof data === 'object') {
      for (const [k, v] of Object.entries(data)) {
        if (typeof v === 'string' && v.trim() && /lead|content|texto|text|improv/i.test(k)) {
          return v
        }
        if (v && typeof v === 'object') {
          const found = extractImprovedLeadFromJson(v)
          if (found) return found
        }
      }
    }

    return undefined
  }

  const resultRoot = useMemo(() => {
    if (!result) return null
    const r = result as any
    const candidate = r?.data?.data || r?.data || r
    return candidate || null
  }, [result])

  const analysis = useMemo(() => {
    const root = resultRoot as any
    if (!root) return {}
    const consciousness = root.analise_nivel_consciencia || root.consciousness || root.nivel_consciencia || null
    const structure = root.estrutura_copy || root.structural_analysis || null
    const improvements = root.pontos_melhoria || root.improvements || null
    const angles = root.novos_angulos || root.angles || null
    const qna = root.qna || root.qa || root['q&a'] || root.response?.text || root.qna_text || null
    return { consciousness, structure, improvements, angles, qna }
  }, [resultRoot])

  const summary = useMemo(() => {
    const r: any = result || {}
    const status = isWaiting ? 'processing' : (r.status || (improvedLead ? 'ready' : (result ? 'ready' : 'idle')))
    const receivedAt = (r.receivedAt || (resultRoot as any)?.receivedAt) ?? null
    const improvementsCount = Array.isArray((analysis as any).improvements) ? (analysis as any).improvements.length : 0
    const anglesCount = Array.isArray((analysis as any).angles) ? (analysis as any).angles.length : 0
    const hasQna = Boolean((analysis as any).qna)
    const framework = (analysis as any).structure?.framework_usado || (analysis as any).structure?.framework
    const levelDesc = (analysis as any).consciousness?.nivel_identificado?.descricao || (analysis as any).consciousness?.descricao
    return { status, receivedAt, improvementsCount, anglesCount, hasQna, framework, levelDesc }
  }, [result, resultRoot, analysis, isWaiting, improvedLead])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setResult(null)

    if (!lead.trim()) {
      setError('Informe a Lead da VSL.')
      return
    }
    // validação de metadata removida

    setIsSubmitting(true)
    try {
      const payload: any = { lead }
      if (title.trim()) payload.title = title.trim()
      // metadata removido do payload

      const res = await fetch('/api/submit-lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      const contentType = res.headers.get('content-type') || ''
      if (!res.ok) {
        if (contentType.includes('application/json')) {
          const err = await res.json()
          throw new Error(err?.error || 'Falha ao processar a Lead')
        }
        const text = await res.text()
        throw new Error(text || 'Falha ao processar a Lead')
      }

      const data = contentType.includes('application/json') ? await res.json() : null

      if (data && data.correlationId) {
        setCorrelationId(data.correlationId)
        setIsWaiting(true)
        startPolling(data.correlationId)
        setResult(null)
        setImprovedLead('')
      } else if (data) {
        setResult(data)
        const improved = extractImprovedLeadFromJson(data)
        setImprovedLead(typeof improved === 'string' ? improved : '')
      } else {
        const text = await res.text()
        setResult({ raw: text })
        setImprovedLead(text || '')
      }
    } catch (err: any) {
      setError(err?.message || 'Erro inesperado')
    } finally {
      setIsSubmitting(false)
    }
  }

  const startPolling = (id: string) => {
    let attempts = 0
    const maxAttempts = 60
    const intervalMs = 5000

    const timer = setInterval(async () => {
      attempts += 1
      try {
        const res = await fetch(`/api/lead/status?id=${encodeURIComponent(id)}`)
        const contentType = res.headers.get('content-type') || ''
        if (!res.ok) return
        const data = contentType.includes('application/json') ? await res.json() : null
        if (data && (data.status === 'ready' || data.improvedLead)) {
          setIsWaiting(false)
          setResult(data)
          setImprovedLead(typeof data.improvedLead === 'string' && data.improvedLead.trim()
            ? data.improvedLead
            : extractImprovedLeadFromJson(data) || '')
          clearInterval(timer)
        }
      } catch {
      }
      if (attempts >= maxAttempts) {
        setIsWaiting(false)
        clearInterval(timer)
      }
    }, intervalMs)
  }

  const handleFileUpload = async (file: File) => {
    const text = await file.text()
    setLead(text)
  }

  const handleCopy = async () => {
    if (!result) return
    const text = JSON.stringify(result, null, 2)
    await navigator.clipboard.writeText(text)
  }

  const handleDownload = () => {
    if (!result) return
    const blob = new Blob([JSON.stringify(result, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'analise-eugene-schwartz.json'
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleCopyImproved = async () => {
    if (!improvedLead?.trim()) return
    await navigator.clipboard.writeText(improvedLead)
  }

  const handleDownloadImproved = () => {
    if (!improvedLead?.trim()) return
    const blob = new Blob([improvedLead], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = (title?.trim() ? `${title.trim()}-` : '') + 'lead-melhorada.txt'
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    window.location.href = '/auth/login'
  }

  const [historyOpen, setHistoryOpen] = useState(false)
  const [history, setHistory] = useState<Array<{ id: string, title?: string | null, status: string, receivedAt: number | null, hasImproved: boolean }>>([])

  const loadHistory = async () => {
    try {
      const res = await fetch('/api/lead/list?limit=50', { cache: 'no-store' })
      const data = await res.json()
      setHistory(Array.isArray(data.items) ? data.items : [])
    } catch {}
  }

  const loadAnalysis = async (id: string) => {
    try {
      const res = await fetch(`/api/lead/get?id=${encodeURIComponent(id)}`, { cache: 'no-store' })
      const contentType = res.headers.get('content-type') || ''
      const data = contentType.includes('application/json') ? await res.json() : null
      if (!res.ok) throw new Error(data?.error || 'Falha ao carregar análise')
      setIsWaiting(false)
      setResult(data)
      const improved = extractImprovedLeadFromJson(data)
      setImprovedLead(typeof improved === 'string' ? improved : '')
      setShowJson(false)
      setCorrelationId(data?.correlationId || null)
      setHistoryOpen(false)
    } catch (err: any) {
      setError(err?.message || 'Erro ao carregar análise')
    }
  }

  // Carregar histórico ao montar a página
  useEffect(() => {
    loadHistory().catch(() => {})
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-slate-50 py-8">
      <div className="container max-w-4xl mx-auto space-y-6 px-4 sm:px-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="bg-slate-100 p-2 rounded-lg">
              <FileText className="h-6 w-6 text-slate-700" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900">Análise de Lead</h1>
              <p className="text-sm text-slate-600">Otimize sua lead com análise baseada em Eugene Schwartz</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => window.location.href = '/'}>
              <Home className="h-4 w-4 mr-2" />
              Início
            </Button>
            {/* Botão Histórico removido; histórico aparecerá como carrossel abaixo */}
            <Button variant="ghost" size="sm" onClick={handleSignOut}>
              <LogOut className="h-4 w-4 mr-2" />
              Sair
            </Button>
          </div>
        </div>

        {configured === false && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-4 mb-6 flex items-center gap-3">
            <Info className="h-5 w-5 shrink-0" />
            <p className="text-sm">
              Variável de ambiente <code className="bg-background/80 px-1 py-0.5 rounded">N8N_WEBHOOK_URL</code> não configurada. Defina-a na Vercel.
            </p>
          </div>
        )}

        <Card className="shadow-sm bg-white border-slate-200">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-xl">Enviar Lead para Análise</CardTitle>
                <CardDescription>
                  Insira o texto da lead para receber uma análise detalhada e sugestões de melhoria
                </CardDescription>
              </div>
              <Button size="sm" variant="outline" onClick={() => setShowForm((v) => !v)} className="gap-2">
                {showForm ? (
                  <>
                    <ChevronRight className="h-4 w-4 rotate-90" />
                    Ocultar
                  </>
                ) : (
                  <>
                    <ChevronRight className="h-4 w-4" />
                    Mostrar
                  </>
                )}
              </Button>
            </div>
          </CardHeader>
          <CardContent className={showForm ? '' : 'hidden'}>
            <form className="space-y-5" onSubmit={handleSubmit}>
              <div className="grid gap-2">
                <Label htmlFor="title" className="flex items-center gap-1.5">
                  <FileText className="h-3.5 w-3.5" />
                  Título (opcional)
                </Label>
                <Input 
                  id="title" 
                  placeholder="Ex.: Lead VSL Vitascience" 
                  value={title} 
                  onChange={(e) => setTitle(e.target.value)} 
                />
              </div>

              <div className="grid gap-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="lead" className="flex items-center gap-1.5">
                    <FileText className="h-3.5 w-3.5" />
                    Lead da VSL
                  </Label>
                  <div className="relative">
                    <Label 
                      htmlFor="file-upload" 
                      className="cursor-pointer text-xs text-primary hover:text-primary/80 flex items-center gap-1"
                    >
                      <Upload className="h-3.5 w-3.5" />
                      Carregar arquivo
                    </Label>
                  <input
                      id="file-upload"
                    type="file"
                    accept=".txt,.md,.rtf,.html,.docx,.pdf"
                      className="sr-only"
                    onChange={(e) => {
                      const f = e.target.files?.[0]
                      if (f) handleFileUpload(f).catch(() => {})
                    }}
                  />
                  </div>
                </div>
                <Textarea
                  id="lead"
                  value={lead}
                  onChange={(e) => setLead(e.target.value)}
                  placeholder="Cole aqui as primeiras páginas (Lead) da VSL..."
                  className="min-h-48 resize-y"
                />
                <div className="text-xs text-slate-500 flex items-center gap-1.5">
                  <Info className="h-3.5 w-3.5 text-slate-400" />
                  Dica: você pode enviar um arquivo ou colar o texto diretamente.
                </div>
              </div>


              {error && (
                <div className="bg-red-50 text-red-700 rounded-md px-3 py-2 text-sm flex items-center gap-2">
                  <Info className="h-4 w-4 shrink-0 text-red-500" />
                  {error}
                </div>
              )}

              <div className="flex flex-wrap items-center gap-3 pt-2">
                <Button type="submit" disabled={isSubmitting} className="gap-2">
                  {isSubmitting ? (
                    <>
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                      Enviando...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4" />
                      Analisar Lead
                    </>
                  )}
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => {
                  setTitle('Exemplo - Vitascience')
                    setLead('\"Você está cansado de tentar de tudo para melhorar sua saúde e não ver resultados? ...\"\n\nApresentamos um método baseado em ciência que transforma hábitos em resultados duradouros...')
                  // metadata removido
                  }}
                  className="gap-2"
                >
                  <FileText className="h-4 w-4" />
                  Preencher Exemplo
                </Button>
                <Button 
                  type="button" 
                  variant="ghost" 
                  onClick={() => { 
                    setTitle(''); 
                    setLead(''); 
                    // metadata removido
                    setResult(null); 
                    setError(null);
                    setImprovedLead('');
                  }}
                  className="gap-2"
                >
                  <RotateCcw className="h-4 w-4" />
                  Limpar
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Carrossel de histórico abaixo do formulário */}
        <div className="overflow-x-auto py-2">
          <div className="flex gap-4 snap-x snap-mandatory pb-2">
            {history.length === 0 ? (
              <div className="text-sm text-slate-500 px-2">Nenhuma análise encontrada.</div>
            ) : (
              history.slice(0, 10).map((h) => (
                <div key={h.id} className="snap-start shrink-0 w-[85%] sm:w-[420px]">
                  <Card className="overflow-hidden bg-white border-slate-200 h-full">
                    <CardContent className="p-3">
                      <div className="flex items-center justify-between gap-2">
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <div className="font-medium truncate text-sm">{h.title || 'Sem título'}</div>
                            {h.hasImproved && <Badge variant="outline" className="shrink-0">Lead</Badge>}
                          </div>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                            <Badge variant="secondary" className="text-xs font-normal">
                              {h.status}
                            </Badge>
                            {h.receivedAt && (
                              <div className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {new Date(h.receivedAt).toLocaleString()}
                              </div>
                            )}
                          </div>
                        </div>
                        <Button 
                          size="sm" 
                          onClick={() => loadAnalysis(h.id)}
                          className="shrink-0"
                        >
                          <ChevronRight className="h-4 w-4 mr-1" />
                          Abrir
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              ))
            )}
          </div>
        </div>

        {isWaiting && (
          <Card className="shadow-sm border-blue-200 bg-blue-50">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-full border-2 border-blue-600 border-t-transparent animate-spin" />
                  <div>
                    <h3 className="font-medium">Processando no n8n...</h3>
                    <p className="text-xs text-slate-600">Sua análise está sendo gerada</p>
                  </div>
                </div>
                <Badge variant="outline" className="text-xs">Atualizando automaticamente</Badge>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Elemento de análise permanece visível mesmo sem análises */}
        {!isWaiting && (
          <Card className="shadow-sm bg-white border-slate-200">
            <CardContent className="pt-6">
              <Tabs defaultValue="resumo" className="w-full">
                <TabsList className="flex flex-wrap gap-1 mb-6 h-auto p-1 bg-slate-100 rounded-md">
                  <TabsTrigger value="resumo" className="flex items-center gap-1.5 h-9">
                    <Info className="h-4 w-4" />
                    Resumo
                  </TabsTrigger>
                  {(analysis as any).consciousness && (
                    <TabsTrigger value="consciencia" className="flex items-center gap-1.5 h-9">
                      <Brain className="h-4 w-4" />
                      Consciência
                    </TabsTrigger>
                  )}
                  {(analysis as any).structure && (
                    <TabsTrigger value="estrutura" className="flex items-center gap-1.5 h-9">
                      <BarChart3 className="h-4 w-4" />
                      Estrutural
                    </TabsTrigger>
                  )}
                  {Array.isArray((analysis as any).improvements) && (analysis as any).improvements.length > 0 && (
                    <TabsTrigger value="melhorias" className="flex items-center gap-1.5 h-9">
                      <Lightbulb className="h-4 w-4" />
                      Melhorias
                    </TabsTrigger>
                  )}
                  {Array.isArray((analysis as any).angles) && (analysis as any).angles.length > 0 && (
                    <TabsTrigger value="angulos" className="flex items-center gap-1.5 h-9">
                      <ChevronRight className="h-4 w-4" />
                      Ângulos
                    </TabsTrigger>
                  )}
                  {(analysis as any).qna && (
                    <TabsTrigger value="qna" className="flex items-center gap-1.5 h-9">
                      <MessageSquareText className="h-4 w-4" />
                      Q&A
                    </TabsTrigger>
                  )}
              {improvedLead && (
                  <TabsTrigger value="comparativo" className="flex items-center gap-1.5 h-9">
                      <FileText className="h-4 w-4" />
                    Comparativo
                    </TabsTrigger>
                  )}
                  {result && (
                    <TabsTrigger value="json" className="flex items-center gap-1.5 h-9">
                      <Code2 className="h-4 w-4" />
                      JSON
                    </TabsTrigger>
                  )}
                </TabsList>
                <TabsContent value="resumo" className="space-y-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="secondary" className="flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5" />
                      Status: {summary.status}
                    </Badge>
                    {correlationId && (
                      <Badge variant="outline" className="font-mono text-xs">
                        ID: {correlationId}
                      </Badge>
                    )}
                    {summary.levelDesc && (
                      <Badge className="flex items-center gap-1">
                        <Brain className="h-3.5 w-3.5" />
                        Consciência: {summary.levelDesc}
                      </Badge>
                    )}
                    {summary.framework && (
                      <Badge variant="outline" className="flex items-center gap-1">
                        <BarChart3 className="h-3.5 w-3.5" />
                        Framework: {summary.framework}
                      </Badge>
                    )}
                  </div>
                  <Separator />
                  <div className="grid gap-4 sm:grid-cols-3">
                    <Card className="bg-white border-slate-200">
                      <CardContent className="pt-6">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="text-sm font-medium text-muted-foreground">Melhorias</h3>
                          <Lightbulb className="h-5 w-5 text-amber-500" />
                        </div>
                        <p className="text-2xl font-bold">{summary.improvementsCount}</p>
                      </CardContent>
                    </Card>
                    <Card className="bg-white border-slate-200">
                      <CardContent className="pt-6">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="text-sm font-medium text-muted-foreground">Ângulos</h3>
                          <ChevronRight className="h-5 w-5 text-blue-500" />
                        </div>
                        <p className="text-2xl font-bold">{summary.anglesCount}</p>
                      </CardContent>
                    </Card>
                    <Card className="bg-white border-slate-200">
                      <CardContent className="pt-6">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="text-sm font-medium text-muted-foreground">Q&A</h3>
                          <MessageSquareText className="h-5 w-5 text-green-500" />
                        </div>
                        <p className="text-2xl font-bold">{summary.hasQna ? 'Disponível' : '—'}</p>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>

                {(analysis as any).consciousness && (
                  <TabsContent value="consciencia" className="space-y-4">
                    {(() => {
                      const c: any = (analysis as any).consciousness
                      const nivel = c?.nivel_identificado?.nivel ?? c?.nivel_identificado ?? c?.nivel
                      const descricao = c?.nivel_identificado?.descricao ?? c?.descricao
                      const adequacao = c?.adequacao
                      const justificativa = c?.justificativa || c?.analise || c?.texto || c?.text
                      return (
                        <div className="space-y-4">
                          <div className="flex flex-wrap items-center gap-2">
                            {(nivel || descricao) && (
                              <Badge variant="secondary" className="flex items-center gap-1">
                                <Brain className="h-3.5 w-3.5" />
                                Nível: {descricao || nivel}
                              </Badge>
                            )}
                            {adequacao && (
                              <Badge className="flex items-center gap-1">
                                Adequação: {adequacao}
                              </Badge>
                            )}
                          </div>
                          {justificativa && (
                            <Card className="bg-white border-slate-200">
                              <CardContent className="pt-6 text-sm whitespace-pre-wrap">
                                {justificativa}
                              </CardContent>
                            </Card>
                          )}
                        </div>
                      )
                    })()}
                  </TabsContent>
                )}

                {(analysis as any).structure && (
                  <TabsContent value="estrutura" className="space-y-4">
                    {(() => {
                      const s: any = (analysis as any).structure
                      const framework = s?.framework_usado || s?.framework
                      const detalhes = s?.analise_detalhada || s?.analise || s?.texto || s?.text
                      const elementos: string[] = s?.elementos_identificados
                      return (
                        <div className="space-y-4">
                          <div className="flex items-center gap-2">
                            {framework && (
                              <Badge variant="secondary" className="flex items-center gap-1">
                                <BarChart3 className="h-3.5 w-3.5" />
                                Framework: {framework}
                              </Badge>
                            )}
                          </div>
                          {Array.isArray(elementos) && elementos.length > 0 && (
                            <Card className="bg-white border-slate-200">
                              <CardContent className="pt-6">
                                <h3 className="text-sm font-medium mb-3">Elementos Identificados</h3>
                                <ul className="list-disc pl-5 text-muted-foreground text-sm space-y-1">
                                  {elementos.map((el, i) => (
                                    <li key={i}>{el}</li>
                                  ))}
                                </ul>
                              </CardContent>
                            </Card>
                          )}
                          {detalhes && (
                            <Card className="bg-background/50">
                              <CardContent className="pt-6 text-sm whitespace-pre-wrap">
                                {detalhes}
                              </CardContent>
                            </Card>
                          )}
                        </div>
                      )
                    })()}
                  </TabsContent>
                )}

                {Array.isArray((analysis as any).improvements) && (analysis as any).improvements.length > 0 && (
                  <TabsContent value="melhorias">
                    <Accordion type="single" collapsible className="w-full">
                      {((analysis as any).improvements as any[]).slice(0, 5).map((item: any, idx: number) => (
                        <AccordionItem key={idx} value={`imp-${idx}`} className="border-b border-border">
                          <AccordionTrigger className="hover:no-underline py-4 px-4">
                    <div className="flex items-center gap-2">
                              <Badge variant="secondary">{idx + 1}</Badge>
                              <span className="text-left font-medium">{item?.problema || `Ponto ${idx + 1}`}</span>
                            </div>
                          </AccordionTrigger>
                          <AccordionContent className="px-4 pb-4 pt-1">
                            <div className="grid gap-3 text-sm">
                              {item?.explicacao && (
                                <div className="bg-muted/50 rounded-md p-3">
                                  <span className="font-medium text-primary">Explicação:</span> {item.explicacao}
                                </div>
                              )}
                              {item?.solucao && (
                                <div className="bg-muted/50 rounded-md p-3">
                                  <span className="font-medium text-primary">Solução:</span> {item.solucao}
                                </div>
                              )}
                              {item?.exemplo && (
                                <div className="bg-muted/50 rounded-md p-3 whitespace-pre-wrap">
                                  <span className="font-medium text-primary">Exemplo:</span> {item.exemplo}
                                </div>
                              )}
                            </div>
                          </AccordionContent>
                        </AccordionItem>
                      ))}
                    </Accordion>
                  </TabsContent>
                )}

                {Array.isArray((analysis as any).angles) && (analysis as any).angles.length > 0 && (
                  <TabsContent value="angulos" className="grid gap-4 sm:grid-cols-3">
                    {((analysis as any).angles as any[]).slice(0, 3).map((item: any, idx: number) => (
                      <Card key={idx} className="overflow-hidden bg-white border-slate-200">
                        <CardHeader className="pb-2 pt-4 px-4">
                          {item?.nivel_consciencia && (
                            <Badge variant="outline" className="mb-1 w-fit">
                              Nível: {item.nivel_consciencia}
                            </Badge>
                          )}
                          {item?.headline && (
                            <CardTitle className="text-sm">{item.headline}</CardTitle>
                          )}
                        </CardHeader>
                        <CardContent className="px-4 pb-4 pt-0 text-sm space-y-2">
                          {item?.lead && (
                            <div className="whitespace-pre-wrap">
                              <span className="font-medium text-primary">Lead:</span> {item.lead}
                            </div>
                          )}
                          {item?.justificativa && (
                            <div className="whitespace-pre-wrap text-slate-600">
                              <span className="font-medium text-slate-900">Justificativa:</span> {item.justificativa}
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </TabsContent>
                )}

                {(analysis as any).qna && (
                  <TabsContent value="qna">
                    <Card className="bg-white border-slate-200">
                      <CardContent className="pt-6">
                        <ScrollArea className="h-[400px] pr-4">
                          <div className="text-sm whitespace-pre-wrap">
                            {(analysis as any).qna}
                    </div>
                        </ScrollArea>
                      </CardContent>
                    </Card>
                  </TabsContent>
                )}

                {improvedLead && (
                  <TabsContent value="comparativo" className="space-y-4">
                    <div className="flex items-center gap-2">
                      <Button size="sm" variant="outline" onClick={handleCopyImproved} className="gap-2">
                        <Copy className="h-4 w-4" />
                        Copiar melhorada
                      </Button>
                      <Button size="sm" onClick={handleDownloadImproved} className="gap-2">
                        <Download className="h-4 w-4" />
                        Baixar melhorada .txt
                      </Button>
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <Card className="bg-white border-slate-200">
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm">Lead original</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <Textarea
                            value={lead}
                            onChange={(e) => setLead(e.target.value)}
                            className="min-h-64 resize-y"
                          />
                        </CardContent>
                      </Card>
                      <Card className="bg-white border-slate-200">
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm">Lead melhorada</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <Textarea
                            value={improvedLead}
                            onChange={(e) => setImprovedLead(e.target.value)}
                            className="min-h-64 resize-y"
                          />
                        </CardContent>
                      </Card>
                    </div>
                  </TabsContent>
                )}

              {result && (
                  <TabsContent value="json" className="space-y-4">
                    <div className="flex items-center gap-2">
                      <Button size="sm" variant="outline" onClick={handleCopy} className="gap-2">
                        <Copy className="h-4 w-4" />
                        Copiar JSON
                      </Button>
                      <Button size="sm" onClick={handleDownload} className="gap-2">
                        <Download className="h-4 w-4" />
                        Baixar JSON
                      </Button>
                    </div>
                    <Card className="bg-background/50">
                      <CardContent className="pt-6">
                        <pre className="text-xs overflow-auto max-h-[500px] p-3 border rounded-md bg-muted/30 font-mono">
{JSON.stringify(result, null, 2)}
                    </pre>
                      </CardContent>
                    </Card>
                  </TabsContent>
                  )}
              </Tabs>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

