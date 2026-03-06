'use client'

import { LayoutDashboard, Bot, MapPin } from 'lucide-react'

export default function Sidebar() {
  return (
    <aside className="w-56 flex-shrink-0 flex flex-col bg-[#0a1628] text-white">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-white/10">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#0066cc] flex items-center justify-center flex-shrink-0">
            <span className="text-white font-black text-xs leading-none">T3</span>
          </div>
          <div>
            <p className="text-sm font-bold leading-none text-white">TEC360</p>
            <p className="text-[10px] text-white/50 leading-tight mt-0.5">AI Lead Intelligence</p>
          </div>
        </div>
      </div>

      {/* Location badge */}
      <div className="px-4 py-3 border-b border-white/10">
        <div className="flex items-center gap-2 px-3 py-2 bg-[#0066cc]/20 rounded-lg">
          <MapPin size={11} className="text-[#00d4aa] flex-shrink-0" />
          <div>
            <p className="text-[10px] font-semibold text-[#00d4aa]">Ciudad de México</p>
            <p className="text-[9px] text-white/40">Mercado objetivo</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        <div className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg bg-[#0066cc]/20 text-white cursor-default">
          <LayoutDashboard size={14} className="text-[#0066cc]" />
          <span className="text-xs font-semibold">Dashboard</span>
        </div>
        <div className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-white/50 cursor-default">
          <Bot size={14} />
          <span className="text-xs">AI Scanner</span>
        </div>
      </nav>

      {/* Footer */}
      <div className="px-4 pb-5 space-y-3">
        <div className="px-3 py-3 rounded-lg bg-white/5 border border-white/10">
          <p className="text-[10px] font-semibold text-white/60 mb-1">Potenciado por</p>
          <div className="flex flex-col gap-1">
            <span className="text-[10px] text-[#00d4aa] font-medium">Claude AI (Anthropic)</span>
            <span className="text-[10px] text-[#0066cc] font-medium">Firecrawl Search</span>
          </div>
        </div>
        <p className="text-[9px] text-white/20 text-center">tec360cloud.com © 2026</p>
      </div>
    </aside>
  )
}
