"use client"

import React, { useMemo, useState } from "react"
import ProjectDashboard, { type Project, type Message, type Stat } from "@/components/project-management-dashboard"
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  BarChart,
  Bar,
  CartesianGrid,
} from "recharts"
import { SaaSLayout } from "@/components/layouts/SaaSLayout"

export default function AdminPage() {
  // Mock: copywriters top performance, copys, clones, status breakdown
  const stats: Stat[] = [
    { id: "topCopywriters", label: "Copywriters com melhor performance", value: 5 },
    { id: "bestCopys", label: "Melhores copys", value: 12 },
    { id: "activeCopys", label: "Copys ativas", value: 28 },
    { id: "clonesUsed", label: "Clones usados", value: 7 },
  ]

  const projects: Project[] = [
    {
      id: "copy-1",
      name: "Black Friday – Headline V3",
      subtitle: "CTR up 14% vs baseline (Copywriter: Ana Souza)",
      date: "2025-09-20",
      progress: 86,
      status: "completed",
      accentColor: "#16a34a",
      participants: [
        "https://i.pravatar.cc/96?img=1",
        "https://i.pravatar.cc/96?img=2",
        "https://i.pravatar.cc/96?img=3",
      ],
      daysLeft: "—",
    },
    {
      id: "copy-2",
      name: "Launch – Email Sequence (Clone: Eugene v2)",
      subtitle: "Open Rate 48%, Unsubscribe 0.9% (Copywriter: Bruno Lima)",
      date: "2025-09-18",
      progress: 62,
      status: "inProgress",
      accentColor: "#6366f1",
      participants: [
        "https://i.pravatar.cc/96?img=4",
        "https://i.pravatar.cc/96?img=5",
      ],
      daysLeft: 5,
    },
    {
      id: "copy-3",
      name: "Evergreen – Landing Page Hero (Clone: AIDA v1)",
      subtitle: "CVR 3.2% (+0.6pp) (Copywriter: Carla Nogueira)",
      date: "2025-09-12",
      progress: 45,
      status: "inProgress",
      accentColor: "#f59e0b",
      participants: [
        "https://i.pravatar.cc/96?img=6",
        "https://i.pravatar.cc/96?img=7",
      ],
      daysLeft: 9,
    },
    {
      id: "copy-4",
      name: "Retarget – Ad Set #4 (Clone: PAS v3)",
      subtitle: "CPC R$0,74 (Copywriter: Diego Castro)",
      date: "2025-09-07",
      progress: 12,
      status: "paused",
      accentColor: "#ef4444",
      participants: [
        "https://i.pravatar.cc/96?img=8",
      ],
      daysLeft: 2,
    },
    {
      id: "copy-5",
      name: "Promo – SMS Broadcast",
      subtitle: "Delivery 96%, CTR 9.1% (Copywriter: Ana Souza)",
      date: "2025-09-05",
      progress: 100,
      status: "completed",
      accentColor: "#10b981",
      participants: [
        "https://i.pravatar.cc/96?img=9",
        "https://i.pravatar.cc/96?img=10",
      ],
      daysLeft: "—",
    },
  ]

  // Messages agora representam "Copys criadas" (com clone/copywriter/descrição)
  const messages: Message[] = [
    {
      id: "copy-1",
      name: "Black Friday – Headline V3",
      avatarUrl: "https://i.pravatar.cc/96?img=1",
      text: "CTR up 14% vs baseline",
      description: "Headline com urgência e ancoragem de preço para BF.",
      cloneName: "Eugene v2",
      copywriter: "Ana Souza",
      date: "2025-09-20 10:24",
      starred: true,
    },
    {
      id: "copy-2",
      name: "Launch – Email Sequence",
      avatarUrl: "https://i.pravatar.cc/96?img=4",
      text: "Open Rate 48%",
      description: "Sequência de 5 emails com storytelling e prova social.",
      cloneName: "Eugene v2",
      copywriter: "Bruno Lima",
      date: "2025-09-18 09:10",
    },
    {
      id: "copy-3",
      name: "Evergreen – Landing Hero",
      avatarUrl: "https://i.pravatar.cc/96?img=6",
      text: "CVR 3.2% (+0.6pp)",
      description: "Hero A/B test com foco em benefício e CTA primário.",
      cloneName: "AIDA v1",
      copywriter: "Carla Nogueira",
      date: "2025-09-12 15:42",
    },
    {
      id: "copy-4",
      name: "Retarget – Ad Set #4",
      avatarUrl: "https://i.pravatar.cc/96?img=8",
      text: "CPC R$0,74",
      description: "Anúncio com dor específica + oferta por tempo limitado.",
      cloneName: "PAS v3",
      copywriter: "Diego Castro",
      date: "2025-09-07 11:05",
    },
  ]

  // Estado da copy selecionada (para mudar análises)
  const [selectedCopyId, setSelectedCopyId] = useState<string | null>(null)

  // Datasets mockados por copy
  const copyDatasets = {
    "copy-1": {
      kpis: { ctr: 5.1, cvr: 3.4, cpc: 0.78, ctrDelta: +0.9, cvrDelta: +0.5, cpcDelta: -0.04 },
      ctrSeries: [3.6,3.9,4.1,3.8,4.2,4.0,4.3,4.5,4.4,4.6,4.7,4.9,5.0,5.1],
      cvrByWriter: [
        { name: "Ana", cvr: 3.8 }, { name: "Bruno", cvr: 3.2 }, { name: "Carla", cvr: 3.1 },
      ],
      clonesUsage: [
        { clone: "Eugene v2", uses: 18 }, { clone: "AIDA v1", uses: 8 }, { clone: "PAS v3", uses: 5 },
      ],
    },
    "copy-2": {
      kpis: { ctr: 4.6, cvr: 3.0, cpc: 0.85, ctrDelta: +0.2, cvrDelta: +0.1, cpcDelta: +0.03 },
      ctrSeries: [3.1,3.3,3.7,3.6,3.9,3.8,4.0,4.2,4.1,4.3,4.5,4.7,4.8,4.6],
      cvrByWriter: [
        { name: "Bruno", cvr: 3.2 }, { name: "Ana", cvr: 3.1 }, { name: "Carla", cvr: 2.9 },
      ],
      clonesUsage: [
        { clone: "Eugene v2", uses: 20 }, { clone: "PAS v3", uses: 6 }, { clone: "AIDA v1", uses: 4 },
      ],
    },
    "copy-3": {
      kpis: { ctr: 4.4, cvr: 3.2, cpc: 0.80, ctrDelta: +0.3, cvrDelta: +0.6, cpcDelta: -0.02 },
      ctrSeries: [3.0,3.2,3.4,3.5,3.6,3.7,3.9,4.0,4.1,4.2,4.3,4.4,4.6,4.4],
      cvrByWriter: [
        { name: "Carla", cvr: 3.2 }, { name: "Ana", cvr: 3.0 }, { name: "Diego", cvr: 2.7 },
      ],
      clonesUsage: [
        { clone: "AIDA v1", uses: 16 }, { clone: "Eugene v2", uses: 9 }, { clone: "PAS v3", uses: 3 },
      ],
    },
    "copy-4": {
      kpis: { ctr: 3.9, cvr: 2.6, cpc: 0.90, ctrDelta: -0.4, cvrDelta: -0.2, cpcDelta: +0.08 },
      ctrSeries: [3.9,3.8,3.7,3.6,3.8,3.7,3.9,4.0,3.9,3.7,3.8,3.9,4.0,3.9],
      cvrByWriter: [
        { name: "Diego", cvr: 2.6 }, { name: "Ana", cvr: 3.0 }, { name: "Bruno", cvr: 2.8 },
      ],
      clonesUsage: [
        { clone: "PAS v3", uses: 12 }, { clone: "Eugene v2", uses: 7 }, { clone: "AIDA v1", uses: 2 },
      ],
    },
  } as const

  const overall = {
    kpis: { ctr: 4.8, cvr: 3.1, cpc: 0.82, ctrDelta: +0.7, cvrDelta: +0.4, cpcDelta: +0.06 },
    ctrSeries: [3.4,3.9,4.1,3.8,4.2,4.0,4.3,4.5,4.4,4.6,4.7,4.9,5.0,4.8],
    cvrByWriter: [
      { name: "Ana", cvr: 3.6 }, { name: "Bruno", cvr: 3.2 }, { name: "Carla", cvr: 3.0 }, { name: "Diego", cvr: 2.7 }, { name: "Eva", cvr: 2.5 },
    ],
    clonesUsage: [
      { clone: "Eugene v2", uses: 34 }, { clone: "AIDA v1", uses: 28 }, { clone: "PAS v3", uses: 19 }, { clone: "4U v1", uses: 13 },
    ],
  } as const

  const current = useMemo(() => {
    if (selectedCopyId && (copyDatasets as any)[selectedCopyId]) {
      return (copyDatasets as any)[selectedCopyId]
    }
    return overall
  }, [selectedCopyId])

  return (
    <SaaSLayout>
      <ProjectDashboard
      title="Admin – Performance de Copys"
      stats={stats}
      projects={projects}
        messages={messages}
      sidebarLinks={[
        { id: "home", label: "Home", active: false, href: "/" },
        { id: "analytics", label: "Analytics", active: true },
        { id: "calendar", label: "Calendar" },
        { id: "settings", label: "Settings" },
      ]}
        showSidebar={false}
        allowCreate={false}
        messagesTitle="Copys criadas"
        onMessageClick={(m) => setSelectedCopyId(m.id)}
      defaultView="grid"
      defaultSortBy="date"
      defaultSortDir="desc"
      defaultStatusFilter="all"
      persistKey="admin-dashboard"
      emptyProjectsLabel="Sem copys para mostrar."
      emptyMessagesLabel="Sem mensagens."
      extraContent={
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* KPI Cards */}
          <div className="rounded-xl bg-white dark:bg-slate-800 ring-1 ring-slate-200 dark:ring-slate-700 p-4">
            <p className="text-sm text-slate-500 dark:text-slate-400">CTR Médio (7d)</p>
              <p className="mt-2 text-2xl font-semibold text-slate-900 dark:text-slate-100">{current.kpis.ctr}%</p>
              <p className={`text-xs ${current.kpis.ctrDelta >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"}`}>
                {current.kpis.ctrDelta >= 0 ? "+" : ""}{current.kpis.ctrDelta}pp vs 7d ant.
              </p>
          </div>
          <div className="rounded-xl bg-white dark:bg-slate-800 ring-1 ring-slate-200 dark:ring-slate-700 p-4">
            <p className="text-sm text-slate-500 dark:text-slate-400">CVR Médio (7d)</p>
              <p className="mt-2 text-2xl font-semibold text-slate-900 dark:text-slate-100">{current.kpis.cvr}%</p>
              <p className={`text-xs ${current.kpis.cvrDelta >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"}`}>
                {current.kpis.cvrDelta >= 0 ? "+" : ""}{current.kpis.cvrDelta}pp vs 7d ant.
              </p>
          </div>
          <div className="rounded-xl bg-white dark:bg-slate-800 ring-1 ring-slate-200 dark:ring-slate-700 p-4">
            <p className="text-sm text-slate-500 dark:text-slate-400">CPC Médio (7d)</p>
              <p className="mt-2 text-2xl font-semibold text-slate-900 dark:text-slate-100">R$ {current.kpis.cpc.toFixed(2)}</p>
              <p className={`text-xs ${current.kpis.cpcDelta <= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"}`}>
                {current.kpis.cpcDelta >= 0 ? "+" : ""}R$ {Math.abs(current.kpis.cpcDelta).toFixed(2)} vs 7d ant.
              </p>
          </div>

          {/* Line Chart: CTR por dia */}
          <div className="lg:col-span-2 rounded-xl bg-white dark:bg-slate-800 ring-1 ring-slate-200 dark:ring-slate-700 p-4">
            <p className="text-sm font-medium text-slate-900 dark:text-slate-100 mb-3">CTR por dia (últimos 14 dias)</p>
            <div style={{ width: "100%", height: 220 }}>
              <ResponsiveContainer>
                <LineChart data={current.ctrSeries.map((v: number, i: number) => ({ d: i === current.ctrSeries.length - 1 ? "Hoje" : `D-${current.ctrSeries.length - 1 - i}`, ctr: v }))} margin={{ top: 5, right: 12, bottom: 0, left: -10 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="d" tick={{ fontSize: 12, fill: "#64748b" }} axisLine={false} tickLine={false} />
                  <YAxis tickFormatter={(v: number) => `${v}%`} tick={{ fontSize: 12, fill: "#64748b" }} axisLine={false} tickLine={false} width={40} />
                  <Tooltip formatter={(v: any) => [`${v}%`, "CTR"]} labelStyle={{ color: "#0f172a" }} />
                  <Line type="monotone" dataKey="ctr" stroke="#6366f1" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Bar Chart: Top Copywriters por CVR */}
          <div className="rounded-xl bg-white dark:bg-slate-800 ring-1 ring-slate-200 dark:ring-slate-700 p-4">
             <p className="text-sm font-medium text-slate-900 dark:text-slate-100 mb-3">Copywriters com maior CVR</p>
            <div style={{ width: "100%", height: 220 }}>
              <ResponsiveContainer>
                <BarChart data={current.cvrByWriter} margin={{ top: 5, right: 12, bottom: 0, left: -10 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="name" tick={{ fontSize: 12, fill: "#64748b" }} axisLine={false} tickLine={false} />
                  <YAxis tickFormatter={(v: number) => `${v}%`} tick={{ fontSize: 12, fill: "#64748b" }} axisLine={false} tickLine={false} width={40} />
                  <Tooltip formatter={(v: any) => [`${v}%`, "CVR"]} labelStyle={{ color: "#0f172a" }} />
                  <Bar dataKey="cvr" fill="#10b981" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Bar Chart: Clones mais usados */}
          <div className="rounded-xl bg-white dark:bg-slate-800 ring-1 ring-slate-200 dark:ring-slate-700 p-4 lg:col-span-3">
             <p className="text-sm font-medium text-slate-900 dark:text-slate-100 mb-3">Clones mais usados (7 dias)</p>
            <div style={{ width: "100%", height: 240 }}>
              <ResponsiveContainer>
                <BarChart data={current.clonesUsage} margin={{ top: 5, right: 12, bottom: 0, left: -10 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="clone" tick={{ fontSize: 12, fill: "#64748b" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 12, fill: "#64748b" }} axisLine={false} tickLine={false} width={36} />
                  <Tooltip labelStyle={{ color: "#0f172a" }} />
                  <Bar dataKey="uses" fill="#6366f1" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      }
      />
    </SaaSLayout>
  )
}


