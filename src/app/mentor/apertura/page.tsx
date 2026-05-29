"use client";

import { useState, useEffect } from "react";
import {
  KeyRound, ScanSearch, MonitorCheck, MapPin, Store, Calculator, DoorOpen, Target,
  AlertTriangle, Check, ArrowLeft, X, ChevronRight, Trophy, Lock, Play,
  RotateCcw, CheckCircle2, ShieldAlert, User, Eye, EyeOff, LogOut, ArrowRight,
  type LucideIcon,
} from "lucide-react";

const STORAGE_KEY = "totto_mentor_apertura_v1";
const AUTH_KEY = "totto_mentor_auth_v1";
const CRED = { user: "Mayo29", pass: "Demo1" };

type RoleKey = "L1" | "A2" | "C3" | "R4" | "M5" | "ALL";

const ROLES: Record<RoleKey, { label: string; bg: string; fg: string }> = {
  L1: { label: "Líder", bg: "#FF3B3B", fg: "#fff" },
  A2: { label: "Asesor", bg: "#F5C518", fg: "#1A1A1A" },
  C3: { label: "Cajero", bg: "#1A1A1A", fg: "#fff" },
  R4: { label: "Regional", bg: "#1A1A1A", fg: "#fff" },
  M5: { label: "Monitoreo", bg: "#CFC7B2", fg: "#1A1A1A" },
  ALL: { label: "Cada colaborador", bg: "#1A1A1A", fg: "#fff" },
};

type Step = { t: string; d: string; crit?: boolean };
type QuizQ = { q: string; o: string[]; a: number };
type Block = {
  n: string;
  id: string;
  title: string;
  icon: LucideIcon;
  promise: string;
  who: RoleKey[];
  whoExtra?: string;
  start: string;
  dur: string;
  evidence: string;
  tags: string;
  steps: Step[];
  kpi: string;
  fail: string;
  quiz: QuizQ[];
};

const BLOCKS: Block[] = [
  {
    n: "01", id: "b1", title: "Llaves y puertas", icon: KeyRound,
    promise: "Mínima ventana de riesgo. Entra primero, deja huella, cierra detrás de ti.",
    who: ["L1"], start: "T−15", dur: "2 min", evidence: "Mensaje único + timestamp",
    tags: "LLAVES · PERSIANA · CANDADO",
    steps: [
      { t: "Lleva las dos llaves.", d: "Verifica las copias antes de salir." },
      { t: "Mínimo dos personas.", d: "Si vas solo en calle, llama a CCTV." },
      { t: "Abre candados y persiana.", d: "No fuerces si hay residuos extraños.", crit: true },
      { t: "Entra y cierra detrás.", d: "Hasta apertura comercial: cerrado." },
      { t: "Guarda las llaves.", d: "Módulo de pago. Sitio asignado." },
    ],
    kpi: "Aperturas en ventana ±5 minutos vs. horario contratado.",
    fail: "Cerradura bloqueada → CCTV + Aranda a Mantenimiento.",
    quiz: [{ q: "Al abrir candados y persiana, si hay residuos extraños debes:", o: ["Forzar rápido para abrir a tiempo", "No forzar y reportar", "Limpiar y abrir"], a: 1 }],
  },
  {
    n: "02", id: "b2", title: "Inspección perimetral", icon: ScanSearch,
    promise: "Mira antes de exponer. Detecta manipulación, sustancias o personas antes de abrir.",
    who: ["L1", "A2"], start: "T−14", dur: "1 min", evidence: "Mensaje único Teams + foto si hay novedad",
    tags: "MIRA · TOCA · REPORTA",
    steps: [
      { t: "Mira el entorno.", d: "Personas o vehículos sospechosos." },
      { t: "Toca candados y persiana.", d: "Silicona, marcas, sustancias. Foto si hay.", crit: true },
      { t: "Reporta a CCTV.", d: "Teams al canal de monitoreo." },
      { t: "Avisa al grupo regional.", d: "Centro comercial: mensaje único." },
    ],
    kpi: "Confirmaciones recibidas en CCTV / aperturas esperadas.",
    fail: "Sustancia extraña → no abras. Llama al 3004290449.",
    quiz: [{ q: "Si detectas una sustancia extraña en candados o persiana:", o: ["Abres con cuidado", "No abres y llamas al 3004290449", "Limpias y abres"], a: 1 }],
  },
  {
    n: "03", id: "b3", title: "Activación de sistemas", icon: MonitorCheck,
    promise: "Sin sistemas, sin venta. Todo listo antes del primer cliente.",
    who: ["C3"], start: "T−13", dur: "6 min", evidence: "Log POS · login + 1ª venta",
    tags: "POS · DATÁFONO · ANTENA",
    steps: [
      { t: "Enciende los equipos.", d: "POS, Zebra, Epson. Sync tarda 6 min." },
      { t: "Entra con tu usuario.", d: "Registradora para ventas. Admin no.", crit: true },
      { t: "Prueba los periféricos.", d: "Datáfono y conectados. Imprime un recibo." },
      { t: "Una sola caja al inicio.", d: "Abre la segunda con 3 personas en fila." },
      { t: "Prueba las antenas.", d: "Pasa un producto pinado. Debe pitar." },
    ],
    kpi: "Login al POS hasta primera venta posible < 8 minutos.",
    fail: "POS no inicia → Aranda a Soporte. Cero ventas hasta resolver.",
    quiz: [{ q: "¿Con qué usuario entras al POS para vender?", o: ["Admin", "Registradora (de ventas)", "El de otro cajero"], a: 1 }],
  },
  {
    n: "04", id: "b4", title: "Marcación e identidad", icon: MapPin,
    promise: "Presencia verificada. Foto + GPS por cada uno. Cero marcaciones cruzadas.",
    who: ["ALL"], start: "T−12", dur: "2 min", evidence: "Geovictoria · foto + GPS",
    tags: "SELFIE · GPS · CADA UNO",
    steps: [
      { t: "Abre Geovictoria.", d: "Con tu credencial. No la de otro." },
      { t: "Marca con foto y GPS.", d: "Selfie con la guía visual." },
      { t: "Uniforme y presentación.", d: "El líder valida a cada uno." },
      { t: "Celular en locker.", d: "Bajo llave. Sin producto sin factura.", crit: true },
    ],
    kpi: "Colaboradores con marcación válida / nómina activa del día.",
    fail: "Geovictoria caído → marca manual + reporta a Soporte.",
    quiz: [{ q: "¿Dónde va el celular durante el turno?", o: ["En el bolsillo", "En el locker bajo llave", "En la caja"], a: 1 }],
  },
  {
    n: "05", id: "b5", title: "Preparación de piso", icon: Store,
    promise: "Tienda como promesa. Limpia, completa, precios al día.",
    who: ["A2", "L1"], start: "T−10", dur: "6 min", evidence: "Foto piso + check 5 ítems",
    tags: "EXHIBICIÓN · PRECIOS · LIMPIEZA",
    steps: [
      { t: "Prueba antenas y despinadora.", d: "Producto pinado debe pitar.", crit: true },
      { t: "Limpia y completa.", d: "Espejos, vitrinas, huecos en exhibición." },
      { t: "Valida precios.", d: "Cada tag actualizado." },
      { t: "Aires, hornos, dispensador.", d: "Sin goteos, sin olores raros.", crit: true },
      { t: "Brand Casting.", d: "Nunca Spotify, YouTube ni USB.", crit: true },
    ],
    kpi: "Cumplimiento del checklist visual · % ítems OK.",
    fail: "Antena, horno o aire dañado → Aranda inmediato.",
    quiz: [{ q: "¿Qué audio está autorizado en el piso?", o: ["Spotify", "YouTube", "Brand Casting"], a: 2 }],
  },
  {
    n: "06", id: "b6", title: "Verificación de caja", icon: Calculator,
    promise: "Base controlada, base firmada. Sin testigo, no se firma.",
    who: ["C3", "L1"], start: "T−5", dur: "3 min", evidence: "Foto + doble firma",
    tags: "BASE · DOBLE FIRMA · FOTO",
    steps: [
      { t: "Cuenta la base. Con testigo.", d: "$200.000 billetes y monedas chicas.", crit: true },
      { t: "Datáfonos en cero.", d: "Cierre del día anterior validado." },
      { t: "Separa entrega.", d: "Si hay recolección: documentación lista." },
      { t: "Valida el cofre DRS.", d: "Operativo. Recibos del día anterior." },
    ],
    kpi: "Base firmada por dos / total aperturas. 100%.",
    fail: "Base no cuadra → no abras hasta resolver con regional.",
    quiz: [{ q: "La base se cuenta…", o: ["Solo", "Con testigo, dos veces", "Después de abrir"], a: 1 }],
  },
  {
    n: "07", id: "b7", title: "Apertura al público", icon: DoorOpen,
    promise: "Hora exacta, mensaje único. ±5 minutos vs. contrato. Más es multa.",
    who: ["L1"], start: "T 0", dur: "1 min", evidence: "Mensaje único + log CCTV",
    tags: "HORA EXACTA · MENSAJE ÚNICO",
    steps: [
      { t: "Horario contractual.", d: "Centro comercial o el del jefe." },
      { t: "Abre en el minuto exacto.", d: "±5 min. Más es multa.", crit: true },
      { t: "Mensaje único al grupo.", d: '"Apertura sin novedad. [hora]."' },
      { t: "Saludo de bienvenida.", d: "Cada asesor en zona, mirando entrada." },
    ],
    kpi: "Aperturas dentro de ventana ±5 minutos.",
    fail: "No puedes abrir → mensaje + foto + llama al jefe.",
    quiz: [{ q: "La ventana para abrir vs. horario contractual es:", o: ["±15 min", "±5 min", "Sin límite"], a: 1 }],
  },
  {
    n: "08", id: "b8", title: "Plan del día", icon: Target,
    promise: "Abres con hipótesis. Liga Comercial, meta, brecha, foco por asesor.",
    who: ["L1"], whoExtra: "+ equipo", start: "T+5", dur: "5 min", evidence: "Bitácora Rumbo Totto",
    tags: "META · BRECHA · FOCO",
    steps: [
      { t: "Lee Liga Comercial.", d: "Ventas y conversión del día anterior." },
      { t: "Define meta y brecha.", d: "Meta mensual / días hábiles." },
      { t: "Foco por asesor.", d: "Categoría + ticket + objetivo." },
      { t: "Cierra bitácora.", d: "Antes de T+10. Sin esto, no se valida.", crit: true },
    ],
    kpi: "Bitácora cerrada antes de T+10. Conversión del día.",
    fail: "Sin Liga Comercial leída → día sin hipótesis. Se descuenta del KPI.",
    quiz: [{ q: "La bitácora debe cerrarse antes de:", o: ["T+5", "T+10", "El cierre comercial"], a: 1 }],
  },
];

const LEVELS = [
  { n: "01", name: "Conoce", d: "Quiz y video" },
  { n: "02", name: "Ejecuta", d: "5 días sin error" },
  { n: "03", name: "Resuelve", d: "3 excepciones" },
  { n: "04", name: "Audita", d: "5 auditorías" },
  { n: "05", name: "Mejora", d: "El KPI sube" },
];

const CSS = `
.tm-root *{box-sizing:border-box;-webkit-tap-highlight-color:transparent;}
.tm-root{
  --cream:#F3EEE2; --card:#E9E2CF; --card2:#EDE7D7; --ink:#191919;
  --red:#FF3B3B; --yellow:#F5C518; --green:#1B8A4B; --muted:#6F6A5C; --line:#191919;
  background:var(--cream); color:var(--ink); min-height:100vh;
  font-family:'Helvetica Neue',-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,sans-serif;
  -webkit-font-smoothing:antialiased; line-height:1.4;
}
.tm-mono{font-family:'SF Mono','JetBrains Mono',ui-monospace,Menlo,Consolas,monospace;}
.tm-eyebrow{font-family:'SF Mono',ui-monospace,monospace;font-size:11px;letter-spacing:.14em;text-transform:uppercase;color:var(--red);font-weight:600;}
.tm-num{font-family:'SF Mono',ui-monospace,monospace;font-feature-settings:'zero' 1;font-weight:700;}
.tm-wrap{max-width:560px;margin:0 auto;padding:0 18px 120px;}
.tm-topbar{position:sticky;top:0;z-index:30;background:rgba(243,238,226,.86);backdrop-filter:saturate(1.4) blur(10px);border-bottom:1px solid rgba(25,25,25,.12);}
.tm-topbar-in{max-width:560px;margin:0 auto;padding:12px 18px;display:flex;align-items:center;gap:12px;}
.tm-logo{font-weight:800;font-size:18px;letter-spacing:-.02em;position:relative;}
.tm-dots{display:inline-flex;gap:3px;position:absolute;top:-6px;left:34px;}
.tm-dot{width:4px;height:4px;border-radius:50%;}
.tm-pill{font-family:'SF Mono',ui-monospace,monospace;font-size:10px;letter-spacing:.08em;text-transform:uppercase;background:var(--ink);color:var(--cream);border-radius:999px;padding:5px 11px;font-weight:600;}
.tm-h1{font-weight:800;letter-spacing:-.03em;line-height:.95;font-size:clamp(46px,16vw,72px);margin:8px 0 0;}
.tm-promise{font-size:16px;color:var(--ink);margin-top:14px;max-width:30ch;}
.tm-stats{display:grid;grid-template-columns:repeat(4,1fr);gap:8px;margin-top:26px;}
.tm-stat .v{font-weight:800;font-size:26px;letter-spacing:-.02em;}
.tm-stat .v.red{color:var(--red);} .tm-stat .v.yellow{color:#D9A800;}
.tm-stat .k{font-family:'SF Mono',ui-monospace,monospace;font-size:9px;letter-spacing:.1em;text-transform:uppercase;color:var(--muted);margin-top:2px;}
.tm-card{background:var(--card);border:1.5px solid var(--line);border-radius:18px;}
.tm-blocklist{display:flex;flex-direction:column;gap:10px;margin-top:14px;}
.tm-block{display:flex;align-items:center;gap:14px;padding:16px;text-align:left;cursor:pointer;transition:transform .12s ease,box-shadow .15s ease;width:100%;font:inherit;color:inherit;}
.tm-block:active{transform:scale(.985);}
.tm-block .ico{width:46px;height:46px;border-radius:12px;display:grid;place-items:center;flex:0 0 auto;background:var(--ink);color:var(--cream);}
.tm-block.done .ico{background:var(--green);color:#fff;}
.tm-block .bn{font-size:11px;}
.tm-block .bt{font-weight:700;font-size:17px;letter-spacing:-.01em;}
.tm-block .meta{font-family:'SF Mono',ui-monospace,monospace;font-size:10px;color:var(--muted);letter-spacing:.04em;margin-top:3px;}
.tm-prog-ring{flex:0 0 auto;}
.tm-chip{font-family:'SF Mono',ui-monospace,monospace;font-size:10px;font-weight:700;letter-spacing:.03em;border-radius:999px;padding:4px 10px 4px 4px;display:inline-flex;align-items:center;gap:6px;}
.tm-chip .badge{width:20px;height:20px;border-radius:50%;display:grid;place-items:center;font-size:9px;font-weight:800;}
.tm-back{display:inline-flex;align-items:center;gap:6px;font-family:'SF Mono',ui-monospace,monospace;font-size:11px;letter-spacing:.08em;text-transform:uppercase;color:var(--ink);background:none;border:none;cursor:pointer;padding:0;font-weight:600;}
.tm-bignum{font-family:'SF Mono',ui-monospace,monospace;font-feature-settings:'zero' 1;font-weight:700;font-size:clamp(64px,22vw,96px);line-height:.85;letter-spacing:-.04em;}
.tm-metastrip{display:grid;grid-template-columns:1fr 1fr;gap:14px 18px;margin-top:22px;padding:18px 0;border-top:1.5px solid var(--line);border-bottom:1.5px solid var(--line);}
.tm-metastrip .lbl{font-family:'SF Mono',ui-monospace,monospace;font-size:9px;letter-spacing:.12em;text-transform:uppercase;color:var(--red);font-weight:600;}
.tm-metastrip .val{font-weight:600;font-size:15px;margin-top:4px;}
.tm-step{position:relative;border:1.5px solid var(--line);border-radius:16px;padding:14px;background:var(--card2);}
.tm-step.crit{background:var(--red);border-color:var(--red);color:#fff;}
.tm-step .tile{width:38px;height:38px;border-radius:10px;display:grid;place-items:center;background:var(--ink);color:var(--cream);}
.tm-step.crit .tile{background:#fff;color:var(--red);}
.tm-step .pn{position:absolute;top:12px;right:14px;font-family:'SF Mono',ui-monospace,monospace;font-size:9px;letter-spacing:.12em;color:var(--muted);}
.tm-step.crit .pn{color:rgba(255,255,255,.85);}
.tm-step .st{font-weight:700;font-size:15px;margin-top:12px;letter-spacing:-.01em;}
.tm-step .sd{font-size:13px;color:var(--muted);margin-top:4px;}
.tm-step.crit .sd{color:rgba(255,255,255,.9);}
.tm-kpi{background:var(--ink);border-radius:16px;padding:18px;color:#fff;}
.tm-kpi .lbl{font-family:'SF Mono',ui-monospace,monospace;font-size:9px;letter-spacing:.14em;text-transform:uppercase;color:var(--yellow);font-weight:600;}
.tm-kpi .txt{font-size:15px;font-weight:600;margin-top:8px;}
.tm-fail{border:1.5px solid var(--line);border-radius:16px;padding:18px;}
.tm-fail .lbl{font-family:'SF Mono',ui-monospace,monospace;font-size:9px;letter-spacing:.14em;text-transform:uppercase;color:var(--muted);font-weight:600;}
.tm-fail .txt{font-size:15px;font-weight:600;margin-top:8px;}
.tm-fail .txt b{color:var(--red);font-weight:700;}
.tm-levels{display:flex;gap:6px;margin-top:10px;}
.tm-lvl{flex:1;border:1.4px solid var(--line);border-radius:10px;padding:8px 6px;text-align:center;}
.tm-lvl.on{background:var(--ink);color:#fff;border-color:var(--ink);}
.tm-lvl .ln{font-family:'SF Mono',ui-monospace,monospace;font-weight:700;font-size:13px;}
.tm-lvl .lname{font-size:9px;font-weight:700;letter-spacing:.02em;margin-top:2px;}
.tm-lvl.locked{opacity:.5;}
.tm-actionbar{position:fixed;left:0;right:0;bottom:0;z-index:40;background:linear-gradient(to top,var(--cream) 60%,transparent);padding:14px 18px 18px;}
.tm-actionbar-in{max-width:560px;margin:0 auto;display:flex;gap:10px;}
.tm-btn{flex:1;border:none;border-radius:14px;padding:15px 14px;font:inherit;font-weight:700;font-size:15px;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:8px;transition:transform .1s ease;}
.tm-btn:active{transform:scale(.97);}
.tm-btn.ink{background:var(--ink);color:#fff;}
.tm-btn.red{background:var(--red);color:#fff;}
.tm-btn.ghost{background:transparent;color:var(--ink);border:1.5px solid var(--line);}
.tm-btn.yellow{background:var(--yellow);color:var(--ink);}
.tm-btn:disabled{opacity:.4;cursor:default;}
.tm-overlay{position:fixed;inset:0;z-index:60;background:var(--cream);display:flex;flex-direction:column;animation:tmIn .25s ease;}
.tm-ov-top{display:flex;align-items:center;justify-content:space-between;padding:16px 18px;border-bottom:1px solid rgba(25,25,25,.12);}
.tm-ov-body{flex:1;overflow:auto;padding:24px 18px;max-width:560px;width:100%;margin:0 auto;}
.tm-dotsrow{display:flex;gap:5px;align-items:center;}
.tm-pdot{height:6px;border-radius:3px;background:rgba(25,25,25,.18);flex:1;transition:background .2s ease;}
.tm-pdot.on{background:var(--ink);} .tm-pdot.crit{background:var(--red);}
.tm-runstep{animation:tmUp .3s ease both;}
.tm-runtile{width:64px;height:64px;border-radius:16px;display:grid;place-items:center;background:var(--ink);color:var(--cream);}
.tm-runtile.crit{background:var(--red);color:#fff;}
.tm-runtitle{font-weight:800;font-size:28px;letter-spacing:-.02em;line-height:1.05;margin-top:20px;}
.tm-rundetail{font-size:17px;color:var(--muted);margin-top:10px;}
.tm-critbanner{display:inline-flex;align-items:center;gap:6px;background:var(--red);color:#fff;font-family:'SF Mono',ui-monospace,monospace;font-size:10px;letter-spacing:.1em;text-transform:uppercase;font-weight:700;padding:6px 11px;border-radius:999px;margin-top:18px;}
.tm-quizopt{width:100%;text-align:left;border:1.5px solid var(--line);background:var(--card2);border-radius:14px;padding:16px;font:inherit;font-weight:600;font-size:16px;cursor:pointer;margin-bottom:10px;transition:all .12s ease;display:flex;align-items:center;gap:12px;}
.tm-quizopt:active{transform:scale(.99);}
.tm-quizopt.correct{background:var(--green);border-color:var(--green);color:#fff;}
.tm-quizopt.wrong{background:var(--red);border-color:var(--red);color:#fff;}
.tm-quizopt .k{font-family:'SF Mono',ui-monospace,monospace;font-weight:700;width:22px;}
.tm-done-hero{text-align:center;padding:30px 0;animation:tmPop .4s ease both;}
.tm-footline{margin-top:42px;padding-top:22px;border-top:1.5px solid var(--line);}
.tm-footline .a{font-weight:800;font-size:22px;letter-spacing:-.02em;line-height:1.1;}
.tm-footline .a .r{color:var(--red);} .tm-footline .a .y{color:#D9A800;}
.tm-reset{margin-top:16px;background:none;border:none;color:var(--muted);font-family:'SF Mono',ui-monospace,monospace;font-size:10px;letter-spacing:.08em;text-transform:uppercase;cursor:pointer;display:inline-flex;align-items:center;gap:6px;}
@keyframes tmIn{from{opacity:0}to{opacity:1}}
@keyframes tmUp{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:none}}
@keyframes tmPop{0%{opacity:0;transform:scale(.8)}60%{transform:scale(1.05)}100%{opacity:1;transform:scale(1)}}
@keyframes tmShake{0%,100%{transform:translateX(0)}20%{transform:translateX(-7px)}40%{transform:translateX(7px)}60%{transform:translateX(-5px)}80%{transform:translateX(5px)}}
.tm-fade{animation:tmUp .4s ease both;}
.tm-login{min-height:100dvh;display:flex;flex-direction:column;justify-content:center;max-width:440px;margin:0 auto;padding:40px 22px;}
.tm-login-brand{display:flex;align-items:center;gap:12px;margin-bottom:auto;padding-top:8px;}
.tm-login-core{animation:tmUp .45s ease both;}
.tm-login-core.shake{animation:tmShake .4s ease;}
.tm-login h1{font-weight:800;letter-spacing:-.03em;font-size:clamp(40px,13vw,54px);line-height:.95;margin:10px 0 0;}
.tm-login .sub{color:var(--muted);font-size:16px;margin-top:12px;max-width:30ch;}
.tm-flbl{font-family:'SF Mono',ui-monospace,monospace;font-size:10px;letter-spacing:.14em;text-transform:uppercase;color:var(--red);font-weight:600;margin:0 0 7px 2px;display:block;}
.tm-input-wrap{position:relative;margin-bottom:14px;}
.tm-input-ico{position:absolute;left:15px;top:50%;transform:translateY(-50%);color:var(--muted);pointer-events:none;}
.tm-input{width:100%;font:inherit;font-size:16px;font-weight:600;border:1.5px solid var(--line);border-radius:14px;padding:16px 16px 16px 46px;background:var(--card2);color:var(--ink);outline:none;transition:border-color .15s ease,box-shadow .15s ease;}
.tm-input::placeholder{color:#A39C8A;font-weight:500;}
.tm-input:focus{border-color:var(--ink);box-shadow:0 0 0 3px rgba(25,25,25,.08);}
.tm-input.bad{border-color:var(--red);box-shadow:0 0 0 3px rgba(255,59,59,.12);}
.tm-eye{position:absolute;right:8px;top:50%;transform:translateY(-50%);background:none;border:none;color:var(--muted);cursor:pointer;padding:10px;display:grid;place-items:center;}
.tm-errline{display:flex;align-items:center;gap:7px;color:var(--red);font-size:13px;font-weight:600;margin:2px 0 14px 2px;}
.tm-demo{margin-top:26px;display:flex;align-items:center;justify-content:center;gap:8px;font-family:'SF Mono',ui-monospace,monospace;font-size:10px;letter-spacing:.06em;color:var(--muted);border:1px dashed rgba(25,25,25,.22);border-radius:10px;padding:10px;}
.tm-sessrow{display:flex;align-items:center;gap:10px;margin-top:14px;}
.tm-logout{display:inline-flex;align-items:center;gap:6px;background:none;border:1.5px solid var(--line);border-radius:999px;padding:7px 13px;font-family:'SF Mono',ui-monospace,monospace;font-size:10px;letter-spacing:.06em;text-transform:uppercase;color:var(--ink);cursor:pointer;font-weight:600;}
.tm-sess{font-family:'SF Mono',ui-monospace,monospace;font-size:10px;letter-spacing:.06em;text-transform:uppercase;color:var(--muted);}
`;

function TottoMark() {
  return (
    <div className="tm-logo">
      TOTTO
      <span className="tm-dots">
        <span className="tm-dot" style={{ background: "#FF3B3B" }} />
        <span className="tm-dot" style={{ background: "#F5C518" }} />
        <span className="tm-dot" style={{ background: "#191919" }} />
      </span>
    </div>
  );
}

function RoleChip({ k }: { k: RoleKey }) {
  const r = ROLES[k];
  if (!r) return null;
  const bgColor = r.bg === "#191919" ? "#191919" : r.bg + "33";
  const fgColor = r.bg === "#CFC7B2" ? "#1A1A1A" : (r.bg === "#191919" ? "#fff" : "#1A1A1A");
  return (
    <span className="tm-chip" style={{ background: bgColor, color: fgColor }}>
      <span className="badge" style={{ background: r.bg, color: r.fg }}>{k}</span>
      {r.label}
    </span>
  );
}

function Ring({ pct, size = 38 }: { pct: number; size?: number }) {
  const sw = 4, r = (size - sw) / 2, c = 2 * Math.PI * r;
  return (
    <svg width={size} height={size} className="tm-prog-ring">
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(25,25,25,.14)" strokeWidth={sw} />
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={pct >= 100 ? "#1B8A4B" : "#FF3B3B"} strokeWidth={sw}
        strokeDasharray={c} strokeDashoffset={c - (c * pct) / 100} strokeLinecap="round"
        transform={`rotate(-90 ${size / 2} ${size / 2})`} style={{ transition: "stroke-dashoffset .5s ease" }} />
    </svg>
  );
}

type BlockProgress = { conoce?: boolean; ejecuta?: boolean };
type ProgressMap = Record<string, BlockProgress>;

export default function MentorAperturaPage() {
  const [view, setView] = useState<"home" | "block">("home");
  const [active, setActive] = useState(0);
  const [overlay, setOverlay] = useState<"run" | "quiz" | null>(null);
  const [progress, setProgress] = useState<ProgressMap>({});
  const [loaded, setLoaded] = useState(false);
  const [authed, setAuthed] = useState(false);
  const [authLoaded, setAuthLoaded] = useState(false);

  useEffect(() => {
    /* eslint-disable react-hooks/set-state-in-effect */
    try {
      if (localStorage.getItem(AUTH_KEY) === "1") setAuthed(true);
    } catch {}
    setAuthLoaded(true);
    /* eslint-enable react-hooks/set-state-in-effect */
  }, []);

  useEffect(() => {
    /* eslint-disable react-hooks/set-state-in-effect */
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setProgress(JSON.parse(raw));
    } catch {}
    setLoaded(true);
    /* eslint-enable react-hooks/set-state-in-effect */
  }, []);

  useEffect(() => {
    if (!loaded) return;
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(progress)); } catch {}
  }, [progress, loaded]);

  const blk = BLOCKS[active];
  const p = (id: string): BlockProgress => progress[id] || {};
  const blockPct = (id: string) => (p(id).conoce ? 50 : 0) + (p(id).ejecuta ? 50 : 0);
  const isDone = (id: string) => Boolean(p(id).conoce && p(id).ejecuta);
  const modulePct = Math.round(BLOCKS.reduce((s, b) => s + blockPct(b.id), 0) / BLOCKS.length);

  function openBlock(i: number) { setActive(i); setView("block"); window.scrollTo(0, 0); }
  function mark(id: string, key: keyof BlockProgress) {
    setProgress((pr) => ({ ...pr, [id]: { ...pr[id], [key]: true } }));
  }
  function resetAll() { setProgress({}); }
  function login() { setAuthed(true); try { localStorage.setItem(AUTH_KEY, "1"); } catch {} }
  function logout() {
    setAuthed(false); setView("home");
    try { localStorage.setItem(AUTH_KEY, "0"); } catch {}
  }

  if (!authLoaded) return <div className="tm-root"><style>{CSS}</style></div>;
  if (!authed) return (
    <div className="tm-root"><style>{CSS}</style><LoginScreen onLogin={login} /></div>
  );

  return (
    <div className="tm-root">
      <style>{CSS}</style>

      <div className="tm-topbar">
        <div className="tm-topbar-in">
          <TottoMark />
          <span className="tm-pill">MENTOR® · Apertura</span>
          <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 8 }}>
            <span className="tm-mono" style={{ fontSize: 12, fontWeight: 700 }}>{modulePct}%</span>
            <Ring pct={modulePct} size={30} />
          </div>
        </div>
      </div>

      {view === "home" && (
        <div className="tm-wrap tm-fade">
          <div style={{ paddingTop: 26 }}>
            <div className="tm-eyebrow">SOP Visual · Capítulo 02 · On the job</div>
            <h1 className="tm-h1">Apertura<span style={{ color: "#FF3B3B" }}>.</span></h1>
            <p className="tm-promise">Ocho bloques. 25 minutos. Una sola misión: abrir a tiempo, segura, con hipótesis de venta.</p>
          </div>

          <div className="tm-stats">
            <div className="tm-stat"><div className="v red">8</div><div className="k">Bloques</div></div>
            <div className="tm-stat"><div className="v">25</div><div className="k">Minutos</div></div>
            <div className="tm-stat"><div className="v yellow">6</div><div className="k">KPIs</div></div>
            <div className="tm-stat"><div className="v">5</div><div className="k">Niveles</div></div>
          </div>

          <div style={{ marginTop: 30 }} className="tm-eyebrow">Los 8 bloques · en orden</div>
          <div className="tm-blocklist">
            {BLOCKS.map((b, i) => {
              const Ico = b.icon;
              const done = isDone(b.id);
              return (
                <button key={b.id} className={`tm-card tm-block ${done ? "done" : ""}`} onClick={() => openBlock(i)}>
                  <div className="ico"><Ico size={22} strokeWidth={2} /></div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div className="tm-num bn" style={{ color: done ? "#1B8A4B" : "#FF3B3B" }}>{b.n}</div>
                    <div className="bt">{b.title}</div>
                    <div className="meta">{b.start} · {b.dur} · {b.who.join(" ")}{b.whoExtra ? " +" : ""}</div>
                  </div>
                  {done ? <CheckCircle2 size={26} color="#1B8A4B" /> : <Ring pct={blockPct(b.id)} />}
                </button>
              );
            })}
          </div>

          <div className="tm-footline">
            <div className="tm-eyebrow" style={{ marginBottom: 8 }}>↓ De manual a sistema operativo</div>
            <div className="a">Lo que no se mide, <span className="y">no se mejora.</span><br />Lo que no se evidencia, <span className="r">no existe.</span></div>
            <div className="tm-sessrow">
              <span className="tm-sess">Sesión · {CRED.user}</span>
              <button className="tm-logout" onClick={logout}><LogOut size={12} /> Salir</button>
            </div>
            <button className="tm-reset" onClick={resetAll}><RotateCcw size={12} /> Reiniciar progreso</button>
          </div>
        </div>
      )}

      {view === "block" && (
        <>
          <div className="tm-wrap tm-fade" style={{ paddingTop: 18 }}>
            <button className="tm-back" onClick={() => { setView("home"); window.scrollTo(0, 0); }}>
              <ArrowLeft size={14} /> Apertura · {active + 1}/8
            </button>

            <div style={{ display: "flex", alignItems: "flex-start", gap: 14, marginTop: 18 }}>
              <div className="tm-bignum" style={{ color: "#FF3B3B" }}>{blk.n}</div>
              <h1 style={{ fontWeight: 800, letterSpacing: "-.025em", fontSize: 34, lineHeight: 1.02, margin: "6px 0 0" }}>
                {blk.title}<span style={{ color: "#FF3B3B" }}>.</span>
              </h1>
            </div>
            <p style={{ fontSize: 16, marginTop: 14, borderLeft: "3px solid #FF3B3B", paddingLeft: 12 }}>{blk.promise}</p>

            <div className="tm-metastrip">
              <div>
                <div className="lbl">Quién</div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 6 }}>
                  {blk.who.map((w) => <RoleChip key={w} k={w} />)}
                  {blk.whoExtra && <span className="val" style={{ alignSelf: "center", fontSize: 13 }}>{blk.whoExtra}</span>}
                </div>
              </div>
              <div><div className="lbl">Empieza</div><div className="val">{blk.start}</div></div>
              <div><div className="lbl">Dura</div><div className="val">{blk.dur}</div></div>
              <div><div className="lbl">Evidencia</div><div className="val" style={{ fontSize: 13 }}>{blk.evidence}</div></div>
            </div>

            <div style={{ marginTop: 20 }} className="tm-eyebrow">Cinco niveles · tu ruta</div>
            <div className="tm-levels">
              {LEVELS.map((l, i) => {
                const on = (i === 0 && p(blk.id).conoce) || (i === 1 && p(blk.id).ejecuta);
                const locked = i >= 2;
                return (
                  <div key={l.n} className={`tm-lvl ${on ? "on" : ""} ${locked ? "locked" : ""}`}>
                    <div className="ln">{l.n}{on && <Check size={12} style={{ marginLeft: 3 }} />}{locked && <Lock size={10} style={{ marginLeft: 3 }} />}</div>
                    <div className="lname">{l.name}</div>
                  </div>
                );
              })}
            </div>

            <div style={{ marginTop: 26, display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
              <span className="tm-eyebrow">Los pasos · en orden</span>
              <span className="tm-mono" style={{ fontSize: 9, color: "#6F6A5C", letterSpacing: ".06em" }}>⚠ crítico · no se salta</span>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 12 }}>
              {blk.steps.map((s, i) => {
                const Ico = s.crit ? AlertTriangle : blk.icon;
                return (
                  <div key={i} className={`tm-step ${s.crit ? "crit" : ""}`} style={{ animationDelay: `${i * 40}ms` }}>
                    <div className="pn">PASO {String(i + 1).padStart(2, "0")}</div>
                    <div className="tile"><Ico size={18} strokeWidth={2.2} /></div>
                    <div className="st">{s.t}{s.crit && " ⚠"}</div>
                    <div className="sd">{s.d}</div>
                  </div>
                );
              })}
            </div>

            <div style={{ marginTop: 16 }} className="tm-kpi">
              <div className="lbl">El KPI que proteges</div>
              <div className="txt">{blk.kpi}</div>
            </div>
            <div style={{ marginTop: 10 }} className="tm-fail">
              <div className="lbl">Si algo falla</div>
              <div className="txt"><ShieldAlert size={15} style={{ verticalAlign: "-2px", color: "#FF3B3B", marginRight: 4 }} />{blk.fail}</div>
            </div>

            <div style={{ marginTop: 18, textAlign: "center" }} className="tm-mono">
              <span style={{ fontSize: 10, letterSpacing: ".12em", color: "#6F6A5C" }}>{blk.tags}</span>
            </div>
          </div>

          <div className="tm-actionbar">
            <div className="tm-actionbar-in">
              <button className="tm-btn ink" onClick={() => setOverlay("run")}>
                <Play size={17} fill="#fff" /> Ejecutar paso a paso
              </button>
              <button className={`tm-btn ${p(blk.id).conoce ? "ghost" : "red"}`} onClick={() => setOverlay("quiz")}>
                {p(blk.id).conoce ? <Check size={17} /> : <Trophy size={17} />} {p(blk.id).conoce ? "Conoce ✓" : "Conoce · Quiz"}
              </button>
            </div>
          </div>
        </>
      )}

      {overlay === "run" && <RunMode block={blk} onClose={() => setOverlay(null)} onDone={() => { mark(blk.id, "ejecuta"); setOverlay(null); }} />}
      {overlay === "quiz" && <QuizMode block={blk} onClose={() => setOverlay(null)} onPass={() => { mark(blk.id, "conoce"); setOverlay(null); }} />}
    </div>
  );
}

function RunMode({ block, onClose, onDone }: { block: Block; onClose: () => void; onDone: () => void }) {
  const [i, setI] = useState(0);
  const [fin, setFin] = useState(false);
  const steps = block.steps;
  const s = steps[i];
  const Ico = s && s.crit ? AlertTriangle : block.icon;

  if (fin) {
    return (
      <div className="tm-overlay">
        <div className="tm-ov-top">
          <span className="tm-eyebrow" style={{ color: "#191919" }}>Bloque {block.n} · completado</span>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer" }}><X size={22} /></button>
        </div>
        <div className="tm-ov-body" style={{ display: "flex", flexDirection: "column", justifyContent: "center" }}>
          <div className="tm-done-hero">
            <div style={{ width: 88, height: 88, borderRadius: 24, background: "#1B8A4B", display: "grid", placeItems: "center", margin: "0 auto" }}>
              <Check size={48} color="#fff" strokeWidth={3} />
            </div>
            <h2 style={{ fontWeight: 800, fontSize: 30, letterSpacing: "-.02em", marginTop: 22 }}>Ejecutado.</h2>
            <p style={{ color: "#6F6A5C", fontSize: 16, marginTop: 8, maxWidth: "26ch", marginInline: "auto" }}>
              Nivel 02 · Ejecuta iniciado. Repite 5 días sin error para consolidarlo.
            </p>
            <div className="tm-kpi" style={{ marginTop: 24, textAlign: "left" }}>
              <div className="lbl">El KPI que protegiste</div>
              <div className="txt">{block.kpi}</div>
            </div>
          </div>
          <button className="tm-btn yellow" style={{ marginTop: 10 }} onClick={onDone}>Guardar y volver <ChevronRight size={18} /></button>
        </div>
      </div>
    );
  }

  return (
    <div className="tm-overlay">
      <div className="tm-ov-top">
        <span className="tm-eyebrow" style={{ color: "#191919" }}>Bloque {block.n} · {block.title}</span>
        <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer" }}><X size={22} /></button>
      </div>
      <div className="tm-ov-body" style={{ display: "flex", flexDirection: "column" }}>
        <div className="tm-dotsrow" style={{ marginBottom: 28 }}>
          {steps.map((st, k) => (
            <div key={k} className={`tm-pdot ${k < i ? (st.crit ? "crit" : "on") : ""} ${k === i ? (st.crit ? "crit" : "on") : ""}`} />
          ))}
        </div>

        <div className="tm-runstep" key={i} style={{ flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div className={`tm-runtile ${s.crit ? "crit" : ""}`}><Ico size={30} strokeWidth={2.2} /></div>
            <span className="tm-num" style={{ fontSize: 14, color: "#6F6A5C" }}>PASO {String(i + 1).padStart(2, "0")} / {String(steps.length).padStart(2, "0")}</span>
          </div>
          {s.crit && <div className="tm-critbanner"><AlertTriangle size={12} /> Paso crítico · no se salta</div>}
          <div className="tm-runtitle">{s.t}</div>
          <div className="tm-rundetail">{s.d}</div>
        </div>

        <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
          {i > 0 && <button className="tm-btn ghost" style={{ flex: "0 0 90px" }} onClick={() => setI(i - 1)}><ArrowLeft size={16} /> Atrás</button>}
          <button className={`tm-btn ${s.crit ? "red" : "ink"}`} onClick={() => { if (i < steps.length - 1) setI(i + 1); else setFin(true); }}>
            <Check size={18} /> {i < steps.length - 1 ? "Hecho · siguiente" : "Hecho · finalizar"}
          </button>
        </div>
      </div>
    </div>
  );
}

function LoginScreen({ onLogin }: { onLogin: () => void }) {
  const [u, setU] = useState("");
  const [p, setP] = useState("");
  const [show, setShow] = useState(false);
  const [err, setErr] = useState(false);

  function submit() {
    if (u.trim() === CRED.user && p === CRED.pass) { setErr(false); onLogin(); }
    else { setErr(true); }
  }
  const onKey = (e: React.KeyboardEvent<HTMLInputElement>) => { if (e.key === "Enter") submit(); };

  return (
    <div className="tm-login">
      <div className="tm-login-brand">
        <TottoMark />
        <span className="tm-pill">MENTOR® · Retail Academy</span>
      </div>

      <div className={`tm-login-core ${err ? "shake" : ""}`}>
        <div className="tm-eyebrow">Acceso · Entrenamiento en piso</div>
        <h1>Inicia<br />sesión<span style={{ color: "#FF3B3B" }}>.</span></h1>
        <p className="sub">Entra con tu usuario MENTOR para entrenar la apertura de tienda.</p>

        <div style={{ marginTop: 30 }}>
          <label className="tm-flbl">Usuario</label>
          <div className="tm-input-wrap">
            <span className="tm-input-ico"><User size={18} /></span>
            <input
              className={`tm-input ${err ? "bad" : ""}`}
              value={u}
              onChange={(e) => { setU(e.target.value); setErr(false); }}
              onKeyDown={onKey}
              placeholder="Mayo29"
              autoCapitalize="none" autoCorrect="off" spellCheck={false}
              autoComplete="username" name="username" enterKeyHint="next"
            />
          </div>

          <label className="tm-flbl">Contraseña</label>
          <div className="tm-input-wrap">
            <span className="tm-input-ico"><Lock size={18} /></span>
            <input
              className={`tm-input ${err ? "bad" : ""}`}
              type={show ? "text" : "password"}
              value={p}
              onChange={(e) => { setP(e.target.value); setErr(false); }}
              onKeyDown={onKey}
              placeholder="••••••"
              autoComplete="current-password" name="password" enterKeyHint="go"
            />
            <button className="tm-eye" onClick={() => setShow((s) => !s)} aria-label="Mostrar contraseña" type="button">
              {show ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          {err && <div className="tm-errline"><AlertTriangle size={14} /> Usuario o contraseña incorrectos.</div>}

          <button className="tm-btn ink" style={{ width: "100%", marginTop: 8 }} onClick={submit}>
            Entrar <ArrowRight size={18} />
          </button>

          <div className="tm-demo"><Lock size={11} /> DEMO · usuario {CRED.user} · clave {CRED.pass}</div>
        </div>
      </div>
    </div>
  );
}

function QuizMode({ block, onClose, onPass }: { block: Block; onClose: () => void; onPass: () => void }) {
  const qs = block.quiz;
  const [qi, setQi] = useState(0);
  const [sel, setSel] = useState<number | null>(null);
  const [right, setRight] = useState(0);
  const q = qs[qi];

  function pick(idx: number) {
    if (sel !== null) return;
    setSel(idx);
    const ok = idx === q.a;
    if (ok) setRight((r) => r + 1);
    setTimeout(() => {
      if (qi < qs.length - 1) { setQi(qi + 1); setSel(null); }
      else { setQi(qs.length); }
    }, 950);
  }

  const finished = qi >= qs.length;
  const passed = finished && right === qs.length;

  return (
    <div className="tm-overlay">
      <div className="tm-ov-top">
        <span className="tm-eyebrow" style={{ color: "#191919" }}>Nivel 01 · Conoce · {block.title}</span>
        <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer" }}><X size={22} /></button>
      </div>
      <div className="tm-ov-body" style={{ display: "flex", flexDirection: "column" }}>
        {!finished ? (
          <div className="tm-runstep" key={qi} style={{ flex: 1 }}>
            <span className="tm-num" style={{ fontSize: 13, color: "#6F6A5C" }}>PREGUNTA {qi + 1} / {qs.length}</span>
            <h2 style={{ fontWeight: 800, fontSize: 24, letterSpacing: "-.02em", margin: "14px 0 24px", lineHeight: 1.15 }}>{q.q}</h2>
            {q.o.map((opt, idx) => {
              let cls = "";
              if (sel !== null) { if (idx === q.a) cls = "correct"; else if (idx === sel) cls = "wrong"; }
              return (
                <button key={idx} className={`tm-quizopt ${cls}`} onClick={() => pick(idx)}>
                  <span className="k">{String.fromCharCode(65 + idx)}</span>{opt}
                  {sel !== null && idx === q.a && <Check size={18} style={{ marginLeft: "auto" }} />}
                </button>
              );
            })}
          </div>
        ) : (
          <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center" }}>
            <div className="tm-done-hero">
              <div style={{ width: 88, height: 88, borderRadius: 24, background: passed ? "#1B8A4B" : "#FF3B3B", display: "grid", placeItems: "center", margin: "0 auto" }}>
                {passed ? <Trophy size={44} color="#fff" /> : <X size={44} color="#fff" strokeWidth={3} />}
              </div>
              <h2 style={{ fontWeight: 800, fontSize: 28, letterSpacing: "-.02em", marginTop: 22 }}>
                {passed ? "Nivel Conoce ✓" : "Casi."}
              </h2>
              <p style={{ color: "#6F6A5C", fontSize: 16, marginTop: 8 }}>
                {passed ? `${right}/${qs.length} correctas. Bloque desbloqueado.` : `${right}/${qs.length}. Repasa el bloque e inténtalo otra vez.`}
              </p>
            </div>
            {passed
              ? <button className="tm-btn yellow" onClick={onPass}>Guardar y volver <ChevronRight size={18} /></button>
              : <button className="tm-btn ink" onClick={() => { setQi(0); setSel(null); setRight(0); }}><RotateCcw size={16} /> Reintentar</button>}
          </div>
        )}
      </div>
    </div>
  );
}
