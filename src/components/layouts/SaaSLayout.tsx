"use client";

import React from "react";
import { Dock } from "@/components/ui/dock-two";
import { Home, Workflow, MessageSquare } from "lucide-react";

type SaaSLayoutProps = {
  children: React.ReactNode
}

export function SaaSLayout({ children }: SaaSLayoutProps) {
  const menuItems = [
    { icon: Home, label: "Visão geral", onClick: () => { window.location.href = "/" } },
    { icon: MessageSquare, label: "Chat", onClick: () => { window.location.href = "/chat" } },
    { icon: Workflow, label: "Clone do Eugene", onClick: () => { window.location.href = "/lead" } },
  ] as const;

  return (
    <div className="min-h-screen w-full bg-[#fefefe]">
      <main className="mx-auto max-w-[1400px] px-6 py-8 sm:px-8">
        {children}
      </main>
      <div className="fixed inset-x-0 bottom-4 z-50 flex items-center justify-center pointer-events-none">
        <div className="pointer-events-auto">
          <Dock
            items={menuItems.map((m) => ({ icon: m.icon, label: m.label, onClick: m.onClick }))}
            className="w-auto h-16"
          />
        </div>
      </div>
    </div>
  )
}


