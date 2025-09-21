"use client"

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

export default function AdminPage() {
  // Mock: copywriters top performance, copys, clones, status breakdown
  const stats: Stat[] = [
    { id: "topCopywriters", label: "Top Copywriters", value: 5 },
    { id: "bestCopys", label: "Best Copys", value: 12 },
    { id: "activeCopys", label: "Active Copys", value: 28 },
    { id: "clonesUsed", label: "Clones Used", value: 7 },
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

  const messages: Message[] = [
    {
      id: "m1",
      name: "Equipe Performance",
      avatarUrl: "https://i.pravatar.cc/96?img=11",
      text: "Clones Eugene v2 e AIDA v1 foram os mais usados nesta semana.",
      date: "2025-09-20 10:24",
      starred: true,
    },
    {
      id: "m2",
      name: "Mídia Paga",
      avatarUrl: "https://i.pravatar.cc/96?img=12",
      text: "Ad Set #4 pausado por custo acima do alvo.",
      date: "2025-09-19 17:03",
    },
  ]

  return (
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
            <p className="mt-2 text-2xl font-semibold text-slate-900 dark:text-slate-100">4,8%</p>
            <p className="text-xs text-emerald-600 dark:text-emerald-400">+0,7pp vs 7d ant.</p>
          </div>
          <div className="rounded-xl bg-white dark:bg-slate-800 ring-1 ring-slate-200 dark:ring-slate-700 p-4">
            <p className="text-sm text-slate-500 dark:text-slate-400">CVR Médio (7d)</p>
            <p className="mt-2 text-2xl font-semibold text-slate-900 dark:text-slate-100">3,1%</p>
            <p className="text-xs text-emerald-600 dark:text-emerald-400">+0,4pp vs 7d ant.</p>
          </div>
          <div className="rounded-xl bg-white dark:bg-slate-800 ring-1 ring-slate-200 dark:ring-slate-700 p-4">
            <p className="text-sm text-slate-500 dark:text-slate-400">CPC Médio (7d)</p>
            <p className="mt-2 text-2xl font-semibold text-slate-900 dark:text-slate-100">R$ 0,82</p>
            <p className="text-xs text-rose-600 dark:text-rose-400">+R$ 0,06 vs 7d ant.</p>
          </div>

          {/* Line Chart: CTR por dia */}
          <div className="lg:col-span-2 rounded-xl bg-white dark:bg-slate-800 ring-1 ring-slate-200 dark:ring-slate-700 p-4">
            <p className="text-sm font-medium text-slate-900 dark:text-slate-100 mb-3">CTR por dia (últimos 14 dias)</p>
            <div style={{ width: "100%", height: 220 }}>
              <ResponsiveContainer>
                <LineChart data={[
                  { d: "D-13", ctr: 3.4 },
                  { d: "D-12", ctr: 3.9 },
                  { d: "D-11", ctr: 4.1 },
                  { d: "D-10", ctr: 3.8 },
                  { d: "D-9", ctr: 4.2 },
                  { d: "D-8", ctr: 4.0 },
                  { d: "D-7", ctr: 4.3 },
                  { d: "D-6", ctr: 4.5 },
                  { d: "D-5", ctr: 4.4 },
                  { d: "D-4", ctr: 4.6 },
                  { d: "D-3", ctr: 4.7 },
                  { d: "D-2", ctr: 4.9 },
                  { d: "D-1", ctr: 5.0 },
                  { d: "Hoje", ctr: 4.8 },
                ]} margin={{ top: 5, right: 12, bottom: 0, left: -10 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="d" tick={{ fontSize: 12, fill: "#64748b" }} axisLine={false} tickLine={false} />
                  <YAxis tickFormatter={(v) => `${v}%`} tick={{ fontSize: 12, fill: "#64748b" }} axisLine={false} tickLine={false} width={40} />
                  <Tooltip formatter={(v: any) => [`${v}%`, "CTR"]} labelStyle={{ color: "#0f172a" }} />
                  <Line type="monotone" dataKey="ctr" stroke="#6366f1" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Bar Chart: Top Copywriters por CVR */}
          <div className="rounded-xl bg-white dark:bg-slate-800 ring-1 ring-slate-200 dark:ring-slate-700 p-4">
            <p className="text-sm font-medium text-slate-900 dark:text-slate-100 mb-3">Top Copywriters (CVR)</p>
            <div style={{ width: "100%", height: 220 }}>
              <ResponsiveContainer>
                <BarChart data={[
                  { name: "Ana", cvr: 3.6 },
                  { name: "Bruno", cvr: 3.2 },
                  { name: "Carla", cvr: 3.0 },
                  { name: "Diego", cvr: 2.7 },
                  { name: "Eva", cvr: 2.5 },
                ]} margin={{ top: 5, right: 12, bottom: 0, left: -10 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="name" tick={{ fontSize: 12, fill: "#64748b" }} axisLine={false} tickLine={false} />
                  <YAxis tickFormatter={(v) => `${v}%`} tick={{ fontSize: 12, fill: "#64748b" }} axisLine={false} tickLine={false} width={40} />
                  <Tooltip formatter={(v: any) => [`${v}%`, "CVR"]} labelStyle={{ color: "#0f172a" }} />
                  <Bar dataKey="cvr" fill="#10b981" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Bar Chart: Clones mais usados */}
          <div className="rounded-xl bg-white dark:bg-slate-800 ring-1 ring-slate-200 dark:ring-slate-700 p-4 lg:col-span-3">
            <p className="text-sm font-medium text-slate-900 dark:text-slate-100 mb-3">Clones mais usados (7d)</p>
            <div style={{ width: "100%", height: 240 }}>
              <ResponsiveContainer>
                <BarChart data={[
                  { clone: "Eugene v2", uses: 34 },
                  { clone: "AIDA v1", uses: 28 },
                  { clone: "PAS v3", uses: 19 },
                  { clone: "4U v1", uses: 13 },
                ]} margin={{ top: 5, right: 12, bottom: 0, left: -10 }}>
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
  )
}


