import { useState, useEffect } from 'react'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
} from 'recharts'

// ─── Data ────────────────────────────────────────────────────────────────────

const REGIONS = [
  { id: 'SEA', name: 'Southeast Asia', risk: 'critical', score: 94, cases: 18420, delta: +12.4, active: 3 },
  { id: 'WAF', name: 'West Africa', risk: 'critical', score: 88, cases: 11203, delta: +8.7, active: 2 },
  { id: 'SAM', name: 'South America', risk: 'high', score: 71, cases: 6847, delta: +5.2, active: 2 },
  { id: 'SAS', name: 'South Asia', risk: 'high', score: 66, cases: 5390, delta: +3.1, active: 1 },
  { id: 'EAF', name: 'East Africa', risk: 'moderate', score: 48, cases: 2104, delta: +1.8, active: 1 },
  { id: 'MEA', name: 'Middle East', risk: 'moderate', score: 41, cases: 1672, delta: -0.3, active: 1 },
  { id: 'EUR', name: 'Europe', risk: 'low', score: 18, cases: 543, delta: -1.2, active: 0 },
  { id: 'NAM', name: 'North America', risk: 'low', score: 12, cases: 298, delta: -2.1, active: 0 },
]

const ALERTS = [
  {
    id: 1, level: 'critical', time: '14:23 UTC', region: 'Thailand',
    title: 'Novel Influenza A subtype detected',
    body: 'H5N9 variant identified in Chiang Rai province. Sustained human-to-human transmission confirmed. WHO notified.',
    pathogen: 'Influenza A (H5N9)', cases: 847,
  },
  {
    id: 2, level: 'critical', time: '13:51 UTC', region: 'Nigeria',
    title: 'Ebola Sudan cluster — containment breach',
    body: '3 new cases outside quarantine perimeter in Borno State. Contact tracing teams deployed.',
    pathogen: 'Ebola Virus (Sudan)', cases: 34,
  },
  {
    id: 3, level: 'high', time: '12:44 UTC', region: 'Brazil',
    title: 'Dengue serotype 3 surge — São Paulo',
    body: 'DENV-3 cases increased 340% over 14-day rolling window. Hospital capacity at 87%.',
    pathogen: 'Dengue (DENV-3)', cases: 2341,
  },
  {
    id: 4, level: 'high', time: '11:17 UTC', region: 'Bangladesh',
    title: 'Nipah virus spillover — cattle link',
    body: 'Serological evidence of NiV in livestock markets near Dhaka. Human surveillance activated.',
    pathogen: 'Nipah Virus', cases: 12,
  },
  {
    id: 5, level: 'moderate', time: '09:33 UTC', region: 'Kenya',
    title: 'Rift Valley Fever — Turkana County',
    body: 'Vector surveillance shows Aedes mosquito density above threshold. Advisory issued.',
    pathogen: 'Rift Valley Fever', cases: 68,
  },
  {
    id: 6, level: 'moderate', time: '08:05 UTC', region: 'Jordan',
    title: 'MERS-CoV — camel farm cluster',
    body: '4 laboratory-confirmed cases linked to single farm. Secondary attack rate under investigation.',
    pathogen: 'MERS-CoV', cases: 4,
  },
]

const TREND_DATA = [
  { day: 'Jul 22', cases: 12400, alerts: 4 },
  { day: 'Jul 23', cases: 13100, alerts: 5 },
  { day: 'Jul 24', cases: 14800, alerts: 6 },
  { day: 'Jul 25', cases: 15200, alerts: 5 },
  { day: 'Jul 26', cases: 16900, alerts: 7 },
  { day: 'Jul 27', cases: 18100, alerts: 8 },
  { day: 'Jul 28', cases: 19400, alerts: 9 },
]

const PATHOGEN_DATA = [
  { name: 'Influenza A', count: 8420, trend: +18.2 },
  { name: 'Dengue', count: 6341, trend: +11.4 },
  { name: 'Ebola Sudan', count: 34, trend: +42.0 },
  { name: 'Nipah', count: 12, trend: +200.0 },
  { name: 'MERS-CoV', count: 84, trend: -3.1 },
  { name: 'Rift Valley Fever', count: 68, trend: +8.7 },
  { name: 'Mpox', count: 432, trend: +1.2 },
]

const TICKER_ITEMS = [
  '🔴 CRITICAL — H5N9 human cluster confirmed, Thailand',
  '🔴 CRITICAL — Ebola Sudan containment breach, Nigeria',
  '🟡 HIGH — Dengue DENV-3 surge 340%, São Paulo',
  '🟡 HIGH — Nipah livestock spillover, Bangladesh',
  '🟠 MODERATE — RVF vector alert, Kenya',
  '🟢 WHO PHEIC monitoring active — 6 pathogens under observation',
  '📡 Genomic surveillance: 1,284 sequences processed today',
  '🛰️ Satellite-linked case reports: 47 new nodes active',
]

const MAP_HOTSPOTS = [
  { x: 72, y: 42, risk: 'critical', label: 'Thailand', size: 16 },
  { x: 47, y: 52, risk: 'critical', label: 'Nigeria', size: 12 },
  { x: 35, y: 62, risk: 'high', label: 'Brazil', size: 10 },
  { x: 67, y: 40, risk: 'high', label: 'Bangladesh', size: 8 },
  { x: 53, y: 55, risk: 'moderate', label: 'Kenya', size: 7 },
  { x: 57, y: 38, risk: 'moderate', label: 'Jordan', size: 5 },
  { x: 74, y: 30, risk: 'high', label: 'China', size: 9 },
  { x: 42, y: 30, risk: 'low', label: 'Europe', size: 4 },
]

// ─── Helpers ─────────────────────────────────────────────────────────────────

const riskColor = (r: string) => {
  if (r === 'critical') return '#ff3b5c'
  if (r === 'high') return '#f5a623'
  if (r === 'moderate') return '#f5d623'
  return '#00e87a'
}

const riskBg = (r: string) => {
  if (r === 'critical') return 'rgba(255,59,92,0.12)'
  if (r === 'high') return 'rgba(245,166,35,0.12)'
  if (r === 'moderate') return 'rgba(245,214,35,0.1)'
  return 'rgba(0,232,122,0.1)'
}

const riskLabel = (r: string) => r.toUpperCase()

function LiveClock() {
  const [time, setTime] = useState(new Date())
  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(t)
  }, [])
  return (
    <span style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: '#6b7fa0', letterSpacing: '0.05em' }}>
      {time.toISOString().replace('T', ' ').slice(0, 19)} UTC
    </span>
  )
}

function RiskBadge({ risk }: { risk: string }) {
  return (
    <span style={{
      fontFamily: 'var(--font-mono)',
      fontSize: 9,
      fontWeight: 700,
      letterSpacing: '0.1em',
      color: riskColor(risk),
      background: riskBg(risk),
      padding: '2px 6px',
      borderRadius: 2,
      border: `1px solid ${riskColor(risk)}33`,
    }}>
      {riskLabel(risk)}
    </span>
  )
}

function DeltaBadge({ v }: { v: number }) {
  const up = v >= 0
  return (
    <span style={{
      fontFamily: 'var(--font-mono)',
      fontSize: 10,
      color: up ? '#ff3b5c' : '#00e87a',
    }}>
      {up ? '▲' : '▼'} {Math.abs(v).toFixed(1)}%
    </span>
  )
}

// ─── Components ──────────────────────────────────────────────────────────────

function Header() {
  const [sysStatus] = useState('OPERATIONAL')
  return (
    <header style={{
      background: '#0d1729',
      borderBottom: '1px solid rgba(255,255,255,0.07)',
      padding: '0 24px',
      height: 56,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      position: 'sticky',
      top: 0,
      zIndex: 100,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{
          width: 32, height: 32, borderRadius: 6,
          background: 'linear-gradient(135deg, #ff3b5c, #ff7a3b)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 16,
        }}>🛡</div>
        <div>
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 15, letterSpacing: '-0.01em', color: '#e2eaf5' }}>
            HealthShield <span style={{ color: '#ff3b5c' }}>AI</span>
          </div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: '#6b7fa0', letterSpacing: '0.12em', marginTop: -1 }}>
            DISEASE OUTBREAK EARLY WARNING SYSTEM
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <div className="pulse-dot" style={{
            width: 6, height: 6, borderRadius: '50%',
            background: '#00e87a', flexShrink: 0,
          }} />
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: '#00e87a', letterSpacing: '0.08em' }}>
            {sysStatus}
          </span>
        </div>
        <div style={{ width: 1, height: 20, background: 'rgba(255,255,255,0.07)' }} />
        <div style={{ display: 'flex', gap: 16 }}>
          {['DASHBOARD', 'MAP', 'PATHOGENS', 'REPORTS', 'SETTINGS'].map(item => (
            <button key={item} style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 10,
              letterSpacing: '0.08em',
              color: item === 'DASHBOARD' ? '#e2eaf5' : '#6b7fa0',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '4px 0',
              borderBottom: item === 'DASHBOARD' ? '1px solid #ff3b5c' : '1px solid transparent',
            }}>
              {item}
            </button>
          ))}
        </div>
        <div style={{ width: 1, height: 20, background: 'rgba(255,255,255,0.07)' }} />
        <LiveClock />
        <div style={{
          width: 28, height: 28, borderRadius: '50%',
          background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 11, fontWeight: 700, color: '#fff', fontFamily: 'var(--font-display)',
          cursor: 'pointer',
        }}>EP</div>
      </div>
    </header>
  )
}

function AlertTicker() {
  const repeated = [...TICKER_ITEMS, ...TICKER_ITEMS]
  return (
    <div style={{
      background: '#0a0f1e',
      borderBottom: '1px solid rgba(255,59,92,0.2)',
      height: 32,
      overflow: 'hidden',
      display: 'flex',
      alignItems: 'center',
    }}>
      <div style={{
        flexShrink: 0,
        padding: '0 12px',
        fontFamily: 'var(--font-mono)',
        fontSize: 9,
        fontWeight: 700,
        letterSpacing: '0.12em',
        color: '#ff3b5c',
        borderRight: '1px solid rgba(255,59,92,0.2)',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        background: 'rgba(255,59,92,0.08)',
        whiteSpace: 'nowrap',
      }}>
        ⚡ LIVE ALERTS
      </div>
      <div style={{ overflow: 'hidden', flex: 1 }}>
        <div className="ticker-track" style={{
          display: 'flex',
          gap: 48,
          whiteSpace: 'nowrap',
          width: 'max-content',
        }}>
          {repeated.map((item, i) => (
            <span key={i} style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 10,
              color: '#a0b2cc',
              letterSpacing: '0.04em',
            }}>
              {item}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}

function KpiCard({ label, value, unit, sub, accent }: {
  label: string; value: string; unit?: string; sub: string; accent: string
}) {
  return (
    <div style={{
      background: '#0d1729',
      border: '1px solid rgba(255,255,255,0.07)',
      borderRadius: 6,
      padding: '14px 18px',
      position: 'relative',
      overflow: 'hidden',
    }}>
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: 2,
        background: accent,
        opacity: 0.8,
      }} />
      <div style={{
        fontFamily: 'var(--font-mono)',
        fontSize: 9,
        letterSpacing: '0.12em',
        color: '#6b7fa0',
        textTransform: 'uppercase',
        marginBottom: 8,
      }}>
        {label}
      </div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
        <span style={{
          fontFamily: 'var(--font-display)',
          fontSize: 28,
          fontWeight: 700,
          color: '#e2eaf5',
          lineHeight: 1,
          letterSpacing: '-0.02em',
        }}>{value}</span>
        {unit && <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: '#6b7fa0' }}>{unit}</span>}
      </div>
      <div style={{ fontFamily: 'var(--font-body)', fontSize: 11, color: '#6b7fa0', marginTop: 4 }}>{sub}</div>
    </div>
  )
}

function WorldMap() {
  const [hovered, setHovered] = useState<string | null>(null)

  return (
    <div style={{
      background: '#0d1729',
      border: '1px solid rgba(255,255,255,0.07)',
      borderRadius: 6,
      overflow: 'hidden',
      position: 'relative',
    }}>
      <div style={{
        padding: '12px 16px',
        borderBottom: '1px solid rgba(255,255,255,0.07)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.1em', color: '#a0b2cc' }}>
          GLOBAL OUTBREAK MAP — REAL-TIME
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          {['critical', 'high', 'moderate', 'low'].map(r => (
            <div key={r} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <div style={{ width: 6, height: 6, borderRadius: '50%', background: riskColor(r) }} />
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 8, color: '#6b7fa0', letterSpacing: '0.06em' }}>{r.toUpperCase()}</span>
            </div>
          ))}
        </div>
      </div>

      <div style={{ position: 'relative', height: 320, background: '#08111f' }}>
        {/* Stylized world map SVG */}
        <svg viewBox="0 0 1000 500" style={{ width: '100%', height: '100%', opacity: 0.4 }}>
          {/* Grid lines */}
          {[0,1,2,3,4,5,6].map(i => (
            <line key={`h${i}`} x1="0" y1={i*83} x2="1000" y2={i*83} stroke="#1a2a44" strokeWidth="0.5"/>
          ))}
          {[0,1,2,3,4,5,6,7,8,9,10].map(i => (
            <line key={`v${i}`} x1={i*100} y1="0" x2={i*100} y2="500" stroke="#1a2a44" strokeWidth="0.5"/>
          ))}
          {/* Simplified continents */}
          <path d="M 380 130 Q 420 100 480 120 Q 520 110 540 130 Q 560 150 550 180 Q 540 210 510 220 Q 490 230 460 220 Q 430 210 410 190 Q 390 170 380 130 Z" fill="#162035" />
          <path d="M 460 240 Q 480 235 500 250 Q 520 265 510 290 Q 500 315 480 320 Q 460 325 445 310 Q 430 295 440 270 Q 450 255 460 240 Z" fill="#162035"/>
          <path d="M 320 165 Q 350 140 380 150 Q 400 160 405 185 Q 408 210 390 230 Q 375 248 350 250 Q 325 250 310 235 Q 295 218 300 195 Q 305 175 320 165 Z" fill="#162035"/>
          <path d="M 240 145 Q 270 125 305 135 Q 325 143 328 165 Q 330 190 312 205 Q 292 220 265 215 Q 238 208 228 185 Q 220 165 240 145 Z" fill="#162035"/>
          <path d="M 185 200 Q 215 185 240 200 Q 258 215 252 240 Q 246 265 225 272 Q 205 278 190 264 Q 175 250 178 228 Q 181 210 185 200 Z" fill="#162035"/>
          <path d="M 165 240 Q 200 230 225 250 Q 240 270 230 300 Q 220 330 195 340 Q 170 348 152 330 Q 135 312 142 285 Q 148 262 165 240 Z" fill="#162035"/>
          <path d="M 350 285 Q 380 270 400 285 Q 418 300 412 325 Q 405 350 383 358 Q 360 365 343 350 Q 328 335 332 312 Q 336 294 350 285 Z" fill="#162035"/>
          <path d="M 520 120 Q 580 90 650 100 Q 700 108 720 130 Q 740 155 730 185 Q 718 215 690 225 Q 660 235 630 225 Q 600 215 575 195 Q 550 175 535 155 Q 522 138 520 120 Z" fill="#162035"/>
          <path d="M 650 120 Q 700 95 760 105 Q 810 115 840 145 Q 865 175 855 210 Q 845 245 810 260 Q 775 275 740 265 Q 705 255 680 230 Q 660 210 652 185 Q 645 160 650 120 Z" fill="#162035"/>
          <path d="M 780 200 Q 820 190 855 205 Q 880 220 885 248 Q 888 275 867 290 Q 845 305 818 298 Q 792 290 780 268 Q 770 248 778 225 Q 780 208 780 200 Z" fill="#162035"/>
          <path d="M 800 305 Q 840 295 870 315 Q 895 335 890 368 Q 883 400 855 412 Q 828 422 805 405 Q 782 388 785 360 Q 788 335 800 305 Z" fill="#162035"/>
        </svg>

        {/* Outbreak hotspots */}
        {MAP_HOTSPOTS.map(spot => {
          const isHovered = hovered === spot.label
          const color = riskColor(spot.risk)
          return (
            <div
              key={spot.label}
              style={{
                position: 'absolute',
                left: `${spot.x}%`,
                top: `${spot.y}%`,
                transform: 'translate(-50%, -50%)',
                cursor: 'pointer',
              }}
              onMouseEnter={() => setHovered(spot.label)}
              onMouseLeave={() => setHovered(null)}
            >
              {(spot.risk === 'critical' || spot.risk === 'high') && (
                <div className="ping-ring" style={{
                  position: 'absolute',
                  inset: -4,
                  borderRadius: '50%',
                  border: `1.5px solid ${color}`,
                  opacity: 0.5,
                }} />
              )}
              <div style={{
                width: spot.size,
                height: spot.size,
                borderRadius: '50%',
                background: color,
                boxShadow: `0 0 ${spot.size}px ${color}88`,
                opacity: isHovered ? 1 : 0.85,
                transition: 'all 0.15s ease',
                transform: isHovered ? 'scale(1.3)' : 'scale(1)',
              }} />
              {isHovered && (
                <div style={{
                  position: 'absolute',
                  top: -36,
                  left: '50%',
                  transform: 'translateX(-50%)',
                  background: '#111e33',
                  border: `1px solid ${color}44`,
                  borderRadius: 4,
                  padding: '4px 8px',
                  whiteSpace: 'nowrap',
                  fontFamily: 'var(--font-mono)',
                  fontSize: 10,
                  color: '#e2eaf5',
                  zIndex: 10,
                }}>
                  {spot.label} — <span style={{ color }}>{spot.risk.toUpperCase()}</span>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

function RegionTable() {
  return (
    <div style={{
      background: '#0d1729',
      border: '1px solid rgba(255,255,255,0.07)',
      borderRadius: 6,
      overflow: 'hidden',
    }}>
      <div style={{
        padding: '12px 16px',
        borderBottom: '1px solid rgba(255,255,255,0.07)',
        fontFamily: 'var(--font-mono)',
        fontSize: 10,
        letterSpacing: '0.1em',
        color: '#a0b2cc',
      }}>
        REGIONAL RISK MATRIX
      </div>
      <div>
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 80px 90px 80px 60px',
          padding: '6px 16px',
          borderBottom: '1px solid rgba(255,255,255,0.05)',
        }}>
          {['REGION', 'RISK', 'CASES', '7D Δ', 'ACTIVE'].map(h => (
            <span key={h} style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 8,
              letterSpacing: '0.1em',
              color: '#6b7fa0',
            }}>{h}</span>
          ))}
        </div>
        {REGIONS.map((r, i) => (
          <div key={r.id} style={{
            display: 'grid',
            gridTemplateColumns: '1fr 80px 90px 80px 60px',
            padding: '8px 16px',
            borderBottom: i < REGIONS.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none',
            background: i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.01)',
            alignItems: 'center',
            transition: 'background 0.1s',
          }}
            onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.04)')}
            onMouseLeave={e => (e.currentTarget.style.background = i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.01)')}
          >
            <span style={{ fontFamily: 'var(--font-body)', fontSize: 12, color: '#c8d8ef' }}>{r.name}</span>
            <div>
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 4,
              }}>
                <div style={{
                  width: 40,
                  height: 3,
                  borderRadius: 2,
                  background: '#1a2a44',
                  overflow: 'hidden',
                }}>
                  <div style={{
                    width: `${r.score}%`,
                    height: '100%',
                    background: riskColor(r.risk),
                    borderRadius: 2,
                  }} />
                </div>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: riskColor(r.risk) }}>{r.score}</span>
              </div>
            </div>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: '#e2eaf5' }}>{r.cases.toLocaleString()}</span>
            <DeltaBadge v={r.delta} />
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: r.active > 0 ? '#ff3b5c' : '#6b7fa0' }}>
              {r.active > 0 ? r.active : '—'}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

function AlertFeed({ filter }: { filter: string }) {
  const filtered = filter === 'all' ? ALERTS : ALERTS.filter(a => a.level === filter)
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {filtered.map(alert => (
        <div key={alert.id} style={{
          background: '#0d1729',
          border: '1px solid rgba(255,255,255,0.07)',
          borderLeft: `3px solid ${riskColor(alert.level)}`,
          borderRadius: '0 6px 6px 0',
          padding: '10px 14px',
          cursor: 'pointer',
          transition: 'background 0.15s',
        }}
          onMouseEnter={e => (e.currentTarget.style.background = '#111e33')}
          onMouseLeave={e => (e.currentTarget.style.background = '#0d1729')}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
            <RiskBadge risk={alert.level} />
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: '#6b7fa0' }}>{alert.time}</span>
          </div>
          <div style={{ fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: 12, color: '#e2eaf5', marginBottom: 3, lineHeight: 1.4 }}>
            {alert.title}
          </div>
          <div style={{ fontFamily: 'var(--font-body)', fontSize: 11, color: '#6b7fa0', lineHeight: 1.5, marginBottom: 6 }}>
            {alert.body}
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <span style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 9,
              color: '#a0b2cc',
              background: 'rgba(160,178,204,0.08)',
              padding: '2px 6px',
              borderRadius: 2,
            }}>📍 {alert.region}</span>
            <span style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 9,
              color: '#a0b2cc',
              background: 'rgba(160,178,204,0.08)',
              padding: '2px 6px',
              borderRadius: 2,
            }}>🧬 {alert.pathogen}</span>
            <span style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 9,
              color: riskColor(alert.level),
              background: riskBg(alert.level),
              padding: '2px 6px',
              borderRadius: 2,
            }}>⚕ {alert.cases.toLocaleString()} cases</span>
          </div>
        </div>
      ))}
    </div>
  )
}

function TrendPanel() {
  return (
    <div style={{
      background: '#0d1729',
      border: '1px solid rgba(255,255,255,0.07)',
      borderRadius: 6,
      overflow: 'hidden',
    }}>
      <div style={{
        padding: '12px 16px',
        borderBottom: '1px solid rgba(255,255,255,0.07)',
        fontFamily: 'var(--font-mono)',
        fontSize: 10,
        letterSpacing: '0.1em',
        color: '#a0b2cc',
      }}>
        GLOBAL CASE TREND — 7 DAY
      </div>
      <div style={{ padding: '12px 8px 8px' }}>
        <ResponsiveContainer width="100%" height={140}>
          <AreaChart data={TREND_DATA} margin={{ top: 4, right: 8, bottom: 0, left: 0 }}>
            <defs>
              <linearGradient id="caseGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#ff3b5c" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#ff3b5c" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis
              dataKey="day"
              tick={{ fontFamily: 'var(--font-mono)', fontSize: 9, fill: '#6b7fa0' }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fontFamily: 'var(--font-mono)', fontSize: 9, fill: '#6b7fa0' }}
              axisLine={false}
              tickLine={false}
              width={48}
              tickFormatter={v => `${(v/1000).toFixed(0)}k`}
            />
            <Tooltip
              contentStyle={{
                background: '#111e33',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: 4,
                fontFamily: 'var(--font-mono)',
                fontSize: 11,
                color: '#e2eaf5',
              }}
              itemStyle={{ color: '#ff3b5c' }}
              labelStyle={{ color: '#6b7fa0', fontSize: 9 }}
            />
            <Area
              type="monotone"
              dataKey="cases"
              stroke="#ff3b5c"
              strokeWidth={1.5}
              fill="url(#caseGrad)"
              dot={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

function PathogenPanel() {
  return (
    <div style={{
      background: '#0d1729',
      border: '1px solid rgba(255,255,255,0.07)',
      borderRadius: 6,
      overflow: 'hidden',
    }}>
      <div style={{
        padding: '12px 16px',
        borderBottom: '1px solid rgba(255,255,255,0.07)',
        fontFamily: 'var(--font-mono)',
        fontSize: 10,
        letterSpacing: '0.1em',
        color: '#a0b2cc',
      }}>
        PATHOGEN SURVEILLANCE
      </div>
      <div style={{ padding: '8px 0' }}>
        {PATHOGEN_DATA.map((p, i) => {
          const max = PATHOGEN_DATA[0].count
          const pct = (p.count / max) * 100
          return (
            <div key={i} style={{
              padding: '6px 16px',
              display: 'grid',
              gridTemplateColumns: '1fr 60px 60px',
              alignItems: 'center',
              gap: 8,
            }}>
              <div>
                <div style={{ fontFamily: 'var(--font-body)', fontSize: 11, color: '#c8d8ef', marginBottom: 3 }}>{p.name}</div>
                <div style={{ height: 2, background: '#1a2a44', borderRadius: 1 }}>
                  <div style={{ width: `${pct}%`, height: '100%', background: p.trend > 10 ? '#ff3b5c' : p.trend > 0 ? '#f5a623' : '#00e87a', borderRadius: 1, transition: 'width 0.4s ease' }} />
                </div>
              </div>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: '#e2eaf5', textAlign: 'right' }}>
                {p.count.toLocaleString()}
              </span>
              <div style={{ textAlign: 'right' }}>
                <DeltaBadge v={p.trend} />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function AlertDistChart() {
  const alertData = [
    { name: 'CRITICAL', value: 2, color: '#ff3b5c' },
    { name: 'HIGH', value: 2, color: '#f5a623' },
    { name: 'MODERATE', value: 2, color: '#f5d623' },
    { name: 'LOW', value: 0, color: '#00e87a' },
  ]
  return (
    <div style={{
      background: '#0d1729',
      border: '1px solid rgba(255,255,255,0.07)',
      borderRadius: 6,
      overflow: 'hidden',
    }}>
      <div style={{
        padding: '12px 16px',
        borderBottom: '1px solid rgba(255,255,255,0.07)',
        fontFamily: 'var(--font-mono)',
        fontSize: 10,
        letterSpacing: '0.1em',
        color: '#a0b2cc',
      }}>
        ALERT DISTRIBUTION
      </div>
      <div style={{ padding: '12px 8px 8px' }}>
        <ResponsiveContainer width="100%" height={100}>
          <BarChart data={alertData} margin={{ top: 0, right: 8, bottom: 0, left: 0 }}>
            <XAxis
              dataKey="name"
              tick={{ fontFamily: 'var(--font-mono)', fontSize: 8, fill: '#6b7fa0' }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis hide />
            <Tooltip
              contentStyle={{
                background: '#111e33',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: 4,
                fontFamily: 'var(--font-mono)',
                fontSize: 11,
                color: '#e2eaf5',
              }}
            />
            <Bar dataKey="value" radius={[2,2,0,0]}>
              {alertData.map((entry, index) => (
                <Cell key={index} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

// ─── Main App ─────────────────────────────────────────────────────────────────

export default function App() {
  const [alertFilter, setAlertFilter] = useState<string>('all')

  return (
    <div style={{ background: '#060c18', minHeight: '100vh', fontFamily: 'var(--font-body)' }}>
      <Header />
      <AlertTicker />

      {/* KPI Row */}
      <div style={{ padding: '16px 20px 0', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
        <KpiCard
          label="ACTIVE OUTBREAKS"
          value="6"
          sub="↑ 2 new in past 24h"
          accent="#ff3b5c"
        />
        <KpiCard
          label="CONFIRMED CASES"
          value="46,477"
          sub="Global 7-day rolling total"
          accent="#f5a623"
        />
        <KpiCard
          label="POPULATION AT RISK"
          value="2.1"
          unit="B"
          sub="Across 18 affected countries"
          accent="#f5d623"
        />
        <KpiCard
          label="RESPONSE TEAMS"
          value="142"
          sub="WHO/MSF/CDC deployed"
          accent="#00e87a"
        />
      </div>

      {/* Main Grid */}
      <div style={{
        padding: '12px 20px',
        display: 'grid',
        gridTemplateColumns: '1fr 340px',
        gap: 12,
      }}>
        {/* Left column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <WorldMap />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <TrendPanel />
            <AlertDistChart />
          </div>
          <RegionTable />
        </div>

        {/* Right column — Alert feed */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {/* Filter bar */}
          <div style={{
            display: 'flex',
            gap: 4,
            background: '#0d1729',
            border: '1px solid rgba(255,255,255,0.07)',
            borderRadius: 6,
            padding: 6,
          }}>
            {['all', 'critical', 'high', 'moderate'].map(f => (
              <button
                key={f}
                onClick={() => setAlertFilter(f)}
                style={{
                  flex: 1,
                  fontFamily: 'var(--font-mono)',
                  fontSize: 9,
                  letterSpacing: '0.08em',
                  color: alertFilter === f ? '#e2eaf5' : '#6b7fa0',
                  background: alertFilter === f ? (f === 'all' ? 'rgba(255,255,255,0.08)' : riskBg(f)) : 'transparent',
                  border: alertFilter === f ? `1px solid ${f === 'all' ? 'rgba(255,255,255,0.1)' : riskColor(f) + '33'}` : '1px solid transparent',
                  borderRadius: 4,
                  padding: '5px 4px',
                  cursor: 'pointer',
                  textTransform: 'uppercase',
                  transition: 'all 0.15s',
                }}
              >
                {f === 'all' ? 'ALL' : f.toUpperCase()}
              </button>
            ))}
          </div>

          {/* Scrollable alert feed */}
          <div style={{ overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 8 }}>
            <AlertFeed filter={alertFilter} />
          </div>

          <PathogenPanel />
        </div>
      </div>

      {/* Footer */}
      <div style={{
        margin: '4px 20px 20px',
        padding: '12px 16px',
        background: '#0d1729',
        border: '1px solid rgba(255,255,255,0.07)',
        borderRadius: 6,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: '#6b7fa0', letterSpacing: '0.06em' }}>
          HEALTHSHIELD AI v3.4.1 · Data sources: WHO EIOS, ProMED, GOARN, CDC, ECDC, HealthMap · Refresh: 90s
        </div>
        <div style={{ display: 'flex', gap: 16 }}>
          {['API STATUS: NOMINAL', 'ML MODEL: v2.1.7', 'LATENCY: 42ms'].map(s => (
            <span key={s} style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: '#00e87a', letterSpacing: '0.06em' }}>
              ● {s}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}
