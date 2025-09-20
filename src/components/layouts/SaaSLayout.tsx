"use client";

import React from "react";
import { Dock } from "@/components/ui/dock-two";
import { Home, Layers, Link2, Workflow } from "lucide-react";

type SaaSLayoutProps = {
  children: React.ReactNode
}

export function SaaSLayout({ children }: SaaSLayoutProps) {
  const menuItems = [
    { icon: Home, label: "Visão geral", onClick: () => { window.location.href = "/deliverables" } },
    { icon: Layers, label: "Artefatos", onClick: () => { window.location.href = "/deliverables#artefatos" } },
    { icon: Link2, label: "APIs", onClick: () => { window.location.href = "/deliverables#apis" } },
    { icon: Workflow, label: "Clone do Eugene", onClick: () => { window.location.href = "/lead" } },
  ] as const;

  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-white to-slate-50">
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/80 backdrop-blur">
        <div className="mx-auto max-w-[1400px] px-4 py-3">
          <div className="flex items-center justify-center">
            <Dock
              items={menuItems.map((m) => ({ icon: m.icon, label: m.label, onClick: m.onClick }))}
              className="w-auto h-16"
            />
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-[1400px] px-6 py-8 sm:px-8">
        {children}
      </main>
    </div>
  )
}


