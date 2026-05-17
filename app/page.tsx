'use client'
import { useState } from 'react'

const PASSWORD = process.env.NEXT_PUBLIC_ADMIN_PASSWORD ?? 'admin123'
const GROQ_KEY = process.env.NEXT_PUBLIC_GROQ_KEY ?? ''

const AGENTS = [
  {
    id: 'securite', name: 'Sécurité', icon: '🔒', color: '#534AB7', bg: '#EEEDFE',
    desc: 'Vulnérabilités, auth, données',
    prompt: `Tu es un expert en sécurité web. Analyse le site MathWorld (mathworld-henna.vercel.app), une plateforme d'apprentissage des maths avec auth, paiements Stripe, contenu IA. Liste 5 points de sécurité critiques. Format: chaque point sur une ligne avec emoji (✅ ok, ⚠️ à vérifier, ❌ problème). Sois concis et pratique.`
  },
  {
    id: 'lecons', name: 'Leçons', icon: '📖', color: '#0F6E56', bg: '#E1F5EE',
    desc: 'Qualité pédagogique du contenu',
    prompt: `Tu es un expert en pédagogie des maths. Analyse les leçons de MathWorld (24 matières, contenu généré par IA). Propose 5 améliorations concrètes pour les rendre plus efficaces et engageantes. Format: chaque point sur une ligne avec emoji. Sois concis.`
  },
  {
    id: 'exercices', name: 'Exercices', icon: '✏️', color: '#854F0B', bg: '#FAEEDA',
    desc: 'Qualité et variété des exercices',
    prompt: `Tu es un expert en création d'exercices de maths. Analyse les exercices adaptatifs de MathWorld. Propose 5 améliorations pour les rendre plus variés, mieux gradués, avec de meilleures explications d'erreurs. Format: chaque point avec emoji. Sois concis.`
  },
  {
    id: 'ameliorations', name: 'Améliorations', icon: '💡', color: '#185FA5', bg: '#E6F1FB',
    desc: 'Nouvelles features & UX',
    prompt: `Tu es un expert en product design ed-tech. Analyse MathWorld (leçons IA, exercices, tuteur, examens). Propose 5 nouvelles fonctionnalités ou améliorations UX à haute valeur ajoutée. Format: chaque point avec emoji. Sois innovant.`
  },
  {
    id: 'marketing', name: 'Marketing', icon: '📣', color: '#993C1D', bg: '#FAECE7',
    desc: 'Acquisition & croissance',
    prompt: `Tu es un expert en marketing startup ed-tech. Analyse MathWorld, plateforme maths avec IA ciblant les étudiants. Propose 5 stratégies marketing concrètes pour acquérir des utilisateurs gratuitement (SEO, réseaux sociaux, partenariats). Format: chaque point avec emoji. Sois actionnable.`
  }
]

type Report = { agent: string; time: string; lines: string[]; color: string; bg: string; icon: string }

export default function AdminPage() {
  const [auth, setAuth] = useState(false)
  const [pw, setPw] = useState('')
  const [error, setError] = useState('')
  const [running, setRunning] = useState<string | null>(null)
  const [report, setReport] = useState<Report | null>(null)
  const [history, setHistory] = useState<Report[]>([])
  const [runCount, setRunCount] = useState(0)

  function login() {
    if (pw === PASSWORD) { setAuth(true); setError('') }
    else setError('Mot de passe incorrect')
  }

  async function runAgent(agent: typeof AGENTS[0]) {
    setRunning(agent.id)
    setReport(null)
    setRunCount(c => c + 1)
    try {
      const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${GROQ_KEY}` },
        body: JSON.stringify({
          model: 'llama-3.3-70b-versatile',
          messages: [{ role: 'user', content: agent.prompt }],
          max_tokens: 600,
          temperature: 0.7
        })
      })
      const data = await res.json()
      if (data.error) throw new Error(data.error.message)
      const lines = data.choices[0].message.content.split('\n').filter((l: string) => l.trim())
      const now = new Date()
      const time = `${now.getHours()}:${String(now.getMinutes()).padStart(2, '0')}`
      const newReport: Report = { agent: agent.name, time, lines, color: agent.color, bg: agent.bg, icon: agent.icon }
      setReport(newReport)
      setHistory(h => [newReport, ...h].slice(0, 10))
    } catch (e: any) {
      alert('Erreur: ' + e.message)
    }
    setRunning(null)
  }

  if (!auth) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #f5f3ff 0%, #ede9fe 100%)' }}>
      <div style={{ background: '#fff', borderRadius: 20, padding: '2.5rem', width: 380, boxShadow: '0 20px 60px rgba(83,74,183,0.15)' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ width: 56, height: 56, background: '#534AB7', borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 800, fontSize: 20, margin: '0 auto 1rem' }}>MW</div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: '#1a1a2e', margin: 0 }}>Admin Dashboard</h1>
          <p style={{ fontSize: 14, color: '#888', marginTop: 6 }}>Accès réservé — MathWorld</p>
        </div>
        <input type="password" placeholder="Mot de passe" value={pw}
          onChange={e => setPw(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && login()}
          style={{ width: '100%', padding: '12px 16px', borderRadius: 10, border: '1.5px solid #e0e0e0', marginBottom: 12, fontSize: 15, outline: 'none', boxSizing: 'border-box', transition: 'border-color .2s' }}
          onFocus={e => e.target.style.borderColor = '#534AB7'}
          onBlur={e => e.target.style.borderColor = '#e0e0e0'} />
        {error && (
          <div style={{ background: '#fff0f0', border: '1px solid #fcc', borderRadius: 8, padding: '8px 12px', marginBottom: 12, fontSize: 13, color: '#c0392b' }}>
            {error}
          </div>
        )}
        <button onClick={login} style={{ width: '100%', padding: 13, background: '#534AB7', color: '#fff', border: 'none', borderRadius: 10, fontSize: 15, cursor: 'pointer', fontWeight: 600, letterSpacing: '.01em' }}>
          Entrer →
        </button>
      </div>
    </div>
  )

  const totalIssues = history.reduce((acc, h) => acc + h.lines.filter(l => l.includes('❌') || l.includes('⚠️')).length, 0)

  return (
    <div style={{ minHeight: '100vh', background: '#f7f8fc', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      <div style={{ background: '#fff', borderBottom: '1px solid #ebebeb', padding: '0 2rem' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', height: 60, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 36, height: 36, background: '#534AB7', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 800, fontSize: 15 }}>MW</div>
            <div>
              <div style={{ fontWeight: 600, fontSize: 15, color: '#1a1a2e' }}>MathWorld Admin</div>
              <div style={{ fontSize: 11, color: '#aaa' }}>Tableau de bord privé</div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <div style={{ background: '#f0f4ff', color: '#534AB7', fontSize: 12, fontWeight: 600, padding: '4px 12px', borderRadius: 20 }}>{runCount} analyses</div>
            <div style={{ background: totalIssues > 0 ? '#fff4f4' : '#f0fff8', color: totalIssues > 0 ? '#c0392b' : '#0F6E56', fontSize: 12, fontWeight: 600, padding: '4px 12px', borderRadius: 20 }}>{totalIssues} points relevés</div>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '2rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 14, marginBottom: '2rem' }}>
          {AGENTS.map(agent => (
            <button key={agent.id} onClick={() => !running && runAgent(agent)} disabled={!!running}
              style={{ background: '#fff', border: running === agent.id ? `2px solid ${agent.color}` : '1.5px solid #ebebeb', borderRadius: 16, padding: '1.25rem', cursor: running ? 'not-allowed' : 'pointer', textAlign: 'left', transition: 'all .2s', opacity: running && running !== agent.id ? 0.5 : 1 }}>
              <div style={{ width: 44, height: 44, background: agent.bg, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, marginBottom: 12 }}>{agent.icon}</div>
              <div style={{ fontWeight: 600, fontSize: 14, color: '#1a1a2e', marginBottom: 4 }}>{agent.name}</div>
              <div style={{ fontSize: 11, color: '#aaa', marginBottom: 14, lineHeight: 1.4 }}>{agent.desc}</div>
              <div style={{ fontSize: 12, fontWeight: 600, color: running === agent.id ? agent.color : '#534AB7', display: 'flex', alignItems: 'center', gap: 4 }}>
                {running === agent.id ? '⏳ Analyse...' : '▶ Lancer'}
              </div>
            </button>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 16 }}>
          <div style={{ background: '#fff', border: '1.5px solid #ebebeb', borderRadius: 16, padding: '1.5rem', minHeight: 300 }}>
            {!report && !running && (
              <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#ccc', padding: '3rem 0' }}>
                <div style={{ fontSize: 48, marginBottom: 12 }}>🤖</div>
                <div style={{ fontSize: 15, fontWeight: 500, color: '#bbb' }}>Lance un agent pour voir le rapport</div>
              </div>
            )}
            {running && (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '3rem 0' }}>
                <div style={{ fontSize: 40, marginBottom: 16, animation: 'spin 1s linear infinite' }}>⏳</div>
                <div style={{ fontSize: 15, color: '#534AB7', fontWeight: 600 }}>Analyse en cours...</div>
                <div style={{ fontSize: 13, color: '#aaa', marginTop: 6 }}>L&apos;agent IA analyse MathWorld</div>
              </div>
            )}
            {report && !running && (
              <>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: '1.25rem', paddingBottom: '1rem', borderBottom: '1px solid #f0f0f0' }}>
                  <div style={{ width: 40, height: 40, background: report.bg, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>{report.icon}</div>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 15, color: '#1a1a2e' }}>Rapport — {report.agent}</div>
                    <div style={{ fontSize: 12, color: '#aaa' }}>Généré à {report.time}</div>
                  </div>
                </div>
                {report.lines.map((line, i) => {
                  const isErr = line.includes('❌')
                  const isWarn = line.includes('⚠️')
                  const isOk = line.includes('✅')
                  const dot = isErr ? '#E24B4A' : isWarn ? '#EF9F27' : isOk ? '#1D9E75' : '#534AB7'
                  const lineBg = isErr ? '#fff8f8' : isWarn ? '#fffbf0' : isOk ? '#f0fff8' : '#f8f8ff'
                  return (
                    <div key={i} style={{ display: 'flex', gap: 10, padding: '10px 12px', borderRadius: 8, marginBottom: 6, background: lineBg, fontSize: 13, lineHeight: 1.5 }}>
                      <div style={{ width: 7, height: 7, borderRadius: '50%', background: dot, marginTop: 5, flexShrink: 0 }} />
                      <span style={{ color: '#333' }}>{line}</span>
                    </div>
                  )
                })}
              </>
            )}
          </div>

          <div style={{ background: '#fff', border: '1.5px solid #ebebeb', borderRadius: 16, padding: '1.25rem' }}>
            <div style={{ fontWeight: 600, fontSize: 14, color: '#1a1a2e', marginBottom: '1rem', paddingBottom: '0.75rem', borderBottom: '1px solid #f0f0f0' }}>
              Historique
            </div>
            {history.length === 0 && <p style={{ color: '#ccc', fontSize: 13, textAlign: 'center', padding: '2rem 0' }}>Aucun rapport encore</p>}
            {history.map((h, i) => (
              <div key={i} onClick={() => setReport(h)} style={{ padding: '10px 0', borderBottom: '1px solid #f5f5f5', cursor: 'pointer', display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                <div style={{ width: 32, height: 32, background: h.bg, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, flexShrink: 0 }}>{h.icon}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 2 }}>
                    <span style={{ fontWeight: 600, fontSize: 12, color: '#333' }}>{h.agent}</span>
                    <span style={{ fontSize: 11, color: '#bbb' }}>{h.time}</span>
                  </div>
                  <div style={{ fontSize: 11, color: '#aaa', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{h.lines[0]?.substring(0, 45)}...</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
