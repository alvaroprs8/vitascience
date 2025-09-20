"use client"

import React, { useMemo } from "react"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Sidebar, SidebarBody, SidebarLink } from "@/components/ui/sidebar"
import RadialOrbitalTimeline from "@/components/ui/radial-orbital-timeline"
import DatabaseWithRestApi from "@/components/ui/database-with-rest-api"
import { FileText, Database, Code, ExternalLink, Download, CheckCircle2, Clock, Play, GitBranch } from "lucide-react"

type DeliverableStatus = "completed" | "in-progress" | "pending"

interface DeliverableItem {
  title: string
  description: string
  href: string
  status: DeliverableStatus
  icon: any
}

export default function DeliverablesPage() {
  const items: DeliverableItem[] = [
    {
      title: "Documento de Concepção",
      description: "Arquitetura, decisões e trade-offs da solução (Markdown).",
      href: "/deliverables/CONCEPCAO.md",
      status: "in-progress",
      icon: FileText,
    },
    {
      title: "Diagrama (Mermaid)",
      description: "Fluxo end-to-end: ingestão RAG, análise no n8n, callback e consumo.",
      href: "/deliverables/DIAGRAMA.mmd",
      status: "completed",
      icon: GitBranch,
    },
    {
      title: "Documentação dos Prompts",
      description: "Todos os prompts usados (consciência, estrutura, melhorias, ângulos, agente Eugene).",
      href: "/deliverables/PROMPTS.md",
      status: "in-progress",
      icon: Code,
    },
    {
      title: "Workflow do n8n (JSON)",
      description: "Export do workflow para import direto no n8n.",
      href: "/deliverables/n8n-workflow.json",
      status: "completed",
      icon: GitBranch,
    },
    {
      title: "Estrutura do Banco de Dados",
      description: "DDL da tabela lead_results e índices (PostgreSQL/Supabase).",
      href: "/deliverables/DB_SCHEMA.sql",
      status: "completed",
      icon: Database,
    },
    {
      title: "Validação e Testes",
      description: "Análise completa da VSL enviada e critérios de avaliação do clone.",
      href: "/deliverables/VALIDATION.md",
      status: "in-progress",
      icon: FileText,
    },
    {
      title: "Link do Loom",
      description: "Vídeo (5–10 min) demonstrando tudo funcionando.",
      href: "/deliverables/LOOM.md",
      status: "pending",
      icon: FileText,
    },
  ]

  const quickLinks = [
    { label: "Enviar Lead (UI)", href: "/lead", icon: ExternalLink },
  ]

  const apiLinks = [
    { label: "POST /api/submit-lead", href: "/api/submit-lead", method: "POST" },
    { label: "GET  /api/lead/status?id={correlationId}", href: "/api/lead/status", method: "GET" },
    { label: "POST /api/lead/callback", href: "/api/lead/callback", method: "POST" },
  ]

  const timelineData = useMemo(() => {
    return items.map((it, idx) => ({
      id: idx + 1,
      title: it.title,
      date: new Date().toISOString().slice(0, 10),
      content: it.description,
      category: "deliverable",
      icon: it.icon,
      relatedIds: [((idx + 1) % items.length) + 1].filter(Boolean),
      status: it.status as "completed" | "in-progress" | "pending",
      energy: it.status === "completed" ? 90 : it.status === "in-progress" ? 60 : 30,
    }))
  }, [items])

  return (
    <Sidebar>
      <div className="min-h-screen w-full md:flex">
        <SidebarBody>
          <nav className="flex flex-col gap-1">
            <SidebarLink link={{ label: "Documentos", href: "#docs", icon: <FileText className="h-4 w-4" /> }} />
            <SidebarLink link={{ label: "APIs", href: "#apis", icon: <Code className="h-4 w-4" /> }} />
            <SidebarLink link={{ label: "Workflow", href: "#workflow", icon: <GitBranch className="h-4 w-4" /> }} />
            <SidebarLink link={{ label: "Acesso Rápido", href: "#quick", icon: <ExternalLink className="h-4 w-4" /> }} />
          </nav>
        </SidebarBody>

        <main className="flex-1 px-6 py-8">
          <section className="mb-8 rounded-xl border bg-gradient-to-r from-blue-50 to-indigo-50 p-6">
            <h1 className="text-3xl font-semibold tracking-tight">Entregáveis — Clone Digital Eugene Schwartz</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Abaixo você encontra todos os artefatos do teste (documentos, diagrama, workflow n8n, schema de banco e validações), além de links rápidos para executar e validar.
            </p>
            <div className="mt-4 flex flex-wrap gap-3">
              <Button asChild>
                <a href="#docs" className="gap-2">
                  <FileText className="h-4 w-4" /> Ver Documentação
                </a>
              </Button>
              <Button asChild variant="outline">
                <a href="/lead" className="gap-2">
                  <Play className="h-4 w-4" /> Testar Clone
                </a>
              </Button>
            </div>
          </section>

          <section id="workflow" className="mb-12">
            <h2 className="mb-4 text-xl font-medium">Status dos Entregáveis</h2>
            <div className="overflow-hidden rounded-xl border">
              <RadialOrbitalTimeline timelineData={timelineData} />
            </div>
          </section>

          <section id="quick" className="mb-10">
            <h2 className="mb-3 text-xl font-medium">Acesso Rápido</h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {quickLinks.map((l) => (
                <Card key={l.href}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base">
                      <l.icon className="h-4 w-4 text-primary" /> {l.label}
                    </CardTitle>
                  </CardHeader>
                  <CardFooter>
                    <Button asChild variant="outline" className="w-full">
                      <a href={l.href}>Acessar</a>
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </section>

          <section id="apis" className="mb-12">
            <h2 className="mb-3 text-xl font-medium">APIs</h2>
            <div className="mb-4 flex justify-center">
              <DatabaseWithRestApi title="API do Clone (Next.js)" circleText="API" />
            </div>
            <div className="grid gap-4">
              {apiLinks.map((api) => (
                <Card key={api.href} className="overflow-hidden">
                  <CardHeader className="pb-2">
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className={api.method === "GET" ? "bg-green-100 text-green-700" : "bg-blue-100 text-blue-700"}>
                        {api.method}
                      </Badge>
                      <code className="rounded bg-muted px-2 py-0.5 text-sm">{api.label.split(" ").slice(1).join(" ")}</code>
                    </div>
                  </CardHeader>
                  <CardFooter className="justify-end">
                    <Button asChild variant="outline" size="sm">
                      <a href={api.href} target="_blank" rel="noreferrer">Documentação</a>
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </section>

          <section id="docs">
            <h2 className="mb-4 text-xl font-medium">Documentos</h2>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {items.map((it) => (
                <Card key={it.title} className="hover:shadow-sm">
                  <CardHeader className="pb-2">
                    <div className="flex items-center gap-2">
                      <div className="rounded-md bg-muted p-2">
                        <it.icon className="h-4 w-4" />
                      </div>
                      <CardTitle className="text-base">{it.title}</CardTitle>
                      <span className="ml-auto flex items-center gap-1 text-xs text-muted-foreground">
                        {it.status === "completed" && <CheckCircle2 className="h-3.5 w-3.5 text-green-600" />}
                        {it.status === "in-progress" && <Clock className="h-3.5 w-3.5 text-amber-600" />}
                        {it.status === "pending" && <Play className="h-3.5 w-3.5 text-slate-500" />}
                        {it.status}
                      </span>
                    </div>
                  </CardHeader>
                  <CardContent className="text-sm text-muted-foreground">
                    {it.description}
                  </CardContent>
                  <CardFooter className="gap-2">
                    <Button asChild variant="outline" size="sm" className="flex-1">
                      <a href={it.href} target="_blank" rel="noreferrer">Abrir</a>
                    </Button>
                    <Button asChild variant="outline" size="sm" className="flex-1">
                      <a href={it.href} download>
                        <Download className="mr-1 h-4 w-4" /> Download
                      </a>
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </section>

          <footer className="mt-10 text-xs text-muted-foreground">
            <p>
              Observação: os arquivos acima ficam em <code>/public/deliverables/</code>. Substitua pelos definitivos conforme for finalizando.
            </p>
          </footer>
        </main>
      </div>
    </Sidebar>
  )
}

