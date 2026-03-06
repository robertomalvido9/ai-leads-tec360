import { NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { FirecrawlClient } from '@mendable/firecrawl-js'
import { Lead } from '@/lib/data'

// 12 diverse queries targeting Mexico City companies across multiple sectors
const ALL_QUERIES = [
  'empresas fintech Ciudad de México transformación digital autenticación IAM 2025',
  'bancos financieras México CDMX banca digital ciberseguridad identidad usuarios',
  'servicios financieros SOFOM crédito neobancos México CDMX seguridad regulación CNBV',
  'aseguradoras InsurTech empresas México CDMX digitalización clientes portal',
  'startups tecnología empresas SaaS Mexico CDMX ciberseguridad identidad digital',
  'retail ecommerce empresas grandes Ciudad de México digital millones clientes 2025',
  'telecomunicaciones internet empresas Mexico CDMX digital transformación usuarios',
  'logística cadena suministro empresas CDMX México transformación digital ERP',
  'salud hospitales privados clínicas Ciudad de México tecnología expediente digital',
  'manufactura industria empresas grandes Ciudad de México SAP ERP tecnología',
  'aerolíneas transporte aéreo empresas México CDMX digitalización pasajeros app',
  'educación universidad tecnología empresas México CDMX digital transformación',
]

export async function GET(request: Request) {
  const url = new URL(request.url)
  const batch = parseInt(url.searchParams.get('batch') ?? '0')

  const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
  const firecrawl = new FirecrawlClient({ apiKey: process.env.FIRECRAWL_API_KEY! })

  try {
    // Pick 4 queries for this batch, rotating through all 12
    const startIdx = (batch * 4) % ALL_QUERIES.length
    const queries = [
      ALL_QUERIES[startIdx % ALL_QUERIES.length],
      ALL_QUERIES[(startIdx + 1) % ALL_QUERIES.length],
      ALL_QUERIES[(startIdx + 2) % ALL_QUERIES.length],
      ALL_QUERIES[(startIdx + 3) % ALL_QUERIES.length],
    ]

    // Scrape search results
    const allSnippets: string[] = []

    let firstFirecrawlError: string | null = null

    for (const query of queries) {
      try {
        const result = await firecrawl.search(query, { limit: 5 })
        console.log('Firecrawl result keys:', Object.keys(result as object))
        // Firecrawl SDK v4+ returns results in result.data; older versions used result.web
        const r = result as Record<string, unknown>
        const webResults: Record<string, unknown>[] =
          (r.data as Record<string, unknown>[]) ??
          (r.web as Record<string, unknown>[]) ??
          (r.results as Record<string, unknown>[]) ??
          []
        console.log(`Query "${query.slice(0, 40)}" → ${webResults.length} results`)
        for (const i of webResults) {
          const snippet = `Fuente: ${String(i.url ?? '')}\nTítulo: ${String(i.title ?? '')}\nContenido: ${String(i.markdown ?? i.description ?? '').slice(0, 700)}`
          allSnippets.push(snippet)
        }
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e)
        console.error('Firecrawl query error:', msg)
        if (!firstFirecrawlError) firstFirecrawlError = msg
      }
    }

    if (allSnippets.length === 0) {
      const detail = firstFirecrawlError ?? 'No results returned'
      return NextResponse.json({ error: `Firecrawl error: ${detail}` }, { status: 502 })
    }

    const systemPrompt = `Eres un analista de inteligencia de ventas B2B para TEC360Cloud (tec360cloud.com), empresa de ciberseguridad e Identidad y Gestión de Acceso (IAM/CIAM) con sede en México sirviendo a LATAM.

TEC360Cloud representa: Okta, Auth0, CrowdStrike, Zscaler, Yubico, Jumio, Incode, LeanIX, SAP Incentive Management, Cornerstone.

Clientes ideales: Empresas medianas-grandes en Ciudad de México (CDMX) en sectores de Finanzas, Fintech, Retail, Tecnología, Salud, Manufactura, Aerolíneas, Telecomunicaciones, Seguros, Logística, Energía, Medios. Empresas con muchos usuarios digitales, iniciativas de transformación digital, o requerimientos de cumplimiento regulatorio (CNBV, NOM-024, LFPIORPI, PCI-DSS, SOX, CONDUSEF).

Califica cada empresa 0-100 basado en:
- industryFit (0-25): Finanzas/Fintech=25, Tecnología=24, Retail=20, Salud/Telecom=20, Manufactura=18, Logística/Medios=15, Otro=10
- companySize (0-25): Enterprise(10k+empleados)=25, Large(1k-10k)=20, Mid(200-1k)=14, Small=8
- digitalMaturity (0-25): Alta transformación digital=25, Media=17, Baja=10
- securityNeeds (0-25): Regulado/financiero=22+, Muchos usuarios/CIAM=18+, Básico=10`

    const userPrompt = `De estos resultados de búsqueda web, extrae hasta 15 empresas reales de Ciudad de México que sean buenos prospectos para los servicios IAM/CIAM/ciberseguridad de TEC360Cloud.

Resultados de búsqueda:
${allSnippets.join('\n\n---\n\n')}

Devuelve SOLO un array JSON válido (sin markdown, sin explicación). Cada objeto debe tener exactamente estos campos:
{
  "company": "Nombre completo de la empresa",
  "website": "https://...",
  "industry": "Industria en español",
  "size": "Enterprise|Large|Mid-Market",
  "country": "México",
  "city": "Ciudad de México",
  "employees": "Empleados aproximados ej. '5,000+'",
  "description": "Descripción de 1-2 oraciones en español",
  "score": número 0-100,
  "scoreBreakdown": { "industryFit": 0-25, "companySize": 0-25, "digitalMaturity": 0-25, "securityNeeds": 0-25 },
  "whyGoodFit": "2-3 oraciones en español explicando por qué necesitan IAM/CIAM/ciberseguridad",
  "suggestedSolution": "Productos TEC360 específicos que aplican (ej. Auth0, Okta, CrowdStrike)",
  "contactApproach": "1-2 oraciones en español con estrategia de acercamiento",
  "priority": "Hot|Warm|Cold",
  "contacts": [
    {
      "name": "Nombre completo del contacto",
      "title": "Título/Cargo (CISO, CTO, CIO, Director de TI, Director de Ciberseguridad, VP de Tecnología, etc.)",
      "email": "correo@dominio.com"
    }
  ]
}

Reglas:
- SOLO incluye empresas que tengan sede o presencia significativa en Ciudad de México (CDMX)
- Si la empresa es de LATAM pero opera en CDMX, inclúyela con city="Ciudad de México"
- NO incluyas empresas duplicadas o muy similares
- Asigna "Hot" si score >= 85, "Warm" si 65-84, "Cold" si < 65
- Para "contacts": incluye 2-3 personas que tendrían poder de decisión para aprobar un proyecto de ciberseguridad/IAM en esa empresa. Usa nombres mexicanos realistas y el dominio de correo de la empresa. Roles prioritarios: CISO, CTO, CIO, Director de Ciberseguridad, Director de TI, Director de Transformación Digital, VP de Ingeniería`

    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 8000,
      messages: [{ role: 'user', content: userPrompt }],
      system: systemPrompt,
    })

    const raw = (message.content[0] as { type: string; text: string }).text.trim()
    const jsonText = raw.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '').trim()
    const parsed: Omit<Lead, 'id' | 'scrapedAt'>[] = JSON.parse(jsonText)

    const scrapedAt = new Date().toISOString().slice(0, 10)
    const leads: Lead[] = parsed.map((l, i) => ({
      ...l,
      id: `AI${batch}${String(Date.now()).slice(-5)}${i}`,
      scrapedAt,
    }))

    return NextResponse.json({ leads, scrapedAt, batch })
  } catch (err) {
    console.error('Leads API error:', err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Internal error' },
      { status: 500 }
    )
  }
}
