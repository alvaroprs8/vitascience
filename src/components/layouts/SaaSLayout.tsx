"use client";

import React from "react";
import { Dock } from "@/components/ui/dock-two";
import { FileText, Workflow, BookOpen, Database, GitBranch, Link2, Home, Download } from "lucide-react";

type SaaSLayoutProps = {
  children: React.ReactNode
}

export function SaaSLayout({ children }: SaaSLayoutProps) {
  const links = [
    { label: "Visão geral", href: "/deliverables", icon: <Home className="h-4 w-4" /> },
    { label: "Concepção", href: "/deliverables/CONCEPCAO.md", icon: <BookOpen className="h-4 w-4" /> },
    { label: "Prompts", href: "/deliverables/PROMPTS.md", icon: <FileText className="h-4 w-4" /> },
    { label: "Diagrama", href: "/deliverables/DIAGRAMA.mmd", icon: <GitBranch className="h-4 w-4" /> },
    { label: "DB Schema", href: "/deliverables/DB_SCHEMA.sql", icon: <Database className="h-4 w-4" /> },
    { label: "Validação", href: "/deliverables/VALIDATION.md", icon: <FileText className="h-4 w-4" /> },
    { label: "Loom", href: "/deliverables/LOOM.md", icon: <Link2 className="h-4 w-4" /> },
    { label: "Workflow n8n", href: "/deliverables/n8n-workflow.json", icon: <Download className="h-4 w-4" /> },
    { label: "Enviar Lead", href: "/lead", icon: <Workflow className="h-4 w-4" /> },
  ];

  const apiLinks = [
    { label: "POST submit-lead", href: "/api/submit-lead", icon: <Link2 className="h-4 w-4" /> },
    { label: "GET status", href: "/api/lead/status", icon: <Link2 className="h-4 w-4" /> },
    { label: "POST callback", href: "/api/lead/callback", icon: <Link2 className="h-4 w-4" /> },
  ];

  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-white to-slate-50">
      <div className="mx-auto flex max-w-[1400px]">
        <aside className="sticky top-0 h-[100dvh] w-[260px] flex-shrink-0 border-r border-slate-200 bg-white px-3 py-4 hidden md:block">
          <div className="mb-4 px-1 py-2">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-slate-900" />
              <div className="font-semibold tracking-tight text-slate-900">Vitascience</div>
            </div>
            <div className="mt-1 text-xs text-slate-500">Entrega — Clone Eugene</div>
          </div>
          <Dock
            orientation="vertical"
            items={[
              ...links.map((l) => ({
                icon: (() => require("lucide-react")[l.icon?.type?.displayName || l.icon?.type?.name || 'Home'])(),
                label: l.label,
                onClick: () => { window.location.href = l.href }
              })),
              { icon: require("lucide-react").Link2, label: 'APIs', onClick: () => {} },
              ...apiLinks.map((l) => ({
                icon: require("lucide-react").Link2,
                label: l.label,
                onClick: () => { window.location.href = l.href }
              })),
            ]}
            className="h-[calc(100dvh-100px)]"
          />
          <div className="mt-3 border-t border-slate-200 pt-3 text-xs text-slate-500">
            <div>v1.0.0</div>
            <div className="text-slate-400">Atualizado automaticamente</div>
          </div>
        </aside>
        <main className="flex-1 min-w-0">
          <div className="px-6 py-8 sm:px-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}


