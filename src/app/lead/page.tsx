'use client'

import * as React from 'react'
import { useEffect, useMemo, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'

export default function LeadPage() {
  const [lead, setLead] = useState('')
  const [title, setTitle] = useState('')
  const [metadata, setMetadata] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<any>(null)
  const [configured, setConfigured] = useState<boolean | null>(null)

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

      if (contentType.includes('application/json')) {
        const data = await res.json()
        setResult(data)
      } else {
        const text = await res.text()
        setResult({ raw: text })
      }
    } catch (err: any) {
      setError(err?.message || 'Erro inesperado')
    } finally {
      setIsSubmitting(false)
    }
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

  return (
    <div className="min-h-screen py-8">
      <div className="container max-w-3xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-semibold">Enviar Lead da VSL</h1>
          <a href="/" className="text-sm underline">Voltar</a>
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

        {result && (
          <Card className="shadow-sm bg-transparent">
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="font-medium">Resultado</h2>
                <div className="flex items-center gap-2">
                  <Button size="sm" variant="outline" onClick={handleCopy}>Copiar JSON</Button>
                  <Button size="sm" onClick={handleDownload}>Baixar JSON</Button>
                </div>
              </div>
              <pre className="text-xs overflow-auto max-h-[500px] p-3 border rounded-md">
{JSON.stringify(result, null, 2)}
              </pre>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}


