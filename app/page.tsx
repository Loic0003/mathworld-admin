'use client'
import { useState } from 'react'

const PASSWORD = process.env.NEXT_PUBLIC_ADMIN_PASSWORD ?? 'admin123'

const AGENTS = [
  {
    id: 'securite', name: 'Sécurité', icon: '🔒',
    prompt: `Tu es un expert en sécurité web. Analyse le site MathWorld (mathworld-henna.vercel.app), une plateforme d'apprentissage des maths avec auth, paiements Stripe, contenu IA. Liste 5 points de sécurité critiques. Format: chaque point sur une ligne avec emoji (✅ ok, ⚠️ à vérifier, ❌ problème). Sois concis.`
  },
  {
    id: 'lecons', name: 'Leçons', icon: '📖',
    prompt: `Tu es un expert en pédagogie des maths. Analyse les leçons de MathWorld (24 matières, contenu généré par IA). Propose 5 améliorations concrètes pour les rendre plus efficaces et engageantes. Format: chaque point sur une ligne avec emoji.`
  },
  {
    id: 'exercices', name: 'Exercices', icon: '✏️',
    prompt: `Tu es un expert en création d'exercices de maths. Analyse les exercices adaptatifs de MathWorld. Propose 5 améliorations pour les rendre plus variés, mieux gradués, avec de meilleures explications d'erreurs. Format: chaque point avec emoji.`
  },
  {
    id: 'ameliorations', name: 'Améliorations', icon: '💡',
    prompt: `Tu es un expert en product design ed-tech. Analyse MathWorld (leçons IA, exercices, tuteur, examens). Propose 5 nouvelles fonctionnalités ou améliorations UX à haute valeur ajoutée. Format: chaque point avec emoji.`
  },
  {
    id: 'marketing', name: 'Marketing', icon: '📣',
    prompt: `Tu es un expert en marketing startup ed-tech. Analyse MathWorld, plateforme maths avec IA ciblant les étudiants. Propose 5 stratégies marketing concrètes pour acquérir des utilisateurs gratuitement (SEO, réseaux sociaux, partenariats). Format: chaque point avec emoji.`
  }
]

type Report = { agent: string; time: string; lines: string[] }

export default function AdminPage() {
  const [auth, setAuth] = useState(false)
  const [pw, setPw] = useState('')
  const [error, setError] = useState('')
  const [groqKey, setGroqKey] = useState('')
  const [keySaved, setKeySaved] = useState(false)
  const [running, setRunning] = useState<string | null>(null)
  const [report, setReport] = useState<Report | null>(null)
  const [history, setHistory] = useState<Report[]>([])

  function login() {
    if (pw === PASSWORD) { setAuth(true); setError('') }
    else setError('Mot de passe incorrect')
  }

  function saveKey() {
    if (groqKey.trim()) { setKeySaved(true); setTimeout(() => setKeySaved(false), 2000) }
  }

  async function runAgent(agent: typeof AGENTS[0]) {
    if (!groqKey) return alert('Entre ta clé Groq d\'abord !')
    setRunning(agent.id)
    setReport(null)
    try {
      const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${groqKey}` },
        body: JSON.stringify({
          model: 'llama3-8b-8192',
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
      const newReport: Report = { agent: agent.name, time, lines }
      setReport(newReport)
      setHistory(h => [newReport, ...h].slice(0, 10))
    } catch (e: any) {
      alert('Erreur: ' + e.message)
    }
    setRunning(null)
  }

  if (!auth) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f5f5f5' }}>
      <div style={{ background: '#fff', border: '1px solid #e0e0e0', borderRadius: 16, padding: '2rem', width: 340 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: '1.5rem' }}>
          <div style={{ width: 32, height: 32, background: '#534AB7', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: 14 }}>MW</div>
          <span style={{ fontWeight: 500, fontSize: 16 }}>Admin — MathWorld</span>
        </div>
        <input type="password" placeholder="Mot de passe" value={pw}
          onChange={e => setPw(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && login()}
          style={{ width: '100%', padding: '10px 14px', borderRadius: 8, border: '1px solid #ccc', marginBottom: 10, fontSize: 14, boxSizing: 'border-box' }} />
        {error && <p style={{ color: '#E24B4A', fontSize: 13, marginBottom: 8 }}>{error}</p>}
        <button onClick={login} style={{ width: '100%', padding: 10, background: '#534AB7', color: '#fff', border: 'none', borderRadius: 8, fontSize: 14, cursor: 'pointer', fontWeight: 500 }}>
          Entrer
        </button>
      </div>
    </div>
  )

  return (
    <div style={{ maxWidth: 960, margin: '0 auto', padding: '2rem 1rem', fontFamily: 'system-ui, sans-serif' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 32, height: 32, background: '#534AB7', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: 14 }}>MW</div>
          <span style={{ fontWeight: 500, fontSize: 16 }}>Admin Dashboard</span>
        </div>
        <span style={{ fontSize: 12, background: '#EAF3DE', color: '#27500A', padding: '4px 12px', borderRadius: 20 }}>Accès privé</span>
      </div>

      <div style={{ display: 'flex', gap: 8, marginBottom: '1.5rem' }}>
        <input type="password" placeholder="Clé API Groq  •  gsk_..." value={groqKey}
          onChange={e => setGroqKey(e.target.value)}
          style={{ flex: 1, padding: '8px 12px', borderRadius: 8, border: '1px solid #ccc', fontSize: 13 }} />
        <button onClick={saveKey} style={{ padding: '8px 16px', background: keySaved ? '#1D9E75' : '#534AB7', color: '#fff', border: 'none', borderRadius: 8, fontSize: 13, cursor: 'pointer' }}>
          {keySaved ? '✓ Sauvegardé' : 'Sauvegarder'}
        </button>
      </div>

      <div style={{ fontSize: 12, fontWeight: 600, color: '#888', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 10 }}>Agents IA</div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 10, marginBottom: '1.5rem' }}>
        {AGENTS.map(agent => (
          <div key={agent.id} style={{ background: '#fff', border: '1px solid #e8e8e8', borderRadius: 12, padding: 14 }}>
            <div style={{ fontSize: 24, marginBottom: 8 }}>{agent.icon}</div>
            <div style={{ fontWeight: 500, fontSize: 13, marginBottom: 4 }}>{agent.name}</div>
            <div style={{ fontSize: 11, color: '#999', marginBottom: 10 }}>
              {running === agent.id ? '⏳ En cours...' : 'En attente'}
            </div>
            <button onClick={() => runAgent(agent)} disabled={!!running}
              style={{ width: '100%', padding: '6px 0', borderRadius: 6, border: '1px solid #ddd', background: running === agent.id ? '#EEEDFE' : 'transparent', fontSize: 12, cursor: 'pointer', opacity: running && running !== agent.id ? 0.5 : 1 }}>
              {running === agent.id ? '⏳ ...' : '▶ Lancer'}
            </button>
          </div>
        ))}
      </div>

      <div style={{ background: '#fff', border: '1px solid #e8e8e8', borderRadius: 12, padding: '1.25rem', marginBottom: '1.5rem', minHeight: 160 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
          <span style={{ fontWeight: 500, fontSize: 14 }}>{report ? `${report.agent} — rapport` : 'Aucun rapport'}</span>
          {report && <span style={{ fontSize: 12, color: '#999' }}>{report.time}</span>}
        </div>
        {!report && <p style={{ color: '#aaa', fontSize: 13 }}>Lance un agent pour voir le rapport ici.</p>}
        {report && report.lines.map((line, i) => {
          const dot = line.includes('❌') ? '#E24B4A' : line.includes('⚠️') ? '#EF9F27' : line.includes('✅') ? '#5DCAA5' : '#7F77DD'
          return (
            <div key={i} style={{ display: 'flex', gap: 8, padding: '7px 0', borderBottom: '1px solid #f0f0f0', fontSize: 13 }}>
              <div style={{ width: 6, height: 6, borderRadius: '50%', background: dot, marginTop: 6, flexShrink: 0 }} />
              <span>{line}</span>
            </div>
          )
        })}
      </div>

      <div style={{ fontSize: 12, fontWeight: 600, color: '#888', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 10 }}>Historique</div>
      <div style={{ background: '#fff', border: '1px solid #e8e8e8', borderRadius: 12, padding: '1.25rem' }}>
        {history.length === 0 && <p style={{ color: '#aaa', fontSize: 13 }}>Aucun rapport encore.</p>}
        {history.map((h, i) => (
          <div key={i} style={{ display: 'flex', gap: 10, padding: '7px 0', borderBottom: '1px solid #f5f5f5', fontSize: 13 }}>
            <span style={{ fontWeight: 500, width: 100 }}>{h.agent}</span>
            <span style={{ color: '#999', width: 50 }}>{h.time}</span>
            <span style={{ color: '#666', flex: 1 }}>{h.lines[0]?.substring(0, 80)}...</span>
          </div>
        ))}
      </div>
    </div>
  )
}
