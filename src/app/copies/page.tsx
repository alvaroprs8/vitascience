'use client'

import { useEffect, useMemo, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'

type CopyItem = {
  id: string
  title: string
  channel?: string | null
  status: string
  updated_at?: string
}

export default function CopiesPage() {
  const [teamId, setTeamId] = useState<string>('')
  const [items, setItems] = useState<CopyItem[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [form, setForm] = useState({
    title: '',
    channel: '',
    persona: '',
    promise: '',
    uniqueMechanism: '',
    targetConsciousnessLevel: '',
    cta: ''
  })

  useEffect(() => {
    const saved = localStorage.getItem('vs_team_id')
    if (saved) setTeamId(saved)
  }, [])

  const canLoad = useMemo(() => teamId.trim().length > 0, [teamId])

  const load = async () => {
    if (!canLoad) return
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/copies?teamId=${encodeURIComponent(teamId)}`, { cache: 'no-store' })
      const data = await res.json()
      if (!res.ok) throw new Error(data?.error || 'Falha ao carregar')
      setItems(Array.isArray(data.items) ? data.items : [])
    } catch (e: any) {
      setError(e?.message || 'Erro inesperado')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load().catch(() => {})
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canLoad])

  const createCopy = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!canLoad) return setError('Informe o Team ID')
    setError(null)
    try {
      const payload: any = { teamId, title: form.title }
      if (form.channel) payload.channel = form.channel
      if (form.persona) payload.persona = form.persona
      if (form.promise) payload.promise = form.promise
      if (form.uniqueMechanism) payload.uniqueMechanism = form.uniqueMechanism
      if (form.targetConsciousnessLevel) payload.targetConsciousnessLevel = Number(form.targetConsciousnessLevel)
      if (form.cta) payload.cta = form.cta
      const res = await fetch('/api/copies', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data?.error || 'Falha ao criar')
      setForm({ title: '', channel: '', persona: '', promise: '', uniqueMechanism: '', targetConsciousnessLevel: '', cta: '' })
      load().catch(() => {})
    } catch (e: any) {
      setError(e?.message || 'Erro inesperado')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-slate-50 py-8">
      <div className="container max-w-5xl mx-auto space-y-6 px-4 sm:px-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Copies</h1>
        </div>

        <Card className="bg-white border-slate-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Seleção de Time</CardTitle>
            <CardDescription>Informe o Team ID para listar e criar copies</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-end">
              <div className="flex-1 w-full">
                <Label htmlFor="team">Team ID</Label>
                <Input id="team" value={teamId} onChange={(e) => setTeamId(e.target.value)} placeholder="uuid do time" />
              </div>
              <div className="flex gap-2">
                <Button onClick={() => { localStorage.setItem('vs_team_id', teamId); load().catch(()=>{}) }} disabled={!canLoad || loading}>Salvar & Carregar</Button>
                <Button variant="outline" onClick={() => { localStorage.removeItem('vs_team_id'); setTeamId(''); setItems([]) }}>Limpar</Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border-slate-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Criar nova Copy</CardTitle>
            <CardDescription>Defina metadados iniciais e crie a copy</CardDescription>
          </CardHeader>
          <CardContent>
            <form className="grid gap-4" onSubmit={createCopy}>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <Label>Título</Label>
                  <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
                </div>
                <div>
                  <Label>Canal</Label>
                  <Input value={form.channel} onChange={(e) => setForm({ ...form, channel: e.target.value })} placeholder="vsl, lp, ad, email" />
                </div>
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <Label>Persona</Label>
                  <Input value={form.persona} onChange={(e) => setForm({ ...form, persona: e.target.value })} />
                </div>
                <div>
                  <Label>Promessa</Label>
                  <Input value={form.promise} onChange={(e) => setForm({ ...form, promise: e.target.value })} />
                </div>
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <Label>Mecanismo Único</Label>
                  <Input value={form.uniqueMechanism} onChange={(e) => setForm({ ...form, uniqueMechanism: e.target.value })} />
                </div>
                <div>
                  <Label>Nível de Consciência (1-5)</Label>
                  <Input value={form.targetConsciousnessLevel} onChange={(e) => setForm({ ...form, targetConsciousnessLevel: e.target.value })} />
                </div>
              </div>
              <div>
                <Label>CTA</Label>
                <Input value={form.cta} onChange={(e) => setForm({ ...form, cta: e.target.value })} />
              </div>
              {error && (
                <div className="text-sm text-red-600">{error}</div>
              )}
              <div>
                <Button type="submit" disabled={!canLoad}>Criar Copy</Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <Separator />

        <Card className="bg-white border-slate-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Lista de Copies</CardTitle>
            <CardDescription>{loading ? 'Carregando...' : `Total: ${items.length}`}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Título</TableHead>
                    <TableHead>Canal</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Atualizado</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.map((it) => (
                    <TableRow key={it.id}>
                      <TableCell className="font-medium">{it.title}</TableCell>
                      <TableCell>{it.channel || '—'}</TableCell>
                      <TableCell>{it.status}</TableCell>
                      <TableCell>{it.updated_at ? new Date(it.updated_at).toLocaleString() : '—'}</TableCell>
                    </TableRow>
                  ))}
                  {items.length === 0 && !loading && (
                    <TableRow>
                      <TableCell colSpan={4} className="text-slate-500">Nenhuma copy encontrada</TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}


