"use client"

import React from "react"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, Clock, Circle } from "lucide-react"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"

export interface TimelineItem {
  title: string
  description: string
  date?: string
  image?: string
  status?: "completed" | "current" | "upcoming"
  category?: string
  href?: string
}

export interface TimelineProps {
  items: TimelineItem[]
  className?: string
}

const getStatusConfig = (status: TimelineItem["status"]) => {
  const configs = {
    completed: {
      progressColor: "bg-success",
      borderColor: "border-success/20",
      badgeBg: "bg-success/10",
      badgeText: "text-success"
    },
    current: {
      progressColor: "bg-blue-600 dark:bg-blue-400",
      borderColor: "border-blue-600/20 dark:border-blue-400/20",
      badgeBg: "bg-blue-100 dark:bg-blue-900/30",
      badgeText: "text-blue-800 dark:text-blue-200"
    },
    upcoming: {
      progressColor: "bg-warning",
      borderColor: "border-warning/20",
      badgeBg: "bg-warning/10",
      badgeText: "text-warning"
    }
  }
  
  return configs[status || "upcoming"]
}

const getStatusIcon = (status: TimelineItem["status"]) => {
  switch (status) {
    case "completed":
      return CheckCircle
    case "current":
      return Clock
    default:
      return Circle
  }
}

export function Timeline({ items, className }: TimelineProps) {
  const [expandedPreviewByHref, setExpandedPreviewByHref] = React.useState<Record<string, boolean>>({})
  const [loadingByHref, setLoadingByHref] = React.useState<Record<string, boolean>>({})
  const [contentCacheByHref, setContentCacheByHref] = React.useState<Record<string, { text: string; error?: string }>>({})

  const isExternalLink = (href?: string) => !!href && /^https?:\/\//i.test(href)
  const getFileExtension = (href?: string) => (href ? href.split("?")[0].split("#")[0].split(".").pop()?.toLowerCase() : undefined)

  const togglePreview = async (href: string) => {
    setExpandedPreviewByHref(prev => ({ ...prev, [href]: !prev[href] }))
    const willOpen = !expandedPreviewByHref[href]
    if (!willOpen) return

    if (!contentCacheByHref[href]) {
      try {
        setLoadingByHref(prev => ({ ...prev, [href]: true }))
        const res = await fetch(href)
        if (!res.ok) throw new Error(`Falha ao carregar recurso (${res.status})`)
        const text = await res.text()
        setContentCacheByHref(prev => ({ ...prev, [href]: { text } }))
      } catch (e: any) {
        setContentCacheByHref(prev => ({ ...prev, [href]: { text: "", error: e?.message || "Erro desconhecido" } }))
      } finally {
        setLoadingByHref(prev => ({ ...prev, [href]: false }))
      }
    }
  }

  const renderPreview = (href: string) => {
    const cached = contentCacheByHref[href]
    const ext = getFileExtension(href)

    if (loadingByHref[href]) {
      return (
        <div className="mt-3 text-xs text-muted-foreground">Carregando pré-visualização...</div>
      )
    }

    if (cached?.error) {
      return (
        <div className="mt-3 text-xs text-red-600">Erro: {cached.error}</div>
      )
    }

    const text = cached?.text || ""

    switch (ext) {
      case "md":
      case "mdx":
        return (
          <div className="prose prose-sm max-w-none mt-3">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{text}</ReactMarkdown>
          </div>
        )
      case "json":
        try {
          const parsed = JSON.parse(text)
          return (
            <pre className="mt-3 overflow-auto rounded-md bg-slate-50 p-3 text-xs text-slate-800 border border-slate-200"><code>{JSON.stringify(parsed, null, 2)}</code></pre>
          )
        } catch {
          return (
            <pre className="mt-3 overflow-auto rounded-md bg-slate-50 p-3 text-xs text-slate-800 border border-slate-200"><code>{text}</code></pre>
          )
        }
      case "sql":
      case "mmd":
      case "txt":
      default:
        return (
          <pre className="mt-3 overflow-auto rounded-md bg-slate-50 p-3 text-xs text-slate-800 border border-slate-200"><code>{text}</code></pre>
        )
    }
  }

  if (!items || items.length === 0) {
    return (
      <div className={cn("w-full max-w-4xl mx-auto px-4 sm:px-6 py-8", className)}>
        <p className="text-center text-muted-foreground">No timeline items to display</p>
      </div>
    )
  }

  return (
    <section 
      className={cn("w-full max-w-4xl mx-auto px-4 sm:px-6 py-8", className)}
      role="list"
      aria-label="Timeline of events and milestones"
    >
      <div className="relative">
        <div 
          className="absolute left-4 sm:left-6 top-0 bottom-0 w-px bg-border" 
          aria-hidden="true"
        />
        
        <motion.div
          className="absolute left-4 sm:left-6 top-0 w-px bg-primary origin-top"
          initial={{ scaleY: 0 }}
          whileInView={{ 
            scaleY: 1,
            transition: {
              duration: 1.2,
              ease: "easeOut",
              delay: 0.2
            }
          }}
          viewport={{ once: true }}
          aria-hidden="true"
        />

        <div className="space-y-8 sm:space-y-12 relative">
          {items.map((item, index) => {
            const config = getStatusConfig(item.status)
            const IconComponent = getStatusIcon(item.status)
            
            return (
              <motion.div
                key={index}
                className="relative group"
                initial={{ opacity: 0, y: 40, scale: 0.98 }}
                whileInView={{ 
                  opacity: 1, 
                  y: 0, 
                  scale: 1,
                  transition: {
                    duration: 0.5,
                    delay: index * 0.1,
                    ease: [0.25, 0.46, 0.45, 0.94]
                  }
                }}
                viewport={{ once: true, margin: "-30px" }}
                role="listitem"
                aria-label={`Timeline item ${index + 1}: ${item.title}`}
              >
                <div className="flex items-start gap-4 sm:gap-6">
                  <div className="relative flex-shrink-0">
                    <motion.div
                      className="relative"
                      whileHover={{ scale: 1.05 }}
                      transition={{ duration: 0.2 }}
                      tabIndex={0}
                      role="img"
                      aria-label={`Avatar for ${item.title}`}
                    >
                      <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full overflow-hidden border-2 border-background shadow-lg relative z-10">
                        {item.image ? (
                          <img
                            src={item.image}
                            alt={`${item.title} avatar`}
                            className="w-full h-full object-cover"
                            loading="lazy"
                          />
                        ) : (
                          <div className="w-full h-full bg-muted flex items-center justify-center">
                            <IconComponent 
                              className="w-5 h-5 sm:w-6 sm:h-6 text-muted-foreground/70" 
                              aria-hidden="true"
                            />
                          </div>
                        )}
                      </div>
                    </motion.div>
                  </div>

                  <motion.div
                    className="flex-1 min-w-0"
                    whileHover={{ y: -2 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Card className={cn(
                      "border transition-all duration-300 hover:shadow-md relative",
                      "bg-card/50 backdrop-blur-sm",
                      config.borderColor,
                      "group-hover:border-primary/30"
                    )}>
                      <CardContent className="p-4 sm:p-6">
                        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 sm:gap-4 mb-3">
                          <div className="flex-1 min-w-0">
                            <motion.h3 
                              className="text-lg sm:text-xl font-semibold text-foreground mb-1 group-hover:text-primary transition-colors duration-300"
                              layoutId={`title-${index}`}
                            >
                              {item.title}
                            </motion.h3>
                            
                            <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                              {item.category && (
                                <span className="font-medium">{item.category}</span>
                              )}
                              {item.category && item.date && (
                                <span className="w-1 h-1 bg-muted-foreground rounded-full" aria-hidden="true" />
                              )}
                              {item.date && (
                                <time dateTime={item.date}>{item.date}</time>
                              )}
                            </div>
                          </div>
                          
                          <Badge 
                            className={cn(
                              "w-fit text-xs font-medium border",
                              config.badgeBg,
                              config.badgeText,
                              "border-current/20"
                            )}
                            aria-label={`Status: ${item.status || "upcoming"}`}
                          >
                            {item.status ? item.status.charAt(0).toUpperCase() + item.status.slice(1) : "Upcoming"}
                          </Badge>
                        </div>

                        <motion.p 
                          className="text-sm sm:text-base text-muted-foreground leading-relaxed mb-4"
                          initial={{ opacity: 0.8 }}
                          whileHover={{ opacity: 1 }}
                        >
                          {item.description}
                        </motion.p>

                        {item.href && (
                          <div className="flex items-center gap-3 mb-4">
                            {isExternalLink(item.href) ? (
                              <a
                                className="text-xs font-medium text-slate-700 underline hover:text-slate-900"
                                href={item.href}
                                target="_blank"
                                rel="noopener noreferrer"
                                aria-label={`Abrir ${item.title} em nova aba`}
                              >
                                Abrir
                              </a>
                            ) : (
                              <button
                                type="button"
                                className="text-xs font-medium text-slate-700 underline hover:text-slate-900"
                                onClick={() => togglePreview(item.href!)}
                                aria-expanded={!!expandedPreviewByHref[item.href!]}
                                aria-controls={`preview-${index}`}
                              >
                                {expandedPreviewByHref[item.href!] ? 'Fechar' : 'Abrir'}
                              </button>
                            )}
                            <a
                              className="text-xs font-medium text-slate-700 underline hover:text-slate-900"
                              href={item.href}
                              download
                              aria-label={`Baixar ${item.title}`}
                            >
                              Download
                            </a>
                          </div>
                        )}

                        {item.href && !isExternalLink(item.href) && expandedPreviewByHref[item.href] && (
                          <div id={`preview-${index}`} className="mt-2">
                            {renderPreview(item.href)}
                          </div>
                        )}

                        <div 
                          className="h-1 bg-muted rounded-full overflow-hidden"
                          role="progressbar"
                          aria-valuenow={item.status === "completed" ? 100 : item.status === "current" ? 65 : 25}
                          aria-valuemin={0}
                          aria-valuemax={100}
                          aria-label={`Progress for ${item.title}`}
                        >
                          <motion.div
                            className={cn("h-full rounded-full", config.progressColor)}
                            initial={{ width: 0 }}
                            animate={{ 
                              width: item.status === "completed" ? "100%" : 
                                     item.status === "current" ? "65%" : "25%"
                            }}
                            transition={{ 
                              duration: 1.2, 
                              delay: index * 0.2 + 0.8,
                              ease: "easeOut"
                            }}
                          />
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                </div>
              </motion.div>
            )
          })}
        </div>

        <motion.div
          className="absolute left-4 sm:left-6 -bottom-6 transform -translate-x-1/2"
          initial={{ opacity: 0, scale: 0 }}
          whileInView={{ 
            opacity: 1, 
            scale: 1,
            transition: {
              duration: 0.4,
              delay: items.length * 0.1 + 0.3,
              type: "spring",
              stiffness: 400
            }
          }}
          viewport={{ once: true }}
          aria-hidden="true"
        >
          <div className="w-3 h-3 bg-primary rounded-full shadow-sm" />
        </motion.div>
      </div>
    </section>
  )
} 