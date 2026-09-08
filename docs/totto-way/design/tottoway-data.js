// Totto Way — contenido precargado (Capítulo 01 + módulos de plataforma)
export const USERS = [
  { id:'u1', name:'Camila Rojas', role:'Asesor comercial', store:'Totto Andino', city:'Bogotá', xp:2450, level:'Explorador', streak:12, avatar:'CR', since:'2025-03-10' },
  { id:'u2', name:'Andrés Molina', role:'Líder de tienda', store:'Totto Andino', city:'Bogotá', xp:6120, level:'Guía', streak:34, avatar:'AM', since:'2022-08-01' },
  { id:'u3', name:'Laura Pérez', role:'Franquiciado', store:'Totto Unicentro Cali', city:'Cali', xp:1800, level:'Explorador', streak:5, avatar:'LP', since:'2026-01-15' },
];

export const CHAPTERS = [
  { n:'01', title:'Introducción', sub:'Bienvenida, empresa, cultura y ecosistema SER', pct:62, lessons:8, done:5, color:'#FCCE01', unlocked:true },
  { n:'02', title:'Ser TOTTO', sub:'Identidad del asesor, imagen y actitud', pct:0, lessons:7, done:0, color:'#F6303E', unlocked:true },
  { n:'03', title:'Experiencia de compra', sub:'Los 7 pasos de la venta TOTTO', pct:0, lessons:9, done:0, color:'#000', unlocked:false },
  { n:'04', title:'Producto', sub:'Líneas, materiales, tecnologías, garantía', pct:0, lessons:10, done:0, color:'#FCCE01', unlocked:false },
  { n:'05', title:'Visual & tienda', sub:'Exhibición, orden, estándares visuales', pct:0, lessons:6, done:0, color:'#F6303E', unlocked:false },
  { n:'06', title:'Operación & caja', sub:'Procesos, inventario, POS, cierre', pct:0, lessons:8, done:0, color:'#000', unlocked:false },
  { n:'07', title:'Liderazgo en tienda', sub:'Equipo, metas, coaching, indicadores', pct:0, lessons:7, done:0, color:'#FCCE01', unlocked:false },
];

export const LESSONS = [
  { id:'l1', ch:'01', m:'M01', title:'Bienvenida a la expedición', type:'lectura', min:4, xp:50, done:true, body:[
    'Este manual es tu mapa. No es un reglamento: es la forma en que TOTTO hace las cosas, explicada para que puedas aplicarla desde el primer día en tienda.',
    'Está dirigido a asesores comerciales, líderes de tienda, auxiliares logísticos, jefes comerciales y franquiciados. Cada rol encontrará señales visuales que indican qué le corresponde.',
  ], key:'Léelo en orden la primera vez. Después, úsalo como consulta rápida en tienda.' },
  { id:'l2', ch:'01', m:'M02', title:'Quiénes somos: Misión, Visión, Propósito', type:'lectura', min:6, xp:80, done:true, body:[
    'Misión: impulsamos a las personas a moverse, crecer y vivir cada aventura al máximo.',
    'Visión: ser la marca que conecta con las historias de quienes no se detienen.',
    'Propósito: impulsamos tus sueños, contigo siempre vamos.',
  ], key:'Como asesor no vendes morrales. Vendes acompañamiento, confianza y movimiento.' },
  { id:'l3', ch:'01', m:'M02', title:'Principios y valores TOTTO', type:'lectura', min:5, xp:80, done:true, body:[
    'Innovación · Humildad · Respeto · Integridad · Gana-gana. Estos cinco principios ordenan cada decisión en tienda: desde cómo saludas hasta cómo resuelves una garantía.',
  ], key:'Gana-gana: el cliente gana, la tienda gana, tú ganas. Si alguien pierde, no es TOTTO.' },
  { id:'l4', ch:'01', m:'M02', title:'Modelo de negocio y unidades', type:'video', min:7, xp:100, done:true, img:'./assets/p10-img_p9_1.png', body:[
    'TOTTO opera tiendas propias, franquicias, canal digital y distribución mayorista en más de 45 países. En tienda representas la promesa completa de la marca.',
  ], key:'Cada tienda es una embajada de la marca. Tu tienda es TOTTO para ese cliente.' },
  { id:'l5', ch:'01', m:'M03', title:'Roles del equipo en tienda', type:'lectura', min:6, xp:80, done:true, body:[
    'Asesor comercial, líder de tienda, auxiliar logístico y jefe comercial: cuatro roles, una sola experiencia. El cliente nunca debería notar dónde termina uno y empieza otro.',
  ], key:'Si ves algo fuera de lugar, es tuyo. No hay "eso no me toca".' },
  { id:'l6', ch:'01', m:'M04', title:'Ecosistema SER: las 8 herramientas', type:'video', min:9, xp:120, done:false, img:'./assets/p21-img_p20_1.png', body:[
    'SER es el sistema que conecta todas las herramientas de tienda: Geovictoria, TOTTO 360°, Torre de Control, NPS, Atlas 360°, POS, Inventario y Academia.',
    'Ocho herramientas en seis relaciones: TOTTO 360° trabaja en pareja con Torre de Control; NPS con Atlas 360°.',
  ], key:'Ninguna herramienta vive sola. Un dato que entra en una, mueve a las otras.' },
  { id:'l7', ch:'01', m:'M05', title:'Geovictoria: registro de jornada', type:'video', min:8, xp:120, done:false, img:'./assets/p40-img_p39_1.png', body:[
    'Marca entrada y salida en Geovictoria al iniciar y terminar tu turno. Marca también pausas. El registro alimenta nómina, cobertura de piso y la Liga.',
  ], key:'Sin marcación no hay turno. Sin turno no hay XP.' },
  { id:'l8', ch:'01', m:'M06', title:'Protocolo de antena y seguridad', type:'lectura', min:5, xp:80, done:false, body:[
    'Cuando suena la antena: acércate con calma, saluda, explica que el sistema se activó, pide revisar el ticket y el producto. Evita introducir tus manos en sus pertenencias. Agradece siempre.',
  ], key:'La antena protege el inventario; tu actitud protege la marca.' },
];

export const QUIZ = {
  l6: [
    { q:'¿Cuántas herramientas componen el ecosistema SER?', a:['Seis','Ocho','Diez'], ok:1 },
    { q:'¿Con qué herramienta trabaja en pareja TOTTO 360°?', a:['Geovictoria','NPS','Torre de Control'], ok:2 },
    { q:'¿Qué pasa con un dato que entra a una herramienta SER?', a:['Se queda ahí','Mueve a las otras','Se borra al cierre'], ok:1 },
  ],
};

export const LEAGUE_STORES = [
  { pos:1, name:'Totto Santafé', city:'Bogotá', pts:18420, delta:+2, team:9 },
  { pos:2, name:'Totto Andino', city:'Bogotá', pts:17910, delta:0, team:8, me:true },
  { pos:3, name:'Totto El Tesoro', city:'Medellín', pts:17250, delta:-1, team:7 },
  { pos:4, name:'Totto Unicentro Cali', city:'Cali', pts:15880, delta:+1, team:6 },
  { pos:5, name:'Totto Buenavista', city:'Barranquilla', pts:14300, delta:-2, team:6 },
  { pos:6, name:'Totto Cacique', city:'Bucaramanga', pts:13100, delta:0, team:5 },
];
export const LEAGUE_PEOPLE = [
  { pos:1, name:'Sofía Herrera', store:'Totto Santafé', pts:3120, avatar:'SH' },
  { pos:2, name:'Julián Castro', store:'Totto El Tesoro', pts:2890, avatar:'JC' },
  { pos:3, name:'Camila Rojas', store:'Totto Andino', pts:2450, avatar:'CR', me:true },
  { pos:4, name:'Diego Ortiz', store:'Totto Andino', pts:2310, avatar:'DO' },
  { pos:5, name:'Valentina Ruiz', store:'Totto Unicentro Cali', pts:2100, avatar:'VR' },
];

export const JOURNEY = [
  { date:'Mar 2025', title:'Te uniste a la expedición', desc:'Ingreso como asesora comercial · Totto Andino', done:true, icon:'flag' },
  { date:'Abr 2025', title:'Primer Capítulo completado', desc:'Introducción · 8/8 lecciones · 620 XP', done:true, icon:'book' },
  { date:'Jun 2025', title:'Insignia Explorador', desc:'2.000 XP acumulados', done:true, icon:'badge' },
  { date:'Ago 2025', title:'NPS 9.4 del mes', desc:'Mejor puntaje del equipo', done:true, icon:'star' },
  { date:'Sep 2026', title:'Racha de 12 días', desc:'Estás aquí', done:true, current:true, icon:'fire' },
  { date:'Próximo', title:'Insignia Guía', desc:'Completa Capítulo 03 y 5.000 XP', done:false, icon:'compass' },
  { date:'Futuro', title:'Líder de tienda', desc:'Ruta de carrera · 69 % de vacantes se cubren internamente', done:false, icon:'summit' },
];

export const INSPIRE = [
  { type:'Podcast', len:'24 min', title:'Hecho para durar', who:'Natán Bursztyn · Fundador', desc:'Cómo una marroquinera en quiebra en Samper Mendoza se convirtió en una marca de 45 países.', quote:'Hay que subir por las escaleras y no por el ascensor.', featured:true },
  { type:'Artículo', len:'8 min', title:'Forbes: Hecho para durar', who:'Forbes Colombia · Jul 2026', desc:'520 tiendas, 45 países y una sucesión familiar con Benny y Natalie Bursztyn al frente.', link:'https://forbes.co/negocios/hecho-para-durar-como-yonatan-bursztin-convirtio-a-totto-en-una-marca-global' },
  { type:'Video', len:'6 min', title:'Lo que llega fácil, se va fácil', who:'Natán Bursztyn · Premio Vida y Obra 2025', desc:'La lección de La Soledad: todo lo valioso se forja con esfuerzo.' },
  { type:'Mensaje', len:'2 min', title:'La esencia de TOTTO es su gente', who:'Marie Claude Joachim · Talento Humano', desc:'Por qué el 96 % del equipo dice que este es un excelente lugar para trabajar.' },
  { type:'Podcast', len:'18 min', title:'Vender en 10 segundos', who:'Serie Asesores TOTTO', desc:'Cinco productos cada diez segundos en el mundo. Cómo se siente eso desde el piso de venta.' },
  { type:'Historia', len:'5 min', title:'De 12 referencias a 39.800', who:'Archivo TOTTO', desc:'1988: los primeros morrales de lona en la Feria Internacional de Bogotá.' },
];

export const BENEFITS = [
  { cat:'Producto', title:'Descuento de colaborador', desc:'Descuento especial en producto TOTTO para ti y tu familia directa.', icon:'bag' },
  { cat:'Ahorro', title:'Fondo de Empleados', desc:'Ahorra del 5 % al 20 % de tu salario por nómina, con rendimientos y crédito automático. Ingreso tras 2 meses de prueba.', icon:'piggy' },
  { cat:'Salud', title:'Seguro médico y prestaciones', desc:'Seguro médico, pensiones, cesantías, primas y vacaciones de ley.', icon:'heart' },
  { cat:'Carrera', title:'Rutas de carrera internas', desc:'El 69 % de las nuevas posiciones se cubren con gente de la casa. Tu progreso en Totto Way cuenta.', icon:'ladder' },
  { cat:'Formación', title:'Academia TOTTO', desc:'Capacitación para todos los colaboradores, sin importar el cargo.', icon:'book' },
  { cat:'Bienestar', title:'Great Place to Work', desc:'Top 10 de mejores empresas para trabajar en Colombia (GPTW 2023).', icon:'star' },
  { cat:'Inclusión', title:'Programa INCLUYETTE', desc:'Modelo de empleo inclusivo premiado y replicado.', icon:'people' },
  { cat:'Reconocimiento', title:'Liga de la Expedición', desc:'Puntos, insignias y premios trimestrales por tienda e individuales.', icon:'trophy' },
];

export const KB = [
  { t:'Misión', a:'Impulsamos a las personas a moverse, crecer y vivir cada aventura al máximo.' },
  { t:'Visión', a:'Ser la marca que conecta con las historias de quienes no se detienen.' },
  { t:'Propósito', a:'Impulsamos tus sueños, contigo siempre vamos.' },
  { t:'Lema', a:'¿Listos? ¡Vamos!' },
  { t:'Principios', a:'Innovación, humildad, respeto, integridad y gana-gana.' },
  { t:'Ecosistema SER', a:'8 herramientas: Geovictoria, TOTTO 360°, Torre de Control, NPS, Atlas 360°, POS, Inventario, Academia. TOTTO 360° trabaja en pareja con Torre de Control; NPS con Atlas 360°.' },
  { t:'Geovictoria', a:'Marca entrada, salida y pausas en cada turno. Alimenta nómina, cobertura y la Liga.' },
  { t:'Protocolo de antena', a:'Acércate con calma, saluda, explica que el sistema se activó, pide revisar ticket y producto, no introduzcas las manos en sus pertenencias, agradece.' },
  { t:'Roles', a:'Asesor comercial, líder de tienda, auxiliar logístico, jefe comercial, franquiciado, formador/admin.' },
  { t:'Fondo de empleados', a:'Ahorro 5–20 % del salario por nómina; ingreso tras 2 meses de prueba; crédito automático.' },
];
