// @ts-nocheck
"use client";
import React, { useState, useEffect, useRef } from 'react';
import { Search, Filter, ChevronRight, Phone, Calendar, MapPin, Star, MessageCircle, Award, Zap, AlertCircle, Check, X, Clock, Send, Sparkles, TrendingUp, Users, Target, ArrowUpRight, ArrowDownRight, Activity, ChevronDown, Inbox, BarChart3, Settings, Bell } from 'lucide-react';

// ====================================================================
// TALENT OS · Don Benítez · Demo Shell
// Linear/Vercel-style aesthetic · dark + gold accent
// ====================================================================

const STAGES = [
  { id: 'captured',    label: 'Capturado',      color: '#525252', count: 12 },
  { id: 'qualifying',  label: 'Calificando',    color: '#3b82f6', count: 8 },
  { id: 'qualified',   label: 'Calificado',     color: '#8b5cf6', count: 5 },
  { id: 'scheduled',   label: 'Agendado',       color: '#d4af37', count: 7 },
  { id: 'interviewed', label: 'Entrevistado',   color: '#10b981', count: 3 },
  { id: 'hired',       label: 'Contratado',     color: '#e8c66a', count: 4 },
];

const SEEDS = [
  { id: 1,  name: 'María José Carmona',  stage: 'captured',    pos: 'Mesera',     sede: 'Cartagena · Centro',  source: 'Computrabajo', score: 87, eng: 0,  age: 22, time: 'hace 2 min',  phone: '+57 300 555 0102' },
  { id: 2,  name: 'Andrés Quintero',     stage: 'captured',    pos: 'Cocinero',   sede: 'Barranquilla · Norte',source: 'LinkedIn',     score: 79, eng: 0,  age: 26, time: 'hace 5 min',  phone: '+57 301 555 0103' },
  { id: 3,  name: 'Daniela Pérez',       stage: 'captured',    pos: 'Cajera',     sede: 'Cartagena · Bocagrande', source: 'OCC',       score: 91, eng: 0,  age: 19, time: 'hace 8 min',  phone: '+57 302 555 0104' },
  { id: 4,  name: 'Kevin Beltrán',       stage: 'qualifying',  pos: 'Mesero',     sede: 'Cartagena · Centro',  source: 'Computrabajo', score: 82, eng: 12, age: 21, time: 'hace 12 min', phone: '+57 303 555 0105' },
  { id: 5,  name: 'Stephany Núñez',      stage: 'qualifying',  pos: 'Anfitriona', sede: 'Santa Marta',         source: 'Indeed',       score: 88, eng: 18, age: 23, time: 'hace 15 min', phone: '+57 304 555 0106' },
  { id: 6,  name: 'Luis Fernando Mora',  stage: 'qualified',   pos: 'Mesero',     sede: 'Cartagena · Centro',  source: 'Computrabajo', score: 93, eng: 45, age: 20, time: 'hace 24 min', phone: '+57 305 555 0107' },
  { id: 7,  name: 'Carolina Lambraño',   stage: 'qualified',   pos: 'Cocinera',   sede: 'Barranquilla · Norte',source: 'Pandapé direct', score: 85, eng: 38, age: 24, time: 'hace 1h',    phone: '+57 306 555 0108' },
  { id: 8,  name: 'Jhonatan Camacho',    stage: 'scheduled',   pos: 'Mesero',     sede: 'Cartagena · Bocagrande', source: 'LinkedIn',  score: 89, eng: 62, age: 22, time: 'mañana 3pm',  phone: '+57 307 555 0109' },
  { id: 9,  name: 'Valentina Ríos',      stage: 'scheduled',   pos: 'Cajera',     sede: 'Cartagena · Centro',  source: 'Computrabajo', score: 95, eng: 78, age: 21, time: 'hoy 5pm',     phone: '+57 308 555 0110' },
  { id: 10, name: 'Mateo Ospino',        stage: 'scheduled',   pos: 'Cocinero',   sede: 'Santa Marta',         source: 'OCC',          score: 81, eng: 55, age: 25, time: 'jueves 11am', phone: '+57 309 555 0111' },
  { id: 11, name: 'Isabella Torres',     stage: 'interviewed', pos: 'Anfitriona', sede: 'Cartagena · Bocagrande', source: 'LinkedIn',  score: 92, eng: 84, age: 23, time: 'pendiente',   phone: '+57 310 555 0112' },
  { id: 12, name: 'Felipe Castaño',      stage: 'hired',       pos: 'Mesero',     sede: 'Cartagena · Centro',  source: 'Computrabajo', score: 94, eng: 96, age: 22, time: 'inicia lunes', phone: '+57 311 555 0113' },
  { id: 13, name: 'Karen Martínez',      stage: 'hired',       pos: 'Cocinera',   sede: 'Barranquilla · Norte',source: 'Pandapé',      score: 88, eng: 91, age: 26, time: 'día 3 academia', phone: '+57 312 555 0114' },
];

const CONVERSATION_TEMPLATE = [
  { from: 'bot', text: 'Hola Valentina 👋 soy Vale del equipo Don Benítez. Vi tu aplicación para Cajera en Cartagena Centro y me encantaría conocerte. ¿Tienes 3 min para unas preguntas rápidas?', time: '14:02' },
  { from: 'user', text: 'Hola sí claro', time: '14:04' },
  { from: 'bot', text: 'Genial 🙌 Te cuento que en Don Benítez trabajamos con turnos rotativos y fines de semana. ¿Tienes disponibilidad para eso?', time: '14:04' },
  { from: 'user', text: 'Sí, no tengo problema con turnos. Estoy estudiando los sábados en la mañana pero después de las 2pm libre', time: '14:06' },
  { from: 'bot', text: 'Perfecto, eso lo podemos acomodar. ¿Has trabajado antes en servicio o caja?', time: '14:06' },
  { from: 'user', text: 'Sí, trabajé 8 meses en un café en Bocagrande como cajera y mesera a veces', time: '14:08' },
  { from: 'bot', text: '¡Excelente experiencia! Cuéntame, ¿alguna vez te tocó un cliente complicado? ¿Cómo lo manejaste?', time: '14:08' },
  { from: 'user', text: 'Sí varias veces jaja. Una señora se quejó porque el café estaba frío. Le ofrecí cambiárselo de una y le regalé un postre pequeño. Se fue contenta', time: '14:11' },
  { from: 'bot', text: 'Eso es exactamente la actitud que buscamos 🔥 Una última: ¿qué tan lejos vives de Cartagena Centro?', time: '14:11' },
  { from: 'user', text: 'Vivo en Manga, son 15 min en buseta', time: '14:12' },
  { from: 'bot', text: '¡Listo Valentina! Encajas muy bien con lo que buscamos. Te quiero agendar entrevista presencial con Carlos, el manager de la sede. Tengo dos espacios: hoy 5pm o mañana 11am. ¿Cuál te queda mejor?', time: '14:13' },
  { from: 'user', text: 'Hoy 5pm', time: '14:14' },
  { from: 'bot', text: '✅ Confirmado: HOY 5:00pm con Carlos en Don Benítez Centro (Cra 7 #34-12). Carlos bloqueó ese horario solo para ti. Te mando recordatorio a las 3pm y la ubicación 30 min antes 📍\n\nMientras tanto, te dejo un video de 45s de Don Eduardo, nuestro fundador, contando cómo arrancó todo. Si lo ves ganas +10 pts para tu entrevista 🎯', time: '14:14' },
  { from: 'user', text: 'Listo gracias Vale!! 🙌', time: '14:14' },
];

const ACADEMY_MODULES = [
  { day: 1, title: 'Bienvenida & Historia', icon: '🎬', points: 50,  status: 'done',   progress: 100, desc: 'Video del fundador + propósito de marca' },
  { day: 2, title: 'El Menú Don Benítez',   icon: '🍤', points: 80,  status: 'done',   progress: 100, desc: 'Flashcards de los 15 platos estrella' },
  { day: 3, title: 'Estándares de Servicio',icon: '🤝', points: 100, status: 'doing',  progress: 60,  desc: 'Role-play con cliente difícil · IA' },
  { day: 4, title: 'Tus Compañeros',        icon: '👥', points: 40,  status: 'locked', progress: 0,   desc: 'Conoce a tu turno antes de llegar' },
  { day: 5, title: 'Primer Día',            icon: '🚀', points: 30,  status: 'locked', progress: 0,   desc: 'Dress code, ubicación, qué llevar' },
];

// ====================================================================

export default function TalentOSDemo() {
  const [view, setView] = useState('pipeline'); // pipeline | candidate | academy | analytics
  const [candidates, setCandidates] = useState(SEEDS);
  const [selected, setSelected] = useState(null);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [conversation, setConversation] = useState([]);
  const [typing, setTyping] = useState(false);
  const [reply, setReply] = useState('');
  const drawerRef = useRef(null);

  // Animate conversation when candidate is opened
  useEffect(() => {
    if (!selected) return;
    setConversation([]);
    let i = 0;
    const interval = setInterval(() => {
      if (i >= CONVERSATION_TEMPLATE.length) {
        clearInterval(interval);
        return;
      }
      setConversation(prev => [...prev, CONVERSATION_TEMPLATE[i]]);
      i++;
    }, 280);
    return () => clearInterval(interval);
  }, [selected]);

  const handleSendReply = () => {
    if (!reply.trim()) return;
    setConversation(prev => [...prev, { from: 'manager', text: reply, time: 'ahora' }]);
    setReply('');
    setTyping(true);
    setTimeout(() => {
      setTyping(false);
      setConversation(prev => [...prev, { from: 'bot', text: 'Entendido, le doy seguimiento y te informo en cuanto tenga respuesta del candidato 👍', time: 'ahora' }]);
    }, 1400);
  };

  const filtered = candidates.filter(c => {
    if (filter !== 'all' && c.sede !== filter) return false;
    if (search && !c.name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const totalCandidates = candidates.length;
  const inFunnel = candidates.filter(c => !['hired', 'rejected'].includes(c.stage)).length;
  const noShowRate = 12;
  const avgTimeToHire = 3.2;

  return (
    <div style={styles.shell}>
      <Sidebar view={view} setView={setView} />

      <main style={styles.main}>
        <Topbar view={view} totalCandidates={totalCandidates} inFunnel={inFunnel} />

        {view === 'pipeline' && (
          <PipelineView
            candidates={filtered}
            search={search}
            setSearch={setSearch}
            filter={filter}
            setFilter={setFilter}
            onSelect={(c) => setSelected(c)}
          />
        )}

        {view === 'analytics' && <AnalyticsView noShowRate={noShowRate} avgTimeToHire={avgTimeToHire} />}
        {view === 'inbox' && <InboxView candidates={candidates} onSelect={(c) => setSelected(c)} />}
        {view === 'academy' && <AcademyView />}
      </main>

      {selected && (
        <Drawer
          candidate={selected}
          onClose={() => setSelected(null)}
          conversation={conversation}
          typing={typing}
          reply={reply}
          setReply={setReply}
          onSend={handleSendReply}
          drawerRef={drawerRef}
        />
      )}
    </div>
  );
}

// ====================================================================
// SIDEBAR
// ====================================================================
function Sidebar({ view, setView }) {
  const items = [
    { id: 'pipeline',  label: 'Pipeline',    icon: Users },
    { id: 'inbox',     label: 'Excepciones', icon: Inbox, badge: 3 },
    { id: 'academy',   label: 'Academia',    icon: Award },
    { id: 'analytics', label: 'Analítica',   icon: BarChart3 },
  ];

  return (
    <aside style={styles.sidebar}>
      <div style={styles.brand}>
        <div style={styles.brandDot} />
        <div>
          <div style={styles.brandName}>Talent OS</div>
          <div style={styles.brandSub}>Don Benítez</div>
        </div>
      </div>

      <nav style={{ flex: 1, marginTop: 18 }}>
        {items.map(item => (
          <button
            key={item.id}
            onClick={() => setView(item.id)}
            style={{
              ...styles.navItem,
              ...(view === item.id ? styles.navItemActive : {}),
            }}
          >
            <item.icon size={14} strokeWidth={1.8} />
            <span style={{ flex: 1, textAlign: 'left' }}>{item.label}</span>
            {item.badge && <span style={styles.badge}>{item.badge}</span>}
          </button>
        ))}
      </nav>

      <div style={styles.sidebarFooter}>
        <div style={styles.userRow}>
          <div style={styles.avatar}>D</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={styles.userName}>Dani Seneor</div>
            <div style={styles.userRole}>Admin · Cartagena</div>
          </div>
          <Settings size={13} color="#666" />
        </div>
      </div>
    </aside>
  );
}

// ====================================================================
// TOPBAR
// ====================================================================
function Topbar({ view, totalCandidates, inFunnel }) {
  const titles = {
    pipeline: 'Pipeline de candidatos',
    inbox: 'Bandeja de excepciones',
    academy: 'Academia · Onboarding',
    analytics: 'Analítica del funnel',
  };

  return (
    <header style={styles.topbar}>
      <div>
        <div style={styles.crumbs}>
          <span style={{ color: '#555' }}>Talent OS</span>
          <ChevronRight size={11} color="#333" />
          <span>{titles[view]}</span>
        </div>
      </div>
      <div style={styles.topbarRight}>
        <div style={styles.statPill}>
          <Activity size={11} color="#10b981" />
          <span style={{ color: '#888' }}>{inFunnel} activos</span>
          <span style={{ color: '#444' }}>·</span>
          <span style={{ color: '#888' }}>{totalCandidates} total</span>
        </div>
        <button style={styles.iconBtn}><Bell size={13} color="#888" /></button>
      </div>
    </header>
  );
}

// ====================================================================
// PIPELINE VIEW · Kanban
// ====================================================================
function PipelineView({ candidates, search, setSearch, filter, setFilter, onSelect }) {
  return (
    <div style={styles.viewContainer}>
      {/* Filters */}
      <div style={styles.filterRow}>
        <div style={styles.searchBox}>
          <Search size={13} color="#555" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Buscar candidato..."
            style={styles.searchInput}
          />
          <kbd style={styles.kbd}>⌘K</kbd>
        </div>

        <div style={styles.tabs}>
          {['all', 'Cartagena · Centro', 'Cartagena · Bocagrande', 'Barranquilla · Norte', 'Santa Marta'].map(s => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              style={{ ...styles.tab, ...(filter === s ? styles.tabActive : {}) }}
            >
              {s === 'all' ? 'Todas las sedes' : s}
            </button>
          ))}
        </div>
      </div>

      {/* Kanban */}
      <div style={styles.kanban}>
        {STAGES.map(stage => {
          const stageCandidates = candidates.filter(c => c.stage === stage.id);
          return (
            <div key={stage.id} style={styles.column}>
              <div style={styles.columnHeader}>
                <div style={styles.columnTitle}>
                  <div style={{ ...styles.stageDot, background: stage.color }} />
                  <span>{stage.label}</span>
                </div>
                <span style={styles.columnCount}>{stageCandidates.length}</span>
              </div>
              <div style={styles.columnBody}>
                {stageCandidates.map(c => (
                  <CandidateCard key={c.id} candidate={c} onSelect={onSelect} />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function CandidateCard({ candidate, onSelect }) {
  const [hover, setHover] = useState(false);
  const scoreColor = candidate.score >= 90 ? '#e8c66a' : candidate.score >= 80 ? '#10b981' : '#888';

  return (
    <div
      onClick={() => onSelect(candidate)}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        ...styles.card,
        ...(hover ? styles.cardHover : {}),
      }}
    >
      <div style={styles.cardHeader}>
        <div style={styles.cardAvatar}>{candidate.name.split(' ').map(n => n[0]).slice(0, 2).join('')}</div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={styles.cardName}>{candidate.name}</div>
          <div style={styles.cardMeta}>{candidate.pos} · {candidate.age}a</div>
        </div>
      </div>

      <div style={styles.cardSede}>
        <MapPin size={9} color="#555" strokeWidth={2} />
        <span>{candidate.sede}</span>
      </div>

      <div style={styles.cardFooter}>
        <div style={styles.scoreRow}>
          <Star size={9} color={scoreColor} fill={scoreColor} />
          <span style={{ color: scoreColor, fontWeight: 600 }}>{candidate.score}</span>
          {candidate.eng > 0 && (
            <>
              <span style={{ color: '#333', margin: '0 2px' }}>·</span>
              <Zap size={9} color="#d4af37" />
              <span style={{ color: '#888' }}>{candidate.eng}</span>
            </>
          )}
        </div>
        <div style={styles.cardTime}>{candidate.time}</div>
      </div>
    </div>
  );
}

// ====================================================================
// DRAWER · Candidate detail
// ====================================================================
function Drawer({ candidate, onClose, conversation, typing, reply, setReply, onSend, drawerRef }) {
  return (
    <>
      <div style={styles.drawerBackdrop} onClick={onClose} />
      <aside ref={drawerRef} style={styles.drawer}>
        {/* Header */}
        <div style={styles.drawerHeader}>
          <button style={styles.iconBtn} onClick={onClose}><X size={14} color="#888" /></button>
          <div style={{ flex: 1 }} />
          <button style={styles.iconBtn}><Phone size={13} color="#888" /></button>
          <button style={styles.iconBtn}><Calendar size={13} color="#888" /></button>
          <button style={styles.primaryBtn}>
            <Check size={11} /> Aprobar
          </button>
        </div>

        {/* Candidate summary */}
        <div style={styles.drawerSummary}>
          <div style={styles.drawerAvatar}>
            {candidate.name.split(' ').map(n => n[0]).slice(0, 2).join('')}
          </div>
          <div>
            <div style={styles.drawerName}>{candidate.name}</div>
            <div style={styles.drawerSub}>{candidate.pos} · {candidate.age} años · {candidate.sede}</div>
            <div style={styles.drawerTags}>
              <span style={styles.tagPill}>{candidate.source}</span>
              <span style={styles.tagPill}>{candidate.phone}</span>
            </div>
          </div>
        </div>

        {/* Scores */}
        <div style={styles.scoresGrid}>
          <div style={styles.scoreCard}>
            <div style={styles.scoreLabel}>Calificación</div>
            <div style={styles.scoreValue}>{candidate.score}<span style={styles.scoreUnit}>/100</span></div>
            <div style={styles.scoreBar}>
              <div style={{ ...styles.scoreBarFill, width: `${candidate.score}%`, background: '#10b981' }} />
            </div>
          </div>
          <div style={styles.scoreCard}>
            <div style={styles.scoreLabel}>Engagement</div>
            <div style={styles.scoreValue}>{candidate.eng}<span style={styles.scoreUnit}>/100</span></div>
            <div style={styles.scoreBar}>
              <div style={{ ...styles.scoreBarFill, width: `${candidate.eng}%`, background: '#d4af37' }} />
            </div>
          </div>
        </div>

        {/* Conversation */}
        <div style={styles.convoSection}>
          <div style={styles.convoHeader}>
            <MessageCircle size={11} color="#888" />
            <span>Conversación WhatsApp</span>
            <span style={styles.liveTag}>
              <span style={styles.livePulse} />
              en vivo
            </span>
          </div>

          <div style={styles.convoFeed}>
            {conversation.map((m, i) => (
              <Message key={i} message={m} />
            ))}
            {typing && (
              <div style={{ ...styles.bubble, ...styles.bubbleUser, padding: '8px 12px' }}>
                <div style={styles.typing}>
                  <span style={styles.dot1}></span>
                  <span style={styles.dot2}></span>
                  <span style={styles.dot3}></span>
                </div>
              </div>
            )}
          </div>

          <div style={styles.replyBar}>
            <div style={styles.takeOver}>
              <Sparkles size={10} color="#d4af37" />
              <span>Vale gestionando · </span>
              <button style={styles.takeOverBtn}>tomar control</button>
            </div>
            <div style={styles.replyInput}>
              <input
                value={reply}
                onChange={e => setReply(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && onSend()}
                placeholder="Responder como manager..."
                style={styles.replyField}
              />
              <button onClick={onSend} style={styles.sendBtn}>
                <Send size={11} />
              </button>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}

function Message({ message }) {
  const isUser = message.from === 'user';
  const isBot = message.from === 'bot';
  const isManager = message.from === 'manager';

  return (
    <div style={{ ...styles.bubbleRow, justifyContent: isUser ? 'flex-end' : 'flex-start' }}>
      <div style={{
        ...styles.bubble,
        ...(isUser ? styles.bubbleUser : isManager ? styles.bubbleManager : styles.bubbleBot)
      }}>
        {isBot && <div style={styles.bubbleFrom}>Vale · IA</div>}
        {isManager && <div style={styles.bubbleFrom}>Tú · manual</div>}
        <div style={{ whiteSpace: 'pre-wrap' }}>{message.text}</div>
        <div style={styles.bubbleTime}>{message.time}</div>
      </div>
    </div>
  );
}

// ====================================================================
// ANALYTICS VIEW
// ====================================================================
function AnalyticsView({ noShowRate, avgTimeToHire }) {
  return (
    <div style={styles.viewContainer}>
      <div style={styles.kpiGrid}>
        <Kpi label="Tiempo a primer contacto" from="4h 12min" to="47s" delta={-99.7} icon={Zap} />
        <Kpi label="No-show entrevista"        from="38%"     to="12%" delta={-68.4} icon={X} />
        <Kpi label="Llega a primer turno"      from="65%"     to="91%" delta={+40.0} icon={Check} />
        <Kpi label="Horas mgr / contrato"      from="6.2h"    to="0.8h" delta={-87.1} icon={Clock} />
      </div>

      <div style={styles.analyticsGrid}>
        <div style={styles.panel}>
          <div style={styles.panelHeader}>
            <h3 style={styles.panelTitle}>Funnel · últimos 30 días</h3>
            <span style={styles.panelMeta}>289 candidatos</span>
          </div>
          <FunnelChart />
        </div>

        <div style={styles.panel}>
          <div style={styles.panelHeader}>
            <h3 style={styles.panelTitle}>No-show por sede</h3>
            <span style={styles.panelMeta}>vs semana anterior</span>
          </div>
          <SedeChart />
        </div>
      </div>
    </div>
  );
}

function Kpi({ label, from, to, delta, icon: Icon }) {
  const positive = delta > 0;
  return (
    <div style={styles.kpiCard}>
      <div style={styles.kpiHead}>
        <div style={styles.kpiLabel}>{label}</div>
        <Icon size={13} color="#444" />
      </div>
      <div style={styles.kpiValues}>
        <div style={styles.kpiFrom}>{from}</div>
        <ChevronRight size={11} color="#333" />
        <div style={styles.kpiTo}>{to}</div>
      </div>
      <div style={{ ...styles.kpiDelta, color: positive ? '#10b981' : '#e8c66a' }}>
        {positive ? <ArrowUpRight size={10} /> : <ArrowDownRight size={10} />}
        <span>{Math.abs(delta).toFixed(1)}%</span>
      </div>
    </div>
  );
}

function FunnelChart() {
  const data = [
    { label: 'Capturados',     value: 289, pct: 100 },
    { label: 'Calificados',    value: 198, pct: 68 },
    { label: 'Agendados',      value: 142, pct: 49 },
    { label: 'Entrevistados',  value: 125, pct: 43 },
    { label: 'Contratados',    value: 87,  pct: 30 },
    { label: 'Primer turno',   value: 79,  pct: 27 },
  ];
  return (
    <div style={{ padding: '14px 0' }}>
      {data.map((d, i) => (
        <div key={i} style={styles.funnelRow}>
          <div style={styles.funnelLabel}>{d.label}</div>
          <div style={styles.funnelBarTrack}>
            <div style={{
              ...styles.funnelBar,
              width: `${d.pct}%`,
              background: `linear-gradient(90deg, #d4af37 0%, #e8c66a 100%)`,
              opacity: 0.3 + (d.pct / 100) * 0.7
            }} />
            <span style={styles.funnelValue}>{d.value}</span>
            <span style={styles.funnelPct}>{d.pct}%</span>
          </div>
        </div>
      ))}
    </div>
  );
}

function SedeChart() {
  const data = [
    { sede: 'Cartagena · Centro',      rate: 8,  prev: 12, color: '#10b981' },
    { sede: 'Cartagena · Bocagrande',  rate: 11, prev: 15, color: '#10b981' },
    { sede: 'Barranquilla · Norte',    rate: 14, prev: 13, color: '#e8c66a' },
    { sede: 'Santa Marta',             rate: 18, prev: 22, color: '#10b981' },
  ];
  return (
    <div style={{ padding: '14px 0' }}>
      {data.map((d, i) => (
        <div key={i} style={styles.sedeRow}>
          <div style={styles.sedeName}>{d.sede}</div>
          <div style={styles.sedeBarTrack}>
            <div style={{ ...styles.sedeBar, width: `${d.rate * 4}%`, background: d.color }} />
          </div>
          <div style={styles.sedeStats}>
            <span style={{ color: '#fafafa', fontWeight: 600 }}>{d.rate}%</span>
            <span style={{ color: '#555', fontSize: 10, marginLeft: 6 }}>
              {d.rate < d.prev ? '↓' : '↑'} {Math.abs(d.rate - d.prev)}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}

// ====================================================================
// INBOX VIEW · Exceptions
// ====================================================================
function InboxView({ candidates, onSelect }) {
  const exceptions = [
    { type: 'sentiment',  candidate: candidates[3], reason: 'Detecté frustración en el chat', urgency: 'high' },
    { type: 'no_show',    candidate: candidates[10], reason: 'No confirmó entrevista de mañana 3pm', urgency: 'high' },
    { type: 'out_of_scope', candidate: candidates[6], reason: 'Preguntó sobre seguro médico — fuera de mi alcance', urgency: 'medium' },
  ];

  return (
    <div style={styles.viewContainer}>
      <div style={{ marginBottom: 16, fontSize: 12, color: '#888' }}>
        Vale escaló estos casos porque requieren tu juicio. Resuélvelos rápido para que el flujo no se rompa.
      </div>
      {exceptions.map((e, i) => (
        <div key={i} style={styles.exception}>
          <div style={{ ...styles.exceptionDot, background: e.urgency === 'high' ? '#ef4444' : '#e8c66a' }} />
          <div style={{ flex: 1 }}>
            <div style={styles.exceptionTitle}>
              {e.candidate.name}
              <span style={styles.exceptionType}>{e.type.replace('_', ' ')}</span>
            </div>
            <div style={styles.exceptionReason}>{e.reason}</div>
          </div>
          <button style={styles.linkBtn} onClick={() => onSelect(e.candidate)}>
            Ver conversación <ChevronRight size={11} />
          </button>
        </div>
      ))}
    </div>
  );
}

// ====================================================================
// ACADEMY VIEW
// ====================================================================
function AcademyView() {
  const candidate = SEEDS.find(c => c.id === 13);
  return (
    <div style={styles.viewContainer}>
      <div style={styles.academyHero}>
        <div>
          <div style={styles.academyKicker}>VISTA DEL CANDIDATO · PRE-ONBOARDING</div>
          <div style={styles.academyTitle}>Hola Karen 👋</div>
          <div style={styles.academySub}>Bienvenida a la Academia Don Benítez. Te estamos preparando para tu primer turno el lunes.</div>
          <div style={styles.academyStats}>
            <div><span style={styles.academyStatNum}>180</span><span style={styles.academyStatLbl}>pts</span></div>
            <div><span style={styles.academyStatNum}>2</span><span style={styles.academyStatLbl}>badges</span></div>
            <div><span style={styles.academyStatNum}>40%</span><span style={styles.academyStatLbl}>completado</span></div>
          </div>
        </div>
      </div>

      <div style={{ marginTop: 24 }}>
        {ACADEMY_MODULES.map(m => (
          <div key={m.day} style={{ ...styles.module, opacity: m.status === 'locked' ? 0.4 : 1 }}>
            <div style={styles.moduleIcon}>{m.icon}</div>
            <div style={{ flex: 1 }}>
              <div style={styles.moduleHead}>
                <span style={styles.moduleDay}>Día {m.day}</span>
                <span style={styles.moduleTitle}>{m.title}</span>
                {m.status === 'done' && <span style={styles.moduleDone}>✓ Completado</span>}
                {m.status === 'doing' && <span style={styles.moduleDoing}>En progreso</span>}
                {m.status === 'locked' && <span style={styles.moduleLocked}>Bloqueado</span>}
              </div>
              <div style={styles.moduleDesc}>{m.desc}</div>
              <div style={styles.moduleProgress}>
                <div style={{ ...styles.moduleProgressBar, width: `${m.progress}%` }} />
              </div>
            </div>
            <div style={styles.modulePoints}>+{m.points}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ====================================================================
// STYLES
// ====================================================================
const styles = {
  shell: {
    display: 'flex',
    minHeight: '100vh',
    background: '#0a0a0a',
    color: '#e5e5e5',
    fontFamily: '"Geist", -apple-system, "Helvetica Neue", sans-serif',
    fontSize: 13,
    letterSpacing: '-0.005em',
  },

  // Sidebar
  sidebar: {
    width: 200,
    background: '#0a0a0a',
    borderRight: '1px solid #161616',
    padding: '14px 10px',
    display: 'flex',
    flexDirection: 'column',
    flexShrink: 0,
  },
  brand: { display: 'flex', alignItems: 'center', gap: 10, padding: '4px 8px 12px', borderBottom: '1px solid #161616' },
  brandDot: { width: 22, height: 22, borderRadius: 5, background: 'linear-gradient(135deg, #d4af37 0%, #b8881e 100%)', boxShadow: '0 0 0 1px rgba(212,175,55,0.15), 0 2px 10px rgba(212,175,55,0.2)' },
  brandName: { fontSize: 12.5, fontWeight: 600, color: '#fafafa', letterSpacing: '-0.015em' },
  brandSub: { fontSize: 10, color: '#666', marginTop: 1 },
  navItem: {
    width: '100%',
    background: 'transparent',
    border: 'none',
    color: '#888',
    fontSize: 12,
    padding: '7px 9px',
    borderRadius: 5,
    display: 'flex',
    alignItems: 'center',
    gap: 9,
    cursor: 'pointer',
    marginBottom: 1,
    fontFamily: 'inherit',
    transition: 'all 120ms',
  },
  navItemActive: { background: '#141414', color: '#fafafa' },
  badge: { background: '#d4af37', color: '#0a0a0a', fontSize: 9, fontWeight: 700, padding: '1px 5px', borderRadius: 3 },
  sidebarFooter: { borderTop: '1px solid #161616', paddingTop: 10, marginTop: 8 },
  userRow: { display: 'flex', alignItems: 'center', gap: 8, padding: '4px 8px' },
  avatar: { width: 24, height: 24, borderRadius: 6, background: '#1a1a1a', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 600, color: '#d4af37' },
  userName: { fontSize: 11.5, color: '#e5e5e5', fontWeight: 500 },
  userRole: { fontSize: 9.5, color: '#555' },

  // Main
  main: { flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 },

  // Topbar
  topbar: { height: 44, borderBottom: '1px solid #161616', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 18px', background: 'rgba(10,10,10,0.85)', backdropFilter: 'blur(10px)', position: 'sticky', top: 0, zIndex: 10 },
  crumbs: { display: 'flex', alignItems: 'center', gap: 6, fontSize: 11.5, color: '#aaa' },
  topbarRight: { display: 'flex', alignItems: 'center', gap: 10 },
  statPill: { display: 'flex', alignItems: 'center', gap: 6, fontSize: 10.5, background: '#0f0f0f', border: '1px solid #1f1f1f', padding: '4px 9px', borderRadius: 5 },
  iconBtn: { background: 'transparent', border: '1px solid transparent', padding: '5px', borderRadius: 5, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' },

  viewContainer: { padding: 18, flex: 1, overflow: 'auto' },

  // Filters
  filterRow: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginBottom: 16, flexWrap: 'wrap' },
  searchBox: { display: 'flex', alignItems: 'center', gap: 7, background: '#0d0d0d', border: '1px solid #1f1f1f', borderRadius: 6, padding: '6px 10px', width: 260 },
  searchInput: { background: 'transparent', border: 'none', color: '#e5e5e5', flex: 1, outline: 'none', fontSize: 12, fontFamily: 'inherit' },
  kbd: { fontSize: 9, color: '#555', background: '#161616', padding: '1px 5px', borderRadius: 3, border: '1px solid #1f1f1f' },
  tabs: { display: 'flex', gap: 3, background: '#0d0d0d', border: '1px solid #1f1f1f', borderRadius: 6, padding: 3 },
  tab: { background: 'transparent', border: 'none', color: '#888', fontSize: 11, padding: '5px 10px', borderRadius: 4, cursor: 'pointer', fontFamily: 'inherit' },
  tabActive: { background: '#1a1a1a', color: '#fafafa' },

  // Kanban
  kanban: { display: 'grid', gridTemplateColumns: 'repeat(6, minmax(180px, 1fr))', gap: 10, overflowX: 'auto' },
  column: { background: '#0c0c0c', border: '1px solid #161616', borderRadius: 7, padding: 10, minHeight: 400 },
  columnHeader: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10, paddingBottom: 8, borderBottom: '1px solid #161616' },
  columnTitle: { display: 'flex', alignItems: 'center', gap: 7, fontSize: 11, color: '#e5e5e5', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.05em' },
  stageDot: { width: 6, height: 6, borderRadius: '50%' },
  columnCount: { fontSize: 10, color: '#666', background: '#161616', padding: '1px 6px', borderRadius: 3, fontWeight: 600 },
  columnBody: { display: 'flex', flexDirection: 'column', gap: 7 },

  // Card
  card: { background: '#111', border: '1px solid #1a1a1a', borderRadius: 6, padding: '10px 10px 9px', cursor: 'pointer', transition: 'all 130ms ease' },
  cardHover: { borderColor: '#2a2a2a', background: '#141414', transform: 'translateY(-1px)' },
  cardHeader: { display: 'flex', alignItems: 'center', gap: 8, marginBottom: 7 },
  cardAvatar: { width: 22, height: 22, borderRadius: 5, background: 'linear-gradient(135deg, #1a1a1a, #262626)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, fontWeight: 600, color: '#d4af37', flexShrink: 0 },
  cardName: { fontSize: 11.5, color: '#fafafa', fontWeight: 500, lineHeight: 1.2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
  cardMeta: { fontSize: 9.5, color: '#666', marginTop: 1 },
  cardSede: { fontSize: 9.5, color: '#777', display: 'flex', alignItems: 'center', gap: 4, marginBottom: 8 },
  cardFooter: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid #1a1a1a', paddingTop: 7, fontSize: 9.5 },
  scoreRow: { display: 'flex', alignItems: 'center', gap: 3 },
  cardTime: { color: '#555', fontSize: 9.5 },

  // Drawer
  drawerBackdrop: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(2px)', zIndex: 50 },
  drawer: { position: 'fixed', top: 0, right: 0, bottom: 0, width: 480, background: '#0c0c0c', borderLeft: '1px solid #1a1a1a', zIndex: 51, display: 'flex', flexDirection: 'column', overflow: 'hidden' },
  drawerHeader: { display: 'flex', alignItems: 'center', gap: 6, padding: '10px 12px', borderBottom: '1px solid #161616' },
  primaryBtn: { background: 'linear-gradient(180deg, #d4af37, #b8881e)', color: '#0a0a0a', border: 'none', borderRadius: 5, padding: '5px 11px', fontSize: 11, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, fontFamily: 'inherit' },
  drawerSummary: { display: 'flex', alignItems: 'flex-start', gap: 12, padding: '14px 16px', borderBottom: '1px solid #161616' },
  drawerAvatar: { width: 40, height: 40, borderRadius: 8, background: 'linear-gradient(135deg, #1a1a1a, #262626)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 600, color: '#d4af37', flexShrink: 0 },
  drawerName: { fontSize: 15, fontWeight: 600, color: '#fafafa', letterSpacing: '-0.015em' },
  drawerSub: { fontSize: 11, color: '#888', marginTop: 2 },
  drawerTags: { display: 'flex', gap: 5, marginTop: 8 },
  tagPill: { fontSize: 9.5, color: '#888', background: '#141414', border: '1px solid #1f1f1f', padding: '2px 6px', borderRadius: 3 },

  // Scores grid
  scoresGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, padding: '12px 16px', borderBottom: '1px solid #161616' },
  scoreCard: { background: '#0f0f0f', border: '1px solid #1a1a1a', borderRadius: 6, padding: '10px 12px' },
  scoreLabel: { fontSize: 9.5, color: '#666', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 5 },
  scoreValue: { fontSize: 20, color: '#fafafa', fontWeight: 600, letterSpacing: '-0.02em' },
  scoreUnit: { fontSize: 10, color: '#555', fontWeight: 400, marginLeft: 2 },
  scoreBar: { height: 3, background: '#1a1a1a', borderRadius: 2, marginTop: 7, overflow: 'hidden' },
  scoreBarFill: { height: '100%', borderRadius: 2, transition: 'width 400ms' },

  // Convo
  convoSection: { flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 },
  convoHeader: { display: 'flex', alignItems: 'center', gap: 6, padding: '10px 16px', fontSize: 10.5, color: '#888', textTransform: 'uppercase', letterSpacing: '0.08em' },
  liveTag: { marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 4, fontSize: 9, color: '#10b981', background: 'rgba(16,185,129,0.08)', padding: '2px 7px', borderRadius: 3, textTransform: 'none' },
  livePulse: { width: 5, height: 5, borderRadius: '50%', background: '#10b981', animation: 'pulse 1.6s infinite' },
  convoFeed: { flex: 1, overflowY: 'auto', padding: '6px 16px 12px', display: 'flex', flexDirection: 'column', gap: 8 },
  bubbleRow: { display: 'flex', width: '100%' },
  bubble: { maxWidth: '78%', padding: '8px 11px', borderRadius: 10, fontSize: 11.5, lineHeight: 1.4 },
  bubbleBot: { background: '#141414', border: '1px solid #1f1f1f', color: '#d4d4d4', borderTopLeftRadius: 3 },
  bubbleUser: { background: '#1a3322', border: '1px solid #234c2f', color: '#d4f5d4', borderTopRightRadius: 3 },
  bubbleManager: { background: 'rgba(212,175,55,0.12)', border: '1px solid rgba(212,175,55,0.3)', color: '#f0d77a', borderTopRightRadius: 3 },
  bubbleFrom: { fontSize: 8.5, color: '#d4af37', fontWeight: 600, marginBottom: 3, letterSpacing: '0.04em', textTransform: 'uppercase' },
  bubbleTime: { fontSize: 8.5, color: '#555', marginTop: 4 },
  typing: { display: 'flex', gap: 3, alignItems: 'center' },
  dot1: { width: 4, height: 4, borderRadius: '50%', background: '#666', animation: 'typing 1.2s infinite' },
  dot2: { width: 4, height: 4, borderRadius: '50%', background: '#666', animation: 'typing 1.2s infinite 0.2s' },
  dot3: { width: 4, height: 4, borderRadius: '50%', background: '#666', animation: 'typing 1.2s infinite 0.4s' },

  // Reply
  replyBar: { borderTop: '1px solid #161616', padding: 12, background: '#0a0a0a' },
  takeOver: { display: 'flex', alignItems: 'center', gap: 5, fontSize: 10, color: '#888', marginBottom: 7 },
  takeOverBtn: { background: 'none', border: 'none', color: '#d4af37', textDecoration: 'underline', cursor: 'pointer', fontSize: 10, padding: 0, fontFamily: 'inherit' },
  replyInput: { display: 'flex', gap: 6, background: '#111', border: '1px solid #1f1f1f', borderRadius: 6, padding: 5 },
  replyField: { flex: 1, background: 'transparent', border: 'none', color: '#e5e5e5', outline: 'none', fontSize: 12, padding: '4px 6px', fontFamily: 'inherit' },
  sendBtn: { background: '#d4af37', color: '#0a0a0a', border: 'none', borderRadius: 4, padding: '5px 9px', cursor: 'pointer', display: 'flex', alignItems: 'center' },

  // Analytics
  kpiGrid: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10, marginBottom: 18 },
  kpiCard: { background: '#0c0c0c', border: '1px solid #161616', borderRadius: 7, padding: '12px 14px' },
  kpiHead: { display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 10 },
  kpiLabel: { fontSize: 10, color: '#888', textTransform: 'uppercase', letterSpacing: '0.08em' },
  kpiValues: { display: 'flex', alignItems: 'baseline', gap: 6, marginBottom: 6 },
  kpiFrom: { fontSize: 11.5, color: '#555', textDecoration: 'line-through' },
  kpiTo: { fontSize: 20, color: '#fafafa', fontWeight: 600, letterSpacing: '-0.02em' },
  kpiDelta: { display: 'flex', alignItems: 'center', gap: 3, fontSize: 10, fontWeight: 600 },

  analyticsGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 },
  panel: { background: '#0c0c0c', border: '1px solid #161616', borderRadius: 7, padding: 14 },
  panelHeader: { display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', paddingBottom: 8, borderBottom: '1px solid #161616' },
  panelTitle: { fontSize: 12, fontWeight: 600, color: '#fafafa', letterSpacing: '-0.01em' },
  panelMeta: { fontSize: 10, color: '#666' },

  funnelRow: { display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 },
  funnelLabel: { fontSize: 10.5, color: '#888', width: 100 },
  funnelBarTrack: { flex: 1, height: 26, background: '#0f0f0f', borderRadius: 4, position: 'relative', display: 'flex', alignItems: 'center', overflow: 'hidden', border: '1px solid #161616' },
  funnelBar: { position: 'absolute', left: 0, top: 0, bottom: 0, borderRadius: 3 },
  funnelValue: { position: 'relative', zIndex: 2, marginLeft: 9, fontSize: 11, color: '#0a0a0a', fontWeight: 700 },
  funnelPct: { position: 'relative', zIndex: 2, marginLeft: 'auto', marginRight: 9, fontSize: 9.5, color: '#888', fontFamily: 'monospace' },

  sedeRow: { display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 },
  sedeName: { fontSize: 11, color: '#aaa', width: 140 },
  sedeBarTrack: { flex: 1, height: 6, background: '#0f0f0f', borderRadius: 3, overflow: 'hidden' },
  sedeBar: { height: '100%', borderRadius: 3 },
  sedeStats: { width: 56, textAlign: 'right' },

  // Exceptions
  exception: { display: 'flex', alignItems: 'center', gap: 12, background: '#0d0d0d', border: '1px solid #1a1a1a', borderRadius: 6, padding: '11px 14px', marginBottom: 8 },
  exceptionDot: { width: 6, height: 6, borderRadius: '50%' },
  exceptionTitle: { fontSize: 12, color: '#fafafa', fontWeight: 500, display: 'flex', alignItems: 'center', gap: 8 },
  exceptionType: { fontSize: 9, color: '#d4af37', background: 'rgba(212,175,55,0.1)', padding: '1px 6px', borderRadius: 3, textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 },
  exceptionReason: { fontSize: 10.5, color: '#888', marginTop: 3 },
  linkBtn: { background: 'transparent', border: 'none', color: '#d4af37', cursor: 'pointer', fontSize: 11, display: 'flex', alignItems: 'center', gap: 3, fontFamily: 'inherit' },

  // Academy
  academyHero: { background: 'linear-gradient(135deg, #1a1408 0%, #0c0c0c 100%)', border: '1px solid #2a1f0a', borderRadius: 9, padding: 22 },
  academyKicker: { fontSize: 9.5, color: '#d4af37', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: 10, fontWeight: 600 },
  academyTitle: { fontSize: 24, fontWeight: 600, color: '#fafafa', letterSpacing: '-0.025em', marginBottom: 6 },
  academySub: { fontSize: 12.5, color: '#aaa', maxWidth: 460, lineHeight: 1.5 },
  academyStats: { display: 'flex', gap: 24, marginTop: 18 },
  academyStatNum: { fontSize: 22, fontWeight: 600, color: '#d4af37', letterSpacing: '-0.02em' },
  academyStatLbl: { fontSize: 10, color: '#888', marginLeft: 5, textTransform: 'uppercase', letterSpacing: '0.1em' },

  module: { display: 'flex', alignItems: 'center', gap: 14, background: '#0d0d0d', border: '1px solid #1a1a1a', borderRadius: 7, padding: '13px 16px', marginBottom: 7 },
  moduleIcon: { fontSize: 22, width: 38, height: 38, background: '#141414', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  moduleHead: { display: 'flex', alignItems: 'center', gap: 9, marginBottom: 4 },
  moduleDay: { fontSize: 9.5, color: '#d4af37', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em' },
  moduleTitle: { fontSize: 13, color: '#fafafa', fontWeight: 600, letterSpacing: '-0.01em' },
  moduleDone: { marginLeft: 'auto', fontSize: 10, color: '#10b981', background: 'rgba(16,185,129,0.1)', padding: '2px 7px', borderRadius: 3 },
  moduleDoing: { marginLeft: 'auto', fontSize: 10, color: '#d4af37', background: 'rgba(212,175,55,0.1)', padding: '2px 7px', borderRadius: 3 },
  moduleLocked: { marginLeft: 'auto', fontSize: 10, color: '#555', background: '#141414', padding: '2px 7px', borderRadius: 3 },
  moduleDesc: { fontSize: 11, color: '#888', marginBottom: 7 },
  moduleProgress: { height: 2.5, background: '#1a1a1a', borderRadius: 2, overflow: 'hidden' },
  moduleProgressBar: { height: '100%', background: 'linear-gradient(90deg, #d4af37, #e8c66a)', borderRadius: 2, transition: 'width 400ms' },
  modulePoints: { fontSize: 14, fontWeight: 700, color: '#d4af37', minWidth: 40, textAlign: 'right' },
};

// Inject keyframes
if (typeof document !== 'undefined' && !document.getElementById('talent-os-keyframes')) {
  const style = document.createElement('style');
  style.id = 'talent-os-keyframes';
  style.textContent = `
    @keyframes pulse {
      0%, 100% { opacity: 1; transform: scale(1); }
      50% { opacity: 0.4; transform: scale(0.85); }
    }
    @keyframes typing {
      0%, 60%, 100% { opacity: 0.3; transform: translateY(0); }
      30% { opacity: 1; transform: translateY(-2px); }
    }
    *::-webkit-scrollbar { width: 6px; height: 6px; }
    *::-webkit-scrollbar-track { background: transparent; }
    *::-webkit-scrollbar-thumb { background: #1f1f1f; border-radius: 3px; }
    *::-webkit-scrollbar-thumb:hover { background: #2a2a2a; }
  `;
  document.head.appendChild(style);
}
