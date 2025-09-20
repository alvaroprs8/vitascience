"use client";

import React from "react";
import { Sidebar, SidebarBody, SidebarLink } from "@/components/ui/sidebar";
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
      <div className="mx-auto flex h-full max-w-[1400px]">
        <Sidebar>
          <SidebarBody className="border-r border-slate-200 bg-white">
            <div className="flex h-full flex-col">
              <div className="mb-4 px-1 py-2">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-lg bg-slate-900" />
                  <div className="font-semibold tracking-tight text-slate-900">Vitascience</div>
                </div>
                <div className="mt-1 text-xs text-slate-500">Entrega — Clone Eugene</div>
              </div>

              <div className="flex-1 space-y-2">
                {links.map((l) => (
                  <SidebarLink key={l.href} link={l} />
                ))}

                <div className="mt-5 text-[10px] uppercase tracking-wider text-slate-500">APIs</div>
                {apiLinks.map((l) => (
                  <SidebarLink key={l.href} link={l} />
                ))}
              </div>

              <div className="mt-auto border-t border-slate-200 pt-3 text-xs text-slate-500">
                <div>v1.0.0</div>
                <div className="text-slate-400">Atualizado automaticamente</div>
              </div>
            </div>
          </SidebarBody>
        </Sidebar>

        <main className="flex-1">
          <div className="px-6 py-8 sm:px-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}


