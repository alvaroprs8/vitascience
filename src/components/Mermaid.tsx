"use client";

import mermaid from 'mermaid'
import React, { useEffect, useRef } from 'react'

type MermaidProps = { chart: string }

export default function Mermaid({ chart }: MermaidProps) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    mermaid.initialize({ startOnLoad: false, theme: 'default' })
    let isMounted = true
    const render = async () => {
      try {
        const { svg } = await mermaid.render(`mmd-${Math.random().toString(36).slice(2)}`, chart)
        if (isMounted && ref.current) {
          ref.current.innerHTML = svg
        }
      } catch {
        if (isMounted && ref.current) {
          ref.current.textContent = 'Falha ao renderizar diagrama.'
        }
      }
    }
    render()
    return () => { isMounted = false }
  }, [chart])

  return <div ref={ref} className="overflow-auto rounded-md border bg-white p-4" />
}


