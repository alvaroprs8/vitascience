'use client'

import * as React from 'react'
import { useEffect, useMemo, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import { createSupabaseBrowserClient } from '@/lib/supabase/browser'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '@/components/ui/accordion'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { Separator } from '@/components/ui/separator'

export default function LeadPage() {
  const supabase = React.useMemo(() => createSupabaseBrowserClient(), [])
  const [lead, setLead] = useState('')
  const [title, setTitle] = useState('')
  const [metadata, setMetadata] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<any>(null)
  const [configured, setConfigured] = useState<boolean | null>(null)
  const [improvedLead, setImprovedLead] = useState('')
  const [showJson, setShowJson] = useState(false)
  const [correlationId, setCorrelationId] = useState<string | null>(null)
  const [isWaiting, setIsWaiting] = useState(false)

  useEffect(() => {
    // Check if the backend proxy is configured
    fetch('/api/submit-lead').then(async (res) => {
      try {
        const data = await res.json()
        setConfigured(Boolean(data?.configured))
      } catch {
        setConfigured(false)
      }
    }).catch(() => setConfigured(false))
  }, [])

  const parsedMetadata = useMemo(() => {
    if (!metadata.trim()) return undefined
    try {
      return JSON.parse(metadata)
    } catch {
      return '__INVALID__'
    }
  }, [metadata])

  function extractImprovedLeadFromJson(data: any): string | undefined {
    if (!data) return undefined

    const priorityKeys = [
      'improvedLead', 'leadMelhorada', 'improved_lead', 'novaLead', 'newLead', 'leadRevisada', 'lead_melhorada',
      'lead', 'content', 'texto', 'text', 'output', 'result'
    ]

    // Direct hit on priority keys
    for (const key of priorityKeys) {
      const value = (data as any)?.[key]
      if (typeof value === 'string' && value.trim()) return value
    }

    // Common wrappers (n8n often wraps under data/result)
    const wrappers = ['data', 'result', 'payload']
    for (const w of wrappers) {
      const nested = (data as any)?.[w]
      if (typeof nested === 'string' && nested.trim()) return nested
      if (nested && typeof nested === 'object') {
        const found = extractImprovedLeadFromJson(nested)
        if (found) return found
      }
    }

    // Arrays
    if (Array.isArray(data)) {
      for (const item of data) {
        const found = extractImprovedLeadFromJson(item)
        if (found) return found
      }
    }

    // Fallback: scan any string-valued key that contains likely names
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

  // Safely get the root object containing our analysis fields, regardless of nesting
  const resultRoot = useMemo(() => {
    if (!result) return null
    // Common shapes:
    // - Async callback: { status, improvedLead, data: { title, metadata, data: { ...analysis } } }
    // - Direct: { ...analysis, improvedLead? }
    // - Wrapped: { data: { ...analysis } }
    const r = result as any
    const candidate = r?.data?.data || r?.data || r
    return candidate || null
  }, [result])

  const analysis = useMemo(() => {
    const root = resultRoot as any
    if (!root) return {}
    // Try several likely keys for each section
    const consciousness = root.analise_nivel_consciencia || root.consciousness || root.nivel_consciencia || null
    const structure = root.estrutura_copy || root.structural_analysis || null
    const improvements = root.pontos_melhoria || root.improvements || null
    const angles = root.novos_angulos || root.angles || null
    // Q&A output varies by node; try common locations
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
    if (parsedMetadata === '__INVALID__') {
      setError('Metadata deve ser um JSON válido.')
      return
    }

    setIsSubmitting(true)
    try {
      const payload: any = { lead }
      if (title.trim()) payload.title = title.trim()
      if (parsedMetadata) payload.metadata = parsedMetadata

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

      // Async mode: expect { ok: true, correlationId }
      if (data && data.correlationId) {
        setCorrelationId(data.correlationId)
        setIsWaiting(true)
        // start polling
        startPolling(data.correlationId)
        setResult(null)
        setImprovedLead('')
      } else if (data) {
        // Fallback: immediate response with improved content
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
    const maxAttempts = 60 // ~5 min @5s
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
        // ignore transient errors
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

  return (
    <div className="min-h-screen py-8">
      <div className="container max-w-3xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-semibold">Enviar Lead da VSL</h1>
          <div className="flex items-center gap-2">
            <a href="/" className="text-sm underline">Voltar</a>
            <Sheet open={historyOpen} onOpenChange={(o) => { setHistoryOpen(o); if (o) loadHistory().catch(() => {}) }}>
              <SheetTrigger asChild>
                <Button variant="outline" size="sm">Histórico</Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[420px] sm:w-[480px]">
                <SheetHeader>
                  <SheetTitle>Histórico de Análises</SheetTitle>
                </SheetHeader>
                <div className="mt-4 space-y-3">
                  {history.length === 0 && (
                    <div className="text-sm text-muted-foreground">Nenhum item encontrado.</div>
                  )}
                  <div className="space-y-2">
                    {history.map((h) => (
                      <div key={h.id} className="border rounded-md p-3 flex items-center justify-between">
                        <div className="min-w-0">
                          <div className="text-sm font-medium truncate">{h.title || h.id}</div>
                          <div className="text-xs text-muted-foreground">
                            {h.status}{h.receivedAt ? ` • ${new Date(h.receivedAt).toLocaleString()}` : ''}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {h.hasImproved && <Badge variant="secondary">Lead</Badge>}
                          <Button size="sm" onClick={() => loadAnalysis(h.id)}>Abrir</Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </SheetContent>
            </Sheet>
            <Button variant="outline" size="sm" onClick={handleSignOut}>Sair</Button>
          </div>
        </div>

        {configured === false && (
          <div className="text-sm text-red-500 border border-red-500/30 rounded-md p-3">
            Variável de ambiente N8N_WEBHOOK_URL não configurada. Defina-a na Vercel.
          </div>
        )}

        <Card className="shadow-sm bg-transparent">
          <CardContent>
            <form className="space-y-4" onSubmit={handleSubmit}>
              <div className="grid gap-2">
                <Label htmlFor="title">Título (opcional)</Label>
                <Input id="title" placeholder="Ex.: Lead VSL Vitascience" value={title} onChange={(e) => setTitle(e.target.value)} />
              </div>

              <div className="grid gap-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="lead">Lead da VSL</Label>
                  <input
                    type="file"
                    accept=".txt,.md,.rtf,.html,.docx,.pdf"
                    onChange={(e) => {
                      const f = e.target.files?.[0]
                      if (f) handleFileUpload(f).catch(() => {})
                    }}
                  />
                </div>
                <Textarea
                  id="lead"
                  value={lead}
                  onChange={(e) => setLead(e.target.value)}
                  placeholder="Cole aqui as primeiras páginas (Lead) da VSL..."
                  className="min-h-48"
                />
                <div className="text-xs text-muted-foreground">
                  Dica: você pode enviar um arquivo ou colar o texto diretamente.
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="metadata">Metadata (JSON opcional)</Label>
                <Textarea
                  id="metadata"
                  value={metadata}
                  onChange={(e) => setMetadata(e.target.value)}
                  placeholder='{"produto":"Suplemento X","mercado":"Saúde"}'
                  className="min-h-24"
                />
                {parsedMetadata === '__INVALID__' && (
                  <span className="text-xs text-red-500">JSON inválido.</span>
                )}
              </div>

              {error && (
                <div className="text-sm text-red-500">
                  {error}
                </div>
              )}

              <div className="flex items-center gap-3">
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? 'Enviando...' : 'Analisar Lead'}
                </Button>
                <Button type="button" variant="outline" onClick={() => {
                  setTitle('Exemplo - Vitascience')
                  setLead('"Você está cansado de tentar de tudo para melhorar sua saúde e não ver resultados? ..."\n\nApresentamos um método baseado em ciência que transforma hábitos em resultados duradouros...')
                  setMetadata('{"idioma":"pt-BR"}')
                }}>Preencher Exemplo</Button>
                <Button type="button" variant="ghost" onClick={() => { setTitle(''); setLead(''); setMetadata(''); setResult(null); setError(null) }}>Limpar</Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {isWaiting && (
          <Card className="shadow-sm bg-transparent">
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="font-medium">Processando no n8n...</h2>
                <span className="text-xs text-muted-foreground">Aguarde — atualizando automaticamente</span>
              </div>
            </CardContent>
          </Card>
        )}

        {(improvedLead || result) && !isWaiting && (
          <Card className="shadow-sm bg-transparent">
            <CardContent className="space-y-4">
              <Tabs defaultValue="resumo" className="w-full">
                <TabsList className="flex flex-wrap gap-2 overflow-x-auto">
                  <TabsTrigger value="resumo">Resumo</TabsTrigger>
                  {(analysis as any).consciousness && <TabsTrigger value="consciencia">Consciência</TabsTrigger>}
                  {(analysis as any).structure && <TabsTrigger value="estrutura">Estrutural</TabsTrigger>}
                  {Array.isArray((analysis as any).improvements) && (analysis as any).improvements.length > 0 && (
                    <TabsTrigger value="melhorias">Melhorias</TabsTrigger>
                  )}
                  {Array.isArray((analysis as any).angles) && (analysis as any).angles.length > 0 && (
                    <TabsTrigger value="angulos">Ângulos</TabsTrigger>
                  )}
                  {(analysis as any).qna && <TabsTrigger value="qna">Q&A</TabsTrigger>}
                  {improvedLead && <TabsTrigger value="lead">Lead</TabsTrigger>}
                  {result && <TabsTrigger value="json">JSON</TabsTrigger>}
                </TabsList>

                <TabsContent value="resumo" className="space-y-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="secondary">Status: {summary.status}</Badge>
                    {correlationId && <Badge variant="outline">ID: {correlationId}</Badge>}
                    {summary.levelDesc && <Badge>Consciência: {summary.levelDesc}</Badge>}
                    {summary.framework && <Badge variant="outline">Framework: {summary.framework}</Badge>}
                  </div>
                  <Separator />
                  <div className="grid gap-3 sm:grid-cols-3 text-sm">
                    <div className="border rounded-md p-3">
                      <div className="text-muted-foreground">Melhorias</div>
                      <div className="font-medium">{summary.improvementsCount}</div>
                    </div>
                    <div className="border rounded-md p-3">
                      <div className="text-muted-foreground">Ângulos</div>
                      <div className="font-medium">{summary.anglesCount}</div>
                    </div>
                    <div className="border rounded-md p-3">
                      <div className="text-muted-foreground">Q&A</div>
                      <div className="font-medium">{summary.hasQna ? 'Disponível' : '—'}</div>
                    </div>
                  </div>
                </TabsContent>

                {(analysis as any).consciousness && (
                  <TabsContent value="consciencia" className="space-y-2">
                    {(() => {
                      const c: any = (analysis as any).consciousness
                      const nivel = c?.nivel_identificado?.nivel ?? c?.nivel_identificado ?? c?.nivel
                      const descricao = c?.nivel_identificado?.descricao ?? c?.descricao
                      const adequacao = c?.adequacao
                      const justificativa = c?.justificativa || c?.analise || c?.texto || c?.text
                      return (
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            {(nivel || descricao) && <Badge variant="secondary">Nível: {descricao || nivel}</Badge>}
                            {adequacao && <Badge>Adequação: {adequacao}</Badge>}
                          </div>
                          {justificativa && (
                            <div className="text-sm whitespace-pre-wrap">{justificativa}</div>
                          )}
                        </div>
                      )
                    })()}
                  </TabsContent>
                )}

                {(analysis as any).structure && (
                  <TabsContent value="estrutura" className="space-y-2">
                    {(() => {
                      const s: any = (analysis as any).structure
                      const framework = s?.framework_usado || s?.framework
                      const detalhes = s?.analise_detalhada || s?.analise || s?.texto || s?.text
                      const elementos: string[] = s?.elementos_identificados
                      return (
                        <div className="space-y-3">
                          <div className="flex items-center gap-2">
                            {framework && <Badge variant="secondary">Framework: {framework}</Badge>}
                          </div>
                          {Array.isArray(elementos) && elementos.length > 0 && (
                            <ul className="list-disc pl-5 text-muted-foreground text-sm">
                              {elementos.map((el, i) => (
                                <li key={i}>{el}</li>
                              ))}
                            </ul>
                          )}
                          {detalhes && (
                            <div className="text-sm whitespace-pre-wrap">{detalhes}</div>
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
                        <AccordionItem key={idx} value={`imp-${idx}`}>
                          <AccordionTrigger>
                            <div className="flex items-center gap-2">
                              <Badge variant="secondary">{idx + 1}</Badge>
                              <span className="text-left">{item?.problema || `Ponto ${idx + 1}`}</span>
                            </div>
                          </AccordionTrigger>
                          <AccordionContent>
                            <div className="grid gap-2 text-sm">
                              {item?.explicacao && (<div><span className="font-medium">Explicação:</span> {item.explicacao}</div>)}
                              {item?.solucao && (<div><span className="font-medium">Solução:</span> {item.solucao}</div>)}
                              {item?.exemplo && (<div className="whitespace-pre-wrap"><span className="font-medium">Exemplo:</span> {item.exemplo}</div>)}
                            </div>
                          </AccordionContent>
                        </AccordionItem>
                      ))}
                    </Accordion>
                  </TabsContent>
                )}

                {Array.isArray((analysis as any).angles) && (analysis as any).angles.length > 0 && (
                  <TabsContent value="angulos" className="grid gap-3 sm:grid-cols-3">
                    {((analysis as any).angles as any[]).slice(0, 3).map((item: any, idx: number) => (
                      <div key={idx} className="border rounded-md p-3 text-sm space-y-2">
                        {item?.nivel_consciencia && (
                          <div className="text-muted-foreground">Nível: {item.nivel_consciencia}</div>
                        )}
                        {item?.headline && (
                          <div><span className="font-medium">Headline:</span> {item.headline}</div>
                        )}
                        {item?.lead && (
                          <div className="whitespace-pre-wrap"><span className="font-medium">Lead:</span> {item.lead}</div>
                        )}
                        {item?.justificativa && (
                          <div className="whitespace-pre-wrap"><span className="font-medium">Justificativa:</span> {item.justificativa}</div>
                        )}
                      </div>
                    ))}
                  </TabsContent>
                )}

                {(analysis as any).qna && (
                  <TabsContent value="qna">
                    <ScrollArea className="h-[400px] border rounded-md p-3 text-sm">
                      {(analysis as any).qna}
                    </ScrollArea>
                  </TabsContent>
                )}

                {improvedLead && (
                  <TabsContent value="lead" className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Button size="sm" variant="outline" onClick={handleCopyImproved}>Copiar</Button>
                      <Button size="sm" onClick={handleDownloadImproved}>Baixar .txt</Button>
                    </div>
                    <Textarea
                      value={improvedLead}
                      onChange={(e) => setImprovedLead(e.target.value)}
                      className="min-h-64"
                    />
                  </TabsContent>
                )}

                {result && (
                  <TabsContent value="json" className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Button size="sm" variant="outline" onClick={handleCopy}>Copiar JSON</Button>
                      <Button size="sm" onClick={handleDownload}>Baixar JSON</Button>
                    </div>
                    <pre className="text-xs overflow-auto max-h-[500px] p-3 border rounded-md">
{JSON.stringify(result, null, 2)}
                    </pre>
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


