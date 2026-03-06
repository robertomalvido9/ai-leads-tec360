'use client'

import { useState, useMemo, useEffect, useCallback } from 'react'
import {
  Bot,
  Flame,
  Snowflake,
  Search,
  SlidersHorizontal,
  RefreshCw,
  Building2,
  Globe,
  Users,
  Lightbulb,
  ChevronRight,
  X,
  TrendingUp,
  Shield,
  Zap,
  Target,
  ExternalLink,
  CheckCircle2,
  Loader2,
  BarChart3,
  Download,
  Trash2,
  MapPin,
  Mail,
  Copy,
  UserCheck,
} from 'lucide-react'
import {
  seedLeads,
  Lead,
  Priority,
  getScoreColor,
  getScoreLabel,
  getPriorityConfig,
  industryOptions,
  priorityOptions,
  LEAD_GOAL,
} from '@/lib/data'

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)
  function handleCopy() {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }
  return (
    <button
      onClick={handleCopy}
      className="ml-1 p-0.5 rounded hover:bg-[#f1f5f9] text-[#94a3b8] hover:text-[#0066cc] transition-colors flex-shrink-0"
      title="Copiar correo"
    >
      {copied ? <CheckCircle2 size={11} className="text-emerald-500" /> : <Copy size={11} />}
    </button>
  )
}

const STORAGE_KEY = 'tec360_leads_cdmx'
const DATA_VERSION = 'v2' // bump this to force-reset localStorage

// ── Score Ring ─────────────────────────────────────────────────────────────────
function ScoreRing({ score }: { score: number }) {
  const r = 22
  const circ = 2 * Math.PI * r
  const fill = (score / 100) * circ
  const c = getScoreColor(score)
  const strokeColor =
    score >= 85 ? '#10b981' : score >= 70 ? '#0066cc' : score >= 55 ? '#f59e0b' : '#94a3b8'
  return (
    <div className="relative flex items-center justify-center w-14 h-14 flex-shrink-0">
      <svg width="56" height="56" className="-rotate-90">
        <circle cx="28" cy="28" r={r} stroke="#e2e8f0" strokeWidth="4" fill="none" />
        <circle
          cx="28" cy="28" r={r}
          stroke={strokeColor}
          strokeWidth="4" fill="none"
          strokeDasharray={`${fill} ${circ}`}
          strokeLinecap="round"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className={`text-sm font-bold leading-none ${c.text}`}>{score}</span>
      </div>
    </div>
  )
}

// ── Score Bar ──────────────────────────────────────────────────────────────────
function ScoreBar({ label, value, max = 25, color }: { label: string; value: number; max?: number; color: string }) {
  const pct = Math.round((value / max) * 100)
  return (
    <div>
      <div className="flex justify-between items-center mb-1">
        <span className="text-[10px] text-[#64748b] font-medium">{label}</span>
        <span className="text-[10px] font-bold text-[#1e293b]">{value}/{max}</span>
      </div>
      <div className="h-1.5 bg-[#f1f5f9] rounded-full overflow-hidden">
        <div className={`h-full rounded-full transition-all ${color}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  )
}

// ── Priority Badge ─────────────────────────────────────────────────────────────
function PriorityBadge({ priority }: { priority: Priority }) {
  const cfg = getPriorityConfig(priority)
  const icons = { Hot: Flame, Warm: TrendingUp, Cold: Snowflake }
  const Icon = icons[priority]
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border ${cfg.text} ${cfg.bg} ${cfg.border}`}>
      <Icon size={9} />
      {priority}
    </span>
  )
}

// ── Detail Panel ───────────────────────────────────────────────────────────────
function DetailPanel({ lead, onClose }: { lead: Lead; onClose: () => void }) {
  const sc = getScoreColor(lead.score)
  const barColors = ['bg-emerald-500', 'bg-[#0066cc]', 'bg-violet-500', 'bg-amber-500']
  const breakdownItems = [
    { label: 'Ajuste de industria',      value: lead.scoreBreakdown.industryFit,    color: barColors[0] },
    { label: 'Tamaño de empresa',        value: lead.scoreBreakdown.companySize,     color: barColors[1] },
    { label: 'Madurez digital',          value: lead.scoreBreakdown.digitalMaturity, color: barColors[2] },
    { label: 'Necesidades de seguridad', value: lead.scoreBreakdown.securityNeeds,   color: barColors[3] },
  ]
  return (
    <div className="w-[360px] flex-shrink-0 border-l border-[#e2e8f0] bg-white flex flex-col overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-[#e2e8f0] flex-shrink-0">
        <p className="text-[10px] font-semibold text-[#94a3b8] uppercase tracking-wider">Análisis de Prospecto</p>
        <button onClick={onClose} className="w-7 h-7 rounded-lg hover:bg-[#f1f5f9] flex items-center justify-center text-[#94a3b8] hover:text-[#64748b] transition-colors">
          <X size={14} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto">
        {/* Identity */}
        <div className="px-5 py-5 border-b border-[#f1f5f9]">
          <div className="flex items-start gap-3 mb-3">
            <ScoreRing score={lead.score} />
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-bold text-[#1e293b] leading-snug">{lead.company}</h3>
              <p className="text-xs text-[#64748b] mt-0.5">{lead.industry}</p>
              <div className="flex items-center gap-1 mt-0.5 text-[10px] text-[#94a3b8]">
                <MapPin size={9} />
                <span>{lead.city}, {lead.country}</span>
              </div>
              <div className="flex items-center gap-1.5 mt-1.5">
                <PriorityBadge priority={lead.priority} />
                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${sc.text} ${sc.bg} ${sc.border}`}>
                  {getScoreLabel(lead.score)}
                </span>
              </div>
            </div>
          </div>
          <p className="text-xs text-[#64748b] leading-relaxed">{lead.description}</p>
        </div>

        {/* Score breakdown */}
        <div className="px-5 py-4 border-b border-[#f1f5f9]">
          <div className="flex items-center gap-1.5 mb-3">
            <BarChart3 size={12} className="text-[#0066cc]" />
            <p className="text-[10px] font-semibold text-[#94a3b8] uppercase tracking-wider">Desglose de Score</p>
          </div>
          <div className="space-y-2.5">
            {breakdownItems.map(item => (
              <ScoreBar key={item.label} label={item.label} value={item.value} color={item.color} />
            ))}
          </div>
        </div>

        {/* Why good fit */}
        <div className="px-5 py-4 border-b border-[#f1f5f9]">
          <div className="flex items-center gap-1.5 mb-2">
            <Target size={12} className="text-emerald-500" />
            <p className="text-[10px] font-semibold text-[#94a3b8] uppercase tracking-wider">Por qué es buen fit</p>
          </div>
          <p className="text-xs text-[#1e293b] leading-relaxed">{lead.whyGoodFit}</p>
        </div>

        {/* Suggested solution */}
        <div className="px-5 py-4 border-b border-[#f1f5f9]">
          <div className="flex items-center gap-1.5 mb-2">
            <Shield size={12} className="text-[#0066cc]" />
            <p className="text-[10px] font-semibold text-[#94a3b8] uppercase tracking-wider">Solución Sugerida</p>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {lead.suggestedSolution.split(',').map(s => (
              <span key={s.trim()} className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-[#0066cc]/10 text-[#0066cc] border border-[#0066cc]/20">
                {s.trim()}
              </span>
            ))}
          </div>
        </div>

        {/* Contact approach */}
        <div className="px-5 py-4 border-b border-[#f1f5f9]">
          <div className="flex items-center gap-1.5 mb-2">
            <Lightbulb size={12} className="text-amber-500" />
            <p className="text-[10px] font-semibold text-[#94a3b8] uppercase tracking-wider">Estrategia de Acercamiento</p>
          </div>
          <p className="text-xs text-[#1e293b] leading-relaxed">{lead.contactApproach}</p>
        </div>

        {/* Key contacts */}
        {lead.contacts && lead.contacts.length > 0 && (
          <div className="px-5 py-4 border-b border-[#f1f5f9]">
            <div className="flex items-center gap-1.5 mb-3">
              <UserCheck size={12} className="text-[#00d4aa]" />
              <p className="text-[10px] font-semibold text-[#94a3b8] uppercase tracking-wider">Contactos Clave</p>
            </div>
            <div className="space-y-3">
              {lead.contacts.map((c, i) => (
                <div key={i} className="bg-[#f8fafc] rounded-lg p-3 border border-[#f1f5f9]">
                  <p className="text-xs font-bold text-[#1e293b]">{c.name}</p>
                  <p className="text-[10px] text-[#0066cc] font-medium mt-0.5">{c.title}</p>
                  <div className="flex items-center gap-1 mt-1.5">
                    <Mail size={10} className="text-[#94a3b8] flex-shrink-0" />
                    <a
                      href={`mailto:${c.email}`}
                      className="text-[10px] text-[#64748b] hover:text-[#0066cc] hover:underline transition-colors"
                    >
                      {c.email}
                    </a>
                    <CopyButton text={c.email} />
                  </div>
                  {c.linkedin && (
                    <div className="flex items-center gap-1 mt-1">
                      <Building2 size={10} className="text-[#94a3b8] flex-shrink-0" />
                      <a href={c.linkedin} target="_blank" rel="noopener noreferrer" className="text-[10px] text-[#0066cc] hover:underline flex items-center gap-0.5">
                        LinkedIn <ExternalLink size={8} />
                      </a>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Meta */}
        <div className="px-5 py-4 space-y-2">
          <div className="flex items-center gap-2 text-xs text-[#64748b]">
            <Users size={11} className="flex-shrink-0" />
            <span>{lead.employees} empleados</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-[#64748b]">
            <Globe size={11} className="flex-shrink-0" />
            <a href={lead.website} target="_blank" rel="noopener noreferrer" className="text-[#0066cc] hover:underline flex items-center gap-1">
              {lead.website.replace('https://', '')} <ExternalLink size={9} />
            </a>
          </div>
          {lead.linkedinUrl && (
            <div className="flex items-center gap-2 text-xs text-[#64748b]">
              <Building2 size={11} className="flex-shrink-0" />
              <a href={lead.linkedinUrl} target="_blank" rel="noopener noreferrer" className="text-[#0066cc] hover:underline flex items-center gap-1">
                LinkedIn <ExternalLink size={9} />
              </a>
            </div>
          )}
          <p className="text-[10px] text-[#94a3b8] mt-1">Analizado: {lead.scrapedAt}</p>
        </div>
      </div>

      {/* Footer */}
      <div className="px-5 py-4 border-t border-[#e2e8f0] flex-shrink-0">
        <div className="flex gap-2">
          <a
            href={`mailto:${lead.contacts?.[0]?.email ?? ''}?subject=Solución de Ciberseguridad IAM para ${lead.company} – TEC360Cloud&body=Estimado/a ${lead.contacts?.[0]?.name ?? 'equipo de tecnología'},%0A%0AMi nombre es [Tu nombre] de TEC360Cloud (tec360cloud.com).%0A%0A${lead.contactApproach}%0A%0ANos especializamos en soluciones de Identidad y Ciberseguridad: ${lead.suggestedSolution}.%0A%0AMe encantaría agendar una llamada de 30 minutos para presentarles una propuesta personalizada para ${lead.company}.%0A%0ASaludos,%0A[Tu nombre]%0ATEC360Cloud`}
            className="flex-1 py-2 text-xs font-semibold rounded-lg bg-[#0066cc] hover:bg-[#0052a3] text-white transition-colors text-center"
          >
            Contactar
          </a>
          <a
            href={lead.website}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 py-2 text-xs font-medium rounded-lg border border-[#e2e8f0] text-[#64748b] hover:bg-[#f8fafc] transition-colors text-center"
          >
            Ver empresa
          </a>
        </div>
      </div>
    </div>
  )
}

// ── Lead Card ──────────────────────────────────────────────────────────────────
function LeadCard({ lead, isActive, onClick }: { lead: Lead; isActive: boolean; onClick: () => void }) {
  const sc = getScoreColor(lead.score)
  return (
    <div
      onClick={onClick}
      className={`group bg-white rounded-xl border cursor-pointer transition-all hover:shadow-md ${
        isActive ? 'border-[#0066cc]/40 shadow-md bg-[#0066cc]/5' : 'border-[#e2e8f0] hover:border-[#0066cc]/30'
      }`}
    >
      <div className="p-4">
        <div className="flex items-start gap-3">
          <ScoreRing score={lead.score} />
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <h3 className="text-sm font-bold text-[#1e293b] truncate">{lead.company}</h3>
                <p className="text-xs text-[#64748b] truncate">{lead.industry}</p>
              </div>
              <PriorityBadge priority={lead.priority} />
            </div>
            <div className="flex items-center gap-1.5 mt-2 flex-wrap">
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${sc.text} ${sc.bg} ${sc.border}`}>
                {getScoreLabel(lead.score)}
              </span>
              <span className="text-[10px] text-[#94a3b8]">·</span>
              <span className="text-[10px] text-[#64748b] flex items-center gap-0.5">
                <MapPin size={8} /> {lead.city}
              </span>
              <span className="text-[10px] text-[#94a3b8]">·</span>
              <span className="text-[10px] text-[#64748b]">{lead.employees}</span>
            </div>
          </div>
          <ChevronRight size={14} className={`flex-shrink-0 mt-1 transition-colors ${isActive ? 'text-[#0066cc]' : 'text-[#e2e8f0] group-hover:text-[#94a3b8]'}`} />
        </div>
        <p className="text-xs text-[#64748b] mt-3 line-clamp-2 leading-relaxed">{lead.description}</p>
        <div className="mt-3 flex items-center justify-between">
          <div className="flex flex-wrap gap-1">
            {lead.suggestedSolution.split(',').slice(0, 3).map(s => (
              <span key={s.trim()} className="text-[9px] font-semibold px-1.5 py-0.5 rounded bg-[#0066cc]/10 text-[#0066cc]">
                {s.trim()}
              </span>
            ))}
          </div>
          {lead.contacts && lead.contacts.length > 0 && (
            <span className="flex items-center gap-1 text-[9px] text-[#00d4aa] font-semibold flex-shrink-0">
              <UserCheck size={9} />
              {lead.contacts.length} contacto{lead.contacts.length > 1 ? 's' : ''}
            </span>
          )}
        </div>
      </div>
    </div>
  )
}

// ── Stat Pill ──────────────────────────────────────────────────────────────────
function StatPill({ icon: Icon, label, value, color, bg }: {
  icon: React.ElementType; label: string; value: number | string; color: string; bg: string
}) {
  return (
    <div className="flex items-center gap-2.5 px-4 py-3 rounded-xl bg-white border border-[#e2e8f0] shadow-sm">
      <div className={`w-8 h-8 rounded-lg ${bg} flex items-center justify-center flex-shrink-0`}>
        <Icon size={15} className={color} />
      </div>
      <div>
        <p className="text-xl font-bold text-[#1e293b] leading-tight">{value}</p>
        <p className="text-xs text-[#64748b]">{label}</p>
      </div>
    </div>
  )
}

// ── Progress Bar ──────────────────────────────────────────────────────────────
function ProgressBar({ current, goal }: { current: number; goal: number }) {
  const pct = Math.min(100, Math.round((current / goal) * 100))
  const color = pct >= 100 ? 'bg-emerald-500' : pct >= 70 ? 'bg-[#0066cc]' : pct >= 40 ? 'bg-amber-500' : 'bg-rose-500'
  return (
    <div className="bg-white rounded-xl border border-[#e2e8f0] shadow-sm px-5 py-4">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Target size={14} className="text-[#0066cc]" />
          <span className="text-sm font-bold text-[#1e293b]">Progreso: {current} / {goal} leads</span>
          {pct >= 100 && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-[10px] font-bold text-emerald-700">
              <CheckCircle2 size={9} /> META ALCANZADA
            </span>
          )}
        </div>
        <span className="text-sm font-bold text-[#0066cc]">{pct}%</span>
      </div>
      <div className="h-3 bg-[#f1f5f9] rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-700 ${color}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      {pct < 100 && (
        <p className="text-[10px] text-[#94a3b8] mt-1.5">
          Faltan {goal - current} leads · Sigue escaneando con IA para completar la meta
        </p>
      )}
    </div>
  )
}

// ── Main Dashboard ─────────────────────────────────────────────────────────────
export default function Dashboard() {
  const [allLeads, setAllLeads] = useState<Lead[]>([])
  const [hydrated, setHydrated] = useState(false)
  const [search, setSearch] = useState('')
  const [priorityFilter, setPriorityFilter] = useState<Priority | 'All'>('All')
  const [industryFilter, setIndustryFilter] = useState<string>('All')
  const [minScore, setMinScore] = useState(0)
  const [selected, setSelected] = useState<Lead | null>(null)
  const [scanning, setScanning] = useState(false)
  const [scanMsg, setScanMsg] = useState('')
  const [scanBatch, setScanBatch] = useState(0)

  // Load from localStorage (client-side only)
  useEffect(() => {
    const savedVersion = localStorage.getItem(STORAGE_KEY + '_version')
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved && savedVersion === DATA_VERSION) {
      try {
        const parsed: Lead[] = JSON.parse(saved)
        setAllLeads(parsed.length > 0 ? parsed : seedLeads)
        const nonSeed = parsed.filter(l => !l.id.startsWith('S')).length
        setScanBatch(Math.floor(nonSeed / 12))
      } catch {
        setAllLeads(seedLeads)
      }
    } else {
      // New version: clear old cache, load fresh seed data
      localStorage.removeItem(STORAGE_KEY)
      localStorage.setItem(STORAGE_KEY + '_version', DATA_VERSION)
      setAllLeads(seedLeads)
    }
    setHydrated(true)
  }, [])

  // Save to localStorage on change
  useEffect(() => {
    if (hydrated && allLeads.length > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(allLeads))
    }
  }, [allLeads, hydrated])

  const allIndustries = useMemo(() => {
    const industries = [...new Set(allLeads.map(l => l.industry))].sort()
    return industries
  }, [allLeads])

  const filtered = useMemo(() => {
    let rows = [...allLeads]
    if (search) {
      const q = search.toLowerCase()
      rows = rows.filter(l =>
        l.company.toLowerCase().includes(q) ||
        l.industry.toLowerCase().includes(q) ||
        l.city.toLowerCase().includes(q) ||
        l.suggestedSolution.toLowerCase().includes(q)
      )
    }
    if (priorityFilter !== 'All') rows = rows.filter(l => l.priority === priorityFilter)
    if (industryFilter !== 'All') rows = rows.filter(l => l.industry === industryFilter)
    if (minScore > 0) rows = rows.filter(l => l.score >= minScore)
    return rows.sort((a, b) => b.score - a.score)
  }, [allLeads, search, priorityFilter, industryFilter, minScore])

  const counts = useMemo(() => ({
    total: allLeads.length,
    hot: allLeads.filter(l => l.priority === 'Hot').length,
    warm: allLeads.filter(l => l.priority === 'Warm').length,
    cold: allLeads.filter(l => l.priority === 'Cold').length,
    avgScore: allLeads.length > 0
      ? Math.round(allLeads.reduce((s, l) => s + l.score, 0) / allLeads.length)
      : 0,
  }), [allLeads])

  const handleScan = useCallback(async () => {
    setScanning(true)
    setScanMsg('Buscando empresas en CDMX con Firecrawl…')
    try {
      const res = await fetch(`/api/leads?batch=${scanBatch}`)
      setScanMsg('Calificando prospectos con Claude IA…')
      if (!res.ok) throw new Error(`Error ${res.status}`)
      const data: { leads: Lead[]; scrapedAt: string; batch: number } = await res.json()
      if (data.leads?.length) {
        setAllLeads(prev => {
          const existingWebsites = new Set(prev.map(l => l.website.toLowerCase()))
          const newOnes = data.leads.filter(l => !existingWebsites.has(l.website.toLowerCase()))
          return [...prev, ...newOnes]
        })
        setScanBatch(b => b + 1)
        setScanMsg(`✓ ${data.leads.length} leads encontrados y calificados`)
      } else {
        setScanMsg('No se encontraron leads nuevos. Intenta de nuevo.')
      }
    } catch {
      setScanMsg('Error al escanear. Verifica las API keys en .env.local')
    } finally {
      setScanning(false)
      setTimeout(() => setScanMsg(''), 6000)
    }
  }, [scanBatch])

  function handleExport() {
    const headers = ['Empresa', 'Website', 'Industria', 'Ciudad', 'Empleados', 'Score', 'Prioridad', 'Solución Sugerida', 'Por qué es buen fit', 'Estrategia de acercamiento']
    const rows = allLeads.map(l => [
      `"${l.company}"`,
      l.website,
      `"${l.industry}"`,
      l.city,
      l.employees,
      l.score,
      l.priority,
      `"${l.suggestedSolution.replace(/"/g, '""')}"`,
      `"${l.whyGoodFit.replace(/"/g, '""')}"`,
      `"${l.contactApproach.replace(/"/g, '""')}"`,
    ].join(','))
    const csv = [headers.join(','), ...rows].join('\n')
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `tec360-leads-cdmx-${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  function handleClear() {
    if (confirm('¿Resetear todos los leads y volver a los 30 iniciales?')) {
      setAllLeads(seedLeads)
      setScanBatch(0)
      setSelected(null)
      localStorage.removeItem(STORAGE_KEY)
    }
  }

  if (!hydrated) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 size={24} className="animate-spin text-[#0066cc]" />
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Header */}
      <header className="flex-shrink-0 flex items-center justify-between px-6 py-3.5 border-b border-[#e2e8f0] bg-white/90 backdrop-blur-md z-10">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-[#0066cc]/10 flex items-center justify-center">
            <Bot size={18} className="text-[#0066cc]" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-[#1e293b]">AI Leads TEC360</h1>
            <p className="text-xs text-[#94a3b8]">
              100 prospectos calificados · Ciudad de México · {allLeads.length} encontrados
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {scanMsg && (
            <span className="text-xs text-[#64748b] bg-[#f8fafc] border border-[#e2e8f0] rounded-lg px-3 py-1.5 flex items-center gap-1.5 max-w-xs">
              {scanning ? <Loader2 size={12} className="animate-spin flex-shrink-0" /> : <CheckCircle2 size={12} className="text-emerald-500 flex-shrink-0" />}
              <span className="truncate">{scanMsg}</span>
            </span>
          )}
          <button
            onClick={handleExport}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-[#e2e8f0] text-xs font-medium text-[#64748b] hover:bg-[#f8fafc] transition-colors"
          >
            <Download size={13} />
            Exportar CSV
          </button>
          <button
            onClick={handleClear}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-[#e2e8f0] text-xs font-medium text-[#94a3b8] hover:text-rose-600 hover:border-rose-200 hover:bg-rose-50 transition-colors"
            title="Resetear leads"
          >
            <Trash2 size={13} />
          </button>
          <button
            onClick={handleScan}
            disabled={scanning || allLeads.length >= LEAD_GOAL}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#0066cc] hover:bg-[#0052a3] disabled:opacity-60 disabled:cursor-not-allowed transition-colors text-xs font-semibold text-white"
          >
            {scanning ? <Loader2 size={13} className="animate-spin" /> : <RefreshCw size={13} />}
            {scanning ? 'Escaneando…' : allLeads.length >= LEAD_GOAL ? 'Meta alcanzada' : 'Escanear con IA'}
          </button>
        </div>
      </header>

      {/* Body */}
      <div className="flex flex-1 min-h-0 overflow-hidden">
        {/* Main content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">

          {/* Progress bar */}
          <ProgressBar current={allLeads.length} goal={LEAD_GOAL} />

          {/* Summary stats */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            <StatPill icon={Zap}        label="Score promedio" value={counts.avgScore} color="text-[#0066cc]"  bg="bg-[#0066cc]/10" />
            <StatPill icon={Flame}      label="Hot leads"      value={counts.hot}      color="text-rose-600"  bg="bg-rose-50"      />
            <StatPill icon={TrendingUp} label="Warm leads"     value={counts.warm}     color="text-amber-600" bg="bg-amber-50"     />
            <StatPill icon={Snowflake}  label="Cold leads"     value={counts.cold}     color="text-sky-600"   bg="bg-sky-50"       />
            <StatPill icon={MapPin}     label="En CDMX"        value={allLeads.filter(l => l.city === 'Ciudad de México').length} color="text-[#00d4aa]" bg="bg-emerald-50" />
          </div>

          {/* AI info banner */}
          <div className="flex items-start gap-3 p-4 bg-[#0066cc]/5 border border-[#0066cc]/15 rounded-xl">
            <Bot size={16} className="text-[#0066cc] flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-semibold text-[#0066cc] mb-0.5">Potenciado por Claude AI + Firecrawl</p>
              <p className="text-xs text-[#64748b] leading-relaxed">
                Prospectos investigados y calificados con IA para TEC360Cloud, basados en su perfil de cliente ideal: empresas medianas-grandes en CDMX que necesiten IAM, CIAM o ciberseguridad. Cada escaneo busca ~15 nuevos prospectos en tiempo real. ¡Escanea hasta completar los 100!
              </p>
            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94a3b8]" />
              <input
                type="text"
                placeholder="Buscar empresa, industria, solución…"
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 text-sm rounded-lg bg-white border border-[#e2e8f0] text-[#1e293b] placeholder-[#94a3b8] focus:outline-none focus:border-[#0066cc]/50 transition-colors shadow-sm"
              />
            </div>
            <div className="flex items-center gap-2 flex-shrink-0 flex-wrap">
              <SlidersHorizontal size={14} className="text-[#94a3b8]" />
              <select
                value={priorityFilter}
                onChange={e => setPriorityFilter(e.target.value as Priority | 'All')}
                className="px-3 py-2.5 text-sm rounded-lg bg-white border border-[#e2e8f0] text-[#64748b] focus:outline-none focus:border-[#0066cc]/50 transition-colors cursor-pointer shadow-sm"
              >
                <option value="All">Todas las prioridades</option>
                {priorityOptions.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
              <select
                value={industryFilter}
                onChange={e => setIndustryFilter(e.target.value)}
                className="px-3 py-2.5 text-sm rounded-lg bg-white border border-[#e2e8f0] text-[#64748b] focus:outline-none focus:border-[#0066cc]/50 transition-colors cursor-pointer shadow-sm"
              >
                <option value="All">Todas las industrias</option>
                {allIndustries.map(i => <option key={i} value={i}>{i}</option>)}
              </select>
              <select
                value={minScore}
                onChange={e => setMinScore(Number(e.target.value))}
                className="px-3 py-2.5 text-sm rounded-lg bg-white border border-[#e2e8f0] text-[#64748b] focus:outline-none focus:border-[#0066cc]/50 transition-colors cursor-pointer shadow-sm"
              >
                <option value={0}>Score: todos</option>
                <option value={85}>Score ≥ 85</option>
                <option value={70}>Score ≥ 70</option>
                <option value={55}>Score ≥ 55</option>
              </select>
            </div>
          </div>

          {/* Results count */}
          <div className="flex items-center justify-between">
            <p className="text-xs text-[#94a3b8]">
              Mostrando <span className="text-[#64748b] font-semibold">{filtered.length}</span> de {allLeads.length} prospectos
            </p>
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <p className="text-[10px] text-[#94a3b8]">Datos actualizados en tiempo real</p>
            </div>
          </div>

          {/* Cards grid */}
          {filtered.length === 0 ? (
            <div className="py-20 text-center">
              <Bot size={40} className="text-[#e2e8f0] mx-auto mb-3" />
              <p className="text-sm text-[#94a3b8]">No se encontraron prospectos con esos filtros.</p>
              <p className="text-xs text-[#94a3b8] mt-1">Ajusta los filtros o escanea más con IA.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 pb-4">
              {filtered.map(lead => (
                <LeadCard
                  key={lead.id}
                  lead={lead}
                  isActive={selected?.id === lead.id}
                  onClick={() => setSelected(prev => prev?.id === lead.id ? null : lead)}
                />
              ))}
            </div>
          )}
        </div>

        {/* Detail panel */}
        {selected && (
          <DetailPanel lead={selected} onClose={() => setSelected(null)} />
        )}
      </div>
    </div>
  )
}
