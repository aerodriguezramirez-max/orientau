// ============================================================
//  OrientaU – Lógica principal v2
// ============================================================

const API = 'api';
let currentUser = null;
let userProfile  = null;

// ── Verificar sesión ──────────────────────────────────────────
(async function checkSession(){
  const saved = sessionStorage.getItem('orientau_user');
  if(!saved){ window.location.href = 'login.html'; return; }
  currentUser = JSON.parse(saved);

  // Mostrar avatar en navbar
  renderNavUser();

  // Cargar perfil desde BD (solo usuarios reales)
  if(!currentUser.demo){
    await loadUserProfile();
    renderNavUser(); // re-pintar con photo_url ya cargado (antes solo mostraba el emoji)
  } else {
    userProfile = { es_nuevo: 0, avatar_emoji:'🚀', avatar_color:'#f59e0b' };
  }

  await loadDashboard();

  // Mostrar modal de bienvenida si es nuevo usuario
  if(!currentUser.demo && userProfile && userProfile.es_nuevo == 1){
    setTimeout(showWelcomeModal, 600);
  } else {
    showGreeting();
  }

  // Anuncio modo demo
  if(currentUser.demo){
    document.getElementById('demoNotice').style.display = 'flex';
  }
})();

// ── Partículas ────────────────────────────────────────────────
(()=>{
  const c = document.getElementById('particles');
  for(let i = 0; i < 22; i++){
    const d = document.createElement('div');
    d.className = 'particle';
    const sz = Math.random() * 6 + 3;
    d.style.cssText = `width:${sz}px;height:${sz}px;left:${Math.random()*100}%;animation-duration:${Math.random()*18+12}s;animation-delay:${Math.random()*15}s`;
    c.appendChild(d);
  }
})();

// ── Banco de 500 Preguntas (10 temas × 50) ──────────────────────
const QUESTION_BANK = [
  { topic:1, cat:"Matemáticas y Lógica", areas:["Ciencias Exactas","Ingeniería"], q:[
    "¿Disfrutas resolver problemas usando lógica y números?",
    "¿Te interesa comprender cómo funcionan las fórmulas matemáticas?",
    "¿Te gusta analizar gráficos y estadísticas?",
    "¿Disfrutas encontrar patrones en operaciones o figuras?",
    "¿Te gusta resolver ejercicios matemáticos paso a paso?",
    "¿Te interesa calcular porcentajes, probabilidades o estadísticas?",
    "¿Disfrutas actividades que requieren precisión numérica?",
    "¿Te gusta encontrar diferentes métodos para resolver un mismo problema?",
    "¿Te resulta sencillo seguir fórmulas y procedimientos matemáticos?",
    "¿Te gusta resolver acertijos mentales o problemas de lógica?",
    "¿Te interesa analizar datos para sacar conclusiones?",
    "¿Prefieres actividades que tengan una respuesta exacta y verificable?",
    "¿Te gustan los juegos de estrategia que requieren razonamiento?",
    "¿Disfrutas trabajar con ecuaciones o funciones algebraicas?",
    "¿Te sientes cómodo realizando cálculos mentales con rapidez?",
    "¿Te interesa la inteligencia artificial o el análisis de datos?",
    "¿Disfrutas organizar información en tablas o diagramas?",
    "¿Te gusta analizar todas las posibilidades antes de tomar una decisión?",
    "¿Te interesa cómo se aplican las matemáticas en ingeniería o arquitectura?",
    "¿Consideras que las matemáticas son útiles para entender el mundo?",
    "¿Te gusta verificar tus resultados para asegurarte de que sean correctos?",
    "¿Te interesa aprender sobre finanzas o economía desde un enfoque matemático?",
    "¿Disfrutas resolver problemas donde debas analizar datos cuidadosamente?",
    "¿Te gusta encontrar relaciones entre números y situaciones reales?",
    "¿Te interesa la geometría, el cálculo o el álgebra lineal?",
    "¿Disfrutas actividades que requieren razonamiento abstracto?",
    "¿Te interesa descubrir errores en razonamientos o procedimientos?",
    "¿Te gusta comparar diferentes soluciones para elegir la mejor?",
    "¿Disfrutas interpretar pistas o datos para llegar a una conclusión?",
    "¿Te interesa analizar información antes de aceptarla como cierta?",
    "¿Te gusta resolver situaciones usando lógica más que memoria?",
    "¿Aunque un problema parezca imposible, sigues intentando resolverlo?",
    "¿Te sientes incómodo cuando algo no tiene una explicación lógica?",
    "¿Prefieres actividades donde debas pensar profundamente antes de actuar?",
    "¿Te interesan los problemas donde existen varias respuestas posibles?",
    "¿Te gusta descubrir contradicciones en argumentos o ideas?",
    "¿Disfrutas actividades donde debas tomar decisiones usando razonamiento?",
    "¿Te interesa resolver situaciones complejas paso a paso?",
    "¿Te gusta analizar diferentes perspectivas antes de concluir algo?",
    "¿Disfrutas desafíos mentales que requieren paciencia y análisis?",
    "¿Te interesa la estadística aplicada a investigaciones científicas o sociales?",
    "¿Te gusta usar hojas de cálculo o herramientas matemáticas digitales?",
    "¿Disfrutas aprender métodos matemáticos nuevos?",
    "¿Te resulta entretenido resolver ecuaciones con múltiples variables?",
    "¿Te interesa comprender cómo funciona la criptografía o la seguridad digital?",
    "¿Te gusta planificar usando cálculos y estimaciones?",
    "¿Disfrutas actividades que combinan lógica y creatividad al mismo tiempo?",
    "¿Te interesa la física matemática o la mecánica cuántica?",
    "¿Te gusta analizar consecuencias antes de realizar una acción?",
    "¿Consideras que el pensamiento lógico es esencial en cualquier profesión?"
  ]},
  { topic:2, cat:"Lengua y Comunicación", areas:["Ciencias Sociales","Artes y Diseño"], q:[
    "¿Te gusta analizar textos y comprender sus significados profundos?",
    "¿Disfrutas expresar ideas de forma clara y organizada?",
    "¿Te interesa debatir usando argumentos sólidos?",
    "¿Disfrutas escribir cuentos, ensayos o reflexiones personales?",
    "¿Te resulta fácil hablar frente a grupos de personas?",
    "¿Te gusta aprender nuevas palabras y ampliar tu vocabulario?",
    "¿Disfrutas explicar ideas complejas de forma sencilla?",
    "¿Te interesa interpretar metáforas, símbolos o mensajes ocultos?",
    "¿Te gusta analizar canciones, películas o poemas en profundidad?",
    "¿Te interesa el periodismo, la comunicación social o los medios digitales?",
    "¿Disfrutas leer libros, artículos o historias en tu tiempo libre?",
    "¿Te resulta fácil persuadir o convencer a otras personas con palabras?",
    "¿Te gusta crear contenido para redes sociales o medios digitales?",
    "¿Disfrutas participar en actividades teatrales, debates o exposiciones?",
    "¿Te interesa aprender otros idiomas para comunicarte globalmente?",
    "¿Te resulta sencillo comprender textos largos y extraer ideas clave?",
    "¿Te gusta investigar temas y redactar conclusiones propias?",
    "¿Disfrutas contar historias o narrar experiencias de forma atractiva?",
    "¿Te interesa cómo las palabras pueden influir en las emociones de las personas?",
    "¿Consideras importante la comunicación efectiva en cualquier profesión?",
    "¿Te gusta interpretar mensajes ocultos en textos, canciones o películas?",
    "¿Disfrutas expresar ideas complejas de manera clara y accesible?",
    "¿Te interesa analizar cómo las palabras influyen en las personas?",
    "¿Te gusta debatir temas usando argumentos bien construidos?",
    "¿Disfrutas escribir ideas creativas o reflexivas?",
    "¿Te interesa comprender diferentes puntos de vista mediante la lectura?",
    "¿Te gusta analizar cómo se construyen discursos y opiniones?",
    "¿Disfrutas comunicar ideas frente a grupos de personas?",
    "¿Te interesa interpretar emociones y mensajes en expresiones artísticas?",
    "¿Te gusta argumentar tus opiniones usando evidencias y ejemplos?",
    "¿Te interesa la locución, la radio o los podcasts?",
    "¿Disfrutas escribir cartas, correos o publicaciones con impacto?",
    "¿Te gusta investigar el origen y evolución de las palabras?",
    "¿Te interesa la edición de textos o la corrección de estilo?",
    "¿Disfrutas analizar discursos políticos o publicitarios?",
    "¿Te gusta usar palabras para motivar o inspirar a otros?",
    "¿Te interesa la traducción o la interpretación de idiomas?",
    "¿Disfrutas aprender sobre culturas y formas de comunicación distintas?",
    "¿Te resulta fácil improvisar discursos o conversaciones?",
    "¿Te interesa el marketing de contenidos o el copywriting?",
    "¿Te gusta escribir reseñas, críticas o análisis de obras?",
    "¿Disfrutas hacer entrevistas o formular preguntas profundas?",
    "¿Te interesa la lingüística o el estudio del lenguaje como ciencia?",
    "¿Te gusta organizar ideas en esquemas o mapas mentales?",
    "¿Disfrutas aprender nuevas formas de expresión artística o literaria?",
    "¿Te interesa el guion cinematográfico o la escritura creativa?",
    "¿Te gusta comprender cómo influye el tono en un mensaje?",
    "¿Disfrutas participar en grupos de lectura o discusión literaria?",
    "¿Te interesa la oratoria o el arte de hablar en público?",
    "¿Consideras que leer y escribir bien son ventajas en cualquier carrera?"
  ]},
  { topic:3, cat:"Ciencias Sociales e Historia", areas:["Ciencias Sociales","Administración"], q:[
    "¿Te interesa comprender cómo funciona la sociedad y sus estructuras?",
    "¿Disfrutas relacionar hechos históricos con problemas de la actualidad?",
    "¿Te gusta analizar problemas políticos o económicos?",
    "¿Te interesa comprender cómo influyen las leyes en la vida de las personas?",
    "¿Disfrutas debatir sobre problemas sociales actuales?",
    "¿Te interesa comprender cómo se organizan los países y sus gobiernos?",
    "¿Te gusta analizar causas y consecuencias de eventos históricos?",
    "¿Disfrutas interpretar mapas, información geográfica o demografía?",
    "¿Te interesa comprender el comportamiento de las comunidades y culturas?",
    "¿Te gusta investigar conflictos sociales y proponer soluciones?",
    "¿Te interesa comprender cómo los medios influyen en la opinión pública?",
    "¿Disfrutas analizar cómo las decisiones políticas afectan la vida diaria?",
    "¿Te gusta investigar las causas de las desigualdades sociales?",
    "¿Te interesa analizar cómo las culturas cambian a través del tiempo?",
    "¿Disfrutas comprender cómo se forman y transforman las identidades culturales?",
    "¿Te gusta relacionar filosofía o ética con problemas del mundo real?",
    "¿Te interesa el derecho, la justicia o los derechos humanos?",
    "¿Disfrutas trabajar en proyectos que beneficien a comunidades vulnerables?",
    "¿Te gusta analizar cómo la economía afecta el bienestar de las personas?",
    "¿Consideras importante entender la historia para transformar el futuro?",
    "¿Te interesa estudiar cómo funcionan las organizaciones internacionales?",
    "¿Disfrutas analizar tratados, constituciones o documentos históricos?",
    "¿Te gusta comprender cómo surgen los movimientos sociales?",
    "¿Te interesa la antropología o el estudio de culturas ancestrales?",
    "¿Disfrutas investigar cómo se construye la identidad nacional?",
    "¿Te gusta analizar el impacto de la globalización en los países?",
    "¿Te interesa la geopolítica o las relaciones internacionales?",
    "¿Disfrutas estudiar revoluciones, guerras o transformaciones históricas?",
    "¿Te gusta comprender cómo funciona la economía global?",
    "¿Te interesa la sociología o el estudio del comportamiento colectivo?",
    "¿Disfrutas analizar cómo los líderes influyen en la historia?",
    "¿Te interesa comprender los sistemas democráticos y su funcionamiento?",
    "¿Te gusta investigar problemas ambientales desde una perspectiva social?",
    "¿Disfrutas entender cómo se financian los gobiernos y las políticas públicas?",
    "¿Te interesa la diplomacia o la resolución de conflictos internacionales?",
    "¿Te gusta analizar cómo las religiones han influido en la historia?",
    "¿Disfrutas comprender cómo funciona la migración y sus efectos?",
    "¿Te interesa la criminología o el análisis del comportamiento delictivo?",
    "¿Te gusta investigar cómo se construyen los prejuicios y estereotipos?",
    "¿Disfrutas analizar estadísticas sociales o demográficas?",
    "¿Te interesa el urbanismo o cómo se planifican las ciudades?",
    "¿Te gusta comprender los derechos laborales y la economía del trabajo?",
    "¿Disfrutas analizar cómo las tecnologías cambian las sociedades?",
    "¿Te interesa la arqueología o el estudio de civilizaciones antiguas?",
    "¿Te gusta investigar cómo se forman los sistemas de valores en una cultura?",
    "¿Disfrutas comprender la historia de Colombia y América Latina?",
    "¿Te interesa el activismo o la participación ciudadana?",
    "¿Te gusta analizar cómo funcionan los partidos políticos?",
    "¿Disfrutas comprender cómo influyen las ideologías en las decisiones?",
    "¿Consideras que conocer la historia es clave para no repetir errores?"
  ]},
  { topic:4, cat:"Ciencias Naturales y Biología", areas:["Ciencias Básicas","Salud y Ciencias Humanas"], q:[
    "¿Te interesa aprender cómo funciona el cuerpo humano?",
    "¿Disfrutas hacer experimentos o investigar fenómenos científicos?",
    "¿Te gusta analizar causas y efectos en procesos naturales?",
    "¿Te interesa aprender sobre reacciones químicas y sus aplicaciones?",
    "¿Disfrutas estudiar fenómenos físicos como la luz, el sonido o la gravedad?",
    "¿Te gusta analizar cómo interactúan los seres vivos en un ecosistema?",
    "¿Te interesa comprender cómo funciona el universo y el espacio?",
    "¿Disfrutas observar y analizar fenómenos naturales del entorno?",
    "¿Te interesa la genética, el ADN o la evolución de los seres vivos?",
    "¿Te gusta usar microscopios u otros instrumentos científicos?",
    "¿Te interesa la medicina, la salud o la investigación biomédica?",
    "¿Disfrutas aprender sobre enfermedades, tratamientos o nutrición?",
    "¿Te gusta cuidar el medio ambiente y entender el cambio climático?",
    "¿Te interesa la biotecnología o la ingeniería biomédica?",
    "¿Disfrutas resolver preguntas científicas complejas mediante investigación?",
    "¿Te gustaría trabajar en laboratorios o centros de investigación?",
    "¿Te interesa la farmacología o cómo funcionan los medicamentos?",
    "¿Disfrutas aprender sobre descubrimientos científicos recientes?",
    "¿Te interesa la oceanografía, la zoología o la botánica?",
    "¿Consideras que la ciencia es clave para mejorar la calidad de vida?",
    "¿Te gusta clasificar especies, elementos o fenómenos naturales?",
    "¿Te interesa la veterinaria o el cuidado de animales?",
    "¿Disfrutas aprender sobre el cerebro y el sistema nervioso?",
    "¿Te interesa la conservación ambiental y la biodiversidad?",
    "¿Te gusta comprender procesos como la fotosíntesis o la respiración celular?",
    "¿Te interesa la física aplicada a fenómenos cotidianos?",
    "¿Disfrutas aprender sobre astronomía o astrofísica?",
    "¿Te gusta investigar cómo funciona el sistema inmunológico?",
    "¿Te interesa la paleontología o el estudio de fósiles?",
    "¿Disfrutas analizar cómo los organismos se adaptan al ambiente?",
    "¿Te interesa la microbiología o el estudio de bacterias y virus?",
    "¿Te gusta aprender sobre energías renovables y sostenibilidad?",
    "¿Disfrutas comprender cómo funciona la herencia genética?",
    "¿Te interesa la química orgánica o inorgánica?",
    "¿Te gusta analizar datos científicos e interpretar resultados?",
    "¿Te interesa la nanotecnología o la ciencia de materiales?",
    "¿Disfrutas aprender sobre el ciclo del agua, el suelo o la atmósfera?",
    "¿Te interesa la nutrición y cómo los alimentos afectan la salud?",
    "¿Te gusta estudiar cómo funcionan los órganos del cuerpo humano?",
    "¿Disfrutas aprender sobre temas de salud pública o epidemiología?",
    "¿Te interesa la ecología y los problemas medioambientales actuales?",
    "¿Te gusta comprender cómo se desarrollan los fármacos y vacunas?",
    "¿Disfrutas investigar sobre plantas medicinales o bioquímica natural?",
    "¿Te interesa la óptica, la mecánica o la termodinámica?",
    "¿Te gusta aprender sobre el origen de la vida y la evolución?",
    "¿Disfrutas analizar el impacto de la contaminación en los ecosistemas?",
    "¿Te interesa la ingeniería química o de procesos?",
    "¿Te gusta comprender cómo se forman los minerales, rocas o volcanes?",
    "¿Disfrutas participar en proyectos de ciencia o ferias científicas?",
    "¿Consideras que la investigación científica es fundamental para el progreso?"
  ]},
  { topic:5, cat:"Tecnología e Innovación", areas:["Ingeniería","Ciencias Exactas"], q:[
    "¿Te interesa comprender cómo funcionan los computadores y sistemas digitales?",
    "¿Disfrutas resolver problemas técnicos o de programación?",
    "¿Te interesa crear aplicaciones, programas o sitios web?",
    "¿Te gusta aprender sobre innovación tecnológica y sus impactos?",
    "¿Disfrutas investigar herramientas digitales nuevas?",
    "¿Te interesa la inteligencia artificial, la robótica o la automatización?",
    "¿Te gusta analizar cómo funciona internet y las redes de comunicación?",
    "¿Disfrutas crear soluciones tecnológicas para problemas cotidianos?",
    "¿Te interesa el diseño digital, la multimedia o la producción audiovisual?",
    "¿Te gusta usar tecnología de forma creativa para proyectos propios?",
    "¿Te interesa cómo la tecnología cambia la sociedad y la economía?",
    "¿Disfrutas aprender sobre ciberseguridad o protección de datos?",
    "¿Te gustaría desarrollar videojuegos, apps o software?",
    "¿Te interesa la impresión 3D, drones u otras tecnologías emergentes?",
    "¿Disfrutas analizar cómo la tecnología mejora procesos industriales?",
    "¿Te gusta aprender sobre blockchain o tecnologías financieras digitales?",
    "¿Te interesa el internet de las cosas (IoT) o los sistemas inteligentes?",
    "¿Disfrutas participar en proyectos tecnológicos creativos o hackathones?",
    "¿Te gusta analizar cómo la tecnología puede mejorar la educación o la salud?",
    "¿Consideras que dominar la tecnología es esencial para cualquier profesión hoy?",
    "¿Te interesa aprender lenguajes de programación como Python, Java o C++?",
    "¿Disfrutas configurar redes, servidores o sistemas informáticos?",
    "¿Te gusta aprender sobre computación en la nube o cloud computing?",
    "¿Te interesa el análisis de big data o la ciencia de datos?",
    "¿Disfrutas aprender sobre machine learning o redes neuronales?",
    "¿Te gusta diseñar interfaces de usuario intuitivas y atractivas?",
    "¿Te interesa la domótica o la automatización del hogar?",
    "¿Disfrutas entender cómo funcionan los algoritmos de búsqueda?",
    "¿Te gusta aprender sobre realidad virtual o aumentada?",
    "¿Te interesa la electrónica o los sistemas embebidos?",
    "¿Disfrutas construir prototipos o modelos tecnológicos?",
    "¿Te gusta aprender sobre telecomunicaciones y transmisión de datos?",
    "¿Te interesa la computación cuántica o tecnologías del futuro?",
    "¿Disfrutas analizar vulnerabilidades y mejorar la seguridad de sistemas?",
    "¿Te gusta aprender sobre sistemas operativos y arquitectura de computadores?",
    "¿Te interesa la ingeniería de software o el desarrollo ágil?",
    "¿Disfrutas automatizar tareas repetitivas usando código o macros?",
    "¿Te gusta aprender sobre bases de datos y gestión de información?",
    "¿Te interesa la visión por computadora o el procesamiento de imágenes?",
    "¿Disfrutas diseñar sistemas que resuelvan problemas reales y complejos?",
    "¿Te gusta aprender sobre energías limpias y tecnología sostenible?",
    "¿Te interesa la manufactura avanzada o la industria 4.0?",
    "¿Disfrutas entender cómo funcionan los satélites o sistemas GPS?",
    "¿Te gusta aprender sobre compresión de datos o algoritmos eficientes?",
    "¿Te interesa el desarrollo de tecnología para el sector salud?",
    "¿Disfrutas investigar cómo mejorar la experiencia del usuario en apps?",
    "¿Te gusta aprender sobre gestión de proyectos tecnológicos?",
    "¿Te interesa la robótica aplicada a la industria o la medicina?",
    "¿Disfrutas aprender sobre infraestructura tecnológica de grandes empresas?",
    "¿Consideras que la tecnología puede resolver los grandes problemas del mundo?"
  ]},
  { topic:6, cat:"Artes y Creatividad", areas:["Artes y Diseño"], q:[
    "¿Disfrutas expresar emociones mediante dibujos, música o diseño?",
    "¿Te interesa crear diseños originales para proyectos visuales?",
    "¿Te gusta interpretar el significado profundo de obras artísticas?",
    "¿Disfrutas combinar imaginación con expresión visual o sonora?",
    "¿Te interesa la fotografía, el cine o la producción audiovisual?",
    "¿Te gusta crear manualidades, esculturas u objetos tridimensionales?",
    "¿Disfrutas actuar, bailar, cantar o participar en artes escénicas?",
    "¿Te interesa transmitir mensajes o emociones a través del arte?",
    "¿Te gusta experimentar con colores, formas, sonidos o texturas?",
    "¿Disfrutas crear proyectos visuales originales y creativos?",
    "¿Te interesa el diseño gráfico, de interiores o de moda?",
    "¿Te gusta analizar cómo el arte influye en la cultura y la sociedad?",
    "¿Disfrutas observar detalles visuales o sonoros que otros no notan?",
    "¿Te interesa la animación digital, los videojuegos o el diseño UX?",
    "¿Disfrutas buscar formas innovadoras de presentar ideas visualmente?",
    "¿Te gusta la música como forma de expresión o herramienta creativa?",
    "¿Te interesa la ilustración, el cómic o el arte digital?",
    "¿Disfrutas desarrollar ideas creativas para campañas publicitarias?",
    "¿Te gusta crear contenido visual para redes sociales o plataformas digitales?",
    "¿Consideras que la creatividad es fundamental en cualquier profesión?",
    "¿Te interesa la arquitectura o el diseño de espacios?",
    "¿Disfrutas aprender sobre historia del arte o movimientos artísticos?",
    "¿Te gusta crear piezas que cuenten una historia visual?",
    "¿Te interesa la tipografía o el diseño editorial?",
    "¿Disfrutas mezclar diferentes disciplinas artísticas en un proyecto?",
    "¿Te gusta aprender sobre arte urbano, graffiti o instalaciones?",
    "¿Te interesa la escenografía o el diseño teatral?",
    "¿Disfrutas editar videos, audios o fotografías?",
    "¿Te gusta aprender sobre composición musical o producción de sonido?",
    "¿Te interesa el arte como herramienta de transformación social?",
    "¿Disfrutas visitar museos, galerías o exposiciones de arte?",
    "¿Te gusta diseñar personajes, mundos o universos ficticios?",
    "¿Te interesa la caligrafía, la tipografía o el lettering?",
    "¿Disfrutas crear portafolios o colecciones de trabajo creativo?",
    "¿Te gusta aprender sobre corrientes artísticas como el surrealismo o el pop art?",
    "¿Te interesa la danza contemporánea o las artes del movimiento?",
    "¿Disfrutas colaborar con otros artistas en proyectos colectivos?",
    "¿Te gusta aprender sobre dirección de arte en cine o televisión?",
    "¿Te interesa la joyería, la cerámica u otras artesanías creativas?",
    "¿Disfrutas aprender sobre la relación entre arte y tecnología?",
    "¿Te gusta aprender sobre composición fotográfica o iluminación?",
    "¿Te interesa el diseño de videojuegos o la narrativa interactiva?",
    "¿Disfrutas aprender sobre moda sostenible o diseño ecológico?",
    "¿Te gusta explorar el arte como medio de expresión personal?",
    "¿Te interesa la gestión cultural o la producción de eventos artísticos?",
    "¿Disfrutas crear experiencias inmersivas o instalaciones artísticas?",
    "¿Te gusta aprender sobre el mercado del arte o el coleccionismo?",
    "¿Te interesa el diseño de identidad visual o branding de marcas?",
    "¿Disfrutas aprender sobre arte precolombino o culturas ancestrales colombianas?",
    "¿Consideras que el arte es una forma válida y valiosa de conocimiento?"
  ]},
  { topic:7, cat:"Psicología y Desarrollo Humano", areas:["Salud y Ciencias Humanas","Ciencias Sociales"], q:[
    "¿Te interesa comprender las emociones y el comportamiento humano?",
    "¿Disfrutas escuchar y apoyar a personas que tienen problemas?",
    "¿Te consideras una persona empática y comprensiva?",
    "¿Te interesa la salud mental, la terapia o el bienestar emocional?",
    "¿Disfrutas ayudar a resolver conflictos entre personas?",
    "¿Te interesa analizar por qué las personas se comportan de cierta manera?",
    "¿Disfrutas orientar o aconsejar a otras personas?",
    "¿Te interesa el liderazgo, motivar equipos o desarrollar el talento humano?",
    "¿Te consideras una persona paciente al tratar con diferentes tipos de personas?",
    "¿Te interesa la educación emocional o el desarrollo de habilidades blandas?",
    "¿Disfrutas trabajar en proyectos que impacten positivamente a comunidades?",
    "¿Te gusta observar el lenguaje corporal y las expresiones no verbales?",
    "¿Te interesa la psicología organizacional o el bienestar en el trabajo?",
    "¿Disfrutas reflexionar sobre tus propias experiencias para crecer?",
    "¿Te interesa el coaching, la orientación vocacional o el acompañamiento?",
    "¿Te resulta fácil generar confianza y conexión con otras personas?",
    "¿Te gusta identificar fortalezas y áreas de mejora en otras personas?",
    "¿Te interesa la inclusión, la diversidad y los derechos de comunidades?",
    "¿Disfrutas aprender técnicas de comunicación asertiva o inteligencia emocional?",
    "¿Consideras que entender la mente humana es clave para cualquier profesión?",
    "¿Te interesa la neurociencia o cómo funciona el cerebro?",
    "¿Disfrutas aprender sobre teorías del aprendizaje y la memoria?",
    "¿Te gusta analizar cómo el entorno influye en el desarrollo personal?",
    "¿Te interesa la psicología infantil o el desarrollo en la primera infancia?",
    "¿Disfrutas aprender sobre técnicas de meditación o mindfulness?",
    "¿Te gusta comprender el estrés, la ansiedad y cómo manejarlos?",
    "¿Te interesa la psicología forense o el perfil criminal?",
    "¿Disfrutas aprender sobre motivación y toma de decisiones?",
    "¿Te gusta analizar cómo los traumas afectan el comportamiento?",
    "¿Te interesa la psicología educativa o el aprendizaje significativo?",
    "¿Disfrutas aprender sobre relaciones interpersonales y vínculos afectivos?",
    "¿Te gusta comprender cómo se forman los hábitos y cómo cambiarlos?",
    "¿Te interesa el trabajo social o la intervención comunitaria?",
    "¿Disfrutas aprender sobre autoestima y desarrollo de la identidad?",
    "¿Te gusta analizar cómo los medios de comunicación afectan la psicología?",
    "¿Te interesa la terapia familiar o de pareja?",
    "¿Disfrutas aprender sobre creatividad y pensamiento lateral?",
    "¿Te gusta comprender cómo el juego influye en el desarrollo infantil?",
    "¿Te interesa la psicología deportiva o el rendimiento bajo presión?",
    "¿Disfrutas aprender sobre sesgos cognitivos y pensamiento crítico?",
    "¿Te gusta comprender cómo se construyen las creencias y valores?",
    "¿Te interesa la gerontología o el bienestar en la tercera edad?",
    "¿Disfrutas aprender sobre adicciones y procesos de recuperación?",
    "¿Te gusta analizar cómo influye la cultura en la identidad personal?",
    "¿Te interesa la psicología del consumidor o del marketing?",
    "¿Disfrutas aprender sobre inteligencias múltiples y estilos de aprendizaje?",
    "¿Te gusta comprender cómo se desarrolla la resiliencia en las personas?",
    "¿Te interesa la hipnosis, el psicodrama u otras técnicas terapéuticas?",
    "¿Disfrutas aprender sobre el impacto de la soledad en la salud mental?",
    "¿Consideras que el bienestar emocional es tan importante como el físico?"
  ]},
  { topic:8, cat:"Administración y Negocios", areas:["Administración","Ciencias Sociales"], q:[
    "¿Te interesa comprender cómo funcionan las empresas y los negocios?",
    "¿Disfrutas planificar, organizar y coordinar actividades o proyectos?",
    "¿Te gusta analizar estrategias empresariales exitosas?",
    "¿Te interesa el marketing, la publicidad o el posicionamiento de marcas?",
    "¿Disfrutas liderar equipos y tomar decisiones importantes?",
    "¿Te interesa la economía, las finanzas o los mercados de capitales?",
    "¿Te gusta analizar estados financieros o presupuestos?",
    "¿Disfrutas negociar o llegar a acuerdos beneficiosos para todos?",
    "¿Te interesa el comercio internacional o los negocios globales?",
    "¿Te gusta emprender e identificar oportunidades de negocio?",
    "¿Te interesa la gestión del talento humano o los recursos humanos?",
    "¿Disfrutas analizar el comportamiento del consumidor?",
    "¿Te gusta aprender sobre contabilidad o auditoría?",
    "¿Te interesa la logística, la cadena de suministro o el comercio?",
    "¿Disfrutas diseñar planes de negocios o proyectos empresariales?",
    "¿Te gusta aprender sobre liderazgo y gestión de equipos de alto desempeño?",
    "¿Te interesa la responsabilidad social empresarial?",
    "¿Disfrutas analizar tendencias del mercado o la competencia?",
    "¿Te gusta aprender sobre franquicias, startups o modelos de negocio?",
    "¿Consideras que tienes habilidades para convencer y persuadir?",
    "¿Te interesa la gestión de proyectos con metodologías ágiles?",
    "¿Disfrutas aprender sobre e-commerce o negocios digitales?",
    "¿Te gusta analizar indicadores económicos como el PIB o la inflación?",
    "¿Te interesa la banca, las inversiones o los seguros?",
    "¿Disfrutas aprender sobre gestión de marca o identidad corporativa?",
    "¿Te gusta comprender cómo funciona la bolsa de valores?",
    "¿Te interesa el derecho comercial o los contratos empresariales?",
    "¿Disfrutas aprender sobre gestión del cambio en organizaciones?",
    "¿Te gusta analizar casos de éxito o fracaso de empresas famosas?",
    "¿Te interesa la consultoría estratégica o el asesoramiento empresarial?",
    "¿Disfrutas aprender sobre tributación o impuestos empresariales?",
    "¿Te gusta comprender cómo funcionan los modelos de franquicia?",
    "¿Te interesa el desarrollo de nuevos productos o servicios innovadores?",
    "¿Disfrutas aprender sobre comunicación corporativa o relaciones públicas?",
    "¿Te gusta analizar cómo las empresas se adaptan a los cambios del mercado?",
    "¿Te interesa la gestión ambiental o la sostenibilidad empresarial?",
    "¿Disfrutas aprender sobre management o teorías de administración?",
    "¿Te gusta comprender cómo se toman decisiones en entornos de incertidumbre?",
    "¿Te interesa la gestión pública o la administración del Estado?",
    "¿Disfrutas aprender sobre comercio exterior o tratados de libre comercio?",
    "¿Te gusta analizar cómo las empresas gestionan su reputación?",
    "¿Te interesa el análisis de riesgos en entornos empresariales?",
    "¿Disfrutas aprender sobre tendencias de consumo y comportamiento del mercado?",
    "¿Te gusta comprender cómo se financia una startup o empresa nueva?",
    "¿Te interesa la gestión de la innovación dentro de las organizaciones?",
    "¿Disfrutas aprender sobre productividad y optimización de procesos?",
    "¿Te gusta analizar cómo las crisis económicas afectan las empresas?",
    "¿Te interesa el comercio justo o los modelos de negocio solidarios?",
    "¿Disfrutas aprender sobre negociación intercultural o diplomacia empresarial?",
    "¿Consideras que tener habilidades de liderazgo es clave para el éxito profesional?"
  ]},
  { topic:9, cat:"Salud y Ciencias de la Vida", areas:["Salud y Ciencias Humanas","Ciencias Básicas"], q:[
    "¿Te interesa la medicina y el cuidado de la salud de las personas?",
    "¿Disfrutas aprender sobre anatomía y cómo funciona el cuerpo humano?",
    "¿Te gusta trabajar ayudando a personas enfermas o vulnerables?",
    "¿Te interesa la enfermería, la fisioterapia o la terapia ocupacional?",
    "¿Disfrutas aprender sobre primeros auxilios o emergencias médicas?",
    "¿Te interesa la odontología o la salud oral?",
    "¿Te gusta comprender cómo se diagnostican y tratan las enfermedades?",
    "¿Disfrutas aprender sobre nutrición y su impacto en la salud?",
    "¿Te interesa la salud mental y el bienestar psicológico?",
    "¿Te gusta trabajar en equipo en entornos hospitalarios o clínicos?",
    "¿Te interesa la medicina preventiva o la salud pública?",
    "¿Disfrutas aprender sobre el sistema cardiovascular o respiratorio?",
    "¿Te gusta investigar nuevas alternativas o tratamientos médicos?",
    "¿Te interesa la optometría o la salud visual?",
    "¿Disfrutas aprender sobre el sistema inmunológico y las vacunas?",
    "¿Te gusta comprender cómo funcionan los medicamentos en el cuerpo?",
    "¿Te interesa la medicina deportiva o la rehabilitación física?",
    "¿Disfrutas aprender sobre cirugía o procedimientos médicos?",
    "¿Te gusta analizar casos clínicos y proponer diagnósticos?",
    "¿Consideras que tienes vocación de servicio hacia las personas?",
    "¿Te interesa la geriatría o el cuidado de adultos mayores?",
    "¿Disfrutas aprender sobre ginecología, obstetricia o salud reproductiva?",
    "¿Te gusta comprender cómo afectan las enfermedades crónicas a la vida?",
    "¿Te interesa la neurología o las enfermedades del sistema nervioso?",
    "¿Disfrutas aprender sobre medicina alternativa o integrativa?",
    "¿Te gusta trabajar en contextos de urgencias o cuidados intensivos?",
    "¿Te interesa la bacteriología, virología o inmunología?",
    "¿Disfrutas aprender sobre tecnología médica o equipos hospitalarios?",
    "¿Te gusta comprender cómo la genética influye en las enfermedades?",
    "¿Te interesa la medicina tropical o las enfermedades infecciosas?",
    "¿Disfrutas aprender sobre salud infantil o pediatría?",
    "¿Te gusta analizar estadísticas de salud o estudios epidemiológicos?",
    "¿Te interesa la medicina forense o la tanatología?",
    "¿Disfrutas aprender sobre rehabilitación auditiva o del lenguaje?",
    "¿Te gusta comprender cómo el estrés afecta el organismo?",
    "¿Te interesa la salud ambiental y su relación con las enfermedades?",
    "¿Disfrutas aprender sobre trasplantes de órganos o medicina regenerativa?",
    "¿Te gusta comprender cómo se desarrollan las enfermedades autoinmunes?",
    "¿Te interesa la oncología o el estudio y tratamiento del cáncer?",
    "¿Disfrutas aprender sobre endocrinología o enfermedades hormonales?",
    "¿Te gusta analizar cómo la alimentación previene enfermedades?",
    "¿Te interesa la salud digital o el uso de tecnología en medicina?",
    "¿Disfrutas aprender sobre bienestar integral: mente, cuerpo y espíritu?",
    "¿Te gusta comprender cómo los hábitos de vida impactan la salud?",
    "¿Te interesa la medicina de emergencias o los simulacros clínicos?",
    "¿Disfrutas aprender sobre accesibilidad y salud inclusiva?",
    "¿Te gusta aprender sobre el rol de las enfermeras en el sistema de salud?",
    "¿Te interesa la investigación en vacunas o enfermedades emergentes?",
    "¿Disfrutas aprender sobre salud intercultural o medicina tradicional?",
    "¿Consideras que la salud es el bien más valioso de una persona?"
  ]},
  { topic:10, cat:"Perfil Integral y Vocación", areas:["Ciencias Exactas","Ingeniería","Ciencias Básicas","Salud y Ciencias Humanas","Ciencias Sociales","Administración","Artes y Diseño"], q:[
    "¿Te gusta resolver problemas difíciles paso a paso?",
    "¿Disfrutas ayudar a otras personas con sus problemas?",
    "¿Te resulta fácil hablar frente a un grupo?",
    "¿Te interesa entender cómo funcionan los computadores o aplicaciones?",
    "¿Te gusta dibujar, diseñar o crear cosas visuales?",
    "¿Te ves liderando equipos o proyectos en el futuro?",
    "¿Te interesa aprender cómo funciona el cuerpo humano?",
    "¿Prefieres actividades prácticas antes que teóricas?",
    "¿Te gusta investigar información hasta encontrar respuestas?",
    "¿Te consideras creativo al resolver problemas?",
    "¿Te interesa trabajar con números, datos o estadísticas?",
    "¿Te gusta escuchar y aconsejar a otras personas?",
    "¿Te gustaría crear contenido para redes sociales o medios digitales?",
    "¿Te interesan los experimentos científicos?",
    "¿Te gusta organizar tareas, horarios o actividades?",
    "¿Te sientes cómodo trabajando bajo presión?",
    "¿Te interesa construir, reparar o ensamblar objetos?",
    "¿Te gusta aprender idiomas o comunicar ideas en diferentes formas?",
    "¿Te gustaría desarrollar videojuegos o software?",
    "¿Te interesa defender ideas o debatir temas importantes?",
    "¿Disfrutas trabajar en equipo para lograr metas comunes?",
    "¿Te gusta analizar el comportamiento de las personas?",
    "¿Te interesa el diseño de espacios, edificios o interiores?",
    "¿Te gusta trabajar con tecnología nueva y emergente?",
    "¿Te ves enseñando o explicando temas a otras personas?",
    "¿Te interesa la música, la actuación o la expresión artística?",
    "¿Te gusta resolver ejercicios matemáticos o lógicos?",
    "¿Te interesa emprender o crear negocios propios?",
    "¿Te sientes motivado al ayudar a mejorar la vida de otros?",
    "¿Te gusta trabajar en ambientes organizados y estructurados?",
    "¿Te interesa la naturaleza, el medio ambiente o la ecología?",
    "¿Te gustaría trabajar en hospitales, laboratorios o clínicas?",
    "¿Te gusta crear ideas innovadoras para resolver problemas?",
    "¿Te interesa comprender cómo funcionan las empresas y organizaciones?",
    "¿Te consideras observador con los detalles?",
    "¿Te gusta persuadir o convencer personas mediante argumentos?",
    "¿Te interesa la fotografía, edición o producción audiovisual?",
    "¿Te gusta resolver conflictos entre personas de forma pacífica?",
    "¿Te interesan las carreras relacionadas con ingeniería?",
    "¿Te gusta trabajar con herramientas, maquinaria o tecnología?",
    "¿Te gustaría investigar fenómenos científicos o sociales?",
    "¿Te interesa crear proyectos tecnológicos o digitales?",
    "¿Te gusta planificar actividades o eventos con anticipación?",
    "¿Te consideras una persona paciente y empática con los demás?",
    "¿Te interesa trabajar al aire libre más que en una oficina?",
    "¿Te gusta escribir historias, artículos o ideas propias?",
    "¿Te interesa analizar mercados, economía o finanzas?",
    "¿Te gusta experimentar con nuevas ideas creativas?",
    "¿Te sientes motivado cuando aprendes algo complejo y lo dominas?",
    "¿Te gustaría que tu trabajo tuviera un impacto importante en la sociedad?"
  ]}
];

// Opciones Likert fijas para todas las preguntas
const LIKERT_OPTS = ["Sí, definitivamente","Sí, bastante","Un poco","No realmente"];
const SCORE_MAP   = [4, 3, 1, 0];

// Sesión de test (se rellena en startTest)
let QUESTIONS = [];

// ── Campus images — Wikimedia Commons (CC-BY-SA) ──────────────
const UNI_CAMPUS = {
  // Bogotá
  "Universidad de los Andes":         "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0b/Uniandes_Campus.jpg/600px-Uniandes_Campus.jpg",
  "Universidad Nacional de Colombia":             "https://upload.wikimedia.org/wikipedia/commons/thumb/b/bc/Ciudad_Universitaria_de_Bogota.jpg/600px-Ciudad_Universitaria_de_Bogota.jpg",
  "Pontificia U. Javeriana":          "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3c/Edificio_Gabriel_Giraldo_SJ.jpg/600px-Edificio_Gabriel_Giraldo_SJ.jpg",
  "Universidad del Rosario":          "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c6/Claustro_de_la_Universidad_del_Rosario.jpg/600px-Claustro_de_la_Universidad_del_Rosario.jpg",
  "U. Externado de Colombia":         "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5c/Externado_de_Colombia_fachada.jpg/600px-Externado_de_Colombia_fachada.jpg",
  "U. Sergio Arboleda":               "https://upload.wikimedia.org/wikipedia/commons/thumb/b/bc/Universidad_Sergio_Arboleda_fachada.jpg/600px-Universidad_Sergio_Arboleda_fachada.jpg",
  "Universidad de La Sabana":         "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6a/Unisabana_campus.jpg/600px-Unisabana_campus.jpg",
  "Colegio Mayor de Cundinamarca":    "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5c/Colegio_Mayor_de_Cundinamarca.jpg/600px-Colegio_Mayor_de_Cundinamarca.jpg",
  "Escuela Colombiana de Ingeniería": "https://upload.wikimedia.org/wikipedia/commons/thumb/b/bb/Escuela_Colombiana_de_Ingenieria_campus.jpg/600px-Escuela_Colombiana_de_Ingenieria_campus.jpg",
  "U. Distrital F. J. de Caldas":    "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b6/Universidad_Distrital_FJC.jpg/600px-Universidad_Distrital_FJC.jpg",
  "Universidad El Bosque":            "https://upload.wikimedia.org/wikipedia/commons/thumb/4/48/Universidad_El_Bosque_campus.jpg/600px-Universidad_El_Bosque_campus.jpg",
  "Universidad Piloto de Colombia":   "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5a/Universidad_Piloto_Colombia.jpg/600px-Universidad_Piloto_Colombia.jpg",
  "U. Santo Tomás":                   "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2d/Santo_Tomas_Bogota.jpg/600px-Santo_Tomas_Bogota.jpg",
  "Fundación U. Los Libertadores":    "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d6/Los_Libertadores_campus.jpg/600px-Los_Libertadores_campus.jpg",
  "Universidad Central":              "https://upload.wikimedia.org/wikipedia/commons/thumb/f/ff/Universidad_Central_Colombia.jpg/600px-Universidad_Central_Colombia.jpg",
  "UNIMINUTO":                        "https://upload.wikimedia.org/wikipedia/commons/thumb/e/ef/UNIMINUTO_campus.jpg/600px-UNIMINUTO_campus.jpg",
  // Medellín
  "Universidad EAFIT":                "https://upload.wikimedia.org/wikipedia/commons/thumb/d/de/Biblioteca-EAFIT.JPG/600px-Biblioteca-EAFIT.JPG",
  "Universidad de Antioquia":         "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0d/UdeA-FacultadMedicinaFachada.JPG/600px-UdeA-FacultadMedicinaFachada.JPG",
  "U. Pontificia Bolivariana":        "https://upload.wikimedia.org/wikipedia/commons/thumb/1/12/UPB_Medellin.jpg/600px-UPB_Medellin.jpg",
  "Universidad CES":                  "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8e/Universidad_CES.jpg/600px-Universidad_CES.jpg",
  "ITM – Inst. Tecnológico Metro.":   "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2e/ITM_Medellin.jpg/600px-ITM_Medellin.jpg",
  // Cali
  "Universidad del Valle":            "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6d/Universidad_del_Valle_Melendez.jpg/600px-Universidad_del_Valle_Melendez.jpg",
  "Pontificia U. Javeriana Cali":     "https://upload.wikimedia.org/wikipedia/commons/thumb/5/50/Pontificia_Universidad_Javeriana_Cali.jpg/600px-Pontificia_Universidad_Javeriana_Cali.jpg",
  "U. Autónoma de Occidente":         "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c6/Universidad_Autonoma_Occidente_Cali.jpg/600px-Universidad_Autonoma_Occidente_Cali.jpg",
  "Universidad ICESI":                "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3c/Icesi_university.jpg/600px-Icesi_university.jpg",
  "Universidad Santiago de Cali":     "https://upload.wikimedia.org/wikipedia/commons/thumb/6/68/Universidad_Santiago_de_Cali.jpg/600px-Universidad_Santiago_de_Cali.jpg",
  "Bellas Artes de Colombia":         "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b2/Bellas_Artes_Colombia.jpg/600px-Bellas_Artes_Colombia.jpg",
  // Barranquilla
  "Universidad del Norte":            "https://upload.wikimedia.org/wikipedia/commons/thumb/8/89/Uninorte_campus.jpg/600px-Uninorte_campus.jpg",
  "Universidad del Atlántico":        "https://upload.wikimedia.org/wikipedia/commons/thumb/4/45/Universidad_del_Atlantico.jpg/600px-Universidad_del_Atlantico.jpg",
  "U. Simón Bolívar Barranquilla":    "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a5/Simon_Bolivar_Barranquilla.jpg/600px-Simon_Bolivar_Barranquilla.jpg",
  "U. Libre Barranquilla":            "https://upload.wikimedia.org/wikipedia/commons/thumb/4/48/Universidad_Libre_Colombia.jpg/600px-Universidad_Libre_Colombia.jpg",
  "Bellas Artes de Colombia B/q":     "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d5/Bellas_Artes_Barranquilla.jpg/600px-Bellas_Artes_Barranquilla.jpg",
  // Bucaramanga
  "U. Industrial de Santander":       "https://upload.wikimedia.org/wikipedia/commons/thumb/9/9c/Universidad_Industrial_de_Santander.jpg/600px-Universidad_Industrial_de_Santander.jpg",
  "U. Autónoma de Bucaramanga (UNAB)":       "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2f/Universidad_Autonoma_de_Bucaramanga.jpg/600px-Universidad_Autonoma_de_Bucaramanga.jpg",
  "U. Cooperativa de Colombia":       "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4b/Universidad_Cooperativa_Colombia.jpg/600px-Universidad_Cooperativa_Colombia.jpg",
  "U. Pontificia Bolivariana B/g":    "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4c/UPB_Bucaramanga.jpg/600px-UPB_Bucaramanga.jpg",
  // Cúcuta
  "U. Francisco de Paula Santander":  "https://upload.wikimedia.org/wikipedia/commons/thumb/e/ed/UFPS_Cucuta.jpg/600px-UFPS_Cucuta.jpg",
  "Universidad de Pamplona":          "https://upload.wikimedia.org/wikipedia/commons/thumb/a/aa/Universidad_de_Pamplona.jpg/600px-Universidad_de_Pamplona.jpg",
  "U. Simón Bolívar Cúcuta":          "https://upload.wikimedia.org/wikipedia/commons/thumb/8/85/Unisimon_Cucuta.jpg/600px-Unisimon_Cucuta.jpg",
  "U. Libre Seccional Cúcuta":        "https://upload.wikimedia.org/wikipedia/commons/thumb/5/53/Unilibre_Cucuta.jpg/600px-Unilibre_Cucuta.jpg",
  "UFPS Ocaña":             "https://upload.wikimedia.org/wikipedia/commons/thumb/f/fc/UFPSO_Ocana.jpg/600px-UFPSO_Ocana.jpg",
  // Eje cafetero
  "U. Tecnológica de Pereira":        "https://upload.wikimedia.org/wikipedia/commons/thumb/5/51/Universidad_Tecnologica_de_Pereira.jpg/600px-Universidad_Tecnologica_de_Pereira.jpg",
  "Universidad de Caldas":            "https://upload.wikimedia.org/wikipedia/commons/thumb/5/56/Universidad_de_Caldas.jpg/600px-Universidad_de_Caldas.jpg",
  "Universidad del Quindío":          "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0b/Universidad_del_Quindio.jpg/600px-Universidad_del_Quindio.jpg",
  "U. Católica de Manizales":         "https://upload.wikimedia.org/wikipedia/commons/thumb/7/77/Universidad_Católica_de_Manizales.jpg/600px-Universidad_Católica_de_Manizales.jpg",
  // Cartagena
  "Universidad de Cartagena":         "https://upload.wikimedia.org/wikipedia/commons/thumb/9/98/Universidad_de_Cartagena.jpg/600px-Universidad_de_Cartagena.jpg",
  "U. Tecnológica de Bolívar":        "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f6/Universidad_Tecnologica_Bolivar.jpg/600px-Universidad_Tecnologica_Bolivar.jpg",
  "U. de San Buenaventura Cgt.":      "https://upload.wikimedia.org/wikipedia/commons/thumb/0/08/San_Buenaventura_Cartagena.jpg/600px-San_Buenaventura_Cartagena.jpg",
  // Otras regiones
  "Universidad de Córdoba":           "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d5/Universidad_de_Cordoba_Colombia.jpg/600px-Universidad_de_Cordoba_Colombia.jpg",
  "Universidad del Cauca":            "https://upload.wikimedia.org/wikipedia/commons/thumb/6/68/Universidad_del_Cauca.jpg/600px-Universidad_del_Cauca.jpg",
  "Universidad de Nariño":            "https://upload.wikimedia.org/wikipedia/commons/thumb/0/02/Universidad_de_Narino.jpg/600px-Universidad_de_Narino.jpg",
  "U. Surcolombiana":                 "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d1/Universidad_Surcolombiana.jpg/600px-Universidad_Surcolombiana.jpg",
  "U. de los Llanos":                 "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5f/Universidad_de_los_Llanos.jpg/600px-Universidad_de_los_Llanos.jpg",
  "Universidad del Magdalena":        "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e5/Universidad_del_Magdalena.jpg/600px-Universidad_del_Magdalena.jpg",
  "U. Popular del Cesar":             "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1b/Universidad_Popular_del_Cesar.jpg/600px-Universidad_Popular_del_Cesar.jpg",
  "Universidad de Sucre":             "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6d/Universidad_de_Sucre.jpg/600px-Universidad_de_Sucre.jpg",
  "U. Pedagógica y Tecnológica (UPTC)":      "https://upload.wikimedia.org/wikipedia/commons/thumb/6/65/UPTC_Tunja.jpg/600px-UPTC_Tunja.jpg",
  "Universidad de la Amazonia":       "https://upload.wikimedia.org/wikipedia/commons/thumb/6/67/Universidad_de_la_Amazonia.jpg/600px-Universidad_de_la_Amazonia.jpg",
};

const UNIVERSITIES = [
  // ── BOGOTÁ / CUNDINAMARCA ──────────────────────────────────
  {name:"Universidad de los Andes",           city:"Bogotá",      region:"Bogotá",       icon:"🦅", url:"https://uniandes.edu.co",              icfes:{min:400,"Ing. de Sistemas":415,"Economía":424,"Administración":400,"Arquitectura":410,"Ciencia Política":405},areas:["Ingeniería","Ciencias Exactas","Administración","Artes y Diseño","Ciencias Sociales"],          careers:["Ing. de Sistemas","Economía","Administración","Arquitectura","Ciencia Política"]},
  {name:"Universidad Nacional de Colombia",   city:"Bogotá",      region:"Bogotá",       icon:"🌿", url:"https://unal.edu.co",                  icfes:{min:340,"Medicina":430,"Ing. Electrónica":362,"Matemáticas":358,"Biología":356,"Sociología":345},areas:["Ciencias Exactas","Ingeniería","Ciencias Básicas","Salud y Ciencias Humanas","Ciencias Sociales"],careers:["Medicina","Ing. Electrónica","Matemáticas","Biología","Sociología"]},
  {name:"Pontificia U. Javeriana",            city:"Bogotá",      region:"Bogotá",       icon:"✝️", url:"https://www.javeriana.edu.co",          icfes:{min:350,"Medicina":445,"Derecho":415,"Diseño Industrial":366,"Comunicación":370,"Ciencia Política":360,"Relaciones Internacionales":365},areas:["Salud y Ciencias Humanas","Administración","Artes y Diseño","Ciencias Sociales"],careers:["Medicina","Derecho","Diseño Industrial","Comunicación","Ciencia Política","Relaciones Internacionales"]},
  {name:"Universidad del Rosario",            city:"Bogotá",      region:"Bogotá",       icon:"🌹", url:"https://urosario.edu.co",              icfes:{min:390,"Medicina":445,"Derecho":420,"Administración":390,"Relaciones Internacionales":410},areas:["Ciencias Sociales","Salud y Ciencias Humanas","Administración"],          careers:["Medicina","Derecho","Administración","Relaciones Internacionales"]},
  {name:"U. Externado de Colombia",           city:"Bogotá",      region:"Bogotá",       icon:"⚖️", url:"https://www.uexternado.edu.co",         icfes:{min:380,"Derecho":415,"Economía":404,"Finanzas":400,"Administración Pública":396,"Relaciones Internacionales":400},                            areas:["Ciencias Sociales","Administración"],                               careers:["Derecho","Economía","Finanzas","Administración Pública","Relaciones Internacionales"]},
  {name:"U. Sergio Arboleda",                 city:"Bogotá",      region:"Bogotá",       icon:"📚", url:"https://www.usergioarboleda.edu.co",    icfes:{min:310,"Derecho":340,"Mercadeo":320,"Ing. de Sistemas":325,"Economía":334},areas:["Administración","Ciencias Sociales","Ingeniería"],                  careers:["Derecho","Mercadeo","Ing. de Sistemas","Economía"]},
  {name:"Universidad de La Sabana",           city:"Chía",        region:"Bogotá",       icon:"☀️", url:"https://www.unisabana.edu.co",          icfes:{min:325,"Comunicación":345,"Medicina":400,"Administración":340,"Derecho":360},areas:["Administración","Salud y Ciencias Humanas","Ciencias Sociales"],     careers:["Comunicación","Medicina","Administración","Derecho"]},
  {name:"U. Colegio Mayor de Cundinamarca",   city:"Bogotá",      region:"Bogotá",       icon:"🏰", url:"https://www.unicolmayor.edu.co",        icfes:{min:290,"Trabajo Social":305,"Arquitectura":315,"Bacteriología":322,"Turismo":296},areas:["Salud y Ciencias Humanas","Artes y Diseño","Ciencias Sociales"],     careers:["Trabajo Social","Arquitectura","Bacteriología","Turismo"]},
  {name:"Escuela Colombiana de Ingeniería",   city:"Bogotá",      region:"Bogotá",       icon:"🏗️", url:"https://www.escuelaing.edu.co",         icfes:{min:395,"Ing. Civil":423,"Ing. de Sistemas":395,"Ing. Biomédica":425,"Matemáticas":413},                                           areas:["Ingeniería","Ciencias Exactas"],                                    careers:["Ing. Civil","Ing. de Sistemas","Ing. Biomédica","Matemáticas"]},
  {name:"U. Distrital F. J. de Caldas",       city:"Bogotá",      region:"Bogotá",       icon:"🏙️", url:"https://www.udistrital.edu.co",         icfes:{min:305,"Ing. de Sistemas":360,"Tecnología en Electrónica":293,"Licenciatura":315,"Ing. Industrial":330},areas:["Ingeniería","Ciencias Exactas","Ciencias Sociales"],                careers:["Ing. de Sistemas","Tecnología en Electrónica","Licenciatura","Ing. Industrial"]},
  {name:"Universidad El Bosque",              city:"Bogotá",      region:"Bogotá",       icon:"🌳", url:"https://www.unbosque.edu.co",           icfes:{min:315,"Medicina":390,"Odontología":370,"Psicología":322,"Biología":331},areas:["Salud y Ciencias Humanas","Ciencias Básicas"],                      careers:["Medicina","Odontología","Psicología","Biología"]},
  {name:"Universidad Piloto de Colombia",     city:"Bogotá",      region:"Bogotá",       icon:"✈️", url:"https://www.unipiloto.edu.co",          icfes:{min:268,"Arquitectura":310,"Ing. de Sistemas":300,"Administración":285,"Diseño Gráfico":280},areas:["Artes y Diseño","Ingeniería","Administración"],                  careers:["Arquitectura","Ing. de Sistemas","Administración","Diseño Gráfico"]},
  {name:"U. Santo Tomás",                     city:"Bogotá",      region:"Bogotá",       icon:"🕊️", url:"https://www.usta.edu.co",              icfes:{min:288,"Derecho":330,"Ing. Civil":316,"Psicología":308,"Filosofía":300},areas:["Ciencias Sociales","Ingeniería","Administración"],                  careers:["Derecho","Ing. Civil","Psicología","Filosofía"]},
  {name:"Fundación U. Los Libertadores",      city:"Bogotá",      region:"Bogotá",       icon:"🗽", url:"https://www.libertadores.edu.co",       icfes:{min:240,"Ing. Aeronáutica":275,"Diseño Gráfico":252,"Psicología":258,"Administración":255},areas:["Ingeniería","Artes y Diseño","Ciencias Sociales"],                  careers:["Ing. Aeronáutica","Diseño Gráfico","Psicología","Administración"]},
  {name:"Universidad Central",                city:"Bogotá",      region:"Bogotá",       icon:"📐", url:"https://www.ucentral.edu.co",          icfes:{min:278,"Diseño Gráfico":290,"Comunicación":298,"Economía":302,"Ing. Industrial":303},areas:["Artes y Diseño","Administración","Ciencias Sociales"],              careers:["Diseño Gráfico","Comunicación","Economía","Ing. Industrial"]},
  {name:"U. Jorge Tadeo Lozano",              city:"Bogotá",      region:"Bogotá",       icon:"🎨", url:"https://www.utadeo.edu.co",             icfes:{min:295,"Diseño Gráfico":307,"Publicidad":307,"Biología Marina":317,"Negocios Internacionales":317},areas:["Artes y Diseño","Ciencias Básicas","Administración"],              careers:["Diseño Gráfico","Publicidad","Biología Marina","Negocios Internacionales"]},
  {name:"U. Católica de Colombia",            city:"Bogotá",      region:"Bogotá",       icon:"⛪", url:"https://www.ucatolica.edu.co",          icfes:{min:282,"Ing. Civil":310,"Derecho":318,"Psicología":302,"Arquitectura":315},areas:["Ingeniería","Ciencias Sociales","Artes y Diseño"],                  careers:["Ing. Civil","Derecho","Psicología","Arquitectura"]},
  {name:"Universidad EAN",                    city:"Bogotá",      region:"Bogotá",       icon:"📊", url:"https://universidadean.edu.co",         icfes:{min:285,"Administración":310,"Negocios Internacionales":307,"Ing. de Sistemas":308,"Mercadeo":295},areas:["Administración","Ingeniería"],                             careers:["Administración","Negocios Internacionales","Ing. de Sistemas","Mercadeo"]},
  {name:"U. de La Salle",                     city:"Bogotá",      region:"Bogotá",       icon:"🔵", url:"https://www.lasalle.edu.co",            icfes:{min:240,"Medicina Veterinaria":255,"Optometría":245,"Ing. Ambiental":240,"Administración":254},areas:["Ciencias Básicas","Salud y Ciencias Humanas","Ingeniería"],  careers:["Medicina Veterinaria","Optometría","Ing. Ambiental","Administración"]},
  {name:"Universidad de Ciencias Aplicadas (UDCA)", city:"Bogotá",region:"Bogotá",      icon:"🔬", url:"https://www.udca.edu.co",              icfes:{min:265,"Medicina":340,"Química Farmacéutica":295,"Ing. Ambiental":283,"Agronomía":275},areas:["Ciencias Básicas","Salud y Ciencias Humanas","Ingeniería"],   careers:["Medicina","Química Farmacéutica","Ing. Ambiental","Agronomía"]},
  {name:"U. Manuela Beltrán",                 city:"Bogotá",      region:"Bogotá",       icon:"💜", url:"https://www.umb.edu.co",               icfes:{min:262,"Fisioterapia":292,"Ing. Biomédica":292,"Psicología":282,"Optometría":290,"Ingeniería de Software":270},areas:["Salud y Ciencias Humanas","Ingeniería"],                            careers:["Fisioterapia","Ing. Biomédica","Psicología","Optometría","Ingeniería de Software"]},
  {name:"U. La Gran Colombia",                city:"Bogotá",      region:"Bogotá",       icon:"🇨🇴", url:"https://www.ugc.edu.co",               icfes:{min:255,"Derecho":295,"Arquitectura":275,"Contaduría Pública":255,"Economía":279},areas:["Ciencias Sociales","Artes y Diseño","Administración"],              careers:["Derecho","Arquitectura","Contaduría Pública","Economía"]},
  {name:"U. Autónoma de Colombia",            city:"Bogotá",      region:"Bogotá",       icon:"🏛️", url:"https://www.fuac.edu.co",              icfes:{min:220,"Derecho":230,"Comunicación":222,"Ing. de Sistemas":220,"Administración":234},   areas:["Ciencias Sociales","Ingeniería","Administración"],                  careers:["Derecho","Comunicación","Ing. de Sistemas","Administración"]},
  {name:"U. de América",                      city:"Bogotá",      region:"Bogotá",       icon:"🌎", url:"https://www.uamerica.edu.co",          icfes:{min:290,"Ing. Química":316,"Ing. Mecánica":314,"Administración":308,"Economía":314},areas:["Ingeniería","Administración","Ciencias Exactas"],                 careers:["Ing. Química","Ing. Mecánica","Administración","Economía"]},
  {name:"CESA",                               city:"Bogotá",      region:"Bogotá",       icon:"💼", url:"https://www.cesa.edu.co",              icfes:{min:400,"Administración":400,"Negocios Internacionales":422,"Finanzas":420},                                          areas:["Administración"],                                                   careers:["Administración","Negocios Internacionales","Finanzas"]},
  {name:"Fundación U. Konrad Lorenz",         city:"Bogotá",      region:"Bogotá",       icon:"🧠", url:"https://www.konradlorenz.edu.co",       icfes:{min:285,"Psicología":320,"Matemáticas":303,"Ing. de Sistemas":295,"Administración":285}, areas:["Ciencias Sociales","Ciencias Exactas","Ingeniería"],                careers:["Psicología","Matemáticas","Ing. de Sistemas","Administración"]},
  {name:"U. Pedagógica Nacional",             city:"Bogotá",      region:"Bogotá",       icon:"📖", url:"https://www.pedagogica.edu.co",         icfes:{min:310,"Licenciatura en Matemáticas":324,"Licenciatura en Biología":322,"Psicología":335},                         areas:["Ciencias Sociales","Ciencias Básicas"],                             careers:["Licenciatura en Matemáticas","Licenciatura en Biología","Psicología"]},
  {name:"Universidad Militar Nueva Granada",  city:"Bogotá",      region:"Bogotá",       icon:"🎖️", url:"https://www.umng.edu.co",              icfes:{min:295,"Ing. Civil":323,"Medicina":370,"Derecho":330,"Administración":315},areas:["Ingeniería","Salud y Ciencias Humanas","Ciencias Sociales"],        careers:["Ing. Civil","Medicina","Derecho","Administración"]},
  {name:"Universidad Iberoamericana",         city:"Bogotá",      region:"Bogotá",       icon:"🌐", url:"https://www.iberoamericana.edu.co",     icfes:{min:230,"Fisioterapia":260,"Fonoaudiología":258,"Terapia Ocupacional":256,"Educación Especial":238},areas:["Salud y Ciencias Humanas"],                                       careers:["Fisioterapia","Fonoaudiología","Terapia Ocupacional","Educación Especial"]},
  {name:"UNAD",                               city:"Nacional",    region:"Nacional",     icon:"🌐", url:"https://www.unad.edu.co",              icfes:{min:180,"Ing. de Sistemas":210,"Psicología":215,"Administración":194,"Agronomía":190},                                                               areas:["Ciencias Sociales","Administración","Ingeniería","Ciencias Básicas"],careers:["Ing. de Sistemas","Psicología","Administración","Agronomía"]},
  {name:"UNIMINUTO",                          city:"Nacional",    region:"Nacional",     icon:"🙏", url:"https://www.uniminuto.edu",            icfes:{min:240,"Trabajo Social":255,"Administración":255,"Licenciatura":250,"Comunicación":260},areas:["Ciencias Sociales","Administración","Salud y Ciencias Humanas"],   careers:["Trabajo Social","Administración","Licenciatura","Comunicación"]},
  {name:"U. Antonio Nariño",                  city:"Nacional",    region:"Nacional",     icon:"🔩", url:"https://www.uan.edu.co",               icfes:{min:250,"Optometría":278,"Ing. Electrónica":272,"Medicina Veterinaria":282,"Química Farmacéutica":280},areas:["Salud y Ciencias Humanas","Ingeniería","Ciencias Básicas"],       careers:["Optometría","Ing. Electrónica","Medicina Veterinaria","Química Farmacéutica"]},
  {name:"U. Cooperativa de Colombia",         city:"Nacional",    region:"Nacional",     icon:"🤝", url:"https://www.ucc.edu.co",              icfes:{min:255,"Psicología":272,"Odontología":310,"Derecho":290,"Administración":268},areas:["Salud y Ciencias Humanas","Ciencias Sociales","Administración"],   careers:["Psicología","Odontología","Derecho","Administración"]},
  {name:"U. San Martín",                      city:"Nacional",    region:"Nacional",     icon:"🏥", url:"https://www.sanmartin.edu.co",         icfes:{min:235,"Medicina Veterinaria":267,"Optometría":263,"Odontología":290,"Fisioterapia":265},areas:["Salud y Ciencias Humanas","Ciencias Básicas"],                      careers:["Medicina Veterinaria","Optometría","Odontología","Fisioterapia"]},
  {name:"U. del Área Andina",                 city:"Nacional",    region:"Nacional",     icon:"🏔️", url:"https://www.areandina.edu.co",          icfes:{min:245,"Enfermería":255,"Radiología":269,"Administración":258,"Cosmetología":249},areas:["Salud y Ciencias Humanas","Administración"],                        careers:["Enfermería","Radiología","Administración","Cosmetología"]},
  {name:"Politécnico Grancolombiano",         city:"Bogotá",      region:"Bogotá",       icon:"🔧", url:"https://www.poli.edu.co",              icfes:{min:248,"Ing. de Sistemas":275,"Administración":262,"Diseño Gráfico":260,"Mercadeo":258},areas:["Ingeniería","Administración","Artes y Diseño"],                  careers:["Ing. de Sistemas","Administración","Diseño Gráfico","Mercadeo"]},
  {name:"U. Agustiniana",                     city:"Bogotá",      region:"Bogotá",       icon:"✡️", url:"https://www.uniagustiniana.edu.co",    icfes:{min:240,"Administración":255,"Derecho":272,"Ing. de Sistemas":268,"Comunicación":260},areas:["Administración","Ciencias Sociales","Ingeniería"],                  careers:["Administración","Derecho","Ing. de Sistemas","Comunicación"]},
  {name:"U. ECCI",                            city:"Bogotá",      region:"Bogotá",       icon:"💻", url:"https://www.ecci.edu.co",              icfes:{min:260,"Ing. de Sistemas":295,"Ing. Electrónica":282,"Administración":278,"Tecnología en Sistemas":250},areas:["Ingeniería","Administración","Ciencias Exactas"],               careers:["Ing. de Sistemas","Ing. Electrónica","Administración","Tecnología en Sistemas"]},
  {name:"U. Incca de Colombia",               city:"Bogotá",      region:"Bogotá",       icon:"🌟", url:"https://www.unincca.edu.co",           icfes:{min:250,"Derecho":285,"Medicina":335,"Ing. de Sistemas":278,"Administración":265},areas:["Ciencias Sociales","Salud y Ciencias Humanas","Ingeniería"],        careers:["Derecho","Medicina","Ing. de Sistemas","Administración"]},
  {name:"Fundación U. INPAHU",               city:"Bogotá",      region:"Bogotá",       icon:"📱", url:"https://www.inpahu.edu.co",            icfes:{min:225,"Diseño Gráfico":237,"Comunicación":245,"Administración":240,"Mercadeo":235},areas:["Artes y Diseño","Ciencias Sociales","Administración"],              careers:["Diseño Gráfico","Comunicación","Administración","Mercadeo"]},
  {name:"Fundación U. Compensar",            city:"Bogotá",      region:"Bogotá",       icon:"💚", url:"https://www.ucompensar.edu.co",        icfes:{min:214,"Administración":236,"Psicología":238,"Ing. de Sistemas":248,"Contaduría Pública":222},areas:["Administración","Ciencias Sociales","Ingeniería"],              careers:["Administración","Psicología","Ing. de Sistemas","Contaduría Pública"]},
  {name:"U. Republicana",                    city:"Bogotá",      region:"Bogotá",       icon:"🏛️", url:"https://www.urepublicana.edu.co",      icfes:{min:218,"Derecho":252,"Ing. de Sistemas":245,"Contaduría Pública":218,"Administración":232},areas:["Ciencias Sociales","Ingeniería","Administración"],              careers:["Derecho","Ing. de Sistemas","Contaduría Pública","Administración"]},
  {name:"Fundación U. Horizonte",            city:"Bogotá",      region:"Bogotá",       icon:"🌅", url:"https://www.unihorizonte.edu.co",      icfes:{min:214,"Ing. de Sistemas":240,"Administración":228,"Derecho":245,"Mercadeo":224},areas:["Administración","Ingeniería","Ciencias Sociales"],              careers:["Ing. de Sistemas","Administración","Derecho","Mercadeo"]},
  {name:"U. de Cundinamarca",                 city:"Fusagasugá",  region:"Bogotá",       icon:"🌄", url:"https://www.ucundinamarca.edu.co",     icfes:{min:205,"Administración":210,"Ing. de Sistemas":208,"Contaduría Pública":205,"Tecnología en Sistemas":195,"Ingeniería de Software":210},  areas:["Administración","Ingeniería"],                                    careers:["Administración","Ing. de Sistemas","Contaduría Pública","Tecnología en Sistemas","Ingeniería de Software"]},
  {name:"Escuela Tecnológica Inst. Técnico Central", city:"Bogotá",region:"Bogotá",     icon:"🏫", url:"https://www.itc.edu.co",              icfes:{min:200,"Ing. de Sistemas":248,"Tecnología en Sistemas":190,"Ing. Electrónica":222},                                           areas:["Ingeniería"],                                                       careers:["Ing. de Sistemas","Tecnología en Sistemas","Ing. Electrónica"]},
  {name:"Fundación U. Uniempresarial",        city:"Bogotá",      region:"Bogotá",       icon:"💼", url:"https://www.uniempresarial.edu.co",    icfes:{min:270,"Administración":295,"Contaduría Pública":270,"Finanzas":290,"Mercadeo":280},                         areas:["Administración"],                                                   careers:["Administración","Contaduría Pública","Finanzas","Mercadeo"]},
  {name:"Fundación U. de Colombia (IUCO)",    city:"Bogotá",      region:"Bogotá",       icon:"🎓", url:"https://www.iuco.edu.co",              icfes:{min:214,"Derecho":245,"Administración":228,"Ing. de Sistemas":240,"Psicología":230},areas:["Ciencias Sociales","Ingeniería","Administración"],              careers:["Derecho","Administración","Ing. de Sistemas","Psicología"]},
  {name:"Fundación U. Sanitas",               city:"Bogotá",      region:"Bogotá",       icon:"🏥", url:"https://www.unisanitas.edu.co",        icfes:{min:295,"Medicina":350,"Enfermería":295,"Fisioterapia":325,"Optometría":323},                               areas:["Salud y Ciencias Humanas"],                                         careers:["Medicina","Enfermería","Fisioterapia","Optometría"]},
  {name:"Corporación Tecnológica de Bogotá",  city:"Bogotá",      region:"Bogotá",       icon:"🔬", url:"https://www.ctb.edu.co",              icfes:{min:208,"Ing. de Sistemas":235,"Administración":222,"Contaduría Pública":208,"Tecnología en Sistemas":198},areas:["Ingeniería","Administración"],                           careers:["Ing. de Sistemas","Administración","Contaduría Pública","Tecnología en Sistemas"]},
  {name:"Fundación U. Agraria (UNIAGRARIA)",  city:"Bogotá",      region:"Bogotá",       icon:"🌱", url:"https://www.uniagraria.edu.co",        icfes:{min:212,"Agronomía":222,"Zootecnia":220,"Ing. Agroecológica":222,"Administración":228},areas:["Ingeniería","Administración","Ciencias Básicas"],           careers:["Agronomía","Zootecnia","Ing. Agroecológica","Administración"]},
  // ── MEDELLÍN / ANTIOQUIA ───────────────────────────────────
  {name:"Universidad EAFIT",                  city:"Medellín",    region:"Medellín",     icon:"⚙️", url:"https://www.eafit.edu.co",             icfes:{min:375,"Ing. de Sistemas":390,"Administración":385,"Matemáticas":393,"Música":381},areas:["Ingeniería","Administración","Ciencias Exactas"],                 careers:["Ing. de Sistemas","Administración","Matemáticas","Música"]},
  {name:"Universidad de Antioquia",           city:"Medellín",    region:"Medellín",     icon:"🌺", url:"https://www.udea.edu.co",              icfes:{min:330,"Medicina":420,"Derecho":375,"Química Farmacéutica":360,"Ing. Ambiental":348,"Sociología":335},areas:["Salud y Ciencias Humanas","Ciencias Sociales","Ciencias Básicas","Ingeniería"],careers:["Medicina","Derecho","Química Farmacéutica","Ing. Ambiental","Sociología"]},
  {name:"U. Pontificia Bolivariana",          city:"Medellín",    region:"Medellín",     icon:"🔔", url:"https://www.upb.edu.co",              icfes:{min:320,"Medicina":400,"Ing. Electrónica":342,"Arquitectura":350,"Diseño Industrial":336},areas:["Salud y Ciencias Humanas","Ingeniería","Artes y Diseño","Administración"],careers:["Medicina","Ing. Electrónica","Arquitectura","Diseño Industrial"]},
  {name:"Universidad CES",                    city:"Medellín",    region:"Medellín",     icon:"🏥", url:"https://www.ces.edu.co",              icfes:{min:340,"Medicina":415,"Odontología":395,"Psicología":360,"Medicina Veterinaria":372},               areas:["Salud y Ciencias Humanas","Ciencias Básicas"],                      careers:["Medicina","Odontología","Psicología","Medicina Veterinaria"]},
  {name:"Universidad Nacional Sede Medellín", city:"Medellín",    region:"Medellín",     icon:"🌿", url:"https://medellin.unal.edu.co",         icfes:{min:385,"Ing. de Sistemas":385,"Arquitectura":385,"Física":405,"Biología":401},         areas:["Ingeniería","Ciencias Exactas","Ciencias Básicas"],                 careers:["Ing. de Sistemas","Arquitectura","Física","Biología"]},
  {name:"ITM – Inst. Tecnológico Metro.",     city:"Medellín",    region:"Medellín",     icon:"🔧", url:"https://www.itm.edu.co",              icfes:{min:232,"Ing. de Sistemas":260,"Ing. Electrónica":254,"Administración":248,"Tecnología en Sistemas":222},areas:["Ingeniería","Ciencias Exactas","Administración"],              careers:["Ing. de Sistemas","Ing. Electrónica","Administración","Tecnología en Sistemas"]},
  {name:"Universidad EIA",                    city:"Envigado",    region:"Medellín",     icon:"💡", url:"https://www.eia.edu.co",              icfes:{min:355,"Ing. Mecánica":379,"Administración":355,"Ing. de Sistemas":385,"Finanzas":375},   areas:["Ingeniería","Administración","Ciencias Exactas"],                   careers:["Ing. Mecánica","Administración","Ing. de Sistemas","Finanzas"]},
  {name:"Tecnológico de Antioquia",           city:"Medellín",    region:"Medellín",     icon:"🔬", url:"https://www.tdea.edu.co",             icfes:{min:224,"Administración":238,"Ing. Electrónica":246,"Trabajo Social":239,"Contaduría Pública":224},areas:["Administración","Ingeniería","Ciencias Sociales"],           careers:["Administración","Ing. Electrónica","Trabajo Social","Contaduría Pública"]},
  {name:"Politécnico Colombiano J.I.C.",      city:"Medellín",    region:"Medellín",     icon:"⚗️", url:"https://www.politecnicojic.edu.co",    icfes:{min:258,"Ing. Electrónica":280,"Ing. Industrial":283,"Diseño Industrial":274,"Tecnología en Sistemas":248},areas:["Ingeniería","Artes y Diseño"],                                      careers:["Ing. Electrónica","Ing. Industrial","Diseño Industrial","Tecnología en Sistemas"]},
  {name:"Institución Universitaria de Envigado",city:"Envigado",  region:"Medellín",     icon:"🏫", url:"https://www.iue.edu.co",              icfes:{min:238,"Derecho":268,"Comunicación":258,"Ing. de Sistemas":265,"Contaduría Pública":238},areas:["Ciencias Sociales","Ingeniería","Administración"],                  careers:["Derecho","Comunicación","Ing. de Sistemas","Contaduría Pública"]},
  {name:"U. Católica Luis Amigó",             city:"Medellín",    region:"Medellín",     icon:"✝️", url:"https://www.funlam.edu.co",            icfes:{min:215,"Psicología":228,"Trabajo Social":220,"Derecho":218,"Licenciatura":225},           areas:["Ciencias Sociales","Salud y Ciencias Humanas"],                     careers:["Psicología","Trabajo Social","Derecho","Licenciatura"]},
  {name:"U. de Medellín",                     city:"Medellín",    region:"Medellín",     icon:"🏙️", url:"https://www.udem.edu.co",              icfes:{min:300,"Ing. Civil":328,"Derecho":340,"Comunicación":320,"Negocios Internacionales":322},areas:["Ingeniería","Ciencias Sociales","Administración"],                  careers:["Ing. Civil","Derecho","Comunicación","Negocios Internacionales"]},
  {name:"U. de Santander UDES",               city:"Bucaramanga", region:"Bucaramanga",  icon:"🌄", url:"https://www.udes.edu.co",              icfes:{min:268,"Medicina":348,"Ing. de Sistemas":298,"Odontología":323,"Fisioterapia":298},areas:["Salud y Ciencias Humanas","Ingeniería"],                            careers:["Medicina","Ing. de Sistemas","Odontología","Fisioterapia"]},
  {name:"UNAULA",                             city:"Medellín",    region:"Medellín",     icon:"🏛️", url:"https://www.unaula.edu.co",            icfes:{min:282,"Derecho":325,"Administración":298,"Ing. de Sistemas":310,"Contaduría Pública":282},areas:["Ciencias Sociales","Ingeniería","Administración"],               careers:["Derecho","Administración","Ing. de Sistemas","Contaduría Pública"]},
  {name:"Corporación Universitaria Remington",city:"Medellín",    region:"Medellín",     icon:"📋", url:"https://www.uniremington.edu.co",       icfes:{min:218,"Derecho":252,"Administración":232,"Ing. de Sistemas":245,"Contaduría Pública":218},areas:["Ciencias Sociales","Administración","Ingeniería"],                  careers:["Derecho","Administración","Ing. de Sistemas","Contaduría Pública"]},
  {name:"U. Católica de Oriente",             city:"Rionegro",    region:"Medellín",     icon:"⛪", url:"https://www.uco.edu.co",              icfes:{min:218,"Agronomía":228,"Ing. de Alimentos":222,"Administración":218,"Zootecnia":226},  areas:["Ciencias Básicas","Ingeniería","Administración"],                   careers:["Agronomía","Ing. de Alimentos","Administración","Zootecnia"]},
  {name:"Corporación U. Lasallista",          city:"Caldas",      region:"Medellín",     icon:"📗", url:"https://www.lasallista.edu.co",        icfes:{min:230,"Derecho":260,"Administración":244,"Ing. de Sistemas":256,"Contaduría Pública":230},areas:["Ciencias Sociales","Ingeniería","Administración"],           careers:["Derecho","Administración","Ing. de Sistemas","Contaduría Pública"]},
  {name:"U. Adventista (UNAC)",               city:"Medellín",    region:"Medellín",     icon:"✡️", url:"https://www.unac.edu.co",              icfes:{min:215,"Administración":230,"Enfermería":225,"Psicología":232,"Contaduría Pública":215},areas:["Administración","Ciencias Sociales","Salud y Ciencias Humanas"],careers:["Administración","Enfermería","Psicología","Contaduría Pública"]},
  {name:"Inst. Univ. Salazar y Herrera",      city:"Medellín",    region:"Medellín",     icon:"🎨", url:"https://www.iush.edu.co",              icfes:{min:228,"Ing. de Sistemas":255,"Diseño Gráfico":240,"Administración":242,"Contaduría Pública":228},areas:["Ingeniería","Artes y Diseño","Administración"],             careers:["Ing. de Sistemas","Diseño Gráfico","Administración","Contaduría Pública"]},
  {name:"Inst. Univ. Visión de las Américas", city:"Medellín",    region:"Medellín",     icon:"🌍", url:"https://www.visiondelasamericas.edu.co",icfes:{min:208,"Derecho":240,"Administración":222,"Ing. de Sistemas":235,"Psicología":225},areas:["Ciencias Sociales","Ingeniería","Administración"],            careers:["Derecho","Administración","Ing. de Sistemas","Psicología"]},
  {name:"Fundación U. Bellas Artes",          city:"Medellín",    region:"Medellín",     icon:"🎭", url:"https://www.bellasartes.edu.co",        icfes:{min:248,"Bellas Artes":254,"Música":254,"Diseño Gráfico":260},                                            areas:["Artes y Diseño"],                                                   careers:["Bellas Artes","Música","Diseño Gráfico"]},
  {name:"U. San Buenaventura Medellín",       city:"Medellín",    region:"Medellín",     icon:"⛵", url:"https://www.usbmed.edu.co",            icfes:{min:268,"Psicología":288,"Derecho":305,"Ing. de Sistemas":298,"Comunicación":288},areas:["Salud y Ciencias Humanas","Ciencias Sociales","Ingeniería"],        careers:["Psicología","Derecho","Ing. de Sistemas","Comunicación"]},
  {name:"Corp. Univ. Minuto de Dios Ant.",    city:"Bello",       region:"Medellín",     icon:"🙏", url:"https://www.uniminuto.edu/antioquia",  icfes:{min:225,"Trabajo Social":240,"Administración":240,"Ing. de Sistemas":252,"Contaduría Pública":225},areas:["Ciencias Sociales","Administración","Ingeniería"],             careers:["Trabajo Social","Administración","Ing. de Sistemas","Contaduría Pública"]},
  {name:"Inst. Univ. CEIPA",                  city:"Sabaneta",    region:"Medellín",     icon:"📈", url:"https://www.ceipa.edu.co",             icfes:{min:245,"Administración":262,"Ing. de Sistemas":255,"Contaduría Pública":245,"Negocios Internacionales":267},    areas:["Administración","Ingeniería"],                                       careers:["Administración","Ing. de Sistemas","Contaduría Pública","Negocios Internacionales"]},
  {name:"U. Pascual Bravo (Inst. Univ.)",     city:"Medellín",    region:"Medellín",     icon:"⚙️", url:"https://www.pascualbravo.edu.co",      icfes:{min:222,"Ing. Electrónica":244,"Ing. Industrial":247,"Tecnología en Sistemas":212,"Ing. de Sistemas":250},areas:["Ingeniería","Administración"],                               careers:["Ing. Electrónica","Ing. Industrial","Tecnología en Sistemas","Ing. de Sistemas"]},
  {name:"Corp. U. Americana",                 city:"Medellín",    region:"Medellín",     icon:"🌎", url:"https://www.americana.edu.co",         icfes:{min:225,"Derecho":258,"Administración":240,"Ing. de Sistemas":252,"Psicología":242},areas:["Ciencias Sociales","Ingeniería","Administración"],             careers:["Derecho","Administración","Ing. de Sistemas","Psicología"]},
  // ── CALI / VALLE DEL CAUCA ─────────────────────────────────
  {name:"Universidad del Valle",              city:"Cali",        region:"Cali",         icon:"🏔️", url:"https://www.univalle.edu.co",           icfes:{min:325,"Ing. de Sistemas":360,"Química":343,"Medicina":415,"Economía":349},areas:["Ciencias Exactas","Ingeniería","Ciencias Básicas","Salud y Ciencias Humanas"],careers:["Ing. de Sistemas","Química","Medicina","Economía"]},
  {name:"Pontificia U. Javeriana Cali",       city:"Cali",        region:"Cali",         icon:"✝️", url:"https://www.javerianacali.edu.co",      icfes:{min:310,"Derecho":355,"Medicina":390,"Psicología":338,"Administración":335},areas:["Salud y Ciencias Humanas","Administración","Ciencias Sociales"],   careers:["Derecho","Medicina","Psicología","Administración"]},
  {name:"U. Autónoma de Occidente",           city:"Cali",        region:"Cali",         icon:"🌿", url:"https://www.uao.edu.co",               icfes:{min:295,"Ing. de Sistemas":330,"Comunicación":315,"Administración":315,"Diseño Gráfico":307},areas:["Ingeniería","Ciencias Sociales","Administración","Artes y Diseño"],careers:["Ing. de Sistemas","Comunicación","Administración","Diseño Gráfico"]},
  {name:"Universidad ICESI",                  city:"Cali",        region:"Cali",         icon:"💡", url:"https://www.icesi.edu.co",             icfes:{min:360,"Administración":360,"Ing. de Sistemas":370,"Diseño de Modas":370,"Economía":384},areas:["Administración","Ingeniería","Artes y Diseño","Salud y Ciencias Humanas"],careers:["Administración","Ing. de Sistemas","Diseño de Modas","Economía"]},
  {name:"Universidad Santiago de Cali",       city:"Cali",        region:"Cali",         icon:"🌅", url:"https://www.usc.edu.co",               icfes:{min:268,"Derecho":305,"Psicología":288,"Administración":285,"Comunicación":288},areas:["Ciencias Sociales","Salud y Ciencias Humanas","Administración"],   careers:["Derecho","Psicología","Administración","Comunicación"]},
  {name:"Universidad Nacional Sede Palmira",  city:"Palmira",     region:"Cali",         icon:"🌿", url:"https://palmira.unal.edu.co",          icfes:{min:340,"Ing. de Sistemas":355,"Agronomía":350,"Administración":340,"Biología":356},                      areas:["Ingeniería","Administración","Ciencias Básicas"],                   careers:["Ing. de Sistemas","Agronomía","Administración","Biología"]},
  {name:"U. San Buenaventura Cali",           city:"Cali",        region:"Cali",         icon:"⛵", url:"https://www.usbcali.edu.co",            icfes:{min:268,"Psicología":288,"Ing. de Sistemas":298,"Derecho":305,"Licenciatura":278},areas:["Salud y Ciencias Humanas","Ingeniería","Ciencias Sociales"],        careers:["Psicología","Ing. de Sistemas","Derecho","Licenciatura"]},
  {name:"Escuela Nacional del Deporte",       city:"Cali",        region:"Cali",         icon:"🏅", url:"https://www.endeporte.edu.co",         icfes:{min:240,"Lic. Educación Física":244,"Entrenamiento Deportivo":244,"Administración Deportiva":246},                         areas:["Salud y Ciencias Humanas","Ciencias Sociales"],                     careers:["Lic. Educación Física","Entrenamiento Deportivo","Administración Deportiva"]},
  {name:"U. Libre Seccional Cali",            city:"Cali",        region:"Cali",         icon:"⚡", url:"https://www.unilibre.edu.co",           icfes:{min:275,"Derecho":320,"Ing. Civil":303,"Medicina":355,"Contaduría Pública":275},areas:["Ciencias Sociales","Ingeniería","Salud y Ciencias Humanas"],        careers:["Derecho","Ing. Civil","Medicina","Contaduría Pública"]},
  {name:"U. del Pacífico",                    city:"Buenaventura", region:"Cali",        icon:"🌊", url:"https://www.unipacifico.edu.co",        icfes:{min:200,"Biología":210,"Administración":205,"Ing. Agroindustrial":208,"Negocios Internacionales":222},areas:["Ciencias Básicas","Administración","Ingeniería"],                careers:["Biología","Administración","Ing. Agroindustrial","Negocios Internacionales"]},
  {name:"Corp. Univ. Centro Superior (UNICUCES)",city:"Cali",     region:"Cali",         icon:"🏫", url:"https://www.unicuces.edu.co",          icfes:{min:210,"Derecho":242,"Administración":225,"Ing. de Sistemas":238,"Psicología":228},areas:["Ciencias Sociales","Ingeniería","Administración"],             careers:["Derecho","Administración","Ing. de Sistemas","Psicología"]},
  {name:"Inst. Univ. Antonio José Camacho",   city:"Cali",        region:"Cali",         icon:"🏛️", url:"https://www.uniajc.edu.co",            icfes:{min:218,"Ing. de Sistemas":245,"Administración":232,"Contaduría Pública":218,"Tecnología en Sistemas":208},areas:["Ingeniería","Administración"],                               careers:["Ing. de Sistemas","Administración","Contaduría Pública","Tecnología en Sistemas"]},
  // ── BARRANQUILLA / ATLÁNTICO ──────────────────────────────
  {name:"Universidad del Norte",              city:"Barranquilla", region:"Barranquilla", icon:"🌊", url:"https://www.uninorte.edu.co",          icfes:{min:335,"Ing. Civil":363,"Psicología":368,"Negocios Internacionales":357,"Medicina":425},areas:["Ingeniería","Administración","Salud y Ciencias Humanas","Ciencias Sociales"],careers:["Ing. Civil","Psicología","Negocios Internacionales","Medicina"]},
  {name:"Universidad del Atlántico",          city:"Barranquilla", region:"Barranquilla", icon:"🌞", url:"https://www.uniatlantico.edu.co",      icfes:{min:300,"Ing. Química":326,"Arquitectura":325,"Nutrición y Dietética":326,"Bellas Artes":306},areas:["Ciencias Básicas","Ingeniería","Artes y Diseño","Salud y Ciencias Humanas"],careers:["Ing. Química","Arquitectura","Nutrición y Dietética","Bellas Artes"]},
  {name:"U. Simón Bolívar Barranquilla",      city:"Barranquilla", region:"Barranquilla", icon:"🏖️", url:"https://www.unisimon.edu.co",          icfes:{min:258,"Medicina":335,"Ing. de Sistemas":285,"Derecho":295,"Administración":272},areas:["Salud y Ciencias Humanas","Ingeniería","Ciencias Sociales"],        careers:["Medicina","Ing. de Sistemas","Derecho","Administración"]},
  {name:"U. Libre Barranquilla",              city:"Barranquilla", region:"Barranquilla", icon:"⚡", url:"https://www.unilibre.edu.co",          icfes:{min:275,"Derecho":320,"Ing. Civil":303,"Medicina":355,"Contaduría Pública":275},areas:["Ciencias Sociales","Ingeniería","Salud y Ciencias Humanas"],        careers:["Derecho","Ing. Civil","Medicina","Contaduría Pública"]},
  {name:"Universidad de la Costa CUC",        city:"Barranquilla", region:"Barranquilla", icon:"🏄", url:"https://www.cuc.edu.co",               icfes:{min:255,"Ing. Civil":283,"Psicología":274,"Administración":270,"Arquitectura":270},areas:["Ingeniería","Ciencias Sociales","Administración"],                  careers:["Ing. Civil","Psicología","Administración","Arquitectura"]},
  {name:"Universidad Metropolitana",          city:"Barranquilla", region:"Barranquilla", icon:"🌆", url:"https://www.unimetro.edu.co",          icfes:{min:248,"Medicina":325,"Psicología":265,"Derecho":285,"Nutrición y Dietética":274},areas:["Salud y Ciencias Humanas","Ciencias Sociales"],                     careers:["Medicina","Psicología","Derecho","Nutrición y Dietética"]},
  {name:"U. Autónoma del Caribe",             city:"Barranquilla", region:"Barranquilla", icon:"🏝️", url:"https://www.uac.edu.co",               icfes:{min:258,"Comunicación":278,"Ing. Industrial":283,"Psicología":275,"Administración":272},areas:["Ciencias Sociales","Ingeniería","Salud y Ciencias Humanas"],       careers:["Comunicación","Ing. Industrial","Psicología","Administración"]},
  {name:"U. de La Guajira",                   city:"Riohacha",    region:"Barranquilla", icon:"🌵", url:"https://www.uniguajira.edu.co",         icfes:{min:250,"Enfermería":255,"Ing. Agronómica":262,"Administración":260,"Derecho":280},areas:["Salud y Ciencias Humanas","Ingeniería","Administración"],          careers:["Enfermería","Ing. Agronómica","Administración","Derecho"]},
  {name:"U. Popular del Cesar",               city:"Valledupar",  region:"Barranquilla", icon:"🎵", url:"https://www.unicesar.edu.co",           icfes:{min:252,"Derecho":282,"Ing. de Sistemas":272,"Licenciatura en Música":260,"Administración":262},areas:["Ciencias Sociales","Ingeniería","Administración"],                  careers:["Derecho","Ing. de Sistemas","Licenciatura en Música","Administración"]},
  {name:"Corp. U. Rafael Núñez",              city:"Cartagena",   region:"Cartagena",    icon:"🏰", url:"https://www.curn.edu.co",              icfes:{min:222,"Enfermería":238,"Derecho":255,"Administración":235,"Contaduría Pública":222},areas:["Salud y Ciencias Humanas","Ciencias Sociales","Administración"],careers:["Enfermería","Derecho","Administración","Contaduría Pública"]},
  {name:"Escuela Naval de Cadetes Almirante Padilla",city:"Cartagena",region:"Cartagena",  icon:"⚓", url:"https://www.escuelanaval.edu.co",       icfes:{min:280,"Ingeniería Naval":300,"Ing. Electrónica":295,"Administración Marítima":270,"Oceanografía Física":285},areas:["Ingeniería","Administración","Ciencias Básicas"],careers:["Ingeniería Naval","Ing. Electrónica","Administración Marítima","Oceanografía Física"]},
  {name:"Fundación U. Tecnológico Comfenalco",city:"Cartagena",   region:"Cartagena",    icon:"🔧", url:"https://www.tecnologicocomfenalco.edu.co",icfes:{min:230,"Ing. de Sistemas":258,"Administración":245,"Contaduría Pública":230,"Tecnología en Sistemas":220},areas:["Ingeniería","Administración"],                               careers:["Ing. de Sistemas","Administración","Contaduría Pública","Tecnología en Sistemas"]},
  // ── BUCARAMANGA / SANTANDER ────────────────────────────────
  {name:"U. Industrial de Santander",         city:"Bucaramanga", region:"Bucaramanga",  icon:"🔩", url:"https://www.uis.edu.co",               icfes:{min:320,"Ing. Industrial":345,"Ing. Electrónica":342,"Medicina":410,"Física":340},areas:["Ingeniería","Ciencias Exactas","Salud y Ciencias Humanas"],       careers:["Ing. Industrial","Ing. Electrónica","Medicina","Física"]},
  {name:"U. Autónoma de Bucaramanga (UNAB)", city:"Bucaramanga", region:"Bucaramanga",  icon:"🏛️", url:"https://www.unab.edu.co",              icfes:{min:285,"Medicina":355,"Comunicación":305,"Ing. de Sistemas":318,"Derecho":315},areas:["Salud y Ciencias Humanas","Administración","Ingeniería"],          careers:["Medicina","Comunicación","Ing. de Sistemas","Derecho"]},
  {name:"U. Manuela Beltrán Bga.",            city:"Bucaramanga", region:"Bucaramanga",  icon:"💜", url:"https://www.umb.edu.co",               icfes:{min:262,"Fisioterapia":292,"Ing. Biomédica":292,"Psicología":282,"Optometría":290},areas:["Salud y Ciencias Humanas","Ingeniería"],                            careers:["Fisioterapia","Ing. Biomédica","Psicología","Optometría"]},
  {name:"U. Pontificia Bolivariana Bga.",     city:"Bucaramanga", region:"Bucaramanga",  icon:"🕊️", url:"https://www.upb.edu.co",              icfes:{min:240,"Ing. Industrial":248,"Administración":242,"Contaduría Pública":240,"Derecho":285},  areas:["Ingeniería","Administración"],                                    careers:["Ing. Industrial","Administración","Contaduría Pública","Derecho"]},
  {name:"Unidades Tecnológicas de Santander", city:"Bucaramanga", region:"Bucaramanga",  icon:"🔬", url:"https://www.uts.edu.co",               icfes:{min:210,"Ing. Electrónica":215,"Administración":212,"Contaduría Pública":210,"Tecnología en Sistemas":200},  areas:["Ingeniería","Administración","Ciencias Exactas"],                 careers:["Ing. Electrónica","Administración","Contaduría Pública","Tecnología en Sistemas"]},
  {name:"Corp. U. de Investigación (UDI)",    city:"Bucaramanga", region:"Bucaramanga",  icon:"🔭", url:"https://www.udi.edu.co",               icfes:{min:220,"Ing. de Sistemas":248,"Administración":235,"Contaduría Pública":220,"Tecnología en Sistemas":210},areas:["Ingeniería","Administración"],                               careers:["Ing. de Sistemas","Administración","Contaduría Pública","Tecnología en Sistemas"]},
  {name:"Corp. U. UNICIENCIA",                city:"Bucaramanga", region:"Bucaramanga",  icon:"🧪", url:"https://www.uniciencia.edu.co",        icfes:{min:210,"Derecho":242,"Administración":225,"Ing. de Sistemas":238,"Psicología":228},areas:["Ingeniería","Administración","Ciencias Sociales"],             careers:["Derecho","Administración","Ing. de Sistemas","Psicología"]},
  // ── CÚCUTA / NORTE DE SANTANDER ───────────────────────────
  {name:"U. Francisco de Paula Santander",    city:"Cúcuta",      region:"Cúcuta",       icon:"🌄", logo:"https://upload.wikimedia.org/wikipedia/commons/thumb/a/ad/Logo_de_UFPS.svg/200px-Logo_de_UFPS.svg.png", url:"https://www.ufps.edu.co",              icfes:{min:278,"Ing. Civil":306,"Ing. de Sistemas":315,"Administración":295,"Derecho":308},areas:["Ingeniería","Administración","Ciencias Sociales"],                 careers:["Ing. Civil","Ing. de Sistemas","Administración","Derecho"]},
  {name:"Universidad de Pamplona",            city:"Pamplona",    region:"Cúcuta",       icon:"🏔️", logo:"https://upload.wikimedia.org/wikipedia/commons/thumb/6/6c/Escudo_Universidad_de_Pamplona.svg/300px-Escudo_Universidad_de_Pamplona.svg.png", url:"https://www.unipamplona.edu.co",        icfes:{min:270,"Medicina":345,"Ing. de Alimentos":284,"Nutrición y Dietética":296,"Psicología":290},areas:["Salud y Ciencias Humanas","Ciencias Básicas","Ingeniería"],        careers:["Medicina","Ing. de Alimentos","Nutrición y Dietética","Psicología"]},
  {name:"U. Simón Bolívar Cúcuta",            city:"Cúcuta",      region:"Cúcuta",       icon:"⭐", logo:"https://upload.wikimedia.org/wikipedia/commons/thumb/e/ed/Escudo_de_la_Universidad_Simón_Bolívar.svg/300px-Escudo_de_la_Universidad_Simón_Bolívar.svg.png", url:"https://www.unisimonbolivar.edu.co",    icfes:{min:258,"Derecho":295,"Ing. de Sistemas":285,"Psicología":276,"Administración":272},areas:["Ciencias Sociales","Ingeniería","Salud y Ciencias Humanas"],        careers:["Derecho","Ing. de Sistemas","Psicología","Administración"]},
  {name:"U. Libre Seccional Cúcuta",          city:"Cúcuta",      region:"Cúcuta",       icon:"🗝️", logo:"https://upload.wikimedia.org/wikipedia/commons/thumb/5/5c/Escudo_de_la_Universidad_Libre_de_Colombia.svg/300px-Escudo_de_la_Universidad_Libre_de_Colombia.svg.png", url:"https://www.unilibrecucuta.edu.co",     icfes:{min:275,"Derecho":320,"Ing. Civil":303,"Contaduría Pública":275,"Administración":292},areas:["Ciencias Sociales","Ingeniería","Administración"],                  careers:["Derecho","Ing. Civil","Contaduría Pública","Administración"]},
  {name:"UFPS Ocaña",                         city:"Ocaña",       region:"Cúcuta",       icon:"🌵", logo:"https://upload.wikimedia.org/wikipedia/commons/thumb/a/ad/Logo_de_UFPS.svg/200px-Logo_de_UFPS.svg.png", url:"https://www.ufpso.edu.co",             icfes:{min:210,"Ing. Civil":215,"Administración":210,"Agronomía":212,"Ing. de Sistemas":240},          areas:["Ingeniería","Administración","Ciencias Básicas"],                   careers:["Ing. Civil","Administración","Agronomía","Ing. de Sistemas"]},
  // ── EJE CAFETERO ──────────────────────────────────────────
  {name:"U. Tecnológica de Pereira",          city:"Pereira",     region:"EjeCafetero",  icon:"🔬", url:"https://www.utp.edu.co",              icfes:{min:308,"Ing. Eléctrica":331,"Medicina":365,"Ing. de Sistemas":355,"Administración":335},areas:["Ingeniería","Ciencias Exactas","Salud y Ciencias Humanas"],        careers:["Ing. Eléctrica","Medicina","Ing. de Sistemas","Administración"]},
  {name:"Universidad de Caldas",              city:"Manizales",   region:"EjeCafetero",  icon:"☕", url:"https://www.ucaldas.edu.co",           icfes:{min:310,"Medicina":400,"Medicina Veterinaria":342,"Diseño Gráfico":322,"Licenciatura":320},areas:["Salud y Ciencias Humanas","Ciencias Sociales","Artes y Diseño"],   careers:["Medicina","Medicina Veterinaria","Diseño Gráfico","Licenciatura"]},
  {name:"Universidad Nacional Sede Manizales",city:"Manizales",   region:"EjeCafetero",  icon:"🌿", url:"https://manizales.unal.edu.co",        icfes:{min:360,"Ing. de Sistemas":375,"Administración":360,"Arquitectura":370,"Física":380},  areas:["Ingeniería","Administración","Artes y Diseño"],                    careers:["Ing. de Sistemas","Administración","Arquitectura","Física"]},
  {name:"Universidad del Quindío",            city:"Armenia",     region:"EjeCafetero",  icon:"🎋", url:"https://www.uniquindio.edu.co",        icfes:{min:285,"Medicina":355,"Ing. de Sistemas":320,"Química":303,"Licenciatura":295},areas:["Salud y Ciencias Humanas","Ingeniería","Ciencias Básicas"],        careers:["Medicina","Ing. de Sistemas","Química","Licenciatura"]},
  {name:"U. Autónoma de Manizales",           city:"Manizales",   region:"EjeCafetero",  icon:"🔵", url:"https://www.autonoma.edu.co",          icfes:{min:282,"Ing. Industrial":307,"Medicina":360,"Administración":298,"Ing. Electrónica":304},areas:["Ingeniería","Salud y Ciencias Humanas","Administración"],          careers:["Ing. Industrial","Medicina","Administración","Ing. Electrónica"]},
  {name:"Universidad de Manizales",           city:"Manizales",   region:"EjeCafetero",  icon:"🌿", url:"https://www.umanizales.edu.co",         icfes:{min:275,"Derecho":310,"Psicología":298,"Ing. de Sistemas":305,"Administración":292},areas:["Ciencias Sociales","Salud y Ciencias Humanas","Ingeniería"],        careers:["Derecho","Psicología","Ing. de Sistemas","Administración"]},
  {name:"U. Católica de Pereira",             city:"Pereira",     region:"EjeCafetero",  icon:"⛪", url:"https://www.ucp.edu.co",              icfes:{min:262,"Ing. de Sistemas":290,"Administración":278,"Comunicación":282,"Diseño Gráfico":274},areas:["Ingeniería","Administración","Ciencias Sociales"],              careers:["Ing. de Sistemas","Administración","Comunicación","Diseño Gráfico"]},
  {name:"Tecnológico COMFENALCO Cartago",     city:"Cartago",     region:"EjeCafetero",  icon:"🔧", url:"https://www.tecnocomfenalco.edu.co",   icfes:{min:205,"Tecnología en Sistemas":195,"Administración":218,"Contaduría Pública":205,"Ing. de Sistemas":230},areas:["Ingeniería","Administración"],                               careers:["Tecnología en Sistemas","Administración","Contaduría Pública","Ing. de Sistemas"]},
  // ── CARTAGENA / BOLÍVAR ───────────────────────────────────
  {name:"Universidad de Cartagena",           city:"Cartagena",   region:"Cartagena",    icon:"🏰", url:"https://www.unicartagena.edu.co",      icfes:{min:305,"Medicina":395,"Derecho":355,"Ing. de Sistemas":340,"Odontología":360},areas:["Salud y Ciencias Humanas","Ciencias Sociales","Ingeniería"],        careers:["Medicina","Derecho","Ing. de Sistemas","Odontología"]},
  {name:"U. Tecnológica de Bolívar",          city:"Cartagena",   region:"Cartagena",    icon:"⚓", url:"https://www.utb.edu.co",              icfes:{min:295,"Ing. Mecánica":319,"Administración":315,"Finanzas":315,"Ing. de Sistemas":330},areas:["Ingeniería","Administración","Ciencias Exactas"],                   careers:["Ing. Mecánica","Administración","Finanzas","Ing. de Sistemas"]},
  {name:"U. San Buenaventura Cartagena",      city:"Cartagena",   region:"Cartagena",    icon:"⛵", url:"https://www.usbcartagena.edu.co",      icfes:{min:268,"Psicología":288,"Ing. Civil":296,"Derecho":305,"Administración":285},areas:["Salud y Ciencias Humanas","Ingeniería","Ciencias Sociales"],        careers:["Psicología","Ing. Civil","Derecho","Administración"]},
  // ── OTRAS REGIONES ─────────────────────────────────────────
  {name:"U. Pedagógica y Tecnológica (UPTC)", city:"Tunja",       region:"Tunja",        icon:"📖", url:"https://www.uptc.edu.co",             icfes:{min:290,"Medicina":360,"Ing. Civil":318,"Licenciatura":300,"Química":308},areas:["Salud y Ciencias Humanas","Ingeniería","Ciencias Sociales","Ciencias Básicas"],careers:["Medicina","Ing. Civil","Licenciatura","Química"]},
  {name:"Universidad de Boyacá",              city:"Tunja",       region:"Tunja",        icon:"🏰", url:"https://www.uniboyaca.edu.co",         icfes:{min:258,"Ing. de Sistemas":285,"Derecho":295,"Arquitectura":272,"Contaduría Pública":258},areas:["Ingeniería","Ciencias Sociales","Artes y Diseño"],                  careers:["Ing. de Sistemas","Derecho","Arquitectura","Contaduría Pública"]},
  {name:"Fundación U. Juan de Castellanos",   city:"Tunja",       region:"Tunja",        icon:"📚", url:"https://www.jdc.edu.co",              icfes:{min:218,"Derecho":252,"Administración":232,"Enfermería":228,"Psicología":235},areas:["Ciencias Sociales","Ingeniería","Salud y Ciencias Humanas"],    careers:["Derecho","Administración","Enfermería","Psicología"]},
  {name:"Universidad de Córdoba",             city:"Montería",    region:"Montería",     icon:"🌾", url:"https://www.unicordoba.edu.co",        icfes:{min:290,"Medicina Veterinaria":322,"Medicina":380,"Ing. Agroindustrial":298,"Biología":306},areas:["Ciencias Básicas","Salud y Ciencias Humanas","Ingeniería"],        careers:["Medicina Veterinaria","Medicina","Ing. Agroindustrial","Biología"]},
  {name:"Universidad del Sinú (UNISINÚ)",     city:"Montería",    region:"Montería",     icon:"🏞️", url:"https://www.unisinu.edu.co",           icfes:{min:235,"Derecho":260,"Medicina":330,"Administración":240,"Ing. de Sistemas":248},areas:["Ciencias Sociales","Salud y Ciencias Humanas","Administración","Ingeniería"],careers:["Derecho","Medicina","Administración","Ing. de Sistemas"]},
  {name:"CECAR",                              city:"Sincelejo",   region:"Cartagena",    icon:"🌾", url:"https://www.cecar.edu.co",             icfes:{min:225,"Derecho":268,"Ing. de Sistemas":262,"Psicología":252,"Administración":250},areas:["Ciencias Sociales","Ingeniería","Salud y Ciencias Humanas"],        careers:["Derecho","Ing. de Sistemas","Psicología","Administración"]},
  {name:"Universidad del Cauca",              city:"Popayán",     region:"Popayán",      icon:"🌋", url:"https://www.unicauca.edu.co",          icfes:{min:298,"Medicina":390,"Ing. Civil":326,"Derecho":340,"Psicología":320},areas:["Salud y Ciencias Humanas","Ingeniería","Ciencias Sociales"],        careers:["Medicina","Ing. Civil","Derecho","Psicología"]},
  {name:"U. Autónoma Indígena Intercultural (UAIIN)",city:"Popayán",region:"Popayán",     icon:"🪶", url:"https://uaiinpebi-cric.edu.co",         icfes:{min:150,"Derecho Propio Intercultural":150,"Licenciatura en Pedagogía":150,"Administración y Gestión Propia":150,"Comunicación Propia Intercultural":150},areas:["Ciencias Sociales"],careers:["Derecho Propio Intercultural","Licenciatura en Pedagogía","Administración y Gestión Propia","Comunicación Propia Intercultural"]},
  {name:"Corp. Univ. Comfacauca (UNICOMFACAUCA)",city:"Popayán",  region:"Popayán",     icon:"🏫", url:"https://www.unicomfacauca.edu.co",     icfes:{min:214,"Ing. de Sistemas":242,"Administración":230,"Contaduría Pública":214,"Tecnología en Sistemas":204},areas:["Ingeniería","Administración"],                               careers:["Ing. de Sistemas","Administración","Contaduría Pública","Tecnología en Sistemas"]},
  {name:"Fundación Universitaria de Popayán", city:"Popayán",     region:"Popayán",      icon:"🌸", url:"https://www.fup.edu.co",              icfes:{min:214,"Derecho":245,"Administración":228,"Ing. de Sistemas":240,"Enfermería":228},areas:["Ciencias Sociales","Ingeniería","Salud y Ciencias Humanas"],    careers:["Derecho","Administración","Ing. de Sistemas","Enfermería"]},
  {name:"Universidad Mariana",                city:"Pasto",       region:"Pasto",        icon:"🌸", url:"https://www.umariana.edu.co",          icfes:{min:252,"Enfermería":260,"Contaduría Pública":252,"Ing. de Sistemas":280,"Trabajo Social":267},areas:["Salud y Ciencias Humanas","Administración","Ingeniería"],          careers:["Enfermería","Contaduría Pública","Ing. de Sistemas","Trabajo Social"]},
  {name:"Universidad de Nariño",              city:"Pasto",       region:"Pasto",        icon:"🌿", url:"https://www.udenar.edu.co",            icfes:{min:295,"Medicina":385,"Ing. de Sistemas":325,"Filosofía":307,"Biología":311},areas:["Salud y Ciencias Humanas","Ingeniería","Ciencias Sociales","Ciencias Básicas"],careers:["Medicina","Ing. de Sistemas","Filosofía","Biología"]},
  {name:"Universidad CESMAG",                 city:"Pasto",       region:"Pasto",        icon:"🏫", url:"https://www.unicesmag.edu.co",         icfes:{min:225,"Derecho":250,"Psicología":238,"Arquitectura":242,"Contaduría Pública":225},areas:["Ciencias Sociales","Ingeniería","Administración"],                 careers:["Derecho","Psicología","Arquitectura","Contaduría Pública"]},
  {name:"Corp. Univ. Autónoma de Nariño (AUNAR)",city:"Pasto",    region:"Pasto",        icon:"🏛️", url:"https://www.aunar.edu.co",             icfes:{min:214,"Derecho":245,"Administración":228,"Ing. de Sistemas":240,"Psicología":230},areas:["Ciencias Sociales","Ingeniería","Administración"],             careers:["Derecho","Administración","Ing. de Sistemas","Psicología"]},
  {name:"U. Surcolombiana",                   city:"Neiva",       region:"Neiva",        icon:"🌵", url:"https://www.usco.edu.co",             icfes:{min:285,"Medicina":370,"Ing. Agrícola":295,"Derecho":325,"Psicología":305,"Ingeniería de Software":295},areas:["Salud y Ciencias Humanas","Ingeniería","Ciencias Sociales"],        careers:["Medicina","Ing. Agrícola","Derecho","Psicología","Ingeniería de Software"]},
  {name:"Universidad de Ibagué",              city:"Ibagué",      region:"Neiva",        icon:"🎸", url:"https://www.unibague.edu.co",          icfes:{min:262,"Ing. Civil":290,"Administración":278,"Psicología":280,"Derecho":298},areas:["Ingeniería","Administración","Ciencias Sociales"],                  careers:["Ing. Civil","Administración","Psicología","Derecho"]},
  {name:"Universidad del Tolima",             city:"Ibagué",      region:"Neiva",        icon:"🌿", url:"https://www.ut.edu.co",               icfes:{min:288,"Medicina Veterinaria":320,"Ing. Agronómica":300,"Medicina":375,"Licenciatura":298},areas:["Ciencias Básicas","Salud y Ciencias Humanas","Ingeniería"],        careers:["Medicina Veterinaria","Ing. Agronómica","Medicina","Licenciatura"]},
  {name:"U. de los Llanos",                   city:"Villavicencio",region:"Villavicencio",icon:"🐄", url:"https://www.unillanos.edu.co",        icfes:{min:260,"Medicina Veterinaria":292,"Ing. Agronómica":272,"Administración":272,"Biología":276},areas:["Ciencias Básicas","Ingeniería","Administración"],         careers:["Medicina Veterinaria","Ing. Agronómica","Administración","Biología"]},
  {name:"Universidad del Magdalena",          city:"Santa Marta", region:"SantaMarta",   icon:"🏝️", url:"https://www.unimagdalena.edu.co",      icfes:{min:264,"Ing. de Sistemas":295,"Biología":280,"Negocios Internacionales":286,"Derecho":305},areas:["Ingeniería","Ciencias Básicas","Administración"],              careers:["Ing. de Sistemas","Biología","Negocios Internacionales","Derecho"]},
  {name:"Universidad de Sucre",               city:"Sincelejo",   region:"Sincelejo",    icon:"🐎", url:"https://www.unisucre.edu.co",          icfes:{min:258,"Medicina":340,"Ing. Agronómica":270,"Enfermería":262,"Biología":274},areas:["Salud y Ciencias Humanas","Ingeniería","Ciencias Básicas"],        careers:["Medicina","Ing. Agronómica","Enfermería","Biología"]},
  {name:"Universidad de la Amazonia",         city:"Florencia",   region:"Florencia",    icon:"🌳", url:"https://www.udla.edu.co",             icfes:{min:205,"Ing. Agroecológica":215,"Medicina Veterinaria":237,"Derecho":210,"Biología":221},              areas:["Ciencias Básicas","Salud y Ciencias Humanas","Ingeniería"],        careers:["Ing. Agroecológica","Medicina Veterinaria","Derecho","Biología"]},
  {name:"U. Tecnológica del Chocó",           city:"Quibdó",      region:"Florencia",    icon:"🌿", url:"https://www.utch.edu.co",             icfes:{min:235,"Ing. de Sistemas":255,"Administración":245,"Licenciatura":245,"Contaduría Pública":235},areas:["Ingeniería","Administración","Ciencias Sociales"],              careers:["Ing. de Sistemas","Administración","Licenciatura","Contaduría Pública"]},
  {name:"Unitrópico",                         city:"Yopal",       region:"Villavicencio", icon:"🌵", url:"https://www.unitropico.edu.co",        icfes:{min:205,"Ing. de Petróleos":215,"Administración":208,"Derecho":210,"Ing. Ambiental":223},       areas:["Ingeniería","Administración","Ciencias Sociales"],                 careers:["Ing. de Petróleos","Administración","Derecho","Ing. Ambiental"]},
  {name:"SENA",                               city:"Nacional",    region:"Nacional",     icon:"🏭", url:"https://www.sena.edu.co",              icfes:{min:185,"Tecnología en Sistemas":175,"Administración":210,"Contaduría Pública":205,"Ing. Electrónica":207},     areas:["Ingeniería","Administración","Ciencias Básicas"],                   careers:["Tecnología en Sistemas","Administración","Contaduría Pública","Ing. Electrónica"]},
  {name:"Instituto Tecnológico de Soledad (ITSA)",city:"Soledad",  region:"Barranquilla",icon:"🌊", url:"https://www.itsa.edu.co",             icfes:{min:212,"Ing. de Sistemas":238,"Administración":226,"Contaduría Pública":212,"Tecnología en Sistemas":202},areas:["Ingeniería","Administración"],                             careers:["Ing. de Sistemas","Administración","Contaduría Pública","Tecnología en Sistemas"]},
  {name:"Instituto Tecnológico del Putumayo", city:"Mocoa",       region:"Florencia",    icon:"🌿", url:"https://www.itp.edu.co",              icfes:{min:192,"Tecnología en Sistemas":182,"Administración":205,"Ing. de Sistemas":218,"Contaduría Pública":192},areas:["Ingeniería","Administración"],                             careers:["Tecnología en Sistemas","Administración","Ing. de Sistemas","Contaduría Pública"]},
  {name:"Tecnológica Fitec",                  city:"Barranquilla", region:"Barranquilla", icon:"🏄", url:"https://www.fitec.edu.co",             icfes:{min:198,"Ing. de Sistemas":225,"Tecnología en Sistemas":188,"Administración":212,"Contaduría Pública":198},areas:["Ingeniería","Administración"],                             careers:["Ing. de Sistemas","Tecnología en Sistemas","Administración","Contaduría Pública"]},
  {name:"Inst. Univ. San Andrés (IUSAI)",                 city:"San Andrés",  region:"Nacional",     icon:"🏝️", url:"https://www.infotepsanandres.edu.co",  icfes:{min:185,"Administración":198,"Tecnología en Sistemas":175,"Contaduría Pública":185,"Ing. de Sistemas":210},    areas:["Administración","Ingeniería"],                                       careers:["Administración","Tecnología en Sistemas","Contaduría Pública","Ing. de Sistemas"]},
  {name:"Instituto Técnico Agrícola (ITA)",   city:"Buga",        region:"Cali",         icon:"🌱", url:"https://www.ita.edu.co",               icfes:{min:178,"Agronomía":188,"Administración":190,"Tecnología en Sistemas":168,"Ing. de Sistemas":200},     areas:["Ingeniería","Administración"],                                       careers:["Agronomía","Administración","Tecnología en Sistemas","Ing. de Sistemas"]},
  {name:"Corp. Técnica de Colombia (CORPOTEC)",city:"Bogotá",     region:"Bogotá",       icon:"🔧", url:"https://www.corpotec.edu.co",          icfes:{min:184,"Tecnología en Sistemas":174,"Administración":196,"Ing. de Sistemas":208,"Contaduría Pública":184},areas:["Ingeniería","Administración"],                           careers:["Tecnología en Sistemas","Administración","Ing. de Sistemas","Contaduría Pública"]},
  {name:"Inst. Técnica Comfamiliar Risaralda", city:"Pereira",     region:"EjeCafetero",  icon:"🏘️", url:"https://www.comfamiliarrisaralda.com.co",icfes:{min:185,"Administración":198,"Tecnología en Sistemas":175,"Contaduría Pública":185,"Ing. de Sistemas":210},  areas:["Administración","Ingeniería"],                                       careers:["Administración","Tecnología en Sistemas","Contaduría Pública","Ing. de Sistemas"]},
  {name:"Inst. Técnica IDEC",                 city:"Bogotá",      region:"Bogotá",       icon:"📋", url:"https://www.idec.edu.co",              icfes:{min:180,"Administración":192,"Tecnología en Sistemas":170,"Contaduría Pública":180},     areas:["Administración","Ingeniería"],                                       careers:["Administración","Tecnología en Sistemas","Contaduría Pública"]},
  {name:"Instituto Técnico Profesional de Roldanillo",city:"Roldanillo",region:"Cali",   icon:"🌿", url:"https://www.itpr.edu.co",             icfes:{min:176,"Tecnología en Sistemas":166,"Administración":188,"Contaduría Pública":176,"Ing. de Sistemas":198},     areas:["Ingeniería","Administración"],                                       careers:["Tecnología en Sistemas","Administración","Contaduría Pública","Ing. de Sistemas"]},
];





const AREAS = ["Ciencias Exactas","Ingeniería","Ciencias Básicas","Salud y Ciencias Humanas","Ciencias Sociales","Administración","Artes y Diseño"];

const CAREER_CATALOG = {
  "Ing. de Sistemas":{area:"Ingeniería",icon:"💻"},
  "Ingeniería de Software":{area:"Ingeniería",icon:"🧑‍💻"},
  "Tecnología en Sistemas":{area:"Ingeniería",icon:"💻"},
  "Ing. Electrónica":{area:"Ingeniería",icon:"🔌"},
  "Tecnología en Electrónica":{area:"Ingeniería",icon:"🔌"},
  "Ing. Civil":{area:"Ingeniería",icon:"🏗️"},
  "Ing. Industrial":{area:"Ingeniería",icon:"⚙️"},
  "Ing. Mecánica":{area:"Ingeniería",icon:"🔧"},
  "Ing. Química":{area:"Ciencias Exactas",icon:"⚗️"},
  "Ing. Eléctrica":{area:"Ingeniería",icon:"⚡"},
  "Ing. Ambiental":{area:"Ciencias Básicas",icon:"🌱"},
  "Ing. Biomédica":{area:"Ingeniería",icon:"🩺"},
  "Ing. Aeronáutica":{area:"Ingeniería",icon:"✈️"},
  "Ing. Agronómica":{area:"Ciencias Básicas",icon:"🌾"},
  "Agronomía":{area:"Ciencias Básicas",icon:"🌾"},
  "Ing. Agroecológica":{area:"Ciencias Básicas",icon:"🌿"},
  "Ing. Agroindustrial":{area:"Ciencias Básicas",icon:"🌽"},
  "Ing. Agrícola":{area:"Ciencias Básicas",icon:"🚜"},
  "Ing. de Alimentos":{area:"Ciencias Básicas",icon:"🍎"},
  "Ing. de Petróleos":{area:"Ingeniería",icon:"🛢️"},
  "Medicina":{area:"Salud y Ciencias Humanas",icon:"⚕️"},
  "Medicina Veterinaria":{area:"Ciencias Básicas",icon:"🐾"},
  "Odontología":{area:"Salud y Ciencias Humanas",icon:"🦷"},
  "Enfermería":{area:"Salud y Ciencias Humanas",icon:"💉"},
  "Fisioterapia":{area:"Salud y Ciencias Humanas",icon:"🤸"},
  "Fonoaudiología":{area:"Salud y Ciencias Humanas",icon:"🗣️"},
  "Terapia Ocupacional":{area:"Salud y Ciencias Humanas",icon:"🧩"},
  "Optometría":{area:"Salud y Ciencias Humanas",icon:"👁️"},
  "Nutrición y Dietética":{area:"Salud y Ciencias Humanas",icon:"🥗"},
  "Bacteriología":{area:"Ciencias Básicas",icon:"🔬"},
  "Química Farmacéutica":{area:"Ciencias Básicas",icon:"💊"},
  "Radiología":{area:"Salud y Ciencias Humanas",icon:"🩻"},
  "Psicología":{area:"Salud y Ciencias Humanas",icon:"🧠"},
  "Derecho":{area:"Ciencias Sociales",icon:"⚖️"},
  "Trabajo Social":{area:"Ciencias Sociales",icon:"🤝"},
  "Comunicación":{area:"Ciencias Sociales",icon:"📡"},
  "Sociología":{area:"Ciencias Sociales",icon:"👥"},
  "Ciencia Política":{area:"Ciencias Sociales",icon:"🏛️"},
  "Relaciones Internacionales":{area:"Ciencias Sociales",icon:"🌐"},
  "Licenciatura":{area:"Ciencias Sociales",icon:"📖"},
  "Licenciatura en Matemáticas":{area:"Ciencias Exactas",icon:"➗"},
  "Licenciatura en Biología":{area:"Ciencias Básicas",icon:"🧬"},
  "Licenciatura en Música":{area:"Artes y Diseño",icon:"🎼"},
  "Educación Especial":{area:"Ciencias Sociales",icon:"🎒"},
  "Filosofía":{area:"Ciencias Sociales",icon:"💭"},
  "Administración":{area:"Administración",icon:"📊"},
  "Administración Pública":{area:"Administración",icon:"🏛️"},
  "Administración Deportiva":{area:"Administración",icon:"🏅"},
  "Contaduría Pública":{area:"Administración",icon:"🧾"},
  "Finanzas":{area:"Administración",icon:"💹"},
  "Economía":{area:"Administración",icon:"📈"},
  "Mercadeo":{area:"Administración",icon:"📣"},
  "Negocios Internacionales":{area:"Administración",icon:"🌎"},
  "Arquitectura":{area:"Artes y Diseño",icon:"🏛️"},
  "Diseño Gráfico":{area:"Artes y Diseño",icon:"🎨"},
  "Diseño Industrial":{area:"Artes y Diseño",icon:"📐"},
  "Diseño de Modas":{area:"Artes y Diseño",icon:"👗"},
  "Bellas Artes":{area:"Artes y Diseño",icon:"🖼️"},
  "Música":{area:"Artes y Diseño",icon:"🎵"},
  "Publicidad":{area:"Artes y Diseño",icon:"📺"},
  "Cosmetología":{area:"Salud y Ciencias Humanas",icon:"💄"},
  "Turismo":{area:"Administración",icon:"🧳"},
  "Matemáticas":{area:"Ciencias Exactas",icon:"➗"},
  "Física":{area:"Ciencias Exactas",icon:"🔭"},
  "Química":{area:"Ciencias Exactas",icon:"⚗️"},
  "Biología":{area:"Ciencias Básicas",icon:"🧬"},
  "Biología Marina":{area:"Ciencias Básicas",icon:"🐠"},
  "Zootecnia":{area:"Ciencias Básicas",icon:"🐄"},
  "Lic. Educación Física":{area:"Salud y Ciencias Humanas",icon:"🏃"},
  "Entrenamiento Deportivo":{area:"Salud y Ciencias Humanas",icon:"🏋️"},

  // ── Agregadas: existían en universidades reales pero faltaban en el catálogo ──
  "Ingeniería Naval":{area:"Ingeniería",icon:"🚢"},
  "Administración Marítima":{area:"Administración",icon:"⚓"},
  "Oceanografía Física":{area:"Ciencias Básicas",icon:"🌊"},
  "Licenciatura en Pedagogía":{area:"Ciencias Sociales",icon:"🍎"},
  "Derecho Propio Intercultural":{area:"Ciencias Sociales",icon:"🪶"},
  "Administración y Gestión Propia":{area:"Ciencias Sociales",icon:"🪶"},
  "Comunicación Propia Intercultural":{area:"Ciencias Sociales",icon:"🪶"}
};


const REGION_MAP = {
  'bogotá':['bogotá','cundinamarca','chía','soacha','zipaquirá','facatativá'],
  'medellín':['medellín','antioquia','envigado','bello','itagüí','sabaneta'],
  'cali':['cali','valle','palmira','buenaventura','yumbo'],
  'barranquilla':['barranquilla','atlántico','soledad','malambo'],
  'cúcuta':['cúcuta','norte de santander','pamplona','ocaña','villa del rosario'],
  'bucaramanga':['bucaramanga','santander','floridablanca','girón','piedecuesta'],
  'manizales':['manizales','caldas','eje cafetero'],
  'pereira':['pereira','risaralda','eje cafetero','dosquebradas'],
  'armenia':['armenia','quindío','eje cafetero'],
  'cartagena':['cartagena','bolívar','turbaco'],
  'santa marta':['santa marta','magdalena','ciénaga'],
  'ibagué':['ibagué','tolima','espinal'],
  'villavicencio':['villavicencio','meta','acacías'],
  'montería':['montería','córdoba','lorica'],
  'pasto':['pasto','nariño','ipiales'],
  'neiva':['neiva','huila','garzón'],
  'valledupar':['valledupar','cesar','aguachica'],
  'sincelejo':['sincelejo','sucre','corozal'],
  'tunja':['tunja','boyacá','duitama','sogamoso'],
  'popayán':['popayán','cauca'],
  'florencia':['florencia','caquetá'],
};

function isLocalUni(uniCity, uniRegion, userCity) {
  if(!userCity) return false;
  const uc = userCity.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'');
  const regions = Object.entries(REGION_MAP).find(([k]) =>
    k.normalize('NFD').replace(/[\u0300-\u036f]/g,'').includes(uc) ||
    uc.includes(k.normalize('NFD').replace(/[\u0300-\u036f]/g,''))
  );
  const regionCities = regions ? regions[1] : [uc];
  const cityNorm = (uniCity+' '+uniRegion).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'');
  return regionCities.some(c => cityNorm.includes(c.normalize('NFD').replace(/[\u0300-\u036f]/g,'')));
}
const AREA_ICONS = {"Ciencias Exactas":"🔢","Ingeniería":"⚙️","Ciencias Básicas":"🔬","Salud y Ciencias Humanas":"❤️","Ciencias Sociales":"🌍","Administración":"📊","Artes y Diseño":"🎨"};
const profileMap = {"Ciencias Exactas":"Perfil Analítico-Científico","Ingeniería":"Perfil Tecnológico-Innovador","Ciencias Básicas":"Perfil Investigador","Salud y Ciencias Humanas":"Perfil Humanitario-Clínico","Ciencias Sociales":"Perfil Humanístico-Social","Administración":"Perfil Empresarial-Estratégico","Artes y Diseño":"Perfil Creativo-Artístico"};

// ══════════════════════════════════════════════════════════════
// Análisis de resultados generado con PLANTILLAS LOCALES, sin IA.
// Usa los datos reales que el algoritmo ya seleccionó (universidades,
// carreras, puntaje) — no llama ningún servicio externo ni genera costo.
// ══════════════════════════════════════════════════════════════
const AREA_DESC = {
  "Ciencias Exactas": "te destacas resolviendo problemas lógicos y numéricos",
  "Ingeniería": "tienes facilidad para entender cómo funcionan las cosas y construir soluciones",
  "Ciencias Básicas": "disfrutas investigar y entender el porqué de los fenómenos naturales",
  "Salud y Ciencias Humanas": "te mueve ayudar y cuidar a otras personas",
  "Ciencias Sociales": "te interesa entender y mejorar cómo funciona la sociedad",
  "Administración": "tienes visión estratégica para organizar y liderar proyectos",
  "Artes y Diseño": "tu fuerte es la creatividad y la expresión visual"
};

function generarAnalisisLocal(topArea, sortedAreas, matchedUnis, scoreVal){
  const secundaria = sortedAreas[1];
  const top3 = matchedUnis.slice(0, 3);
  const nombresUnis = top3.map(u => u.name).join(', ');
  const primeraCarrera = (top3[0]?.matchedCareers?.length ? top3[0].matchedCareers[0].career : top3[0]?.careers?.[0]) || 'tu carrera de interés';

  let texto = `Tu perfil muestra fortaleza principal en ${topArea}: ${AREA_DESC[topArea] || 'tienes aptitudes claras en esta área'}. `;
  if(secundaria) texto += `También se nota interés en ${secundaria}, lo que amplía tus opciones. `;
  if(top3.length){
    texto += `Con base en tus resultados, universidades como ${nombresUnis} encajan bien con tu perfil, especialmente en programas como ${primeraCarrera}. `;
  }
  texto += scoreVal >= 70
    ? 'Tu nivel de definición vocacional es alto — es un buen momento para empezar a preparar tu proceso de admisión.'
    : 'Todavía tienes tiempo para explorar más — repetir el test más adelante puede ayudarte a confirmar tu camino.';
  return texto;
}

// ══════════════════════════════════════════════════════════════
// RECOMENDACIÓN DE CARRERAS — primero carrera, luego universidad
// ══════════════════════════════════════════════════════════════
// Recibe las áreas ordenadas por puntaje (sortedAreas) y los puntajes
// crudos por área (areaScores), y devuelve una lista de carreras
// recomendadas ordenada por relevancia: [{career, area, icon, rank, score}]
function recommendCareers(sortedAreas, areaScores) {
  const maxScore = Math.max(...Object.values(areaScores), 1);
  // Cuántas carreras tomar de cada área (más de la dominante, menos de las siguientes)
  const areaWeights = [4, 3, 2, 1]; // top 4 áreas consideradas

  const picked = [];
  const seen = new Set();

  sortedAreas.slice(0, 4).forEach((area, areaIdx) => {
    // Todas las carreras del catálogo que pertenecen a esta área
    const careersInArea = Object.entries(CAREER_CATALOG)
      .filter(([, info]) => info.area === area)
      .map(([name]) => name);

    // Cuántas universidades en Colombia ofrecen cada carrera (popularidad / disponibilidad real)
    const availability = {};
    careersInArea.forEach(c => {
      availability[c] = UNIVERSITIES.filter(u => u.careers.includes(c)).length;
    });

    // Ordenar por disponibilidad real (carreras más ofertadas = más opciones para el estudiante)
    const sortedCareers = careersInArea
      .filter(c => availability[c] > 0)
      .sort((a,b) => availability[b] - availability[a]);

    const take = areaWeights[areaIdx] || 1;
    sortedCareers.slice(0, take).forEach(career => {
      if (seen.has(career)) return;
      seen.add(career);
      picked.push({
        career,
        area,
        icon: CAREER_CATALOG[career].icon,
        rank: picked.length,
        areaScore: Math.round((areaScores[area] / maxScore) * 100)
      });
    });
  });

  return picked.slice(0, 8); // máximo 8 carreras recomendadas
}

let State = { currentQ: 0, answers: [], streak: 0, lastAnswered: -1 };
let _analyzeStart = 0;

// ══════════════════════════════════════════════════════════════
//  PERFIL DE USUARIO
// ══════════════════════════════════════════════════════════════
const EMOJIS = ['🎓','🚀','⭐','🔥','💡','🎯','🌟','🧠','🎨','⚡','🏆','🌈','🦋','🎵','📚','💎'];
const COLORS = ['#1976d2','#7b1fa2','#c62828','#2e7d32','#f57c00','#00838f','#ad1457','#37474f','#6d4c41','#1565c0'];

async function loadUserProfile(){
  try {
    const { data, error } = await sb.from('perfiles').select('*').eq('id', currentUser.id).single();
    if(error) throw error;
    userProfile = data;
  } catch(e){ userProfile = { es_nuevo:0, avatar_emoji:'🎓', avatar_color:'#1976d2' }; }
}

function renderNavUser(){
  const el = document.getElementById('navUser');
  const nombre = currentUser.nombre.split(' ')[0];
  el.textContent = nombre;

  const photo = userProfile?.photo_url || '';
  const emoji = userProfile?.avatar_emoji || '👤';
  const color = userProfile?.avatar_color || '#1976d2';

  // Mini avatar en navbar de escritorio
  const inner = document.getElementById('navAvatarInner');
  if (inner) {
    const emojiEl = document.getElementById('navAvatarEmoji');
    const photoEl = document.getElementById('navAvatarPhoto');
    inner.style.background = color;
    if (photo) {
      emojiEl.style.display = 'none';
      photoEl.src = photo;
      photoEl.style.display = 'block';
    } else {
      photoEl.style.display = 'none';
      emojiEl.style.display = 'block';
      emojiEl.textContent = emoji;
    }
  }

  // Mismo avatar en la barra de navegación móvil
  const mobEmojiEl = document.getElementById('mobAvatarEmoji');
  const mobPhotoEl = document.getElementById('mobAvatarPhoto');
  if (mobEmojiEl && mobPhotoEl) {
    if (photo) {
      mobEmojiEl.style.display = 'none';
      mobPhotoEl.src = photo;
      mobPhotoEl.style.display = 'block';
    } else {
      mobPhotoEl.style.display = 'none';
      mobEmojiEl.style.display = 'block';
      mobEmojiEl.textContent = emoji;
    }
  }
}


// ── Saludo personalizado ──────────────────────────────────────
function showGreeting(){
  const el = document.getElementById('greetingBanner');
  if(!el) return;
  const nombre = currentUser.nombre.split(' ')[0];
  const isNew  = userProfile && userProfile.es_nuevo == 1;
  const hora   = new Date().getHours();
  const saludo = hora < 12 ? '¡Buenos días' : hora < 18 ? '¡Buenas tardes' : '¡Buenas noches';
  const tips = [
    '💡 Tip: Responde con sinceridad para mejores resultados.',
    '🎯 Sabías que el 70% de universitarios cambian de carrera sin orientación previa.',
    '🧠 Tu perfil vocacional se vuelve más preciso con cada test.',
    '📊 OrientaU analiza 7 áreas de aptitud para darte el mejor match.',
    '🌟 Las mejores decisiones se toman con información. ¡Tú tienes la ventaja!'
  ];
  const tip = tips[Math.floor(Math.random() * tips.length)];

  let msg = '';
  if(currentUser.demo){
    msg = `<span class="greeting-wave">👋</span> ${saludo}, <strong>${nombre}</strong>! Estás en modo demo. <span class="greeting-tip">${tip}</span>`;
  } else if(isNew){
    msg = `<span class="greeting-wave">🎉</span> ${saludo}, <strong>${nombre}</strong>! Bienvenido/a a OrientaU. <span class="greeting-tip">${tip}</span>`;
  } else {
    msg = `<span class="greeting-wave">👋</span> ${saludo} de nuevo, <strong>${nombre}</strong>! <span class="greeting-tip">${tip}</span>`;
  }
  el.innerHTML = msg;
  el.classList.add('show');
}

// ── Modal Bienvenida (5 preguntas onboarding) ─────────────────
const WELCOME_STEPS = [
  {
    icon: '🎓',
    title: '¡Bienvenido/a a OrientaU!',
    desc: 'Somos tu plataforma de orientación vocacional con Inteligencia Artificial. En solo unos pasos estarás listo para descubrir tu camino profesional.',
    question: null,
    action: 'Continuar →'
  },
  {
    icon: '🎯',
    title: '¿En qué grado estás?',
    desc: 'Esto nos ayuda a darte recomendaciones más personalizadas según tu etapa escolar.',
    question: { id:'wGrado', type:'select', opts:['9°','10°','11°','Grado 12 / Bachillerato','Ya terminé el colegio'] },
    action: 'Siguiente →'
  },
  {
    icon: '🏙️',
    title: '¿En qué ciudad vives?',
    desc: 'Usaremos tu ciudad para destacar las universidades más cercanas y relevantes para ti.',
    question: { id:'wCiudad', type:'select', opts:['Bogotá','Medellín','Cali','Barranquilla','Cúcuta','Bucaramanga','Pereira','Manizales','Santa Marta','Cartagena','Otra ciudad'] },
    action: 'Siguiente →'
  },
  {
    icon: '🌟',
    title: '¿Cuál es tu materia favorita?',
    desc: 'Conocer tus fortalezas nos permite orientarte mejor desde el principio.',
    question: { id:'wMateria', type:'select', opts:['Matemáticas / Física','Biología / Química','Ciencias Sociales / Historia','Literatura / Filosofía','Educación Artística / Música','Inglés / Idiomas','Tecnología / Informática'] },
    action: 'Siguiente →'
  },
  {
    icon: '💬',
    title: '¿Qué esperas de OrientaU?',
    desc: 'Cuéntanos tu meta principal para esta plataforma.',
    question: { id:'wMeta', type:'select', opts:['Descubrir qué carrera estudiar','Conocer qué universidades existen en Colombia','Explorar mis habilidades y aptitudes','Todo lo anterior 🚀'] },
    action: '¡Empezar! ✨'
  }
];

let welcomeStep = 0;
let welcomeAnswers = {};

function showWelcomeModal(){
  welcomeStep = 0;
  document.getElementById('welcomeModal').style.display = 'flex';
  renderWelcomeStep();
}

function renderWelcomeStep(){
  const s = WELCOME_STEPS[welcomeStep];
  const total = WELCOME_STEPS.length;
  const dots = Array.from({length:total}, (_,i) =>
    `<div class="w-dot ${i===welcomeStep?'active':''}"></div>`).join('');

  let questionHTML = '';
  if(s.question){
    if(s.question.type === 'select'){
      questionHTML = `<select class="w-select" id="${s.question.id}">
        <option value="">Seleccionar...</option>
        ${s.question.opts.map(o=>`<option value="${o}">${o}</option>`).join('')}
      </select>`;
    }
  }

  document.getElementById('welcomeSteps').innerHTML = `
    <div class="w-dots">${dots}</div>
    <div class="w-icon">${s.icon}</div>
    <h2 class="w-title">${s.title}</h2>
    <p class="w-desc">${s.desc}</p>
    ${questionHTML}
    <button class="btn btn-gold w-btn" onclick="nextWelcomeStep()">${s.action}</button>
    ${welcomeStep > 0 ? '<button class="btn btn-outline w-btn-skip" onclick="skipWelcome()">Saltar introducción</button>' : ''}
  `;
}

async function nextWelcomeStep(){
  const s = WELCOME_STEPS[welcomeStep];
  if(s.question){
    const val = document.getElementById(s.question.id)?.value;
    if(!val){ 
      document.getElementById(s.question.id).style.borderColor = 'rgba(239,68,68,.6)';
      setTimeout(()=>document.getElementById(s.question.id).style.borderColor='',900);
      return; 
    }
    welcomeAnswers[s.question.id] = val;
  }
  welcomeStep++;
  if(welcomeStep >= WELCOME_STEPS.length){
    await finishWelcome();
  } else {
    renderWelcomeStep();
  }
}

async function finishWelcome(){
  document.getElementById('welcomeModal').style.display = 'none';
  // Guardar que ya no es nuevo + datos de onboarding
  if(!currentUser.demo){
    try {
      await sb.from('perfiles').update({
        avatar_emoji: '🎓',
        avatar_color: '#1976d2',
        grado: welcomeAnswers.wGrado || '',
        intereses: welcomeAnswers.wMateria || '',
        es_nuevo: false
      }).eq('id', currentUser.id);
    } catch(e){}
    userProfile = { ...userProfile, es_nuevo: 0 };
  }
  showGreeting();
  // Mostrar tooltip en el test la primera vez
  sessionStorage.setItem('orientau_showTips', '1');
}

function skipWelcome(){
  document.getElementById('welcomeModal').style.display = 'none';
  finishWelcome();
}

// ══════════════════════════════════════════════════════════════
//  PERFIL (Modal editable)
// ══════════════════════════════════════════════════════════════
function openProfile(){
  if(currentUser.demo){
    alert('El perfil no está disponible en modo demo. ¡Crea una cuenta para guardar tus datos!');
    return;
  }
  // Emoji grid
  const eg = document.getElementById('emojiGrid');
  eg.innerHTML = EMOJIS.map(e =>
    `<button class="emoji-btn ${(userProfile?.avatar_emoji===e)?'selected':''}" onclick="selectEmoji('${e}')">${e}</button>`
  ).join('');
  // Color grid
  const cg = document.getElementById('colorGrid');
  cg.innerHTML = COLORS.map(c =>
    `<button class="color-btn ${(userProfile?.avatar_color===c)?'selected':''}" style="background:${c}" onclick="selectColor('${c}')"></button>`
  ).join('');
  // Avatar display
  const av = document.getElementById('avatarDisplay');
  av.textContent = userProfile?.avatar_emoji || '🎓';
  av.style.background = userProfile?.avatar_color || '#1976d2';
  // Photo preview
  _applyPhotoPreview(userProfile?.photo_url || '');
  // Fields
  document.getElementById('pfBio').value       = userProfile?.bio || '';
  document.getElementById('pfTel').value       = userProfile?.telefono || '';
  document.getElementById('pfGrado').value     = userProfile?.grado || '';
  document.getElementById('pfColegio').value   = userProfile?.colegio || '';
  document.getElementById('pfIntereses').value = userProfile?.intereses || '';
  document.getElementById('pfPhotoUrl').value  = userProfile?.photo_url || '';
  document.getElementById('profileModal').style.display = 'flex';
}

function closeProfile(){
  document.getElementById('profileModal').style.display = 'none';
}

function selectEmoji(e){
  userProfile = { ...userProfile, avatar_emoji: e };
  document.getElementById('avatarDisplay').textContent = e;
  document.querySelectorAll('.emoji-btn').forEach(b => b.classList.toggle('selected', b.textContent===e));
}

function selectColor(c){
  userProfile = { ...userProfile, avatar_color: c };
  document.getElementById('avatarDisplay').style.background = c;
  document.querySelectorAll('.color-btn').forEach(b => b.classList.toggle('selected', b.style.background===c || b.style.backgroundColor===c));
}

async function saveProfile(){
  const alertEl = document.getElementById('profileAlert');
  try {
    // Get photo: URL field takes priority; if empty, use cached base64
    const photoUrl = document.getElementById('pfPhotoUrl').value.trim()
                     || userProfile?.photo_url || '';
    const payload = {
      avatar_emoji: userProfile?.avatar_emoji || '🎓',
      avatar_color: userProfile?.avatar_color || '#1976d2',
      photo_url:    photoUrl,
      bio:          document.getElementById('pfBio').value,
      telefono:     document.getElementById('pfTel').value,
      grado:        document.getElementById('pfGrado').value,
      colegio:      document.getElementById('pfColegio').value,
      intereses:    document.getElementById('pfIntereses').value,
      es_nuevo:     false
    };
    const { error } = await sb.from('perfiles').update(payload).eq('id', currentUser.id);
    if(!error){
      userProfile = { ...userProfile, ...payload };
      alertEl.className = 'alert success show';
      alertEl.textContent = '✅ Perfil guardado correctamente';
      renderNavUser();
      setTimeout(() => { alertEl.className='alert'; closeProfile(); }, 1500);
    } else {
      throw new Error(error.message);
    }
  } catch(e){
    alertEl.className = 'alert error show';
    alertEl.textContent = '⚠️ Error al guardar: ' + (e.message || 'Revisa tu conexión');
  }
}

// ── Photo helpers ─────────────────────────────────────────────
function _applyPhotoPreview(src) {
  const av      = document.getElementById('avatarDisplay');
  const img     = document.getElementById('profilePhotoImg');
  const removeBtn = document.getElementById('btnRemovePhoto');
  if (!av || !img) return;
  if (src) {
    img.src = src;
    img.style.display = 'block';
    av.style.display  = 'none';
    if(removeBtn) removeBtn.style.display = 'block';
  } else {
    img.style.display = 'none';
    av.style.display  = 'flex';
    if(removeBtn) removeBtn.style.display = 'none';
  }
}

function applyPhotoUrl() {
  const url = document.getElementById('pfPhotoUrl').value.trim();
  if (!url) return;
  userProfile = { ...userProfile, photo_url: url };
  _applyPhotoPreview(url);
}

function applyPhotoFile(input) {
  const file = input?.files?.[0];
  if (!file) return;

  if (!file.type.startsWith('image/')) {
    alert('Selecciona un archivo de imagen (JPG, PNG, WEBP, etc).');
    input.value = '';
    return;
  }
  const MAX_SOURCE_MB = 15;
  if (file.size > MAX_SOURCE_MB * 1024 * 1024) {
    alert(`Esa imagen pesa mucho (máx. ${MAX_SOURCE_MB}MB). Elige una foto más liviana.`);
    input.value = '';
    return;
  }

  const reader = new FileReader();
  reader.onload = (e) => {
    const img = new Image();
    img.onload = () => {
      // Redimensionar + comprimir: una foto de celular puede pesar varios MB,
      // y eso no cabe bien como base64 en la base de datos. La achicamos a
      // máx. 500px de lado y la exportamos como JPEG liviano.
      const MAX_DIM = 500;
      let { width, height } = img;
      if (width > height && width > MAX_DIM) {
        height = Math.round(height * (MAX_DIM / width));
        width = MAX_DIM;
      } else if (height >= width && height > MAX_DIM) {
        width = Math.round(width * (MAX_DIM / height));
        height = MAX_DIM;
      }
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      canvas.getContext('2d').drawImage(img, 0, 0, width, height);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.82);

      userProfile = { ...userProfile, photo_url: dataUrl };
      document.getElementById('pfPhotoUrl').value = '';
      _applyPhotoPreview(dataUrl);
    };
    img.onerror = () => alert('No se pudo leer esa imagen. Prueba con otro archivo.');
    img.src = e.target.result;
  };
  reader.onerror = () => alert('No se pudo leer el archivo.');
  reader.readAsDataURL(file);
}

function removePhoto() {
  userProfile = { ...userProfile, photo_url: '' };
  document.getElementById('pfPhotoUrl').value = '';
  _applyPhotoPreview('');
}

// ── Helpers ───────────────────────────────────────────────────
function showScreen(id){
  const overlay = document.getElementById('pageTransition');
  // Skip transition for loading screen (avoid blocking async flow)
  const skipTransition = id === 'screenLoading' || id === 'screenResults';
  if(overlay && !skipTransition){
    overlay.classList.add('active');
    setTimeout(()=>{
      document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
      const el = document.getElementById(id);
      if(el) el.classList.add('active');
      window.scrollTo(0, 0);
      overlay.classList.remove('active');
    }, 180);
  } else {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    const el = document.getElementById(id);
    if(el) el.classList.add('active');
    window.scrollTo(0, 0);
  }
  // Show keyboard hint only on test screen
  const hint = document.getElementById('keyboardHint');
  if(hint) hint.classList.toggle('visible', id === 'screenTest');
  // Trigger confetti on first results view
  if(id === 'screenResults' && !window._confettiFired){
    window._confettiFired = true;
    setTimeout(()=>{ if(window.launchConfetti) window.launchConfetti(); }, 600);
  }
  // Init explorer when navigating to it
  if(id === 'screenExplorer'){ setTimeout(()=>expInitUI(), 100); }
}

function goToDash(){ loadDashboard(); showScreen('screenDash'); }

function doLogout(){
  sessionStorage.removeItem('orientau_user');
  window.location.href = 'login.html';
}

// Trae las sesiones de test del usuario desde Supabase, con los MISMOS
// nombres de campo que ya esperaba el resto de la app (areas, unis, carreras,
// respuestas) aunque en la tabla se llamen distinto (areas_json, etc.)
async function cargarSesiones(){
  const { data, error } = await sb.from('sesiones_test')
    .select('id, puntaje, perfil, areas:areas_json, unis:unis_json, carreras:carreras_json, analisis_ia, respuestas:respuestas_json, creado_en')
    .eq('usuario_id', currentUser.id)
    .order('creado_en', { ascending: false });
  if(error) throw error;
  return data || [];
}

// ── Dashboard ─────────────────────────────────────────────────
async function loadDashboard(){
  const grid = document.getElementById('historyGrid');

  // Badge del hero: "+N Universidades CO" — calculado del total real, no fijo a mano
  const heroUniCountEl = document.getElementById('heroUniCount');
  if (heroUniCountEl) {
    heroUniCountEl.textContent = `+${Math.floor(UNIVERSITIES.length/10)*10} Universidades CO`;
  }

  if(currentUser.demo){
    grid.innerHTML = '<div class="no-history">⚡ Modo demo — los resultados no se guardan. ¡Toma el test! 🚀</div>';
    showGreeting();
    return;
  }

  grid.innerHTML = '<div class="no-history">Cargando historial... ⏳</div>';
  try {
    const sessions = await cargarSesiones();
    if(!sessions.length){
      grid.innerHTML = '<div class="no-history"><div class="no-history-icon">📊</div><div>Aún no tienes resultados. ¡Toma el primer test! 🚀</div></div>';
      return;
    }
    // Store globally for history screen
    window._allSessions = sessions;
    // Show last 3 in dashboard preview
    const preview = sessions.slice(0,3);
    grid.innerHTML = preview.map((s,i) => {
      const topArea = s.areas ? Object.entries(s.areas).sort((a,b)=>b[1]-a[1])[0]?.[0] : '—';
      const areaIcon = AREA_ICONS[topArea] || '📚';
      return `<div class="history-card hc-v4" onclick="showHistoryResult(${i})" style="animation-delay:${i*0.08}s">
        <div class="hc-top">
          <div class="hc-score-ring">
            <svg width="56" height="56" viewBox="0 0 56 56">
              <circle cx="28" cy="28" r="22" fill="none" stroke="rgba(255,255,255,0.07)" stroke-width="4"/>
              <circle cx="28" cy="28" r="22" fill="none" stroke="#4f8ef7" stroke-width="4" stroke-linecap="round"
                stroke-dasharray="${Math.round((s.puntaje/100)*138.2)} 138.2"
                stroke-dashoffset="34.6" transform="rotate(-90 28 28)"/>
            </svg>
            <span class="hc-score-val">${s.puntaje}</span>
          </div>
          <div class="hc-meta">
            <div class="hc-profile">${s.perfil || '—'}</div>
            <div class="hc-date">📅 ${s.creado_en}</div>
          </div>
        </div>
        <div class="hc-area-badge">${areaIcon} ${topArea}</div>
        <div class="hc-cta">Ver resultados completos →</div>
      </div>`;
    }).join('');
    if(sessions.length > 3){
      grid.innerHTML += `<div class="hc-more-btn" onclick="openHistoryScreen()">Ver todos los ${sessions.length} resultados →</div>`;
    }
  } catch(e) {
    grid.innerHTML = '<div class="no-history">⚠️ No se pudo cargar el historial.</div>';
  }
}

async function openHistoryScreen(){
  showScreen('screenHistory');
  const body        = document.getElementById('histTableBody');
  const statsRow    = document.getElementById('histStatsRow');
  const combPanel   = document.getElementById('combinedPanel');
  if(combPanel) combPanel.style.display = 'none';
  body.innerHTML = '<div style="text-align:center;padding:30px;opacity:.5">Cargando...</div>';

  try {
    window._allSessions = await cargarSesiones();
  } catch(e){ window._allSessions = window._allSessions || []; }

  const sessions = window._allSessions;
  const btnCombine = document.getElementById('btnCombine');
  if(btnCombine) btnCombine.style.display = sessions.length >= 2 ? '' : 'none';

  if(!sessions.length){
    statsRow.innerHTML = '';
    body.innerHTML = '<div style="text-align:center;padding:40px;opacity:.5">Sin resultados aún. ¡Toma el test!</div>';
    return;
  }

  const scores = sessions.map(s=>s.puntaje);
  const avg    = Math.round(scores.reduce((a,b)=>a+b,0)/scores.length);
  const best   = Math.max(...scores);
  statsRow.innerHTML = `
    <div class="hist-stat"><div class="hist-stat-val">${sessions.length}</div><div class="hist-stat-lbl">Tests realizados</div></div>
    <div class="hist-stat"><div class="hist-stat-val">${best}</div><div class="hist-stat-lbl">Mejor puntaje</div></div>
    <div class="hist-stat"><div class="hist-stat-val">${avg}</div><div class="hist-stat-lbl">Promedio</div></div>
    <div class="hist-stat"><div class="hist-stat-val">${sessions[0].perfil?.split(' ')[0]||'—'}</div><div class="hist-stat-lbl">Último perfil</div></div>
  `;

  body.innerHTML = sessions.map((s,i) => {
    const topArea   = s.areas ? Object.entries(s.areas).sort((a,b)=>b[1]-a[1])[0]?.[0] : '—';
    const areaIcon  = AREA_ICONS[topArea]||'📚';
    const scoreColor= s.puntaje>=70?'#4f8ef7':s.puntaje>=50?'#f59e0b':'#ef4444';
    return `<div class="hist-row" style="animation-delay:${i*0.04}s">
      <span class="hist-cell hist-check-cell"><input type="checkbox" class="hist-check" data-idx="${i}" data-id="${s.id}" onchange="updateSelectionCount()"></span>
      <span class="hist-cell hist-cell-date" onclick="showHistoryResult(${i})" style="cursor:pointer">📅 ${s.creado_en}</span>
      <span class="hist-cell" onclick="showHistoryResult(${i})" style="cursor:pointer"><span class="hist-score-badge" style="color:${scoreColor};border-color:${scoreColor}">${s.puntaje} pts</span></span>
      <span class="hist-cell hist-cell-profile" onclick="showHistoryResult(${i})" style="cursor:pointer">${s.perfil||'—'}</span>
      <span class="hist-cell" onclick="showHistoryResult(${i})" style="cursor:pointer">${areaIcon} <span style="opacity:.7;font-size:12px">${topArea}</span></span>
      <span class="hist-cell" style="justify-content:flex-end;gap:6px">
        <span class="hist-view-btn" onclick="showHistoryResult(${i})">Ver →</span>
        <button class="hist-del-btn" onclick="deleteSingleSession(${i},event)" title="Eliminar">🗑️</button>
      </span>
    </div>`;
  }).join('');
}

function updateSelectionCount(){
  const checked = document.querySelectorAll('.hist-check:checked');
  const countEl = document.getElementById('selectionCount');
  const delBtn  = document.getElementById('btnDeleteSelected');
  if(countEl){ countEl.textContent = `${checked.length} seleccionado(s)`; countEl.style.display = checked.length ? '' : 'none'; }
  if(delBtn)  delBtn.style.display = checked.length ? '' : 'none';
}

function toggleSelectAll(checked){
  document.querySelectorAll('.hist-check').forEach(c => c.checked = checked);
  updateSelectionCount();
}

async function deleteSingleSession(idx, e){
  if(e) e.stopPropagation();
  const sessions = window._allSessions || [];
  const s = sessions[idx];
  if(!s) return;
  if(!confirm(`¿Eliminar el resultado del ${s.creado_en}?`)) return;
  try {
    const { error } = await sb.from('sesiones_test').delete().eq('id', s.id).eq('usuario_id', currentUser.id);
    if(error) throw error;
    window._allSessions = window._allSessions.filter(x=>x.id !== s.id);
    openHistoryScreen();
  } catch(e){ alert('Error eliminando. Intenta de nuevo.'); }
}

async function deleteSelectedSessions(){
  const checked = Array.from(document.querySelectorAll('.hist-check:checked'));
  if(!checked.length) return;
  if(!confirm(`¿Eliminar ${checked.length} resultado(s)? No se puede deshacer.`)) return;
  const ids = new Set(checked.map(c => parseInt(c.dataset.id)));
  for(const id of ids){
    try { await sb.from('sesiones_test').delete().eq('id', id).eq('usuario_id', currentUser.id); } catch(e){}
  }
  window._allSessions = (window._allSessions||[]).filter(s=>!ids.has(s.id));
  openHistoryScreen();
}

function showCombinedAnalysis(){
  const sessions = window._allSessions || [];
  if(sessions.length < 2){ alert('Necesitas al menos 2 tests para combinar.'); return; }
  const panel = document.getElementById('combinedPanel');
  const body  = document.getElementById('combinedBody');
  if(!panel||!body) return;

  const merged = {};
  sessions.forEach(s => {
    if(!s.areas) return;
    Object.entries(s.areas).forEach(([k,v]) => { merged[k] = (merged[k]||0) + v; });
  });
  Object.keys(merged).forEach(k => merged[k] = Math.round(merged[k]/sessions.length));
  const maxVal   = Math.max(...Object.values(merged),1);
  const sorted   = Object.entries(merged).sort((a,b)=>b[1]-a[1]);
  const topAreas = sorted.slice(0,3).map(([k])=>k);
  const avgScore = Math.round(sessions.map(s=>s.puntaje).reduce((a,b)=>a+b,0)/sessions.length);
  const best     = Math.max(...sessions.map(s=>s.puntaje));
  const trend    = sessions.length >= 3
    ? (sessions[0].puntaje > sessions[sessions.length-1].puntaje ? '📈 Mejorando' : '📉 Variable')
    : '📊 En progreso';

  body.innerHTML = `
    <div class="combined-scores-row">
      <div class="combined-stat"><div class="combined-stat-val">${avgScore}</div><div class="combined-stat-lbl">Puntaje promedio</div></div>
      <div class="combined-stat"><div class="combined-stat-val">${best}</div><div class="combined-stat-lbl">Mejor puntaje</div></div>
      <div class="combined-stat"><div class="combined-stat-val">${sessions.length}</div><div class="combined-stat-lbl">Tests analizados</div></div>
      <div class="combined-stat"><div class="combined-stat-val" style="font-size:14px">${trend}</div><div class="combined-stat-lbl">Tendencia</div></div>
    </div>
    <div class="combined-areas-title">🏆 Tus áreas más consistentes</div>
    <div class="combined-areas-bars">
      ${sorted.map(([name,val],i)=>`
        <div class="combined-area-row">
          <span class="combined-area-icon">${AREA_ICONS[name]||'📚'}</span>
          <span class="combined-area-name">${name}</span>
          <div class="combined-area-bar-wrap"><div class="combined-area-bar" style="width:${Math.round(val/maxVal*100)}%;transition-delay:${i*0.07}s"></div></div>
          <span class="combined-area-pct">${Math.round(val/maxVal*100)}%</span>
        </div>`).join('')}
    </div>
    <div class="combined-conclusion">
      <strong>📌 Conclusión:</strong> A lo largo de tus ${sessions.length} tests, tus áreas más consistentes son
      <strong>${topAreas.join(', ')}</strong>. Esto confirma un perfil vocacional sólido hacia estas disciplinas.
    </div>`;
  panel.style.display = '';
  panel.scrollIntoView({ behavior:'smooth', block:'start' });
}

function showHistoryResult(idx){
  const sessions = window._allSessions || [];
  let s;
  if(typeof idx === 'number'){
    s = sessions[idx];
  } else {
    s = idx; // legacy: direct object passed
  }
  if(!s){ 
    console.warn('No session at index', idx, '- sessions length:', sessions.length);
    return; 
  }

  // Parsear areas si llega como string JSON
  let areas = s.areas || {};
  if(typeof areas === 'string'){ try { areas = JSON.parse(areas); } catch(e){ areas = {}; } }

  const sortedAreas = Object.entries(areas).sort((a,b)=>b[1]-a[1]).map(e=>e[0]);

  // Parsear carreras guardadas, o regenerar si faltan (sesiones antiguas)
  let recommendedCareers = s.carreras || s.recommendedCareers || [];
  if(typeof recommendedCareers === 'string'){ try { recommendedCareers = JSON.parse(recommendedCareers); } catch(e){ recommendedCareers = []; } }
  if(!recommendedCareers.length && sortedAreas.length){
    recommendedCareers = recommendCareers(sortedAreas, areas);
  }

  // Reconstruir unis: si los guardados son incompletos, regenerar desde UNIVERSITIES
  let unis = s.unis || [];
  if(typeof unis === 'string'){ try { unis = JSON.parse(unis); } catch(e){ unis = []; } }

  // Si los unis guardados no tienen careers/matchedCareers (formato viejo), regenerar con sistema de carreras
  if(!unis.length || !unis[0]?.careers || unis.some(u => !u.careers)){
    const userCity = currentUser?.ciudad || '';
    const regen = UNIVERSITIES.map(u => {
      const offeredMatches = recommendedCareers
        .map(rc => {
          const offered = u.careers.includes(rc.career);
          const icfesScore = offered ? (u.icfes[rc.career] || u.icfes.min) : null;
          return offered ? { career: rc.career, icfesScore, rank: rc.rank } : null;
        })
        .filter(Boolean);
      let m = 0;
      offeredMatches.forEach(om => { m += Math.max(0, 26 - om.rank * 4); });
      sortedAreas.forEach((a,i) => { if(u.areas.includes(a)) m += Math.max(0, 7 - i*1.1); });
      const local = isLocalUni(u.city, u.region||'', userCity);
      if(local) m += 14;
      return { ...u, matchScore: Math.min(99, Math.round(m)), isLocal: local, matchedCareers: offeredMatches };
    }).filter(u => u.matchScore > 8 && u.matchedCareers.length > 0)
      .sort((a,b) => {
        if(a.isLocal && !b.isLocal) return -1;
        if(!a.isLocal && b.isLocal) return  1;
        return b.matchScore - a.matchScore;
      });
    const localUnis    = regen.filter(u=>u.isLocal).slice(0,15);
    const nonLocalUnis = regen.filter(u=>!u.isLocal).slice(0, 50-localUnis.length);
    unis = [...localUnis, ...nonLocalUnis];
  }

  renderResults(
    s.puntaje    || s.score  || 0,
    areas,
    s.perfil     || s.profile || '—',
    s.analisis_ia|| s.aiText  || '',
    unis,
    recommendedCareers
  );
  window._confettiFired = false; // Allow confetti on each history result view
  showScreen('screenResults');
}

function shareWhatsApp(score, profile){
  const topArea = document.querySelector('.rv4-area-card .area-name')?.textContent || '';
  const msg = encodeURIComponent(
    `🎓 Acabo de hacer mi Test Vocacional en OrientaU y obtuve ${score} puntos!\n` +
    `Mi perfil: *${profile}*\n` +
    (topArea ? `Mi área top: ${topArea}\n` : '') +
    `¡Descubre tu vocación también! 👉 orientau.vercel.app`
  );
  window.open(`https://wa.me/?text=${msg}`, '_blank');
}

// ── Navbar loading bar ──────────────────────────────────────
function showLoadingBar(){
  let bar = document.getElementById('navLoadBar');
  if(!bar){
    bar = document.createElement('div');
    bar.id = 'navLoadBar';
    bar.style.cssText = 'position:fixed;top:0;left:0;height:3px;width:0;background:linear-gradient(90deg,#4f8ef7,#93c5fd);z-index:9999;transition:width 0.4s ease;border-radius:0 2px 2px 0;box-shadow:0 0 8px rgba(79,142,247,0.6)';
    document.body.appendChild(bar);
  }
  bar.style.width = '0';
  bar.style.opacity = '1';
  requestAnimationFrame(()=>{ bar.style.width = '70%'; });
}
function hideLoadingBar(){
  const bar = document.getElementById('navLoadBar');
  if(!bar) return;
  bar.style.width = '100%';
  setTimeout(()=>{ bar.style.opacity='0'; setTimeout(()=>bar.style.width='0',300); }, 250);
}
const TOOLTIP_HINTS = [
  'Selecciona la opción que mejor te represente y presiona "Siguiente".',
  'No hay respuestas correctas o incorrectas — sé honesto/a contigo.',
  '¡Vas muy bien! Puedes retroceder en cualquier momento con "Anterior".',
  'Analizaremos todas tus respuestas al final del test.',
  '¡Solo quedan unas pocas preguntas! Tu análisis vocacional está cerca.'
];

function startTest(testMode){
  // If no mode passed, show modal to choose
  if(!testMode){
    const existing = document.getElementById('testModeModal');
    if(existing) existing.remove();
    const modal = document.createElement('div');
    modal.id = 'testModeModal';
    modal.className = 'test-mode-modal-overlay';
    modal.innerHTML = `
      <div class="test-mode-modal">
        <div class="test-mode-header">
          <div class="test-mode-icon">🎯</div>
          <h2>¿Cómo quieres hacer el test?</h2>
          <p>Elige el modo que más se adapte a tu tiempo y profundidad de análisis</p>
        </div>
        <div class="test-mode-options">
          <div class="test-mode-card quick" onclick="document.getElementById('testModeModal').remove(); startTest('quick');">
            <div class="tmc-badge">⚡ Recomendado</div>
            <div class="tmc-icon">⚡</div>
            <div class="tmc-title">Test Rápido</div>
            <div class="tmc-count">30 preguntas</div>
            <div class="tmc-desc">Selección aleatoria representativa de las 500 preguntas. Análisis en minutos.</div>
            <div class="tmc-time">⏱ ~5 min</div>
            <button class="tmc-btn quick-btn">Iniciar Test Rápido ⚡</button>
          </div>
          <div class="test-mode-card full" onclick="document.getElementById('testModeModal').remove(); startTest('full');">
            <div class="tmc-badge tmc-badge-full">🔬 Máxima precisión</div>
            <div class="tmc-icon">🔬</div>
            <div class="tmc-title">Test Completo</div>
            <div class="tmc-count">500 preguntas</div>
            <div class="tmc-desc">Análisis exhaustivo de todas las áreas vocacionales. La IA tendrá más datos para un perfil ultra-preciso.</div>
            <div class="tmc-time">⏱ ~40-60 min</div>
            <button class="tmc-btn full-btn">Iniciar Test Completo 🔬</button>
          </div>
        </div>
        <button class="tmc-cancel" onclick="document.getElementById('testModeModal').remove()">Cancelar</button>
      </div>
    `;
    document.body.appendChild(modal);
    requestAnimationFrame(() => modal.classList.add('show'));
    return;
  }

  // Motivational quote modal before starting
  const quotes = [
    { q: '"El éxito es la suma de pequeños esfuerzos repetidos día tras día."', a: '— Robert Collier' },
    { q: '"Elige un trabajo que te guste y no tendrás que trabajar ni un día de tu vida."', a: '— Confucio' },
    { q: '"La mejor forma de predecir tu futuro es creándolo."', a: '— Abraham Lincoln' },
    { q: '"Conocerte a ti mismo es el comienzo de toda sabiduría."', a: '— Aristóteles' },
    { q: '"No sigas el camino. Ve donde no hay camino y deja un rastro."', a: '— Ralph W. Emerson' },
  ];
  const q = quotes[Math.floor(Math.random() * quotes.length)];
  const existingToast = document.getElementById('quoteToast');
  if(existingToast) existingToast.remove();
  const toast = document.createElement('div');
  toast.id = 'quoteToast';
  toast.innerHTML = `<div class="quote-toast-text">${q.q}</div><div class="quote-toast-author">${q.a}</div>`;
  toast.className = 'quote-toast';
  document.body.appendChild(toast);
  requestAnimationFrame(()=>{ toast.classList.add('show'); });
  setTimeout(()=>{ toast.classList.remove('show'); setTimeout(()=>toast.remove(),400); }, 2800);

  if(testMode === 'full'){
    // All 500 questions shuffled
    QUESTIONS = QUESTION_BANK.flatMap(topic => {
      const shuffled = [...topic.q].sort(() => Math.random() - 0.5);
      return shuffled.map(text => ({ cat: topic.cat, text, areas: topic.areas }));
    }).sort(() => Math.random() - 0.5);
  } else {
    // 30 random questions (3 per topic × 10 topics)
    QUESTIONS = QUESTION_BANK.flatMap(topic => {
      const shuffled = [...topic.q].sort(() => Math.random() - 0.5);
      return shuffled.slice(0, 3).map(text => ({ cat: topic.cat, text, areas: topic.areas }));
    }).sort(() => Math.random() - 0.5);
  }

  State = { currentQ: 0, answers: new Array(QUESTIONS.length).fill(null), streak: 0, lastAnswered: -1 };
  renderQuestion();
  showScreen('screenTest');

  const showTips = sessionStorage.getItem('orientau_showTips') === '1' || (userProfile && userProfile.es_nuevo == 1);
  const hint = document.getElementById('tooltipHint');
  if(showTips && hint){
    hint.style.display = 'flex';
    document.getElementById('tooltipText').textContent = TOOLTIP_HINTS[0];
  }
}

// Keyboard navigation for test
document.addEventListener('keydown', e => {
  const screen = document.getElementById('screenTest');
  if(!screen?.classList.contains('active')) return;
  if(e.key >= '1' && e.key <= '5'){
    const idx = parseInt(e.key) - 1;
    const btns = document.querySelectorAll('.option-btn');
    if(btns[idx]){ selectOpt(idx); }
  }
  if(e.key === 'ArrowRight' || e.key === 'Enter') nextQ();
  if(e.key === 'ArrowLeft') prevQ();
});

function renderQuestion(direction = 'forward'){
  const q = QUESTIONS[State.currentQ];
  const total = QUESTIONS.length;
  document.getElementById('progCount').textContent = `${State.currentQ + 1} / ${total}`;
  document.getElementById('progFill').style.width  = `${((State.currentQ + 1) / total) * 100}%`;

  const card = document.querySelector('.question-card');
  if(card){
    // Exit animation
    card.style.transition = 'transform 0.22s ease, opacity 0.22s ease';
    card.style.transform = direction === 'forward' ? 'translateX(-32px)' : 'translateX(32px)';
    card.style.opacity = '0';

    setTimeout(() => {
      // Update content
      document.getElementById('qCategory').textContent = q.cat;
      document.getElementById('qText').textContent     = q.text;
      document.getElementById('optionsGrid').innerHTML = LIKERT_OPTS.map((opt, i) => `
        <button class="option-btn ${State.answers[State.currentQ] === i ? 'selected' : ''}" onclick="selectOpt(${i})">
          <span class="option-text">${opt}</span>
        </button>`).join('');

      document.getElementById('btnPrev').style.visibility = State.currentQ === 0 ? 'hidden' : 'visible';
      document.getElementById('btnNext').textContent = State.currentQ === total - 1 ? 'Ver Resultados ✨' : 'Siguiente →';

      // Tooltip update
      const hint = document.getElementById('tooltipHint');
      if(hint && hint.style.display !== 'none'){
        const idx = Math.min(Math.floor(State.currentQ / 4), TOOLTIP_HINTS.length - 1);
        document.getElementById('tooltipText').textContent = TOOLTIP_HINTS[idx];
      }

      // Enter animation from opposite side
      card.style.transform = direction === 'forward' ? 'translateX(32px)' : 'translateX(-32px)';
      requestAnimationFrame(() => {
        card.style.transform = 'translateX(0)';
        card.style.opacity = '1';
      });
    }, 220);
  } else {
    document.getElementById('qCategory').textContent = q.cat;
    document.getElementById('qText').textContent     = q.text;
    document.getElementById('optionsGrid').innerHTML = LIKERT_OPTS.map((opt, i) => `
      <button class="option-btn ${State.answers[State.currentQ] === i ? 'selected' : ''}" onclick="selectOpt(${i})">
        <span class="option-text">${opt}</span>
      </button>`).join('');
    document.getElementById('btnPrev').style.visibility = State.currentQ === 0 ? 'hidden' : 'visible';
    document.getElementById('btnNext').textContent = State.currentQ === total - 1 ? 'Ver Resultados ✨' : 'Siguiente →';
  }
}

function selectOpt(i){
  State.answers[State.currentQ] = i;
  document.querySelectorAll('.option-btn').forEach((b, idx) => b.classList.toggle('selected', idx === i));
}

function nextQ(){
  if(State.answers[State.currentQ] === null){
    document.querySelectorAll('.option-btn').forEach(b => {
      b.style.borderColor = 'rgba(239,68,68,.5)';
      setTimeout(() => b.style.borderColor = '', 900);
    });
    return;
  }
  if(State.currentQ === QUESTIONS.length - 1){ analyzeResults(); return; }
  State.currentQ++;
  renderQuestion('forward');
}

function prevQ(){
  if(State.currentQ > 0){
    State.currentQ--;
    renderQuestion('back');
  }
}

// ── Análisis IA ───────────────────────────────────────────────

// ── Helpers de progreso ───────────────────────────────────────
function setProgress(pct, stepText, activeStepId, doneStepIds = []) {
  const bar    = document.getElementById('progressBar');
  const pctEl  = document.getElementById('progressPct');
  const stepEl = document.getElementById('progressStep');
  if(bar)   bar.style.width = pct + '%';
  if(pctEl) pctEl.textContent = Math.round(pct) + '%';
  if(stepEl && stepText) stepEl.textContent = stepText;

  // Marcar pasos completados
  doneStepIds.forEach(id => {
    const el = document.getElementById(id);
    if(el){ el.classList.remove('active'); el.classList.add('done'); }
  });
  // Marcar paso activo
  if(activeStepId) {
    const el = document.getElementById(activeStepId);
    if(el){ el.classList.add('active'); el.classList.remove('done'); }
  }
}

// Anima el porcentaje suavemente desde current hasta target
function animateTo(current, target, duration, stepText, activeId, doneIds = []) {
  return new Promise(resolve => {
    const start   = performance.now();
    const from    = current;
    const diff    = target - from;
    function tick(now) {
      const elapsed = now - start;
      const t       = Math.min(elapsed / duration, 1);
      const eased   = t < 0.5 ? 2*t*t : -1+(4-2*t)*t; // ease-in-out
      const val     = from + diff * eased;
      setProgress(val, stepText, activeId, doneIds);
      if(t < 1) requestAnimationFrame(tick);
      else resolve();
    }
    requestAnimationFrame(tick);
  });
}

async function analyzeResults(){
  _analyzeStart = Date.now();
  showScreen('screenLoading');
  showLoadingBar();

  // Reset progress UI
  ['step1','step2','step3','step4','step5'].forEach(id => {
    const el = document.getElementById(id);
    if(el){ el.classList.remove('active','done'); }
  });
  setProgress(0, 'Iniciando análisis...', null);

  // ── PASO 1: Calcular puntajes (0→20%) ──
  await animateTo(0, 5, 300, 'Evaluando aptitudes cognitivas...', 'step1');

  // ⚠️ FIX: antes se sumaban los puntos crudos por área (areaRawSum), y el área
  // con MÁS preguntas etiquetadas ganaba casi siempre, sin importar las respuestas
  // reales. Ciencias Sociales está etiquetada en 5 de los 10 temas del banco
  // (Lengua y Comunicación, Ciencias Sociales e Historia, Psicología, Administración
  // y Perfil Integral) — más que cualquier otra área (el resto está en 3-4 temas) —
  // así que acumulaba más puntos estructuralmente y terminaba ganando casi siempre.
  // Ahora se normaliza a un PROMEDIO por área (puntos ÷ preguntas que tocan esa área),
  // así todas las áreas compiten en igualdad de condiciones sin importar cuántas
  // preguntas del banco las mencionen.
  const areaRawSum = {};
  const areaCounts = {};
  AREAS.forEach(a => { areaRawSum[a] = 0; areaCounts[a] = 0; });
  QUESTIONS.forEach((q, qi) => {
    const ans = State.answers[qi];
    if(ans !== null){
      const pts = SCORE_MAP[ans];
      q.areas.forEach(area => {
        areaRawSum[area] = (areaRawSum[area] || 0) + pts;
        areaCounts[area] = (areaCounts[area] || 0) + 1;
      });
    }
  });
  const areaScores = {};
  AREAS.forEach(a => { areaScores[a] = areaCounts[a] > 0 ? (areaRawSum[a] / areaCounts[a]) : 0; });

  await animateTo(5, 20, 600, 'Aptitudes calculadas ✓', 'step1');

  // ── PASO 2: Calcular perfil (20→35%) ──
  await animateTo(20, 22, 200, 'Calculando perfil vocacional...', 'step2', ['step1']);

  const topArea     = Object.entries(areaScores).sort((a,b) => b[1]-a[1])[0][0];
  const maxPossible = QUESTIONS.length * 4;
  const totalPts    = Object.values(areaRawSum).reduce((a,b) => a+b, 0);
  const scoreVal    = Math.round((totalPts / maxPossible) * 85) + 15;
  const summary     = QUESTIONS.map((q,i) => `${q.cat}: "${q.text.substring(0,60)}" → ${LIKERT_OPTS[State.answers[i]||0]}`).join('; ');

  await animateTo(22, 35, 700, 'Perfil vocacional listo ✓', 'step2', ['step1']);

  // ── PASO 3: Matching universidades con datos reales (35→55%) ──
  await animateTo(35, 40, 300, `Filtrando ${UNIVERSITIES.length} instituciones...`, 'step3', ['step1','step2']);

  const sortedAreas = Object.entries(areaScores).sort((a,b) => b[1]-a[1]).map(e => e[0]);
  const userCity = currentUser.ciudad || '';

  // ── 1) Recomendar CARRERAS según las áreas dominantes del test ──
  const recommendedCareers = recommendCareers(sortedAreas, areaScores);

  // ── 2) Filtrar universidades que ofrezcan esas carreras, con ICFES real ──
  const matchedUnisAll = UNIVERSITIES.map(u => {
    // ¿Cuáles de las carreras recomendadas ofrece esta universidad?
    const offeredMatches = recommendedCareers
      .map(rc => {
        const offered = u.careers.includes(rc.career);
        const icfesScore = offered ? (u.icfes[rc.career] || u.icfes.min) : null;
        return offered ? { career: rc.career, icfesScore, rank: rc.rank } : null;
      })
      .filter(Boolean);

    let m = 0;
    // Puntaje por carreras recomendadas que ofrece (lo más importante)
    offeredMatches.forEach(om => { m += Math.max(0, 26 - om.rank * 4); });
    // Puntaje residual por área general (por si no hay carrera exacta)
    sortedAreas.forEach((a, i) => { if(u.areas.includes(a)) m += Math.max(0, 7 - i * 1.1); });

    const local = isLocalUni(u.city, u.region || '', userCity);
    if(local) m += 14;
    u._local = local;

    return {
      ...u,
      matchScore: Math.min(99, Math.round(m)),
      isLocal: local,
      matchedCareers: offeredMatches
    };
  }).filter(u => u.matchScore > 8 && u.matchedCareers.length > 0)
    .sort((a,b) => {
      if(a.isLocal && !b.isLocal) return -1;
      if(!a.isLocal && b.isLocal) return  1;
      return b.matchScore - a.matchScore;
    });

  const localUnis    = matchedUnisAll.filter(u => u.isLocal).slice(0, 15);
  const nonLocalUnis = matchedUnisAll.filter(u => !u.isLocal).slice(0, 50 - localUnis.length);
  let matchedUnis  = [...localUnis, ...nonLocalUnis];

  // Fallback: si ninguna universidad ofrece exactamente las carreras top, usar matching por área (compat. anterior)
  if (matchedUnis.length === 0) {
    matchedUnis = UNIVERSITIES.map(u => {
      let m = 0;
      sortedAreas.forEach((a, i) => { if(u.areas.includes(a)) m += 10 - i * 1.2; });
      const local = isLocalUni(u.city, u.region || '', userCity);
      if(local) m += 18;
      return { ...u, matchScore: Math.min(99, Math.round(m)), isLocal: local, matchedCareers: [] };
    }).filter(u => u.matchScore > 8)
      .sort((a,b) => b.matchScore - a.matchScore)
      .slice(0, 30);
  }

  await animateTo(40, 55, 500, `${matchedUnis.length} universidades seleccionadas ✓`, 'step3', ['step1','step2']);

  // ── PASO 4: Generar el análisis (55→90%) — con plantillas locales, sin IA ──
  await animateTo(55, 70, 400, 'Analizando tus resultados...', 'step4', ['step1','step2','step3']);

  const profile = profileMap[topArea] || topArea;
  const aiText  = generarAnalisisLocal(topArea, sortedAreas, matchedUnis, scoreVal);

  await animateTo(85, 90, 300, 'Análisis listo ✓', 'step4', ['step1','step2','step3']);

  // ── Guardar sesión fire-and-forget ──
  if(!currentUser.demo){
    sb.from('sesiones_test').insert({
      usuario_id: currentUser.id, puntaje: scoreVal, perfil: profile,
      areas_json: areaScores, unis_json: matchedUnis.slice(0,12), analisis_ia: aiText,
      respuestas_json: State.answers, carreras_json: recommendedCareers
    }).then(({error}) => { if(error) console.warn('No se pudo guardar:', error.message); });
  }

  // ── PASO 5: Renderizar (90→100%) ──
  await animateTo(90, 95, 400, 'Preparando tus resultados...', 'step5', ['step1','step2','step3','step4']);

  renderResults(scoreVal, areaScores, profile, aiText, matchedUnis, recommendedCareers);
  hideLoadingBar();

  await animateTo(95, 100, 400, '¡Listo! Mostrando resultados...', 'step5', ['step1','step2','step3','step4']);
  await new Promise(r => setTimeout(r, 200));
  showScreen('screenResults');
}


// ── Mapa de Universidades (Leaflet) ──────────────────────────
// ══ Sistema de audio OrientaU ══════════════════════════════════
let _uniAudio = null;
function playUniSound() {
  try {
    if (!_uniAudio) {
      _uniAudio = new Audio('assets/ui_click.ogg');
      _uniAudio.preload = 'auto';
    }
    _uniAudio.currentTime = 0;
    _uniAudio.volume = 0.7;
    _uniAudio.play().catch(() => {});
  } catch(e) {}
}

const UNI_COORDS = {
  "Universidad de los Andes":       [4.6013, -74.0659],
  "Universidad Nacional de Colombia":           [4.6388, -74.0829],
  "Pontificia U. Javeriana":        [4.6280, -74.0650],
  "Universidad del Rosario":        [4.5981, -74.0761],
  "U. Externado de Colombia":       [4.6001, -74.0716],
  "U. Sergio Arboleda":             [4.6582, -74.0572],
  "Universidad de La Sabana":       [4.8612, -74.0267],
  "Colegio Mayor de Cundinamarca":  [4.5985, -74.0760],
  "Escuela Colombiana de Ingeniería":[4.6901,-74.0430],
  "U. Distrital F. J. de Caldas":  [4.6024, -74.0704],
  "Universidad El Bosque":          [4.6878, -74.0342],
  "Universidad Piloto de Colombia": [4.6200, -74.0940],
  "U. Santo Tomás":                 [4.5979, -74.0763],
  "Fundación U. Los Libertadores":  [4.6570, -74.0631],
  "Universidad Central":            [4.6119, -74.0826],
  "UNIMINUTO":                      [4.6536, -74.1036],
  "Universidad EAFIT":              [6.2006, -75.5784],
  "Universidad de Antioquia":       [6.2676, -75.5652],
  "U. Pontificia Bolivariana":      [6.2340, -75.5887],
  "Universidad CES":                [6.2100, -75.5661],
  "ITM – Inst. Tecnológico Metro.": [6.2519, -75.5590],
  "Universidad del Valle":          [3.3759, -76.5280],
  "Pontificia U. Javeriana Cali":   [3.3647, -76.5335],
  "U. Autónoma de Occidente":       [3.3393, -76.5325],
  "Universidad ICESI":              [3.3404, -76.5326],
  "Universidad Santiago de Cali":   [3.4420, -76.5219],
  "Bellas Artes de Colombia":       [3.4350, -76.5340],
  "Universidad del Norte":          [11.0187,-74.8503],
  "Universidad del Atlántico":      [10.9883,-74.7891],
  "U. Simón Bolívar Barranquilla":  [11.0085,-74.8167],
  "U. Libre Barranquilla":          [10.9920,-74.8000],
  "Bellas Artes de Colombia B/q":   [10.9870,-74.7940],
  "U. Industrial de Santander":     [7.1404, -73.1227],
  "U. Autónoma de Bucaramanga (UNAB)":     [7.1192, -73.1228],
  "U. Cooperativa de Colombia":     [7.1150, -73.1190],
  "U. Pontificia Bolivariana B/g":  [7.1183, -73.1203],
  "U. Francisco de Paula Santander":[7.8981, -72.4887],
  "Universidad de Pamplona":        [7.3858, -72.6492],
  "U. Simón Bolívar Cúcuta":        [7.8840, -72.5013],
  "U. Libre Seccional Cúcuta":      [7.9122, -72.4988],
  "UFPS Ocaña":           [8.2350, -73.3212],
  "U. Tecnológica de Pereira":      [4.7895, -75.6960],
  "Universidad de Caldas":          [5.0674, -75.5078],
  "Universidad del Quindío":        [4.5343, -75.6774],
  "U. Católica de Manizales":       [5.0661, -75.5049],
  "Universidad de Cartagena":       [10.4196,-75.5437],
  "U. Tecnológica de Bolívar":      [10.3973,-75.4862],
  "U. de San Buenaventura Cgt.":    [10.4058,-75.5330],
  "Universidad de Córdoba":         [8.7494, -75.8796],
  "Universidad del Sinú (UNISINÚ)": [8.7671, -75.8849],
  "Universidad del Cauca":          [2.4437, -76.6061],
  "U. Autónoma Indígena Intercultural (UAIIN)": [2.4931, -76.5647],
  "Universidad de Nariño":          [1.2136, -77.2805],
  "Universidad CESMAG":             [1.2091, -77.2785],
  "U. Surcolombiana":               [2.9389, -75.2938],
  "U. de los Llanos":               [4.1511, -73.6247],
  "Universidad del Magdalena":      [11.2404,-74.1964],
  "U. Popular del Cesar":           [10.4660,-73.2534],
  "Universidad de Sucre":           [9.2996, -75.3941],
  "U. Pedagógica y Tecnológica (UPTC)":    [5.5333, -73.3667],
  "Universidad de la Amazonia":     [1.6140, -75.6070],
  // Nuevas universidades v36
  "U. Jorge Tadeo Lozano":          [4.6042, -74.0697],
  "U. Católica de Colombia":        [4.6100, -74.0820],
  "Universidad EAN":                [4.6580, -74.0561],
  "U. de La Salle":                 [4.6300, -74.0652],
  "Universidad de Ciencias Aplicadas":[4.7083,-74.0403],
  "U. Manuela Beltrán":             [4.6578, -74.0620],
  "U. La Gran Colombia":            [4.5978, -74.0764],
  "U. Autónoma de Colombia":        [4.6050, -74.0818],
  "U. de América":                  [4.6153, -74.0832],
  "CESA":                           [4.6572, -74.0551],
  "Fundación U. Konrad Lorenz":     [4.7563, -74.0451],
  "U. Pedagógica Nacional":         [4.6288, -74.0840],
  "Universidad Militar Nueva Granada":[4.6937,-74.1018],
  "Universidad Iberoamericana":     [4.6502, -74.0600],
  "UNAD":                           [4.6484, -74.0609],
  "U. Antonio Nariño":              [4.5980, -74.0783],
  "U. San Martín":                  [4.6510, -74.0581],
  "U. del Área Andina":             [4.6571, -74.0622],
  "U. Colegio Mayor de Cundinamarca":[4.5985,-74.0760],
  "U. de Cundinamarca":             [4.3561, -74.3646],
  "Universidad EIA":                [6.1720, -75.5920],
  "Tecnológico de Antioquia":       [6.2520, -75.5598],
  "Politécnico Colombiano J.I.C.":  [6.2390, -75.5880],
  "Institución Universitaria de Envigado":[6.1697,-75.5924],
  "U. Católica Luis Amigó":         [6.2572, -75.5598],
  "U. de Medellín":                 [6.2351, -75.6131],
  "Corporación Universitaria Remington":[6.2508,-75.5600],
  "U. Católica de Oriente":         [6.1550, -75.3759],
  "U. San Buenaventura Cali":       [3.3750, -76.5357],
  "Escuela Nacional del Deporte":   [3.4200, -76.5150],
  "U. Libre Seccional Cali":        [3.4418, -76.5218],
  "U. del Pacífico":                [3.8817, -77.0308],
  "Universidad de la Costa CUC":    [10.9950,-74.7950],
  "Universidad Metropolitana":      [10.9920,-74.8178],
  "U. Autónoma del Caribe":         [11.0050,-74.8050],
  "U. de La Guajira":               [11.5412,-72.9077],
  "U. de Santander UDES":           [7.1283, -73.1239],
  "U. Pontificia Bolivariana Bga.": [7.1183, -73.1203],
  "Unidades Tecnológicas de Santander":[7.0925,-73.1197],
  "UNIPAZ":                         [7.0636, -73.8603],
  "U. de San Gil UNISANGIL":        [6.5650, -73.1329],
  "ISER Pamplona":                  [7.3700, -72.6500],
  "U. Autónoma de Manizales":       [5.0682, -75.5031],
  "Universidad de Manizales":       [5.0760, -75.5090],
  "U. Católica de Pereira":         [4.8130, -75.6941],
  "U. Libre de Pereira":            [4.8000, -75.6989],
  "U. del Sinú Cartagena":          [10.4100,-75.5412],
  "CECAR":                          [9.3060, -75.3865],
  "U. Libre Barranquilla":          [10.9920,-74.8000],
  "Universidad de Boyacá":          [5.5412, -73.3540],
  "U. del Sinú Montería":           [8.7500, -75.8800],
  "Universidad Mariana":            [1.2189, -77.2804],
  "Universidad de Ibagué":          [4.4420, -75.2334],
  "Universidad del Tolima":         [4.4335, -75.2458],
  "U. Sergio Arboleda Santa Marta": [11.2290,-74.1980],
  "U. Tecnológica del Chocó":       [5.6920, -76.6570],
  "Unitrópico":                     [5.3460, -72.3968],
  "U. San Buenaventura Cartagena":  [10.4058,-75.5330],
  // ── Nuevas universidades v44 (PDF sync) ──────────────────────
  "Universidad Nacional Sede Medellín":[6.2676,-75.5652],
  "Universidad Nacional Sede Manizales":[5.0674,-75.5078],
  "Universidad Nacional Sede Palmira":[3.5320,-76.3050],
  "UNAULA":                         [6.2508,-75.5600],
  "Universidad de Ciencias Aplicadas (UDCA)":[4.7083,-74.0403],
  "Politécnico Grancolombiano":     [4.6580,-74.0560],
  "U. Agustiniana":                 [4.7012,-74.0680],
  "U. ECCI":                        [4.6541,-74.0610],
  "U. Incca de Colombia":           [4.5980,-74.0784],
  "Fundación U. INPAHU":            [4.6502,-74.0600],
  "Fundación U. Compensar":         [4.6400,-74.1100],
  "U. Republicana":                 [4.6050,-74.0818],
  "Fundación U. Horizonte":         [4.6450,-74.0520],
  "Fundación U. Uniempresarial":    [4.6180,-74.0717],
  "Fundación U. de Colombia (IUCO)":[4.6100,-74.0820],
  "Fundación U. Sanitas":           [4.7060,-74.0395],
  "Corporación Tecnológica de Bogotá":[4.6350,-74.0880],
  "Fundación U. Agraria (UNIAGRARIA)":[4.6280,-74.0760],
  "Fundación U. Los Libertadores":  [4.6570,-74.0631],
  "Escuela Tecnológica Inst. Técnico Central":[4.5980,-74.0754],
  "Inst. Técnica IDEC":             [4.6200,-74.0780],
  "Corp. Técnica de Colombia (CORPOTEC)":[4.6320,-74.0820],
  "UNAULA":                         [6.2508,-75.5600],
  "Corporación U. Lasallista":      [6.1540,-75.6430],
  "U. Adventista (UNAC)":           [6.2400,-75.5700],
  "Inst. Univ. Salazar y Herrera":  [6.2390,-75.5880],
  "Inst. Univ. Visión de las Américas":[6.2600,-75.5580],
  "Fundación U. Bellas Artes":      [6.2510,-75.5612],
  "U. San Buenaventura Medellín":   [6.2700,-75.5640],
  "Corp. Univ. Minuto de Dios Ant.":[6.3394,-75.5527],
  "Inst. Univ. CEIPA":              [6.1466,-75.6040],
  "U. Pascual Bravo (Inst. Univ.)":[6.2390,-75.5880],
  "Corp. U. Americana":             [6.2540,-75.5650],
  "U. Católica de Oriente":        [6.1550,-75.3759],
  "Universidad Nacional Sede Palmira":[3.5320,-76.3050],
  "Corp. Univ. Centro Superior (UNICUCES)":[3.3800,-76.5200],
  "Inst. Univ. Antonio José Camacho":[3.4600,-76.5100],
  "Corp. U. Rafael Núñez":          [10.4050,-75.5420],
  "Escuela Naval de Cadetes Almirante Padilla": [10.3923,-75.5254],
  "Fundación U. Tecnológico Comfenalco":[10.4100,-75.5380],
  "Fundación Universitaria de Popayán":[2.4450,-76.6040],
  "Corp. Univ. Comfacauca (UNICOMFACAUCA)":[2.4437,-76.6061],
  "Corp. Univ. Autónoma de Nariño (AUNAR)":[1.2136,-77.2805],
  "Corp. U. de Investigación (UDI)":[7.1192,-73.1228],
  "Corp. U. UNICIENCIA":            [7.1200,-73.1190],
  "Fundación U. Juan de Castellanos":[5.5412,-73.3540],
  "Tecnológico COMFENALCO Cartago": [4.7450,-75.9100],
  "SENA":                           [4.6484,-74.0609],
  "Instituto Tecnológico de Soledad (ITSA)":[10.9200,-74.7700],
  "Instituto Tecnológico del Putumayo":[1.1500,-76.6500],
  "Tecnológica Fitec":              [10.9920,-74.8000],
  "Inst. Univ. San Andrés (IUSAI)": [12.5847,-81.7006],
  "Instituto Técnico Agrícola (ITA)":[3.9020,-76.2990],
  "Inst. Técnica Comfamiliar Risaralda":[4.8130,-75.6941],
  "Inst. Técnica IDEC":             [4.6200,-74.0780],
  "Instituto Técnico Profesional de Roldanillo":[4.4160,-76.1570],
  "U. Manuela Beltrán Bga.":        [7.1192,-73.1228],
};

let _leafletMap = null;

function renderUniMap(unis) {
  const mapEl = document.getElementById('uniMap');
  if(!mapEl || !window.L) return;

  // Destroy previous map
  if(_leafletMap){ _leafletMap.remove(); _leafletMap = null; }

  const userCity = currentUser?.ciudad || '';
  const userCoords = [7.8939, -72.5078]; // Cúcuta default
  _leafletMap = L.map('uniMap', { zoomControl: true }).setView([5.5, -74.0], 5);

  L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
    attribution: '© OpenStreetMap © CARTO', subdomains: 'abcd', maxZoom: 19
  }).addTo(_leafletMap);

  // User location marker
  const userIcon = L.divIcon({
    html: `<div style="background:#00d4aa;border:3px solid #fff;border-radius:50%;width:16px;height:16px;box-shadow:0 0 12px rgba(0,212,170,0.8)"></div>`,
    iconSize: [16,16], iconAnchor: [8,8], className: ''
  });
  L.marker(userCoords, {icon: userIcon}).addTo(_leafletMap)
   .bindPopup(`<strong>📍 Tu ubicación</strong><br>${userCity || 'Cúcuta'}`);

  let added = 0;
  unis.forEach(u => {
    const coords = UNI_COORDS[u.name];
    if(!coords) return;
    added++;
    const isLocal = u.isLocal;
    const color = isLocal ? '#4f8ef7' : 'rgba(255,255,255,0.5)';
    const shadow = isLocal ? '0 0 10px rgba(79,142,247,0.9)' : 'none';
    const sz = isLocal ? 14 : 10;
    const icon = L.divIcon({
      html: `<div style="background:${color};border:2px solid ${isLocal?'#fff':'rgba(255,255,255,0.3)'};border-radius:50%;width:${sz}px;height:${sz}px;box-shadow:${shadow};cursor:pointer;"></div>`,
      iconSize: [sz,sz], iconAnchor: [sz/2,sz/2], className: ''
    });
    const localBadge = isLocal ? '<span style="background:#4f8ef7;color:#fff;padding:2px 6px;border-radius:4px;font-size:11px;margin-left:4px;">Tu región</span>' : '';
    const routeUrl = `https://www.google.com/maps/dir/${userCoords[0]},${userCoords[1]}/${coords[0]},${coords[1]}`;
    const svUrl = `https://www.google.com/maps/@?api=1&map_action=pano&viewpoint=${coords[0]},${coords[1]}&heading=0&pitch=0`;
    const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(u.name + ' ' + u.city + ' Colombia')}`;
    L.marker(coords, {icon}).addTo(_leafletMap)
     .bindPopup(`
       <div style="min-width:210px;font-family:sans-serif;">
         <div style="font-weight:700;font-size:13px;margin-bottom:4px;">${u.icon} ${u.name}${localBadge}</div>
         <div style="color:#888;font-size:11px;margin-bottom:6px;">📍 ${u.city} · Compat: <strong style="color:#4f8ef7">${u.matchScore}%</strong></div>
         <div style="display:flex;flex-direction:column;gap:5px;">
           <a href="${svUrl}" target="_blank" style="display:flex;align-items:center;gap:6px;background:#1a73e8;color:#fff;padding:6px 10px;border-radius:6px;text-decoration:none;font-size:12px;font-weight:600;">
             🚶 Vista de calle (Street View)
           </a>
           <a href="${mapsUrl}" target="_blank" style="display:flex;align-items:center;gap:6px;background:#0f3d1a;color:#4ade80;padding:6px 10px;border-radius:6px;text-decoration:none;font-size:12px;">
             🗺️ Ver en Google Maps
           </a>
           <a href="${routeUrl}" target="_blank" style="display:flex;align-items:center;gap:6px;color:#00d4aa;font-size:11px;text-decoration:none;padding:2px 0;">
             🧭 Cómo llegar desde ${userCity||'Cúcuta'}
           </a>
           <a href="${u.url||'#'}" target="_blank" style="color:#aaa;font-size:11px;text-decoration:none;">
             🌐 Sitio oficial →
           </a>
         </div>
       </div>
     `, { maxWidth: 260 });
  });

  if(added === 0) {
    mapEl.innerHTML = '<div style="color:rgba(255,255,255,0.3);padding:40px;text-align:center;">No hay coordenadas disponibles para las universidades seleccionadas.</div>';
  }
}


// ── QR de resultados ──────────────────────────────────────────
function renderQR() {
  const container = document.getElementById('qrContainer');
  if(!container || !window.QRCode) return;
  container.innerHTML = '';
  new QRCode(container, {
    text: 'https://orientau.vercel.app',
    width: 180, height: 180,
    colorDark: '#1a1a2e', colorLight: '#ffffff',
    correctLevel: QRCode.CorrectLevel.H
  });
}

function downloadQR() {
  const container = document.getElementById('qrContainer');
  const canvas = container?.querySelector('canvas');
  if(!canvas) return;
  const link = document.createElement('a');
  link.download = 'OrientaU_QR.png';
  link.href = canvas.toDataURL('image/png');
  link.click();
}

// ── Panel ICFES ───────────────────────────────────────────────
function renderIcfesPanel(unis) {
  const el = document.getElementById('icfesPanel');
  if(!el) return;

  // Public universities (official/public) — misma fuente que el resto del explorador,
  // así no hay que mantener esta lista por triplicado (antes se desincronizaba)
  const publicNames = EXP_PUBLIC;

  // Get all 125 unis from UNIVERSITIES (global), merge with passed unis for local tags
  const localSet = new Set(unis.map(u => u.name));
  const allUnis = UNIVERSITIES.map(u => ({
    ...u,
    isLocal: localSet.has(u.name),
    tipo: publicNames.has(u.name) ? 'publica' : 'privada'
  })).filter(u => u.icfes && u.icfes.min);

  const publicas = allUnis.filter(u => u.tipo === 'publica').sort((a,b) => b.icfes.min - a.icfes.min);
  const privadas = allUnis.filter(u => u.tipo === 'privada').sort((a,b) => b.icfes.min - a.icfes.min);

  function buildCards(list) {
    return list.map(u => {
      const programs = Object.entries(u.icfes).filter(([k]) => k !== 'min');
      const progCards = programs.map(([p,s]) => `
        <div class="icfes-prog-card">
          <span class="ipc-name">${p}</span>
          <span class="ipc-score">${s} pts</span>
        </div>`).join('');
      const localTag = u.isLocal ? '<span class="local-tag">📍 Local</span>' : '';
      const tipoColor = u.tipo === 'publica' ? 'var(--pub-color)' : 'var(--priv-color)';
      return `
        <div class="icfes-uni-card ${u.isLocal ? 'icfes-card-local' : ''}" data-min="${u.icfes.min}">
          <div class="iuc-header">
            <span class="iuc-icon">${u.icon}</span>
            <div class="iuc-info">
              <div class="iuc-name">${u.name} ${localTag}</div>
              <div class="iuc-city">📍 ${u.city}</div>
            </div>
            <div class="iuc-min-badge" style="background:${tipoColor}22;border-color:${tipoColor}44;color:${tipoColor}">
              <span class="iuc-min-val">${u.icfes.min}</span>
              <span class="iuc-min-lbl">mín</span>
            </div>
          </div>
          ${progCards ? `<div class="iuc-careers-grid">${progCards}</div>` : ''}
        </div>`;
    }).join('');
  }

  el.innerHTML = `
    <style>
      :root { --pub-color: #4ade80; --priv-color: #60a5fa; }
      .icfes-tabs { display:flex; gap:8px; margin-bottom:16px; flex-wrap:wrap; }
      .icfes-tab { padding:8px 18px; border-radius:20px; border:1.5px solid rgba(255,255,255,0.15);
        background:rgba(255,255,255,0.05); color:rgba(255,255,255,0.6); cursor:pointer;
        font-size:13px; font-weight:600; transition:all .2s; }
      .icfes-tab.active-pub { background:rgba(74,222,128,0.15); border-color:rgba(74,222,128,0.5); color:#4ade80; }
      .icfes-tab.active-priv { background:rgba(96,165,250,0.15); border-color:rgba(96,165,250,0.5); color:#60a5fa; }
      .icfes-section-title { font-size:15px; font-weight:700; margin:12px 0 10px;
        display:flex; align-items:center; gap:8px; }
      .icfes-uni-card { background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.1);
        border-radius:14px; padding:14px; margin-bottom:10px; transition:all .25s;
        cursor:default; }
      .icfes-uni-card:hover { background:rgba(255,255,255,0.07); transform:translateY(-2px);
        box-shadow:0 8px 24px rgba(0,0,0,0.3); }
      .icfes-card-local { border-color:rgba(79,142,247,0.4) !important;
        box-shadow:0 0 12px rgba(79,142,247,0.15); }
      .iuc-header { display:flex; align-items:center; gap:10px; }
      .iuc-icon { font-size:24px; flex-shrink:0; }
      .iuc-info { flex:1; min-width:0; }
      .iuc-name { font-size:13px; font-weight:700; color:#f0f0f0; line-height:1.3; }
      .iuc-city { font-size:11px; color:rgba(255,255,255,0.45); margin-top:2px; }
      .iuc-min-badge { border:1.5px solid; border-radius:10px; padding:6px 10px;
        text-align:center; flex-shrink:0; min-width:54px; }
      .iuc-min-val { display:block; font-size:16px; font-weight:800; line-height:1; }
      .iuc-min-lbl { display:block; font-size:9px; font-weight:600; text-transform:uppercase;
        letter-spacing:.5px; opacity:.7; }
      .iuc-careers-grid { display:flex; flex-wrap:wrap; gap:6px; margin-top:10px; }
      .icfes-prog-card { background:rgba(255,255,255,0.07); border:1px solid rgba(255,255,255,0.1);
        border-radius:8px; padding:5px 10px; display:flex; align-items:center; gap:6px;
        font-size:11.5px; transition:all .2s; }
      .icfes-prog-card:hover { background:rgba(79,142,247,0.15); }
      .ipc-name { color:rgba(255,255,255,0.75); }
      .ipc-score { color:#4f8ef7; font-weight:700; font-size:12px; }
      .local-tag { background:rgba(79,142,247,0.2); color:#4f8ef7; border:1px solid rgba(79,142,247,0.3);
        font-size:10px; padding:1px 6px; border-radius:10px; margin-left:4px;
        vertical-align:middle; font-weight:600; }
      .icfes-uni-card.icfes-qualified .iuc-min-badge { background:rgba(74,222,128,0.2)!important;
        border-color:rgba(74,222,128,0.5)!important; color:#4ade80!important; }
      .icfes-uni-card.icfes-unqualified { opacity:.5; }
      .icfes-panel-grid { display:none; }
      .icfes-panel-grid.active { display:block; }
    </style>
    <div class="icfes-tabs">
      <button class="icfes-tab active-pub" onclick="switchIcfesTab('pub',this)">
        🏛️ Públicas (${publicas.length})
      </button>
      <button class="icfes-tab" onclick="switchIcfesTab('priv',this)">
        🏢 Privadas (${privadas.length})
      </button>
    </div>
    <div id="icfesTabPub" class="icfes-panel-grid active">
      <div class="icfes-section-title" style="color:#4ade80">🏛️ Universidades Públicas de Colombia</div>
      ${buildCards(publicas)}
    </div>
    <div id="icfesTabPriv" class="icfes-panel-grid">
      <div class="icfes-section-title" style="color:#60a5fa">🏢 Universidades Privadas de Colombia</div>
      ${buildCards(privadas)}
    </div>
  `;

  // Score checker
  const checker = document.getElementById('icfesChecker');
  if(checker) {
    checker.oninput = function() {
      const val = parseInt(this.value) || 0;
      document.querySelectorAll('.icfes-uni-card').forEach(card => {
        const min = parseInt(card.dataset.min);
        card.classList.toggle('icfes-qualified', val >= min);
        card.classList.toggle('icfes-unqualified', val > 0 && val < min);
      });
      const info = document.getElementById('icfesInfo');
      if(info) {
        const qualified = document.querySelectorAll('.icfes-qualified').length;
        const total = document.querySelectorAll('.icfes-uni-card').length;
        info.textContent = val > 0 ? `Con ${val} puntos clasificas a ${qualified} de ${total} universidades` : '';
        info.style.color = qualified > 0 ? '#4f8ef7' : '#ef4444';
      }
    };
  }
}

function switchIcfesTab(tab, btn) {
  document.querySelectorAll('.icfes-tab').forEach(t => {
    t.className = 'icfes-tab';
  });
  document.querySelectorAll('.icfes-panel-grid').forEach(p => p.classList.remove('active'));
  if(tab === 'pub') {
    btn.classList.add('active-pub');
    document.getElementById('icfesTabPub').classList.add('active');
  } else {
    btn.classList.add('active-priv');
    document.getElementById('icfesTabPriv').classList.add('active');
  }
}

// ── Radar Chart ───────────────────────────────────────────────
function drawRadarChart(areas){
  const canvas = document.getElementById('radarCanvas');
  if(!canvas) return;
  const ctx = canvas.getContext('2d');
  const W = canvas.width, H = canvas.height;
  const cx = W/2, cy = H/2;
  const R = Math.min(W,H)/2 - 36;
  const keys = Object.keys(areas);
  const vals = Object.values(areas);
  const maxVal = Math.max(...vals, 1);
  const N = keys.length;
  ctx.clearRect(0,0,W,H);

  // Draw grid rings
  for(let ring = 1; ring <= 4; ring++){
    const r = R * ring/4;
    ctx.beginPath();
    for(let i = 0; i < N; i++){
      const angle = (Math.PI*2/N)*i - Math.PI/2;
      const x = cx + r * Math.cos(angle);
      const y = cy + r * Math.sin(angle);
      i===0 ? ctx.moveTo(x,y) : ctx.lineTo(x,y);
    }
    ctx.closePath();
    ctx.strokeStyle = 'rgba(255,255,255,0.08)';
    ctx.lineWidth = 1;
    ctx.stroke();
  }

  // Draw axes
  for(let i = 0; i < N; i++){
    const angle = (Math.PI*2/N)*i - Math.PI/2;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(cx + R*Math.cos(angle), cy + R*Math.sin(angle));
    ctx.strokeStyle = 'rgba(255,255,255,0.12)';
    ctx.lineWidth = 1;
    ctx.stroke();
  }

  // Animate filled area
  let progress = 0;
  function animate(){
    progress = Math.min(progress + 0.04, 1);
    ctx.clearRect(0,0,W,H);

    // Redraw grid
    for(let ring = 1; ring <= 4; ring++){
      const r = R * ring/4;
      ctx.beginPath();
      for(let i = 0; i < N; i++){
        const angle = (Math.PI*2/N)*i - Math.PI/2;
        const x = cx + r*Math.cos(angle), y = cy + r*Math.sin(angle);
        i===0?ctx.moveTo(x,y):ctx.lineTo(x,y);
      }
      ctx.closePath();
      ctx.strokeStyle='rgba(255,255,255,0.08)'; ctx.lineWidth=1; ctx.stroke();
    }
    for(let i=0;i<N;i++){
      const angle=(Math.PI*2/N)*i-Math.PI/2;
      ctx.beginPath(); ctx.moveTo(cx,cy);
      ctx.lineTo(cx+R*Math.cos(angle),cy+R*Math.sin(angle));
      ctx.strokeStyle='rgba(255,255,255,0.12)'; ctx.lineWidth=1; ctx.stroke();
    }

    // Filled polygon
    ctx.beginPath();
    for(let i=0;i<N;i++){
      const angle=(Math.PI*2/N)*i-Math.PI/2;
      const r = R*(vals[i]/maxVal)*progress;
      const x=cx+r*Math.cos(angle), y=cy+r*Math.sin(angle);
      i===0?ctx.moveTo(x,y):ctx.lineTo(x,y);
    }
    ctx.closePath();
    const grad = ctx.createRadialGradient(cx,cy,0,cx,cy,R);
    grad.addColorStop(0,'rgba(79,142,247,0.45)');
    grad.addColorStop(1,'rgba(79,142,247,0.08)');
    ctx.fillStyle = grad;
    ctx.fill();
    ctx.strokeStyle='#4f8ef7'; ctx.lineWidth=2.5; ctx.stroke();

    // Dots
    for(let i=0;i<N;i++){
      const angle=(Math.PI*2/N)*i-Math.PI/2;
      const r=R*(vals[i]/maxVal)*progress;
      const x=cx+r*Math.cos(angle), y=cy+r*Math.sin(angle);
      ctx.beginPath(); ctx.arc(x,y,4,0,Math.PI*2);
      ctx.fillStyle='#4f8ef7'; ctx.fill();
      ctx.strokeStyle='#fff'; ctx.lineWidth=1.5; ctx.stroke();
    }

    // Labels (always at full R, not animated)
    ctx.fillStyle='rgba(255,255,255,0.75)';
    ctx.font='500 10px Outfit';
    ctx.textAlign='center'; ctx.textBaseline='middle';
    for(let i=0;i<N;i++){
      const angle=(Math.PI*2/N)*i-Math.PI/2;
      const lx=cx+(R+22)*Math.cos(angle), ly=cy+(R+22)*Math.sin(angle);
      const icon = AREA_ICONS[keys[i]]||'📚';
      ctx.fillText(icon, lx, ly);
    }

    if(progress < 1) requestAnimationFrame(animate);
  }
  animate();
}

// ── Download Result as PNG ────────────────────────────────────
function downloadResult(score, areas, profile){
  const off = document.createElement('canvas');
  off.width = 900; off.height = 560;
  const c = off.getContext('2d');

  // ── Background ──
  const bg = c.createLinearGradient(0, 0, 900, 560);
  bg.addColorStop(0,'#04091a'); bg.addColorStop(0.5,'#070f24'); bg.addColorStop(1,'#030810');
  c.fillStyle = bg; c.fillRect(0, 0, 900, 560);

  // Subtle grid pattern
  c.strokeStyle = 'rgba(79,142,247,0.04)'; c.lineWidth = 1;
  for(let x=0; x<900; x+=40){ c.beginPath(); c.moveTo(x,0); c.lineTo(x,560); c.stroke(); }
  for(let y=0; y<560; y+=40){ c.beginPath(); c.moveTo(0,y); c.lineTo(900,y); c.stroke(); }

  // Glow blobs
  const g1 = c.createRadialGradient(160,280,10,160,280,220);
  g1.addColorStop(0,'rgba(79,142,247,0.22)'); g1.addColorStop(1,'rgba(0,0,0,0)');
  c.fillStyle=g1; c.fillRect(0,0,900,560);
  const g2 = c.createRadialGradient(780,100,10,780,100,180);
  g2.addColorStop(0,'rgba(0,212,170,0.12)'); g2.addColorStop(1,'rgba(0,0,0,0)');
  c.fillStyle=g2; c.fillRect(0,0,900,560);

  // ── Score circle ──
  const cx=155, cy=270, r=90, sw=12;
  // Outer ring
  c.beginPath(); c.arc(cx,cy,r,0,Math.PI*2);
  c.strokeStyle='rgba(255,255,255,0.06)'; c.lineWidth=sw+4; c.stroke();
  // Track
  c.beginPath(); c.arc(cx,cy,r,0,Math.PI*2);
  c.strokeStyle='rgba(79,142,247,0.15)'; c.lineWidth=sw; c.stroke();
  // Arc fill
  const pct=(score/100)*Math.PI*2;
  const arcGrad = c.createConicGradient(-Math.PI/2, cx, cy);
  arcGrad.addColorStop(0,'#4f8ef7');
  arcGrad.addColorStop(0.5,'#00d4aa');
  arcGrad.addColorStop(score/100,'#93c5fd');
  arcGrad.addColorStop(score/100+0.001,'transparent');
  arcGrad.addColorStop(1,'transparent');
  c.beginPath(); c.arc(cx,cy,r,-Math.PI/2,-Math.PI/2+pct);
  c.strokeStyle=arcGrad; c.lineWidth=sw; c.lineCap='round'; c.stroke();
  // Inner fill
  c.fillStyle='rgba(3,9,20,0.95)'; c.beginPath(); c.arc(cx,cy,r-sw-2,0,Math.PI*2); c.fill();
  // Score text
  c.fillStyle='#ffffff'; c.font='bold 44px Arial'; c.textAlign='center'; c.textBaseline='middle';
  c.fillText(score, cx, cy-10);
  c.fillStyle='#4f8ef7'; c.font='600 14px Arial';
  c.fillText('puntos', cx, cy+18);

  // ── Brand header ──
  c.textAlign='left';
  // Logo text
  c.fillStyle='#4f8ef7'; c.font='bold 32px Arial';
  c.fillText('Orienta', 290, 65);
  c.fillStyle='#00d4aa';
  c.fillText('U', 290 + c.measureText('Orienta').width, 65);
  // Tagline
  c.fillStyle='rgba(255,255,255,0.35)'; c.font='13px Arial';
  c.fillText('Tu orientación vocacional con Inteligencia Artificial', 290, 90);

  // Horizontal divider
  const divGrad = c.createLinearGradient(290,0,820,0);
  divGrad.addColorStop(0,'rgba(79,142,247,0.7)'); divGrad.addColorStop(1,'rgba(0,212,170,0.1)');
  c.strokeStyle=divGrad; c.lineWidth=1.5; c.beginPath(); c.moveTo(290,105); c.lineTo(820,105); c.stroke();

  // ── User info ──
  const userName = (currentUser?.nombre || '').toUpperCase();
  const userGrado = userProfile?.grado || '';
  const userCity  = currentUser?.ciudad || 'Colombia';

  c.fillStyle='#ffffff'; c.font='bold 19px Arial';
  c.fillText(userName || 'Estudiante', 290, 135);

  if(userGrado || userCity){
    c.fillStyle='rgba(255,255,255,0.45)'; c.font='13px Arial';
    const meta = [userGrado, userCity].filter(Boolean).join('  ·  ');
    c.fillText(meta, 290, 157);
  }

  // ── Profile badge ──
  const badgeX = 290, badgeY = 175;
  const badgeW = Math.min(c.measureText(profile).width + 32, 400);
  const bGrad = c.createLinearGradient(badgeX, 0, badgeX+badgeW, 0);
  bGrad.addColorStop(0,'rgba(79,142,247,0.25)'); bGrad.addColorStop(1,'rgba(0,212,170,0.15)');
  c.fillStyle=bGrad;
  c.beginPath(); if(c.roundRect){ c.roundRect(badgeX,badgeY,badgeW,32,8); } else { c.rect(badgeX,badgeY,badgeW,32); }
  c.fill();
  c.strokeStyle='rgba(79,142,247,0.5)'; c.lineWidth=1;
  c.beginPath(); if(c.roundRect){ c.roundRect(badgeX,badgeY,badgeW,32,8); } else { c.rect(badgeX,badgeY,badgeW,32); }
  c.stroke();
  c.fillStyle='#93c5fd'; c.font='bold 14px Arial';
  c.fillText(profile, badgeX+16, badgeY+20);

  // ── Area bars ──
  const sorted = Object.entries(areas).sort((a,b)=>b[1]-a[1]).slice(0,4);
  const maxV = Math.max(...Object.values(areas),1);
  sorted.forEach(([name,val],i)=>{
    const y = 228 + i*62;
    const pct2 = val/maxV;
    const barW = 390;
    const icon = AREA_ICONS[name]||'📚';
    c.fillStyle='rgba(255,255,255,0.65)'; c.font='13px Arial';
    c.fillText(`${icon} ${name}`, 290, y);
    // Bar bg
    c.fillStyle='rgba(255,255,255,0.07)';
    c.beginPath(); if(c.roundRect){ c.roundRect(290,y+8,barW,9,4); } else { c.rect(290,y+8,barW,9); } c.fill();
    // Bar fill gradient
    const bfg = c.createLinearGradient(290,0,290+barW*pct2,0);
    bfg.addColorStop(0,'#4f8ef7'); bfg.addColorStop(1,'#00d4aa');
    c.fillStyle=bfg;
    c.beginPath(); if(c.roundRect){ c.roundRect(290,y+8,barW*pct2,9,4); } else { c.rect(290,y+8,barW*pct2,9); } c.fill();
    // Percentage
    c.fillStyle='rgba(255,255,255,0.55)'; c.font='bold 12px Arial'; c.textAlign='right';
    c.fillText(`${Math.round(pct2*100)}%`, 290+barW+40, y+17);
    c.textAlign='left';
  });

  // ── QR Code (pure canvas, no lib needed - simple placeholder with URL) ──
  // Draw a decorative QR-like badge
  const qrX = 700, qrY = 170, qrS = 120;
  c.fillStyle='rgba(255,255,255,0.05)';
  c.beginPath(); if(c.roundRect){ c.roundRect(qrX,qrY,qrS,qrS,10); } else { c.rect(qrX,qrY,qrS,qrS); } c.fill();
  c.strokeStyle='rgba(79,142,247,0.3)'; c.lineWidth=1;
  c.beginPath(); if(c.roundRect){ c.roundRect(qrX,qrY,qrS,qrS,10); } else { c.rect(qrX,qrY,qrS,qrS); } c.stroke();
  c.fillStyle='rgba(79,142,247,0.7)'; c.font='32px Arial'; c.textAlign='center';
  c.fillText('📱', qrX+qrS/2, qrY+48);
  c.fillStyle='rgba(255,255,255,0.4)'; c.font='10px Arial';
  c.fillText('Escanea para ver', qrX+qrS/2, qrY+70);
  c.fillText('tus resultados', qrX+qrS/2, qrY+84);
  c.fillStyle='#4f8ef7'; c.font='bold 10px Arial';
  c.fillText('orientau.vercel.app', qrX+qrS/2, qrY+104);

  // ── Footer ──
  c.textAlign='left';
  const ftGrad = c.createLinearGradient(0,530,900,530);
  ftGrad.addColorStop(0,'rgba(79,142,247,0.4)'); ftGrad.addColorStop(1,'rgba(0,212,170,0.2)');
  c.strokeStyle=ftGrad; c.lineWidth=1; c.beginPath(); c.moveTo(40,530); c.lineTo(860,530); c.stroke();
  c.fillStyle='rgba(255,255,255,0.2)'; c.font='12px Arial'; c.textAlign='center';
  c.fillText(`orientau.vercel.app  ·  ${new Date().toLocaleDateString('es-CO')}`, 450, 548);

  // ── Download ──
  const safeName = (currentUser?.nombre||'resultado').replace(/\s+/g,'_');
  const link = document.createElement('a');
  link.download = `OrientaU_${safeName}_${Date.now()}.png`;
  link.href = off.toDataURL('image/png');
  link.click();
}

// ── Render resultados ─────────────────────────────────────────
function renderResults(score, areas, profile, aiText, unis, recommendedCareers){
  recommendedCareers = recommendedCareers || [];
  // Guard: asegurar que areas y unis sean objetos válidos
  if(!areas || typeof areas !== 'object') areas = {};
  if(!Array.isArray(unis)) unis = [];

  const canvas = document.getElementById('scoreCanvas');
  if(!canvas) return;
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, 150, 150);
  const cx = 75, cy = 75, r = 62, sw = 11;

  // Track gris
  ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI*2);
  ctx.strokeStyle = 'rgba(255,255,255,0.06)'; ctx.lineWidth = sw; ctx.stroke();

  // Arco de progreso — gradiente lineal (compatible con todos los browsers)
  const pctAngle = (score / 100) * Math.PI * 2;
  const grad = ctx.createLinearGradient(cx - r, cy, cx + r, cy);
  grad.addColorStop(0, '#4f8ef7');
  grad.addColorStop(1, '#00d4aa');
  ctx.beginPath(); ctx.arc(cx, cy, r, -Math.PI/2, -Math.PI/2 + pctAngle);
  ctx.strokeStyle = grad; ctx.lineWidth = sw; ctx.lineCap = 'round'; ctx.stroke();

  // Círculo interior
  ctx.fillStyle = 'rgba(2,13,10,0.95)';
  ctx.beginPath(); ctx.arc(cx, cy, r - sw, 0, Math.PI*2); ctx.fill();

  // Texto puntaje
  ctx.fillStyle = '#ffffff'; ctx.font = 'bold 30px sans-serif';
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillText(score, cx, cy - 7);
  ctx.fillStyle = '#4f8ef7'; ctx.font = '600 12px sans-serif';
  ctx.fillText('puntos', cx, cy + 14);

  document.getElementById('resultProfile').textContent = profile;
  document.getElementById('resultDesc').textContent    = `Basado en tus ${QUESTIONS.length || Object.keys(areas).length > 0 ? (QUESTIONS.length || 30) : 30} respuestas, identificamos tus fortalezas y las mejores universidades colombianas para tu perfil.`;

  // WhatsApp share button (always recreate to update score/profile for current result)
  const heroActions = document.querySelector('.rv4-hero-actions');
  if(heroActions){
    const existingWaBtn = document.getElementById('btnWhatsapp');
    if(existingWaBtn) existingWaBtn.remove();
    const waBtn = document.createElement('button');
    waBtn.id = 'btnWhatsapp';
    waBtn.className = 'rv4-btn-whatsapp';
    waBtn.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 0C5.373 0 0 5.373 0 12c0 2.137.565 4.14 1.543 5.876L.057 23.998l6.305-1.654A11.954 11.954 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.793 9.793 0 01-5.001-1.371l-.36-.214-3.72.977.992-3.62-.234-.372A9.793 9.793 0 012.182 12C2.182 6.58 6.58 2.182 12 2.182S21.818 6.58 21.818 12 17.42 21.818 12 21.818z"/></svg> Compartir`;
    waBtn.onclick = () => shareWhatsApp(score, profile);
    heroActions.appendChild(waBtn);
  }

  // Animate radar
  setTimeout(() => drawRadarChart(areas), 300);

  // Render ICFES panel
  renderIcfesPanel(unis);

  // Render mapa de universidades
  setTimeout(() => renderUniMap(unis), 800);

  // Render QR
  setTimeout(() => renderQR(), 500);

  // AI text with typewriter
  const aiEl = document.getElementById('aiText');
  aiEl.textContent = '';
  let ci2 = 0;
  const tw2 = setInterval(()=>{
    aiEl.textContent = aiText.slice(0, ci2++);
    if(ci2 > aiText.length) clearInterval(tw2);
  }, 14);

  const maxVal = Math.max(...Object.values(areas), 1);
  document.getElementById('areasGrid').innerHTML = Object.entries(areas)
    .sort((a,b) => b[1] - a[1])
    .map(([name, val], idx) => {
      const pct = Math.round((val / maxVal) * 100);
      return `<div class="area-card rv4-area-card" style="animation-delay:${idx*0.07}s">
        <div class="area-icon">${AREA_ICONS[name] || '📚'}</div>
        <div class="area-name">${name}</div>
        <div class="area-pct">${pct}%</div>
        <div class="area-bar"><div class="area-fill" style="width:${val ? Math.max((val/maxVal)*100, 6) : 4}%;transition-delay:${idx*0.1}s"></div></div>
      </div>`;
    }).join('');

  // ── Carreras recomendadas ────────────────────────────────────
  const careersGridEl = document.getElementById('careersGrid');
  if (careersGridEl) {
    if (recommendedCareers.length) {
      // Precomputar: para cada carrera, las universidades REALES que la ofrecen (del país completo)
      // Esto garantiza que el número mostrado = el número que aparece al filtrar
      const userCity = currentUser?.ciudad || '';
      const careerUniMap = {};
      recommendedCareers.forEach(c => {
        const allOffering = UNIVERSITIES.filter(u => (u.careers||[]).includes(c.career))
          .map(u => {
            const local = isLocalUni(u.city, u.region||'', userCity);
            return {
              ...u,
              isLocal: local,
              matchScore: u.matchScore || (local ? 65 : 48),
              matchedCareers: [{ career: c.career, icfesScore: u.icfes[c.career] || u.icfes.min, rank: 0 }]
            };
          })
          .sort((a,b) => {
            if(a.isLocal && !b.isLocal) return -1;
            if(!a.isLocal && b.isLocal) return  1;
            return (a.icfes[c.career]||a.icfes.min) - (b.icfes[c.career]||b.icfes.min);
          });
        careerUniMap[c.career] = allOffering;
      });

      // Paletas de color por área
      const AREA_COLORS = {
        'Ingeniería':              {from:'#1e3a8a',to:'#3b82f6',accent:'#60a5fa'},
        'Salud y Ciencias Humanas':{from:'#7f1d1d',to:'#ef4444',accent:'#fca5a5'},
        'Ciencias Exactas':        {from:'#312e81',to:'#8b5cf6',accent:'#c4b5fd'},
        'Administración':          {from:'#14532d',to:'#22c55e',accent:'#86efac'},
        'Ciencias Sociales':       {from:'#7c2d12',to:'#f97316',accent:'#fdba74'},
        'Ciencias Básicas':        {from:'#164e63',to:'#06b6d4',accent:'#67e8f9'},
        'Artes y Diseño':          {from:'#4a044e',to:'#d946ef',accent:'#f0abfc'},
      };

      careersGridEl.innerHTML = recommendedCareers.map((c, idx) => {
        const offering = careerUniMap[c.career] || [];
        const count = offering.length;
        const col = AREA_COLORS[c.area] || {from:'#0f3460',to:'#00d4aa',accent:'#00d4aa'};

        // ICFES mínimo de ingreso a esta carrera (la más accesible del país)
        const icfesMin = count > 0 ? Math.min(...offering.map(u => u.icfes[c.career] || u.icfes.min)) : null;
        const icfesMax = count > 0 ? Math.max(...offering.map(u => u.icfes[c.career] || u.icfes.min)) : null;

        const localCount = offering.filter(u => u.isLocal).length;
        const localNote = localCount > 0 ? `<span class="crc-local-badge">📍 ${localCount} cerca</span>` : '';

        return `<div class="career-rec-card reveal" style="animation-delay:${idx*0.055}s;--crc-from:${col.from};--crc-to:${col.to};--crc-accent:${col.accent}" onclick="filterByCareer('${c.career.replace(/'/g,"\\'")}', ${idx})" data-career="${c.career.replace(/"/g,'&quot;')}" data-career-idx="${idx}">
          <div class="crc-glow"></div>
          <div class="crc-top">
            <span class="crc-rank">${idx+1}</span>
            <span class="crc-icon">${c.icon}</span>
            ${localNote}
          </div>
          <div class="crc-name">${c.career}</div>
          <div class="crc-area">${c.area}</div>
          ${icfesMin !== null ? `<div class="crc-icfes">
            <div class="crc-icfes-row"><span class="crc-icfes-lbl">ICFES mín.</span><span class="crc-icfes-val">${icfesMin}</span></div>
            <div class="crc-icfes-row"><span class="crc-icfes-lbl">ICFES máx.</span><span class="crc-icfes-val">${icfesMax}</span></div>
          </div>` : ''}
          <div class="crc-footer">
            <div class="crc-count-row">
              <span class="crc-count">${count}</span>
              <span class="crc-count-lbl">universidad${count===1?'':'es'}</span>
            </div>
            <div class="crc-cta">Ver →</div>
          </div>
        </div>`;
      }).join('');

      // Guardar el mapa para usarlo en el filtro sin recalcular
      window._careerUniMap = careerUniMap;

    } else {
      careersGridEl.innerHTML = `<div class="no-history" style="grid-column:1/-1"><div class="no-history-icon">🎯</div><div>No se identificaron carreras específicas, revisa tus áreas de aptitud arriba.</div></div>`;
    }
  }

  // Update local count badge
  const localCountEl = document.getElementById('localCount');
  if(localCountEl){
    const lc = unis.filter(u=>u.isLocal).length;
    localCountEl.textContent = lc > 0 ? `${lc}` : '';
  }
  const totalUniCountEl = document.getElementById('totalUniCount');
  if(totalUniCountEl){
    totalUniCountEl.textContent = `${UNIVERSITIES.length} instituciones`;
  }

  // Show skeleton first then replace with real content
  const unisGridEl = document.getElementById('unisGrid');
  unisGridEl.innerHTML = [1,2,3].map(()=>`
    <div class="skeleton-card">
      <div class="skeleton sk-line w80"></div>
      <div class="skeleton sk-line w60"></div>
      <div class="skeleton sk-line w40"></div>
    </div>`).join('');

  setTimeout(()=>{
    renderUnisGrid(unis);
    if(window._observeReveal) window._observeReveal();
  }, 600);

  window._lastResult = { score, areas, profile, recommendedCareers, allUnis: unis };
}

// ── Renderiza el grid de universidades, con filtro opcional por carrera ──
function renderUnisGrid(unis, careerFilterName){
  const unisGridEl = document.getElementById('unisGrid');
  if(!unisGridEl) return;

  const list = careerFilterName
    ? unis.filter(u => (u.matchedCareers||[]).some(mc => mc.career === careerFilterName)
                      || (u.careers||[]).includes(careerFilterName))
    : unis;

  if(!list.length){
    unisGridEl.innerHTML = `<div class="no-history" style="grid-column:1/-1">
      <div class="no-history-icon">🔍</div>
      <div>Ninguna de tus universidades recomendadas ofrece esta carrera todavía.</div>
      <small style="opacity:.6">Prueba explorando todas las universidades para esta carrera.</small>
    </div>`;
    return;
  }

  unisGridEl.innerHTML = list.map((u, idx) => {
    const lvl  = u.matchScore >= 70 ? 'high' : u.matchScore >= 50 ? 'mid' : 'low';
    const lbl  = u.matchScore >= 70 ? 'Alta compatibilidad' : u.matchScore >= 50 ? 'Buena opción' : 'A explorar';
    const localBadge = u.isLocal ? `<span class="local-badge">📍 Tu ciudad</span>` : '';

    // Si hay filtro activo, destacar solo esa carrera primero
    let matched = u.matchedCareers && u.matchedCareers.length ? u.matchedCareers : null;
    if (careerFilterName && matched) {
      matched = [...matched].sort((a,b) => (a.career===careerFilterName?-1:0) - (b.career===careerFilterName?-1:0));
    }

    let careersHtml = '';
    if (matched) {
      careersHtml = matched.map(mc => {
        const isFiltered = careerFilterName && mc.career === careerFilterName;
        return `<span class="career-tag career-tag-matched${isFiltered ? ' career-tag-highlight' : ''}" title="ICFES Saber 11 más reciente: ${mc.icfesScore}">📖 ${mc.career} <strong>${mc.icfesScore}+</strong></span>`;
      }).join('') + (u.careers.length > matched.length
        ? `<span class="career-tag career-tag-more">+${u.careers.length - matched.length} más</span>` : '');
    } else {
      careersHtml = (u.careers||[]).map(c => {
        const score = u.icfes && u.icfes[c] ? u.icfes[c] : (u.icfes ? u.icfes.min : null);
        return `<span class="career-tag">📖 ${c}${score ? ` <strong>${score}+</strong>` : ''}</span>`;
      }).join('');
    }

    let icfesHtml = '';
    if (careerFilterName && u.icfes && u.icfes[careerFilterName]) {
      icfesHtml = `<div class="uni-icfes"><span class="icfes-label">ICFES ${careerFilterName}</span><span class="icfes-val">${u.icfes[careerFilterName]}+</span></div>`;
    } else if (matched && matched.length) {
      const lowestNeeded = Math.min(...matched.map(m => m.icfesScore));
      icfesHtml = `<div class="uni-icfes"><span class="icfes-label">ICFES desde</span><span class="icfes-val">${lowestNeeded}+</span></div>`;
    } else if(u.icfes && u.icfes.min) {
      icfesHtml = `<div class="uni-icfes"><span class="icfes-label">ICFES mín.</span><span class="icfes-val">${u.icfes.min}+</span></div>`;
    }

    const href = u.url || '#';
    const campusUrl = UNI_CAMPUS[u.name];
    const bgIdx = idx % 8;
    const campusBanner = campusUrl
      ? `<img class="uni-campus-img" src="${campusUrl}" alt="${u.name}" loading="lazy" onerror="this.style.display='none'">`
      : `<div class="uni-campus-placeholder bg-${bgIdx}"><span class="campus-emoji">${u.icon}</span></div>`;
    const badgeInner = u.logo
      ? `<img src="${u.logo}" alt="" style="width:100%;height:100%;object-fit:contain;padding:4px;box-sizing:border-box" onerror="this.style.display='none';this.nextElementSibling.style.display='flex'"><span style="display:none;width:100%;height:100%;align-items:center;justify-content:center;font-size:26px;">${u.icon}</span>`
      : u.icon;

    return `<div class="rv4-uni-card ${u.isLocal ? 'uni-card-local' : ''} match-${lvl} reveal" style="animation-delay:${idx*0.06}s" onclick="window.open('${href}','_blank')" title="Visitar ${u.name}">
      <div class="rv4-uni-inner">
        ${campusBanner}
        <div class="rv4-uni-match-bar match-bar-${lvl}"></div>
        <div class="uni-header" style="padding:0 20px">
          <div class="rv4-uni-badge">${badgeInner}</div>
          <div style="flex:1;min-width:0">
            <div class="uni-name">${u.name} ${localBadge}</div>
            <div class="uni-city">📍 ${u.city}</div>
          </div>
          <div class="rv4-uni-pct match-pct-${lvl}">${u.matchScore}%</div>
        </div>
        <div class="rv4-uni-meta" style="padding:0 20px">
          <span class="match-badge match-${lvl}">${lbl}</span>
          ${icfesHtml}
        </div>
        <div class="uni-careers" style="padding:0 20px">${careersHtml}</div>
        <div class="rv4-uni-footer" style="padding:0 20px 16px">
          <span class="rv4-uni-cta">🌐 Explorar universidad →</span>
        </div>
      </div>
    </div>`;
  }).join('');
}

// Filtra el grid de universidades por una carrera específica recomendada
// Filtra por carrera usando el mapa precalculado — garantiza que el número mostrado == resultado
function filterByCareer(careerName, cardIdx) {
  const pool = window._careerUniMap?.[careerName] || [];

  // Marcar tarjeta activa
  document.querySelectorAll('.career-rec-card').forEach((card, i) => {
    card.classList.toggle('career-rec-active', i === cardIdx);
  });

  // Chip de filtro
  const chip = document.getElementById('careerFilterChip');
  const chipName = document.getElementById('careerFilterName');
  if (chip && chipName) {
    chip.style.display = 'inline-flex';
    chipName.textContent = careerName;
  }

  renderUnisGrid(pool, careerName);
  if (window._observeReveal) window._observeReveal();

  const section = document.getElementById('unisGrid');
  if (section) section.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// Alias para código anterior
function scrollToCareerUnis(careerName) { filterByCareer(careerName, -1); }

// Quita el filtro y muestra todas las universidades recomendadas de nuevo
function clearCareerFilter() {
  const allUnis = window._lastResult?.allUnis || [];
  document.querySelectorAll('.career-rec-card').forEach(card => card.classList.remove('career-rec-active'));
  const chip = document.getElementById('careerFilterChip');
  if (chip) chip.style.display = 'none';
  renderUnisGrid(allUnis);
  if (window._observeReveal) window._observeReveal();
}

// ══════════════════════════════════════════════════════════════
// EXPLORADOR DE UNIVERSIDADES — OrientaU v40
// ══════════════════════════════════════════════════════════════

const EXP_STATE = {
  city: '', tipo: 'all', area: '', career: '',
  skills: [], icfes: 280, priority: '',
  results: []
};

const EXP_AREAS = [
  {icon:'⚗️', name:'Ingeniería', key:'Ingeniería'},
  {icon:'🏥', name:'Salud', key:'Salud y Ciencias Humanas'},
  {icon:'💰', name:'Administración', key:'Administración'},
  {icon:'⚖️', name:'Ciencias Sociales', key:'Ciencias Sociales'},
  {icon:'🎨', name:'Artes y Diseño', key:'Artes y Diseño'},
  {icon:'🔬', name:'Ciencias Básicas', key:'Ciencias Básicas'},
  {icon:'📐', name:'Ciencias Exactas', key:'Ciencias Exactas'},
];

const EXP_CITIES = ['Bogotá','Medellín','Cali','Barranquilla','Bucaramanga',
  'Cúcuta','Manizales','Pereira','Cartagena','Santa Marta','Ibagué','Pasto',
  'Villavicencio','Tunja','Armenia','Montería','Neiva','Valledupar',
  'Popayán','Sincelejo','Riohacha','Quibdó','Florencia','Mocoa',
  'Palmira','Envigado','Bello','Sabaneta','Caldas','Rionegro',
  'Soledad','Buenaventura','Barrancabermeja','Ocaña','Pamplona',
  'Villa del Rosario','Cartago','Roldanillo','Buga','Fresno','San Andrés'];

const EXP_PUBLIC = new Set([
  // Universidades públicas
  'Universidad Nacional de Colombia','U. Distrital F. J. de Caldas','U. Pedagógica Nacional',
  'Universidad de Antioquia','ITM – Inst. Tecnológico Metro.','Tecnológico de Antioquia',
  'Politécnico Colombiano J.I.C.','Institución Universitaria de Envigado',
  'Universidad del Valle','Escuela Nacional del Deporte','U. del Pacífico',
  'Universidad del Atlántico','U. de La Guajira','U. Popular del Cesar',
  'U. Industrial de Santander','Unidades Tecnológicas de Santander','UNIPAZ',
  'U. de San Gil UNISANGIL','U. Francisco de Paula Santander','Universidad de Pamplona',
  'UFPS Ocaña','ISER Pamplona','U. Tecnológica de Pereira','Universidad de Caldas',
  'Universidad del Quindío','Universidad de Cartagena','U. Colegio Mayor de Cundinamarca',
  'U. Pedagógica y Tecnológica (UPTC)','Universidad de Córdoba',
  'Universidad del Cauca','Universidad de Nariño','U. Surcolombiana',
  'Universidad del Tolima','U. de los Llanos','Universidad del Magdalena',
  'Universidad de Sucre','Universidad de la Amazonia','U. Tecnológica del Chocó',
  'Unitrópico','U. de Cundinamarca','UNAD',
  'Universidad Militar Nueva Granada',
  'Escuela Naval de Cadetes Almirante Padilla',
  'U. Autónoma Indígena Intercultural (UAIIN)',
  'U. Surcolombiana Ext. Neiva',
  // Nuevas públicas v44
  'Universidad Nacional Sede Medellín','Universidad Nacional Sede Manizales',
  'Universidad Nacional Sede Palmira',
  'Escuela Tecnológica Inst. Técnico Central',
  'Inst. Univ. Antonio José Camacho',
  'Instituto Tecnológico de Soledad (ITSA)',
  'Instituto Tecnológico del Putumayo',
  'Inst. Univ. San Andrés (IUSAI)',
  'Instituto Técnico Agrícola (ITA)',
  'Instituto Técnico Profesional de Roldanillo',
  'U. Pascual Bravo (Inst. Univ.)',
  'SENA',
]);

function openExplorer(){
  expRestart();
  // Poblar datalist de carreras reales (una sola vez)
  const dl = document.getElementById('careerDatalist');
  if (dl && !dl.dataset.filled) {
    dl.innerHTML = Object.keys(CAREER_CATALOG).sort().map(c => `<option value="${c}">`).join('');
    dl.dataset.filled = '1';
  }
  showScreen('screenExplorer');
}

function expRestart(){
  // Reset state
  EXP_STATE.city     = '';
  EXP_STATE.tipo     = 'all';
  EXP_STATE.area     = '';
  EXP_STATE.career   = '';
  EXP_STATE.skills   = [];
  EXP_STATE.icfes    = 280;
  EXP_STATE.priority = '';
  EXP_STATE.results  = [];

  // Stop any running 3D animation
  if (_3dRaf) { cancelAnimationFrame(_3dRaf); _3dRaf = null; }

  // Reset UI selections
  setTimeout(function() {
    document.querySelectorAll('.exp-city-btn, .exp-area-btn, .exp-chip').forEach(function(b) {
      b.classList.remove('selected');
    });
    document.querySelectorAll('.exp-tipo-btn').forEach(function(b) {
      b.classList.remove('active');
    });
    var allBtn = document.querySelector('.exp-tipo-btn[data-tipo="all"]');
    if (allBtn) allBtn.classList.add('active');

    var inp = document.getElementById('expCityInput');
    if (inp) inp.value = '';
    var ci = document.getElementById('expCareerInput');
    if (ci) ci.value = '';
    var sl = document.getElementById('expIcfesSlider');
    if (sl) {
      sl.value = 280;
      var valEl = document.getElementById('expIcfesVal');
      if (valEl) valEl.textContent = '280';
    }

    // Reset AI card and results
    var aiCard = document.getElementById('expAiCard');
    if (aiCard) aiCard.style.display = 'none';
    var grid = document.getElementById('expResultsGrid');
    if (grid) grid.innerHTML = '';
    var sec3d = document.getElementById('exp3dSection');
    if (sec3d) sec3d.style.display = 'none';

    expInitUI();
    expGoToStep(1);
  }, 50);
}

function expInitUI(){
  // Build cities grid
  const cg = document.getElementById('expCitiesGrid');
  if(cg && !cg.dataset.built){
    cg.dataset.built = '1';
    cg.innerHTML = EXP_CITIES.map(c =>
      `<button class="exp-city-btn" onclick="selectExpCity('${c}',this)">${c}</button>`
    ).join('');
  }
  // Build areas grid
  const ag = document.getElementById('expAreasGrid');
  if(ag && !ag.dataset.built){
    ag.dataset.built = '1';
    ag.innerHTML = EXP_AREAS.map(a =>
      `<button class="exp-area-btn" data-area="${a.key}" onclick="selectExpArea('${a.key}',this)">
        <span class="exp-area-icon">${a.icon}</span>
        <span class="exp-area-name">${a.name}</span>
      </button>`
    ).join('');
  }
  // Chip click handlers
  document.querySelectorAll('#expSkillsChips .exp-chip, #expPriorityChips .exp-chip').forEach(chip => {
    chip.onclick = function(){
      const group = this.closest('.exp-q-chips');
      const isMulti = group.id === 'expSkillsChips';
      if(isMulti){
        this.classList.toggle('selected');
      } else {
        group.querySelectorAll('.exp-chip').forEach(c => c.classList.remove('selected'));
        this.classList.add('selected');
      }
    };
  });
}

function selectExpCity(city, btn){
  EXP_STATE.city = city;
  document.querySelectorAll('.exp-city-btn').forEach(b => b.classList.remove('selected'));
  btn.classList.add('selected');
  document.getElementById('expCityInput').value = city;
}

function selectExpArea(area, btn){
  EXP_STATE.area = area;
  document.querySelectorAll('.exp-area-btn').forEach(b => b.classList.remove('selected'));
  btn.classList.add('selected');
}

function selectTipo(btn, tipo){
  EXP_STATE.tipo = tipo;
  document.querySelectorAll('.exp-tipo-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
}

function expNext(fromStep){
  if(fromStep === 1){
    const cityVal = document.getElementById('expCityInput').value.trim();
    if(cityVal) EXP_STATE.city = cityVal;
    expGoToStep(2);
  } else if(fromStep === 2){
    const careerVal = document.getElementById('expCareerInput').value.trim();
    if(careerVal) EXP_STATE.career = careerVal;
    const selArea = document.querySelector('.exp-area-btn.selected');
    if(selArea) EXP_STATE.area = selArea.dataset.area;
    expGoToStep(3);
  }
}

function expBack(fromStep){
  expGoToStep(fromStep - 1);
}

function expGoToStep(step){
  document.querySelectorAll('.exp-step-panel').forEach(p => p.classList.remove('active'));
  document.getElementById(`expPanel${step}`).classList.add('active');
  document.querySelectorAll('.exp-step').forEach(s => {
    const n = parseInt(s.dataset.step);
    s.classList.toggle('active', n === step);
    s.classList.toggle('done', n < step);
  });
  window.scrollTo({top: 0, behavior:'smooth'});
}

async function expAnalyze(){
  // Collect step 3 data
  EXP_STATE.icfes = parseInt(document.getElementById('expIcfesSlider').value);
  EXP_STATE.skills = [...document.querySelectorAll('#expSkillsChips .exp-chip.selected')].map(c => c.dataset.val);
  const prioEl = document.querySelector('#expPriorityChips .exp-chip.selected');
  EXP_STATE.priority = prioEl ? prioEl.dataset.val : '';

  expGoToStep(4);

  // Show loading in results area
  document.getElementById('expResultsGrid').innerHTML = `
    <div class="exp-loading">
      <div class="exp-loading-spinner"></div>
      <div class="exp-loading-text">🤖 La IA está analizando tu perfil...</div>
    </div>`;
  document.getElementById('exp3dSection').style.display = 'none';

  // Match universities
  const userCity = EXP_STATE.city;
  const scored = UNIVERSITIES.map(u => {
    let score = 0;
    const tipo = EXP_PUBLIC.has(u.name) ? 'publica' : 'privada';
    if(EXP_STATE.tipo !== 'all' && tipo !== EXP_STATE.tipo) return null;

    // ICFES filter
    if(u.icfes && u.icfes.min && EXP_STATE.icfes < u.icfes.min - 30) return null;

    // Area match
    if(EXP_STATE.area && u.areas.includes(EXP_STATE.area)) score += 25;

    // Career match
    const careerQ = (EXP_STATE.career || '').toLowerCase();
    let matchedCareerName = null;
    if(careerQ){
      matchedCareerName = (u.careers||[]).find(c => c.toLowerCase().includes(careerQ));
      const icfesCareerMatch = Object.keys(u.icfes||{}).some(k => k.toLowerCase().includes(careerQ));
      if(matchedCareerName || icfesCareerMatch) score += 30;
    }

    // ICFES compatibility — usa el puntaje de la carrera específica si está disponible
    const relevantIcfes = matchedCareerName && u.icfes && u.icfes[matchedCareerName]
      ? u.icfes[matchedCareerName]
      : (u.icfes ? u.icfes.min : null);
    if(relevantIcfes){
      const diff = EXP_STATE.icfes - relevantIcfes;
      if(diff >= 30) score += 20;
      else if(diff >= 0) score += 12;
      else score += 3;
    }

    // Locality bonus
    const local = isLocalUni(u.city, u.region||'', userCity);
    if(local){ score += 22; u._exp_local = true; }

    // Skills match
    const skillMap = {
      'números':['Ciencias Exactas','Ingeniería'],
      'comunicacion':['Ciencias Sociales','Artes y Diseño'],
      'arte':['Artes y Diseño'],
      'ciencias':['Ciencias Básicas','Salud y Ciencias Humanas'],
      'tecnologia':['Ingeniería','Ciencias Exactas'],
      'personas':['Salud y Ciencias Humanas','Ciencias Sociales'],
      'negocios':['Administración'],
      'naturaleza':['Ciencias Básicas','Ingeniería'],
    };
    EXP_STATE.skills.forEach(skill => {
      const areas = skillMap[skill] || [];
      if(u.areas.some(a => areas.includes(a))) score += 8;
    });

    // Priority boost
    if(EXP_STATE.priority === 'costo' && tipo === 'publica') score += 15;
    if(EXP_STATE.priority === 'ubicacion' && local) score += 15;
    if(EXP_STATE.priority === 'calidad' && u.icfes && u.icfes.min >= 280) score += 10;
    if(EXP_STATE.priority === 'investigacion' && u.icfes && u.icfes.min >= 275) score += 12;

    return { ...u, _exp_score: score, _exp_local: !!local, _exp_tipo: tipo };
  }).filter(Boolean).sort((a,b) => {
    if(a._exp_local && !b._exp_local) return -1;
    if(!a._exp_local && b._exp_local) return 1;
    return b._exp_score - a._exp_score;
  }).slice(0, 20);

  EXP_STATE.results = scored;

  // Resumen generado con plantillas locales, sin IA — usa lo que ya se calculó arriba
  const topCarreraExp = EXP_STATE.career || (scored[0]?.matchedCareers?.[0]?.career) || (scored[0]?.careers?.[0]) || 'Tu carrera de interés';
  const aiText = {
    summary: `Tu perfil combina interés en ${EXP_STATE.career||EXP_STATE.area||'múltiples áreas'} con un ICFES de ${EXP_STATE.icfes} puntos. Encontramos ${scored.length} universidades compatibles con tu perfil en Colombia.`,
    top_carrera: topCarreraExp,
    razon: 'Corresponde a tus habilidades y perfil vocacional indicado.',
    consejo: 'Consulta los requisitos de admisión directamente en la web de cada universidad.'
  };

  renderExpResults(scored, aiText);
}

// Costo de matrícula: NO tenemos el valor exacto en pesos por programa (varía cada
// semestre y por carrera), así que en vez de inventar cifras mostramos un nivel
// aproximado + un link directo a la página de admisiones para el valor real.
// Públicas: casi siempre cobran matrícula por estrato socioeconómico (SPP), muy accesible.
// Privadas: usamos el ICFES mínimo como proxy de qué tan selectiva/costosa suele ser.
function estimateCostTier(u, tipo){
  if(tipo === 'publica'){
    return { dots: 1, label: 'Accesible', note: 'Matrícula según estrato (SPP)' };
  }
  const min = (u.icfes && u.icfes.min) ? u.icfes.min : 0;
  if(min >= 370) return { dots: 4, label: 'Alto', note: 'Privada de alta selectividad' };
  if(min >= 300) return { dots: 3, label: 'Medio-alto', note: 'Privada reconocida' };
  if(min >= 250) return { dots: 2, label: 'Medio', note: 'Privada de rango medio' };
  return { dots: 1, label: 'Accesible', note: 'Privada de menor costo relativo' };
}

function renderExpResults(unis, ai){
  // AI card
  const aiCard = document.getElementById('expAiCard');
  aiCard.style.display = 'block';
  const aiEl = document.getElementById('expAiText');
  if(typeof ai === 'object' && ai.summary){
    aiEl.innerHTML = `
      <div class="exp-ai-block">
        <div class="exp-ai-row"><span class="exp-ai-key">📋 Perfil:</span> ${ai.summary}</div>
        <div class="exp-ai-row"><span class="exp-ai-key">🎯 Carrera top:</span> <strong>${ai.top_carrera}</strong> — ${ai.razon}</div>
        <div class="exp-ai-row"><span class="exp-ai-key">💡 Consejo:</span> ${ai.consejo}</div>
      </div>`;
  } else {
    aiEl.textContent = typeof ai === 'string' ? ai : 'Análisis disponible';
  }

  // Results grid
  const grid = document.getElementById('expResultsGrid');
  if(!unis.length){
    grid.innerHTML = `<div class="exp-no-results">😕 No encontramos universidades con esos filtros. Intenta ampliar tu búsqueda.</div>`;
    return;
  }

  grid.innerHTML = unis.map((u, i) => {
    const isLocal = u._exp_local;
    const tipo = u._exp_tipo === 'publica' ? '🏛️ Pública' : '🏢 Privada';
    const tipoColor = u._exp_tipo === 'publica' ? '#4ade80' : '#60a5fa';
    const localBadge = isLocal ? '<span class="exp-local-badge">📍 Tu región</span>' : '';

    // Si hay una carrera específica buscada, usar SU puntaje ICFES en vez del genérico
    const careerQ = (EXP_STATE.career || '').toLowerCase();
    const matchedCareerKey = careerQ
      ? Object.keys(u.icfes||{}).find(k => k !== 'min' && k.toLowerCase().includes(careerQ))
      : null;
    const icfesMin = matchedCareerKey
      ? u.icfes[matchedCareerKey]
      : ((u.icfes && u.icfes.min) ? u.icfes.min : '—');
    const icfesLabel = matchedCareerKey ? `ICFES · ${matchedCareerKey}` : 'ICFES mín.';

    const careers = (u.careers||[]).slice(0,4);
    const extraCareers = (u.careers||[]).length > 4 ? (u.careers.length - 4) : 0;
    const cost = estimateCostTier(u, u._exp_tipo);
    const icfesPrograms = Object.entries(u.icfes||{}).filter(([k])=>k!=='min').slice(0,3);
    const matchPct = Math.min(99, Math.round((u._exp_score/100)*100));
    const progsHtml = icfesPrograms.map(([p,s]) => {
      const isMatched = matchedCareerKey === p;
      return `<span class="exp-uni-prog${isMatched ? ' exp-uni-prog-highlight' : ''}">${p}: <strong>${s}</strong></span>`;
    }).join('');
    const careersHtml2 = careers.map(c => '<span class="exp-career-chip">📖 '+c+'</span>').join('')
      + (extraCareers > 0 ? `<span class="exp-career-chip exp-career-chip-more">+${extraCareers} más</span>` : '');
    const bgGradient = isLocal ? 'rgba(79,142,247,0.15)' : 'rgba(255,255,255,0.03)';
    const ringCls = isLocal ? 'ring-local' : 'ring-normal';

    return `
      <div class="exp-uni-card ${isLocal ? 'exp-card-local' : ''}" style="animation-delay:${i*0.07}s">
        <div class="exp-uni-card-top" style="background:linear-gradient(135deg,${bgGradient} 0%,transparent 100%)">
          <div class="exp-uni-rank">#${i+1}</div>
          <div class="exp-uni-icon-wrap">
            <span class="exp-uni-icon">${u.icon}</span>
          </div>
          <div class="exp-uni-main">
            <div class="exp-uni-name">${u.name} ${localBadge}</div>
            <div class="exp-uni-city">📍 ${u.city}</div>
            <div class="exp-uni-tipo" style="color:${tipoColor}">${tipo}</div>
          </div>
          <div class="exp-uni-score-wrap">
            <div class="exp-uni-score-ring ${ringCls}">
              <span class="exp-uni-score-val">${matchPct}%</span>
            </div>
            <div class="exp-uni-score-lbl">match</div>
          </div>
        </div>
        <div class="exp-uni-card-body">
          <div class="exp-uni-icfes-row">
            <span class="exp-uni-icfes-label">${icfesLabel}</span>
            <span class="exp-uni-icfes-val">${icfesMin} pts</span>
            ${progsHtml}
          </div>
          <div class="exp-uni-cost-row">
            <span class="exp-uni-cost-label">💲 Costo estimado</span>
            <span class="exp-uni-cost-dots">${'●'.repeat(cost.dots)}${'○'.repeat(4-cost.dots)}</span>
            <span class="exp-uni-cost-tag">${cost.label}</span>
          </div>
          <div class="exp-uni-cost-note">${cost.note} · <a href="${u.url||'#'}" target="_blank" rel="noopener">valor exacto en la web ↗</a></div>
          <div class="exp-uni-careers">
            ${careersHtml2}
          </div>
        </div>
        <div class="exp-uni-card-footer">
          <button class="exp-uni-btn-3d" onclick="expShow3DByIdx(${i})">🚶 Ver Street View</button>
          <a class="exp-uni-btn-visit" href="${u.url||'#'}" target="_blank">🌐 Visitar web →</a>
        </div>
      </div>`;
  }).join('');

  // Show 3D section with first local or first result
  const highlight = unis.find(u => u._exp_local) || unis[0];
  if(highlight) expShow3D(highlight.name);

  if(window._observeReveal) window._observeReveal();
}

// ══ 3D University Viewer ═══════════════════════════════════════

// ══════════════════════════════════════════════════════════════
// MOTOR 3D REALISTA — OrientaU v41
// Renderizado isométrico con geometría verdadera, sombras,
// materiales, árboles, iluminación dinámica y animaciones
// ══════════════════════════════════════════════════════════════

let _3dCanvas, _3dCtx,
    _3dAngle = 0.4, _3dTargetAngle = 0.4,
    _3dZoom = 1, _3dTargetZoom = 1,
    _3dDragging = false, _3dLastX = 0, _3dLastY = 0,
    _3dRaf = null, _3dCurrentUni = null,
    _3dElevation = 0.42, _3dT = 0,
    _3dOffX = 0, _3dOffY = 0;

// ── Universidad → tipo de edificio ────────────────────────────
function getUniArchetype(uni) {
  if (!uni) return 'modern';
  const name = uni.name || '';
  const isPub = EXP_PUBLIC.has(name);
  const icfes = (uni.icfes && uni.icfes.min) ? uni.icfes.min : 200;

  if (name.includes('Nacional') || name.includes('Andes') || name.includes('Javeriana'))
    return 'classic_grand';
  if (name.includes('EAFIT') || name.includes('Sabana') || name.includes('Externado'))
    return 'campus_modern';
  if (name.includes('Distrital') || name.includes('Pedagógica') || name.includes('Surcolombiana'))
    return 'institutional';
  if (name.includes('Tecnológico') || name.includes('ITM') || name.includes('Politécnico') || name.includes('Sena'))
    return 'tech_campus';
  if (name.includes('Médico') || name.includes('Ciencias de la Salud') || name.includes('El Bosque'))
    return 'medical';
  if (isPub && icfes >= 270) return 'classic_grand';
  if (isPub) return 'institutional';
  if (icfes >= 280) return 'campus_modern';
  return 'modern';
}

// ── Color palettes por arquetipo ───────────────────────────────
const ARCH_PALETTE = {
  classic_grand:  { wall:'#c8b89a', wallD:'#a8987a', wallS:'#e8d8ba', roof:'#8b6914', roofD:'#6b4904', accent:'#fbbf24', glass:'rgba(135,195,255,0.8)', trim:'#d4a853', stone:'#b8a888', colPillar:'#ddd0b8' },
  campus_modern:  { wall:'#e8e4dc', wallD:'#c8c4bc', wallS:'#f8f4ec', roof:'#3a3a4a', roofD:'#2a2a3a', accent:'#60a5fa', glass:'rgba(160,210,255,0.85)', trim:'#94a3b8', stone:'#d0ccc4', colPillar:'#e8e4dc' },
  institutional:  { wall:'#d4c9b0', wallD:'#b4a990', wallS:'#e4d9c0', roof:'#5c4a2a', roofD:'#3c2a0a', accent:'#4ade80', glass:'rgba(120,190,240,0.75)', trim:'#8b7355', stone:'#c4b898', colPillar:'#d4c9b0' },
  tech_campus:    { wall:'#9aa5b4', wallD:'#7a8594', wallS:'#bac5d4', roof:'#1e293b', roofD:'#0e1929', accent:'#38bdf8', glass:'rgba(100,200,255,0.9)', trim:'#64748b', stone:'#8a95a4', colPillar:'#aab5c4' },
  medical:        { wall:'#f0ece8', wallD:'#d0ccc8', wallS:'#ffffff', roof:'#1a5fa0', roofD:'#0a3f80', accent:'#38bdf8', glass:'rgba(180,225,255,0.88)', trim:'#3b82f6', stone:'#e0dcd8', colPillar:'#f0ece8' },
  modern:         { wall:'#b8c0cc', wallD:'#98a0ac', wallS:'#d8e0ec', roof:'#2d3748', roofD:'#1d2738', accent:'#a855f7', glass:'rgba(150,190,255,0.82)', trim:'#7c8fa0', stone:'#a8b0bc', colPillar:'#c8d0dc' },
};

// ── Projection engine ─────────────────────────────────────────
function make3DContext(canvas, angle, zoom, elev, offX, offY) {
  const W = canvas.width, H = canvas.height;
  const cx = W / 2 + offX, cy = H * 0.56 + offY;
  const s = zoom * (W < 500 ? 105 : 130);
  const cosA = Math.cos(angle), sinA = Math.sin(angle);

  const proj = (x, y, z) => {
    const rx = x * cosA - z * sinA;
    const rz = x * sinA + z * cosA;
    const ry = y - rz * elev;
    return { x: cx + rx * s, y: cy + ry * s };
  };

  // Normal vector in screen space (for back-face culling)
  const visible = (nx, nz) => {
    const rnx = nx * cosA - nz * sinA;
    const rnz = nx * sinA + nz * cosA;
    return rnx * 0 + rnz * (-1) > -0.1;
  };

  return { proj, visible, cx, cy, s, W, H };
}

// ── Drawing helpers ────────────────────────────────────────────
function drawFace(ctx, pts, fill, strokeCol, lineW) {
  ctx.beginPath();
  ctx.moveTo(pts[0].x, pts[0].y);
  for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i].x, pts[i].y);
  ctx.closePath();
  if (fill) { ctx.fillStyle = fill; ctx.fill(); }
  if (strokeCol) { ctx.strokeStyle = strokeCol; ctx.lineWidth = lineW || 0.8; ctx.stroke(); }
}

function drawBox(ctx, proj, x, y, z, w, h, d, pal, opts) {
  opts = opts || {};
  const p = (dx, dy, dz) => proj(x + dx, y + dy, z + dz);

  // Faces: back-face culling via angle heuristic
  const angle = Math.atan2(
    proj(1,0,0).y - proj(0,0,0).y,
    proj(1,0,0).x - proj(0,0,0).x
  );

  const faceFront  = [p(0,0,d),  p(w,0,d),  p(w,-h,d), p(0,-h,d)];
  const faceRight  = [p(w,0,d),  p(w,0,0),  p(w,-h,0), p(w,-h,d)];
  const faceLeft   = [p(0,0,d),  p(0,0,0),  p(0,-h,0), p(0,-h,d)];
  const faceTop    = [p(0,-h,d), p(w,-h,d), p(w,-h,0), p(0,-h,0)];
  const faceBack   = [p(0,0,0),  p(w,0,0),  p(w,-h,0), p(0,-h,0)];

  const edge = opts.edge || 'rgba(0,0,0,0.18)';
  const lw   = opts.lineW || 0.7;

  // Always draw top
  drawFace(ctx, faceTop, pal.roofD || pal.wallD, edge, lw);

  // Determine which sides face the camera
  const showFront = true; // simplified: always show front
  const showRight = true;

  if (showFront) drawFace(ctx, faceFront, opts.front || pal.wall, edge, lw);
  if (showRight) drawFace(ctx, faceRight, opts.side  || pal.wallD, edge, lw);
}

// ── Scene renderers por arquetipo ──────────────────────────────

function renderClassicGrand(ctx, P, pal, t) {
  const { proj } = P;

  // ── Ground / plaza ──────────────────────────────────────────
  drawGround(ctx, P, pal);
  drawPathwork(ctx, P, pal, t);

  // ── Main building body ──────────────────────────────────────
  // Wide stepped base (podium)
  drawBox(ctx, proj, -2.2, 0, -0.6, 4.4, 0.18, 1.2, { wall:'#ddd0b8', wallD:'#bdb098', roofD:'#ccc0a8' });

  // Central tower body
  drawBox(ctx, proj, -1.5, -0.18, -0.5, 3.0, 2.0, 1.0, pal);

  // Upper central tower
  drawBox(ctx, proj, -0.8, -2.18, -0.35, 1.6, 0.9, 0.7, {
    wall: pal.wallS, wallD: pal.wall, roofD: pal.roof
  });

  // Flanking wings
  drawBox(ctx, proj, -2.4, -0.18, -0.4, 0.85, 1.4, 0.8, {
    wall: pal.wall, wallD: pal.wallD, roofD: pal.roofD
  });
  drawBox(ctx, proj, 1.55, -0.18, -0.4, 0.85, 1.4, 0.8, {
    wall: pal.wall, wallD: pal.wallD, roofD: pal.roofD
  });

  // ── Classic columns ─────────────────────────────────────────
  const colXs = [-1.2, -0.7, -0.2, 0.3, 0.8, 1.3];
  colXs.forEach(cx => {
    drawBox(ctx, proj, cx, -0.18, 0.48, 0.12, 1.8, 0.12, {
      wall: pal.colPillar, wallD: '#c8c0b0', roofD: '#a8a090',
      edge:'rgba(0,0,0,0.12)', lineW: 0.5
    });
    // Capital
    drawBox(ctx, proj, cx - 0.04, -1.98, 0.46, 0.2, 0.06, 0.16, {
      wall: pal.colPillar, wallD: '#d0c8b8', roofD: '#b8b0a0'
    });
  });

  // ── Triangular pediment ─────────────────────────────────────
  drawPediment(ctx, proj, -1.4, -1.98, -0.01, 2.8, 0.55, 1.0, pal);

  // ── Dome ────────────────────────────────────────────────────
  drawDome(ctx, P, -0.06, -3.08 + Math.sin(t * 0.4) * 0.003, 0.1, 0.72, pal, t);

  // ── Windows ─────────────────────────────────────────────────
  drawWindowGrid(ctx, proj, -1.45, -0.25, 0.52, 2.9, 1.75, 5, 3, pal, t);
  drawWindowGrid(ctx, proj, -2.38, -0.25, 0.42, 0.8, 1.35, 2, 2, pal, t);
  drawWindowGrid(ctx, proj, 1.57, -0.25, 0.42, 0.8, 1.35, 2, 2, pal, t);
  drawWindowGrid(ctx, proj, -0.78, -2.22, 0.37, 1.55, 0.85, 3, 1, pal, t);

  // ── Entrance door ────────────────────────────────────────────
  drawArchwayDoor(ctx, proj, -0.22, 0, 0.5, 0.45, 0.5, pal);

  // ── Trees ───────────────────────────────────────────────────
  drawTree(ctx, P, -2.8, 0, -1.8, 0.18, pal, t, 0);
  drawTree(ctx, P,  2.8, 0, -1.8, 0.22, pal, t, 1);
  drawTree(ctx, P, -3.2, 0,  0.5, 0.15, pal, t, 2);
  drawTree(ctx, P,  3.2, 0,  0.5, 0.15, pal, t, 3);

  // ── Lamposts ─────────────────────────────────────────────────
  drawLampost(ctx, P, -1.8, 0, 1.8, pal, t);
  drawLampost(ctx, P,  1.8, 0, 1.8, pal, t);

  // ── Flags ────────────────────────────────────────────────────
  drawFlag(ctx, proj, -1.55, -3.65, 0.1, pal, t);
  drawFlag(ctx, proj,  1.32, -3.65, 0.1, pal, t);
}

function renderCampusModern(ctx, P, pal, t) {
  const { proj } = P;

  drawGround(ctx, P, pal);
  drawPathwork(ctx, P, pal, t);

  // ── Main tower (glass + concrete) ───────────────────────────
  // Core concrete shaft
  drawBox(ctx, proj, -0.9, 0, -0.45, 1.8, 2.8, 0.9, pal);

  // Glass curtain wall strips
  for (let f = 0; f < 7; f++) {
    const fy = -0.08 - f * 0.38;
    drawBox(ctx, proj, -0.88, fy, 0.43, 1.76, 0.28, 0.04, {
      wall: pal.glass, wallD: 'rgba(80,160,220,0.6)', roofD: 'rgba(60,140,200,0.5)',
      edge: 'rgba(100,180,255,0.3)'
    });
  }

  // ── Low annexes ──────────────────────────────────────────────
  drawBox(ctx, proj, -2.6, 0, -0.3, 1.5, 0.9, 0.7, {
    wall: pal.wallS, wallD: pal.wall, roofD: pal.roof
  });
  drawBox(ctx, proj, 1.1, 0, -0.3, 1.5, 0.9, 0.7, {
    wall: pal.wallS, wallD: pal.wall, roofD: pal.roof
  });

  // Flat roofs with railing
  drawBox(ctx, proj, -2.6, -0.9, -0.3, 1.5, 0.06, 0.7, {
    wall: '#c8d0dc', wallD: '#a8b0bc', roofD: pal.roofD
  });
  drawBox(ctx, proj, 1.1, -0.9, -0.3, 1.5, 0.06, 0.7, {
    wall: '#c8d0dc', wallD: '#a8b0bc', roofD: pal.roofD
  });

  // ── Entrance canopy ──────────────────────────────────────────
  drawBox(ctx, proj, -0.55, -0.02, 0.42, 1.1, 0.04, 0.5, {
    wall: 'rgba(180,210,240,0.6)', wallD: 'rgba(140,180,210,0.4)',
    roofD: 'rgba(120,160,200,0.5)', edge: 'rgba(100,170,220,0.5)'
  });

  // ── Windows/glass facade ─────────────────────────────────────
  drawWindowGrid(ctx, proj, -0.88, -0.08, 0.45, 1.76, 2.72, 4, 7, pal, t);

  // ── Sculpture / plaza element ────────────────────────────────
  drawSculpture(ctx, P, 0, 0, 1.5, pal, t);

  // ── Trees ────────────────────────────────────────────────────
  drawTree(ctx, P, -2.2, 0, 1.4, 0.2, pal, t, 0);
  drawTree(ctx, P,  2.2, 0, 1.4, 0.2, pal, t, 1);
  drawTree(ctx, P, -3.5, 0, -0.5, 0.16, pal, t, 4);
  drawTree(ctx, P,  3.5, 0, -0.5, 0.16, pal, t, 5);

  drawLampost(ctx, P, -1.5, 0, 1.6, pal, t);
  drawLampost(ctx, P,  1.5, 0, 1.6, pal, t);
}

function renderInstitutional(ctx, P, pal, t) {
  const { proj } = P;

  drawGround(ctx, P, pal);
  drawPathwork(ctx, P, pal, t);

  // ── U-shaped campus layout ───────────────────────────────────
  // Left wing
  drawBox(ctx, proj, -2.8, 0, -0.8, 1.1, 1.6, 1.0, pal);
  // Right wing
  drawBox(ctx, proj,  1.7, 0, -0.8, 1.1, 1.6, 1.0, pal);
  // Back connector
  drawBox(ctx, proj, -1.7, 0, -0.82, 3.4, 1.3, 0.22, {
    wall: pal.wallD, wallD: pal.wallS, roofD: pal.roofD
  });

  // ── Central main block ───────────────────────────────────────
  drawBox(ctx, proj, -1.55, 0, -0.62, 3.1, 2.0, 0.85, pal);

  // ── Central clock tower ──────────────────────────────────────
  drawBox(ctx, proj, -0.32, -2.0, -0.3, 0.65, 1.1, 0.62, {
    wall: pal.wallS, wallD: pal.wall, roofD: pal.roofD
  });
  // Bell tower cap
  drawPyramid(ctx, proj, -0.35, -3.1, -0.28, 0.72, 0.65, 0.67, pal);

  // ── Windows ─────────────────────────────────────────────────
  drawWindowGrid(ctx, proj, -1.52, -0.2, 0.87, 3.04, 1.78, 5, 3, pal, t);
  drawWindowGrid(ctx, proj, -2.78, -0.2, 0.22, 1.06, 1.55, 2, 3, pal, t);
  drawWindowGrid(ctx, proj,  1.72, -0.2, 0.22, 1.06, 1.55, 2, 3, pal, t);

  // ── Arch entrance ────────────────────────────────────────────
  drawArchwayDoor(ctx, proj, -0.26, 0, 0.87, 0.52, 0.62, pal);

  // ── Courtyard fountain ───────────────────────────────────────
  drawFountain(ctx, P, 0, 0, 1.2, pal, t);

  drawTree(ctx, P, -2.2, 0, 1.5, 0.19, pal, t, 2);
  drawTree(ctx, P,  2.2, 0, 1.5, 0.19, pal, t, 3);
  drawLampost(ctx, P, -1.2, 0, 1.8, pal, t);
  drawLampost(ctx, P,  1.2, 0, 1.8, pal, t);
}

function renderTechCampus(ctx, P, pal, t) {
  const { proj } = P;

  drawGround(ctx, P, pal);
  drawPathwork(ctx, P, pal, t);

  // ── Industrial-modern main block ─────────────────────────────
  drawBox(ctx, proj, -1.6, 0, -0.5, 3.2, 2.2, 1.0, pal);

  // ── Exposed structure stripes (horizontal bands) ─────────────
  for (let b = 0; b < 5; b++) {
    const by = -0.1 - b * 0.42;
    drawBox(ctx, proj, -1.6, by, 0.48, 3.2, 0.06, 0.06, {
      wall: pal.accent + 'cc', wallD: pal.accent + '88',
      roofD: pal.accent + '66', edge: 'none'
    });
  }

  // ── Side annex with sawtooth roof ────────────────────────────
  drawBox(ctx, proj, -3.0, 0, -0.4, 1.2, 1.2, 0.8, {
    wall: pal.wallD, wallD: pal.wall, roofD: pal.roofD
  });
  // Sawtooth skylights
  for (let s = 0; s < 3; s++) {
    drawBox(ctx, proj, -2.98 + s * 0.36, -1.2, -0.18, 0.28, 0.25, 0.62, {
      wall: pal.glass, wallD: 'rgba(60,140,200,0.5)',
      roofD: pal.glass, edge: 'rgba(80,160,220,0.4)'
    });
  }

  // ── Chimney / comms tower ────────────────────────────────────
  drawBox(ctx, proj, 1.0, -2.2, -0.1, 0.18, 1.2, 0.18, {
    wall: '#8899aa', wallD: '#6879899', roofD: '#445566'
  });
  drawBox(ctx, proj, 0.95, -3.35, -0.08, 0.28, 0.08, 0.28, {
    wall: '#99aacc', wallD: '#7788aa', roofD: pal.accent
  });

  // ── Large windows ────────────────────────────────────────────
  drawWindowGrid(ctx, proj, -1.58, -0.1, 0.52, 3.16, 2.1, 5, 5, pal, t);
  drawWindowGrid(ctx, proj, -2.98, -0.1, 0.42, 1.16, 1.1, 2, 2, pal, t);

  // ── Parking area hint ────────────────────────────────────────
  drawParkingLines(ctx, P, pal);

  drawTree(ctx, P, -3.8, 0, 0.8, 0.15, pal, t, 0);
  drawTree(ctx, P,  2.8, 0, 0.8, 0.15, pal, t, 1);
  drawLampost(ctx, P, 2.2, 0, 1.5, pal, t);
}

function renderMedical(ctx, P, pal, t) {
  const { proj } = P;

  drawGround(ctx, P, pal);
  drawPathwork(ctx, P, pal, t);

  // ── Tall hospital block ──────────────────────────────────────
  drawBox(ctx, proj, -1.2, 0, -0.5, 2.4, 3.0, 1.0, pal);

  // ── Lower entrance block ─────────────────────────────────────
  drawBox(ctx, proj, -1.8, 0, 0.48, 3.6, 0.7, 0.55, {
    wall: pal.wallS, wallD: pal.wall, roofD: pal.roof
  });

  // ── Glass curtain facade ─────────────────────────────────────
  for (let f = 0; f < 8; f++) {
    const fy = -0.05 - f * 0.36;
    drawBox(ctx, proj, -1.18, fy, 0.48, 2.36, 0.28, 0.04, {
      wall: pal.glass, wallD: 'rgba(100,180,240,0.65)',
      roofD: 'rgba(80,160,220,0.5)', edge: 'rgba(120,200,255,0.3)'
    });
  }

  // ── Cross symbol on facade ───────────────────────────────────
  drawCross(ctx, P, -0.06, -1.5, 0.5, pal, t);

  // ── Side annex ───────────────────────────────────────────────
  drawBox(ctx, proj, -3.2, 0, -0.4, 1.3, 1.5, 0.8, {
    wall: pal.wall, wallD: pal.wallD, roofD: pal.roofD
  });
  drawWindowGrid(ctx, proj, -3.18, -0.1, 0.42, 1.26, 1.4, 2, 3, pal, t);

  // ── Helipad on roof ──────────────────────────────────────────
  drawHelipad(ctx, P, 0, -3.02, 0, pal, t);

  drawTree(ctx, P, 2.2, 0, 0.8, 0.18, pal, t, 0);
  drawTree(ctx, P, 2.8, 0, -0.5, 0.15, pal, t, 1);
  drawLampost(ctx, P, -0.8, 0, 1.8, pal, t);
  drawLampost(ctx, P,  0.8, 0, 1.8, pal, t);
}

function renderModern(ctx, P, pal, t) {
  const { proj } = P;

  drawGround(ctx, P, pal);
  drawPathwork(ctx, P, pal, t);

  // ── Asymmetric modern campus ─────────────────────────────────
  // Main block
  drawBox(ctx, proj, -1.0, 0, -0.45, 2.5, 1.9, 0.9, pal);
  // Elevated connector bridge
  drawBox(ctx, proj, -1.0, -1.2, -0.15, 2.5, 0.15, 0.32, {
    wall: pal.glass, wallD: 'rgba(100,160,220,0.5)',
    roofD: pal.wallD, edge: 'rgba(120,180,240,0.4)'
  });
  // Secondary block
  drawBox(ctx, proj, 1.6, 0, -0.35, 1.2, 1.5, 0.75, {
    wall: pal.wallD, wallD: pal.wallS, roofD: pal.roofD
  });
  // Low entrance pavilion
  drawBox(ctx, proj, -2.4, 0, -0.25, 1.3, 0.8, 0.65, {
    wall: pal.wallS, wallD: pal.wall, roofD: pal.roof
  });
  // Stairwell tower
  drawBox(ctx, proj, -1.02, 0, -0.47, 0.35, 2.4, 0.35, {
    wall: pal.glass, wallD: 'rgba(80,150,210,0.6)',
    roofD: pal.roofD, edge: 'rgba(100,170,230,0.35)'
  });

  // ── Windows ─────────────────────────────────────────────────
  drawWindowGrid(ctx, proj, -0.98, -0.12, 0.47, 2.46, 1.78, 4, 4, pal, t);
  drawWindowGrid(ctx, proj, 1.62, -0.12, 0.38, 1.16, 1.38, 2, 3, pal, t);
  drawWindowGrid(ctx, proj, -2.38, -0.12, 0.38, 1.26, 0.68, 2, 1, pal, t);

  drawSculpture(ctx, P, 0.3, 0, 1.4, pal, t);
  drawTree(ctx, P, -2.8, 0, 0.8, 0.2, pal, t, 0);
  drawTree(ctx, P,  3.0, 0, 0.5, 0.18, pal, t, 1);
  drawTree(ctx, P,  2.0, 0, 1.5, 0.16, pal, t, 2);
  drawLampost(ctx, P, -1.5, 0, 1.6, pal, t);
  drawLampost(ctx, P,  1.5, 0, 1.6, pal, t);
}

// ── Shared scene elements ──────────────────────────────────────

function drawGround(ctx, P, pal) {
  const { proj, cx, cy, s, W, H } = P;

  // Sky gradient
  const sky = ctx.createLinearGradient(0, 0, 0, H * 0.62);
  sky.addColorStop(0, '#0a1628');
  sky.addColorStop(0.55, '#0d2040');
  sky.addColorStop(1, '#122842');
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, W, H);

  // Stars (deterministic)
  const rng = n => { let x = Math.sin(n + 1.7) * 43758.5453; return x - Math.floor(x); };
  for (let i = 0; i < 120; i++) {
    const sx = rng(i) * W;
    const sy = rng(i + 100) * H * 0.5;
    const ss = rng(i + 200) * 1.8 + 0.3;
    const sa = 0.3 + rng(i + 300) * 0.7;
    ctx.fillStyle = 'rgba(255,255,255,' + sa + ')';
    ctx.beginPath();
    ctx.arc(sx, sy, ss, 0, Math.PI * 2);
    ctx.fill();
  }

  // Moon
  ctx.save();
  const moonX = W * 0.82, moonY = H * 0.12;
  const moonGrad = ctx.createRadialGradient(moonX - 4, moonY - 4, 0, moonX, moonY, 22);
  moonGrad.addColorStop(0, 'rgba(255,255,220,0.95)');
  moonGrad.addColorStop(0.6, 'rgba(240,230,180,0.7)');
  moonGrad.addColorStop(1, 'rgba(220,200,140,0)');
  ctx.fillStyle = moonGrad;
  ctx.beginPath();
  ctx.arc(moonX, moonY, 22, 0, Math.PI * 2);
  ctx.fill();

  // Moon glow
  const moonGlow = ctx.createRadialGradient(moonX, moonY, 18, moonX, moonY, 60);
  moonGlow.addColorStop(0, 'rgba(255,240,180,0.12)');
  moonGlow.addColorStop(1, 'transparent');
  ctx.fillStyle = moonGlow;
  ctx.beginPath();
  ctx.arc(moonX, moonY, 60, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // Horizon ambient glow
  const horizGlow = ctx.createRadialGradient(cx, cy + s * 0.1, 0, cx, cy + s * 0.1, s * 2.8);
  horizGlow.addColorStop(0, 'rgba(79,142,247,0.14)');
  horizGlow.addColorStop(0.4, 'rgba(79,142,247,0.05)');
  horizGlow.addColorStop(1, 'transparent');
  ctx.fillStyle = horizGlow;
  ctx.fillRect(0, 0, W, H);

  // Ground plane
  const gPts = [proj(-4, 0.01, 4), proj(4, 0.01, 4), proj(4, 0.01, -4), proj(-4, 0.01, -4)];
  const gGrad = ctx.createLinearGradient(
    gPts[3].x, gPts[3].y, gPts[0].x, gPts[0].y
  );
  gGrad.addColorStop(0, '#0e1e10');
  gGrad.addColorStop(0.5, '#142218');
  gGrad.addColorStop(1, '#0a1812');
  ctx.beginPath();
  gPts.forEach((p, i) => i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y));
  ctx.closePath();
  ctx.fillStyle = gGrad;
  ctx.fill();

  // Ground grid
  ctx.strokeStyle = 'rgba(79,142,247,0.10)';
  ctx.lineWidth = 0.7;
  for (let i = -4; i <= 4; i++) {
    const a = proj(i, 0.01, -4), b = proj(i, 0.01, 4);
    ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
    const c = proj(-4, 0.01, i), d = proj(4, 0.01, i);
    ctx.beginPath(); ctx.moveTo(c.x, c.y); ctx.lineTo(d.x, d.y); ctx.stroke();
  }
}

function drawPathwork(ctx, P, pal, t) {
  const { proj } = P;

  // Main entrance path
  const path = [proj(-0.3, 0.02, 4), proj(0.3, 0.02, 4), proj(0.3, 0.02, 0.6), proj(-0.3, 0.02, 0.6)];
  ctx.beginPath();
  path.forEach((p, i) => i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y));
  ctx.closePath();
  ctx.fillStyle = '#1a2430';
  ctx.fill();
  ctx.strokeStyle = 'rgba(200,180,120,0.25)';
  ctx.lineWidth = 0.5;
  ctx.stroke();

  // Side paths
  const sp1 = [proj(-3.5, 0.02, 4), proj(-0.4, 0.02, 4), proj(-0.4, 0.02, 3.6), proj(-3.5, 0.02, 3.6)];
  const sp2 = [proj(0.4, 0.02, 4), proj(3.5, 0.02, 4), proj(3.5, 0.02, 3.6), proj(0.4, 0.02, 3.6)];
  [sp1, sp2].forEach(pts => {
    ctx.beginPath();
    pts.forEach((p, i) => i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y));
    ctx.closePath();
    ctx.fillStyle = '#141e28';
    ctx.fill();
  });
}

function drawWindowGrid(ctx, proj, ox, oy, oz, W, H, cols, rows, pal, t) {
  const cw = W / cols;
  const ch = H / rows;
  const wPad = cw * 0.22;
  const hPad = ch * 0.20;

  for (let c = 0; c < cols; c++) {
    for (let r = 0; r < rows; r++) {
      const wx = ox + c * cw + wPad;
      const wy = oy - r * ch - hPad;
      const ww = cw - wPad * 2;
      const wh = ch - hPad * 2;
      const depth = oz + 0.01;

      // Random flicker for some windows
      const hash = (c * 7 + r * 13) % 17;
      const lit = hash < 12 || (hash === 12 && Math.sin(t * 0.3 + hash) > -0.3);
      const alpha = lit ? (0.72 + Math.sin(t * 0.8 + hash * 0.7) * 0.06) : 0.15;
      const winColor = lit
        ? 'rgba(255,' + Math.floor(220 + Math.sin(t + hash) * 20) + ',140,' + alpha + ')'
        : 'rgba(40,60,90,0.4)';

      const pts = [
        proj(wx,      wy,      depth),
        proj(wx + ww, wy,      depth),
        proj(wx + ww, wy - wh, depth),
        proj(wx,      wy - wh, depth),
      ];
      ctx.beginPath();
      pts.forEach((p, i) => i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y));
      ctx.closePath();
      ctx.fillStyle = winColor;
      ctx.fill();
      ctx.strokeStyle = lit ? 'rgba(255,200,100,0.3)' : 'rgba(60,80,110,0.3)';
      ctx.lineWidth = 0.5;
      ctx.stroke();

      // Window glow for lit windows
      if (lit) {
        const pc = proj(wx + ww / 2, wy - wh / 2, depth);
        const glowR = ctx.createRadialGradient(pc.x, pc.y, 0, pc.x, pc.y, 18);
        glowR.addColorStop(0, 'rgba(255,200,80,' + (alpha * 0.35) + ')');
        glowR.addColorStop(1, 'transparent');
        ctx.fillStyle = glowR;
        ctx.fillRect(pc.x - 18, pc.y - 18, 36, 36);
      }
    }
  }
}

function drawArchwayDoor(ctx, proj, x, y, z, w, h, pal) {
  // Door frame
  const pts = [proj(x, y, z), proj(x + w, y, z), proj(x + w, y - h, z), proj(x, y - h, z)];
  ctx.beginPath();
  pts.forEach((p, i) => i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y));
  ctx.closePath();
  ctx.fillStyle = 'rgba(20,15,10,0.85)';
  ctx.fill();
  ctx.strokeStyle = pal.trim;
  ctx.lineWidth = 1.2;
  ctx.stroke();

  // Arch top (semi-circle in projection)
  const pc = proj(x + w / 2, y - h, z);
  const pr = proj(x + w, y - h, z);
  const pl = proj(x, y - h, z);
  const rx = (pr.x - pl.x) / 2;
  const ry = Math.abs(rx) * 0.4;
  ctx.beginPath();
  ctx.ellipse(pc.x, pc.y, Math.abs(rx), ry, 0, Math.PI, 0);
  ctx.fillStyle = 'rgba(20,15,10,0.85)';
  ctx.fill();
  ctx.strokeStyle = pal.trim;
  ctx.lineWidth = 1.2;
  ctx.stroke();
}

function drawPediment(ctx, proj, x, y, z, w, ph, d, pal) {
  const left   = proj(x,       y,      z);
  const right  = proj(x + w,   y,      z);
  const top    = proj(x + w/2, y - ph, z + d * 0.5 - d);

  ctx.beginPath();
  ctx.moveTo(left.x, left.y);
  ctx.lineTo(right.x, right.y);
  ctx.lineTo(top.x, top.y);
  ctx.closePath();
  ctx.fillStyle = pal.wall;
  ctx.fill();
  ctx.strokeStyle = pal.trim;
  ctx.lineWidth = 1;
  ctx.stroke();

  // Raking cornice
  ctx.strokeStyle = pal.colPillar;
  ctx.lineWidth = 1.5;
  ctx.stroke();
}

function drawPyramid(ctx, proj, x, y, z, w, h, d, pal) {
  const bl = proj(x,     y,     z);
  const br = proj(x + w, y,     z);
  const fr = proj(x + w, y,     z + d);
  const fl = proj(x,     y,     z + d);
  const tp = proj(x + w/2, y - h, z + d/2);

  drawFace(ctx, [fl, fr, tp], pal.roof, pal.roofD, 0.7);
  drawFace(ctx, [bl, br, tp], pal.roofD, 'rgba(0,0,0,0.2)', 0.7);
  drawFace(ctx, [fr, br, tp], 'rgba(0,0,0,0.3)', 'rgba(0,0,0,0.15)', 0.7);
  drawFace(ctx, [fl, bl, tp], pal.roofD, pal.roofD, 0.7);
}

function drawDome(ctx, P, x, y, z, r, pal, t) {
  const { proj, cx, cy, s } = P;
  const center = proj(x, y, z);
  const scaleR = s * r;

  // Shadow ellipse
  const shadowE = proj(x, 0.01, z);
  ctx.save();
  ctx.globalAlpha = 0.25;
  ctx.fillStyle = '#000';
  ctx.beginPath();
  ctx.ellipse(shadowE.x, shadowE.y, scaleR * 0.6, scaleR * 0.2, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // Drum base
  for (let i = 5; i >= 0; i--) {
    const drumY = center.y + (scaleR * 0.35) - i * (scaleR * 0.06);
    const drumR = scaleR * 0.38 - i * (scaleR * 0.012);
    const grad = ctx.createRadialGradient(center.x - drumR * 0.3, drumY, 0, center.x, drumY, drumR);
    grad.addColorStop(0, pal.wallS);
    grad.addColorStop(0.6, pal.wall);
    grad.addColorStop(1, pal.wallD);
    ctx.beginPath();
    ctx.ellipse(center.x, drumY, drumR, drumR * 0.35, 0, 0, Math.PI * 2);
    ctx.fillStyle = grad;
    ctx.fill();
    ctx.strokeStyle = pal.trim;
    ctx.lineWidth = 0.5;
    ctx.stroke();
  }

  // Main dome sphere (half-ellipse gradient)
  const domeGrad = ctx.createRadialGradient(
    center.x - scaleR * 0.25, center.y - scaleR * 0.3, scaleR * 0.05,
    center.x, center.y, scaleR * 1.1
  );
  domeGrad.addColorStop(0, pal.wallS);
  domeGrad.addColorStop(0.35, pal.wall);
  domeGrad.addColorStop(0.7, pal.wallD);
  domeGrad.addColorStop(1, pal.roofD);
  ctx.beginPath();
  ctx.ellipse(center.x, center.y, scaleR * 0.42, scaleR * 0.55, 0, 0, Math.PI * 2);
  ctx.fillStyle = domeGrad;
  ctx.fill();
  ctx.strokeStyle = pal.trim;
  ctx.lineWidth = 1;
  ctx.stroke();

  // Specular highlight
  const spec = ctx.createRadialGradient(
    center.x - scaleR * 0.15, center.y - scaleR * 0.3, 0,
    center.x - scaleR * 0.1, center.y - scaleR * 0.2, scaleR * 0.3
  );
  spec.addColorStop(0, 'rgba(255,255,255,0.35)');
  spec.addColorStop(1, 'transparent');
  ctx.fillStyle = spec;
  ctx.beginPath();
  ctx.ellipse(center.x, center.y, scaleR * 0.42, scaleR * 0.55, 0, 0, Math.PI * 2);
  ctx.fill();

  // Lantern
  const lantY = center.y - scaleR * 0.52;
  ctx.fillStyle = pal.colPillar;
  ctx.beginPath();
  ctx.arc(center.x, lantY, scaleR * 0.06, 0, Math.PI * 2);
  ctx.fill();

  // Flag on lantern
  ctx.strokeStyle = pal.trim;
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(center.x, lantY);
  ctx.lineTo(center.x, lantY - scaleR * 0.18);
  ctx.stroke();
  ctx.fillStyle = '#e63946';
  ctx.beginPath();
  ctx.moveTo(center.x, lantY - scaleR * 0.18);
  ctx.lineTo(center.x + scaleR * 0.1, lantY - scaleR * 0.13);
  ctx.lineTo(center.x, lantY - scaleR * 0.09);
  ctx.closePath();
  ctx.fill();
}

function drawTree(ctx, P, x, y, z, radius, pal, t, seed) {
  const { proj, s } = P;
  const base = proj(x, y, z);
  const top  = proj(x, y - radius * 3.5, z);
  const r = s * radius;
  const sw = Math.sin(t * 0.6 + seed * 1.3) * 1.5;

  // Trunk
  ctx.strokeStyle = '#4a3520';
  ctx.lineWidth = Math.max(1.5, r * 0.18);
  ctx.beginPath();
  ctx.moveTo(base.x, base.y);
  ctx.lineTo(top.x + sw * 0.3, top.y);
  ctx.stroke();

  // Shadow on ground
  ctx.save();
  ctx.globalAlpha = 0.18;
  ctx.fillStyle = '#000';
  ctx.beginPath();
  ctx.ellipse(base.x + r * 0.5, base.y - r * 0.15, r * 0.9, r * 0.3, 0.3, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // Foliage layers (dark to light, back to front)
  const layers = [
    { dy: 0,    dr: 1.0, col: '#0d3015' },
    { dy: 0.3,  dr: 0.92, col: '#0f3d1a' },
    { dy: 0.6,  dr: 0.82, col: '#124d1c' },
    { dy: 0.9,  dr: 0.7,  col: '#155920' },
    { dy: 1.15, dr: 0.55, col: '#1a6e26' },
  ];

  layers.forEach(({ dy, dr, col }) => {
    const ly = top.y + (base.y - top.y) * (1 - dy * 0.22);
    const lx = top.x + sw * dy * 0.12;
    const lr = r * dr;
    const lGrad = ctx.createRadialGradient(lx - lr * 0.25, ly - lr * 0.2, 0, lx, ly, lr);
    lGrad.addColorStop(0, col);
    lGrad.addColorStop(0.7, col);
    lGrad.addColorStop(1, 'rgba(5,15,8,0.4)');
    ctx.beginPath();
    ctx.arc(lx + sw * 0.1, ly, lr, 0, Math.PI * 2);
    ctx.fillStyle = lGrad;
    ctx.fill();
  });

  // Highlight
  const hGrad = ctx.createRadialGradient(top.x - r * 0.2, top.y - r * 0.2, 0, top.x, top.y, r * 0.5);
  hGrad.addColorStop(0, 'rgba(80,180,60,0.25)');
  hGrad.addColorStop(1, 'transparent');
  ctx.fillStyle = hGrad;
  ctx.beginPath();
  ctx.arc(top.x + sw * 0.1, top.y, r * 0.55, 0, Math.PI * 2);
  ctx.fill();
}

function drawLampost(ctx, P, x, y, z, pal, t) {
  const { proj, s } = P;
  const base = proj(x, y, z);
  const head = proj(x, y - 0.7, z);
  const headR = proj(x + 0.12, y - 0.7, z);

  // Pole
  ctx.strokeStyle = '#8898aa';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(base.x, base.y);
  ctx.lineTo(head.x, head.y);
  ctx.stroke();

  // Arm
  ctx.beginPath();
  ctx.moveTo(head.x, head.y);
  ctx.lineTo(headR.x, headR.y);
  ctx.stroke();

  // Glow halo
  const lightPt = proj(x + 0.14, y - 0.72, z);
  const glow = ctx.createRadialGradient(lightPt.x, lightPt.y, 0, lightPt.x, lightPt.y, 22);
  glow.addColorStop(0, 'rgba(255,230,120,0.55)');
  glow.addColorStop(0.4, 'rgba(255,200,80,0.2)');
  glow.addColorStop(1, 'transparent');
  ctx.fillStyle = glow;
  ctx.fillRect(lightPt.x - 22, lightPt.y - 22, 44, 44);

  // Bulb
  ctx.fillStyle = 'rgba(255,240,160,0.95)';
  ctx.beginPath();
  ctx.arc(lightPt.x, lightPt.y, 4, 0, Math.PI * 2);
  ctx.fill();
}

function drawFountain(ctx, P, x, y, z, pal, t) {
  const { proj, s } = P;
  const base = proj(x, y, z);
  const r = s * 0.28;

  // Basin
  ctx.fillStyle = '#0a1e30';
  ctx.beginPath();
  ctx.ellipse(base.x, base.y, r * 1.1, r * 0.42, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = pal.stone;
  ctx.lineWidth = 2;
  ctx.stroke();

  // Water shimmer
  ctx.fillStyle = 'rgba(60,140,220,0.55)';
  ctx.beginPath();
  ctx.ellipse(base.x, base.y, r * 0.88, r * 0.33, 0, 0, Math.PI * 2);
  ctx.fill();

  // Center pillar
  const pillar = proj(x, y - 0.18, z);
  ctx.fillStyle = pal.stone;
  ctx.beginPath();
  ctx.ellipse(pillar.x, pillar.y, s * 0.04, s * 0.015, 0, 0, Math.PI * 2);
  ctx.fill();

  // Water spray (animated)
  ctx.strokeStyle = 'rgba(120,200,255,0.6)';
  ctx.lineWidth = 1;
  for (let i = 0; i < 6; i++) {
    const angle = (i / 6) * Math.PI * 2 + t * 0.5;
    const spray = proj(x + Math.cos(angle) * 0.06, y - 0.28, z + Math.sin(angle) * 0.06);
    ctx.beginPath();
    ctx.moveTo(pillar.x, pillar.y);
    ctx.lineTo(spray.x, spray.y);
    ctx.stroke();
  }
}

function drawSculpture(ctx, P, x, y, z, pal, t) {
  const { proj, s } = P;
  const base = proj(x, y, z);
  const top  = proj(x, y - 0.4, z);
  const r = s * 0.055;

  ctx.fillStyle = pal.stone;
  ctx.beginPath();
  ctx.ellipse(base.x, base.y, r * 1.4, r * 0.5, 0, 0, Math.PI * 2);
  ctx.fill();

  // Abstract form
  ctx.fillStyle = '#c0b8b0';
  ctx.beginPath();
  ctx.ellipse(top.x, top.y, r, r * 2.5, 0, 0, Math.PI * 2);
  ctx.fill();

  const spec = ctx.createRadialGradient(top.x - r * 0.3, top.y - r, 0, top.x, top.y, r * 1.5);
  spec.addColorStop(0, 'rgba(255,255,255,0.3)');
  spec.addColorStop(1, 'transparent');
  ctx.fillStyle = spec;
  ctx.beginPath();
  ctx.ellipse(top.x, top.y, r, r * 2.5, 0, 0, Math.PI * 2);
  ctx.fill();
}

function drawParkingLines(ctx, P, pal) {
  const { proj } = P;
  ctx.strokeStyle = 'rgba(255,255,200,0.2)';
  ctx.lineWidth = 0.8;
  ctx.setLineDash([3, 4]);
  for (let i = 0; i < 5; i++) {
    const x = 2.0 + i * 0.38;
    const a = proj(x, 0.02, 1.0);
    const b = proj(x, 0.02, 3.0);
    ctx.beginPath();
    ctx.moveTo(a.x, a.y);
    ctx.lineTo(b.x, b.y);
    ctx.stroke();
  }
  ctx.setLineDash([]);
}

function drawCross(ctx, P, x, y, z, pal, t) {
  const { proj, s } = P;
  const cr = s * 0.09;
  const center = proj(x, y, z);
  const pulse = 0.9 + Math.sin(t * 1.2) * 0.08;

  // Glow
  const glow = ctx.createRadialGradient(center.x, center.y, 0, center.x, center.y, cr * 2.5);
  glow.addColorStop(0, 'rgba(255,80,80,0.25)');
  glow.addColorStop(1, 'transparent');
  ctx.fillStyle = glow;
  ctx.fillRect(center.x - cr * 2.5, center.y - cr * 2.5, cr * 5, cr * 5);

  ctx.fillStyle = '#e63946';
  // Vertical
  ctx.fillRect(center.x - cr * 0.2, center.y - cr * 0.9 * pulse, cr * 0.4, cr * 1.8 * pulse);
  // Horizontal
  ctx.fillRect(center.x - cr * 0.7 * pulse, center.y - cr * 0.2, cr * 1.4 * pulse, cr * 0.4);
}

function drawHelipad(ctx, P, x, y, z, pal, t) {
  const { proj, s } = P;
  const center = proj(x, y, z);
  const r = s * 0.35;

  // Circle
  ctx.strokeStyle = '#e8c84a';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.ellipse(center.x, center.y, r, r * 0.38, 0, 0, Math.PI * 2);
  ctx.stroke();

  // H letter
  ctx.strokeStyle = '#e8c84a';
  ctx.lineWidth = 2.5;
  const hW = r * 0.35;
  ctx.beginPath();
  ctx.moveTo(center.x - hW, center.y - r * 0.12);
  ctx.lineTo(center.x - hW, center.y + r * 0.12);
  ctx.moveTo(center.x - hW, center.y);
  ctx.lineTo(center.x + hW, center.y);
  ctx.moveTo(center.x + hW, center.y - r * 0.12);
  ctx.lineTo(center.x + hW, center.y + r * 0.12);
  ctx.stroke();

  // Blinking light
  const blink = Math.sin(t * 3) > 0;
  if (blink) {
    ctx.fillStyle = 'rgba(255,80,80,0.9)';
    ctx.beginPath();
    ctx.arc(center.x, center.y - r * 0.16, 4, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawFlag(ctx, proj, x, y, z, pal, t) {
  const base  = proj(x, y, z);
  const top   = proj(x, y - 0.18, z);
  const swing = Math.sin(t * 1.8) * 0.04;

  // Pole
  ctx.strokeStyle = '#c0c8d0';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(base.x, base.y);
  ctx.lineTo(top.x, top.y);
  ctx.stroke();

  // Flag (Colombian colors: yellow, blue, red)
  const fw = 22 + swing * 80;
  const fh = 10;
  const colors = ['#ffd700', '#003893', '#ce1126'];
  colors.forEach((col, i) => {
    ctx.fillStyle = col;
    ctx.fillRect(top.x, top.y + i * (fh / 3), fw, fh / 3 + 0.5);
  });
}

// ── Main draw loop ─────────────────────────────────────────────

function draw3DLoop() {
  _3dAngle  += (_3dTargetAngle - _3dAngle)  * 0.07;
  _3dZoom   += (_3dTargetZoom  - _3dZoom)   * 0.1;
  if (!_3dDragging) _3dTargetAngle += 0.006;
  _3dT += 0.016;

  const canvas = _3dCanvas;
  if (!canvas) return;
  const ctx = _3dCtx;
  const W = canvas.width, H = canvas.height;
  ctx.clearRect(0, 0, W, H);

  const P = make3DContext(canvas, _3dAngle, _3dZoom, _3dElevation, _3dOffX, _3dOffY);
  const uni = _3dCurrentUni;
  const archetype = getUniArchetype(uni);
  const pal = ARCH_PALETTE[archetype] || ARCH_PALETTE.modern;

  switch (archetype) {
    case 'classic_grand':  renderClassicGrand(ctx, P, pal, _3dT); break;
    case 'campus_modern':  renderCampusModern(ctx, P, pal, _3dT); break;
    case 'institutional':  renderInstitutional(ctx, P, pal, _3dT); break;
    case 'tech_campus':    renderTechCampus(ctx, P, pal, _3dT);    break;
    case 'medical':        renderMedical(ctx, P, pal, _3dT);       break;
    default:               renderModern(ctx, P, pal, _3dT);        break;
  }

  // ── Name overlay ────────────────────────────────────────────
  const nameLabel = (uni?.name || 'Universidad').split(' ').slice(0, 4).join(' ');
  ctx.save();
  ctx.font = 'bold 13px system-ui, sans-serif';
  const tw = ctx.measureText(nameLabel).width;
  const px = W / 2 - tw / 2 - 12, py = H - 44;
  ctx.fillStyle = 'rgba(5,12,28,0.78)';
  ctx.beginPath();
  ctx.roundRect(px, py, tw + 24, 28, 8);
  ctx.fill();
  ctx.fillStyle = '#e8f0ff';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(nameLabel, W / 2, py + 14);

  // Archetype badge
  const archetypeLabels = {
    classic_grand: '🏛️ Clásica',
    campus_modern: '🏢 Moderna',
    institutional: '🏫 Institucional',
    tech_campus:   '⚙️ Tecnológica',
    medical:       '🏥 Ciencias de Salud',
    modern:        '🎓 Contemporánea'
  };
  const badge = archetypeLabels[archetype] || '🎓';
  ctx.font = '11px system-ui, sans-serif';
  const bw2 = ctx.measureText(badge).width;
  ctx.fillStyle = 'rgba(79,142,247,0.25)';
  ctx.beginPath();
  ctx.roundRect(W / 2 - bw2 / 2 - 10, py - 28, bw2 + 20, 22, 6);
  ctx.fill();
  ctx.fillStyle = '#93c5fd';
  ctx.fillText(badge, W / 2, py - 17);
  ctx.restore();

  _3dRaf = requestAnimationFrame(draw3DLoop);
}

function draw3DBuilding() { /* legacy stub */ }

// ── expShow3D: sets up canvas interaction + UI panels ─────────
// ══ Street View viewer — reemplaza el visor 3D ════════════════
function expShow3D(uniName) {
  const uni = UNIVERSITIES.find(u => u.name === uniName);
  if (!uni) return;
  _3dCurrentUni = uni;

  const sec = document.getElementById('exp3dSection');
  sec.style.display = 'block';
  sec.classList.remove('type-pub', 'type-priv');
  sec.classList.add(EXP_PUBLIC.has(uni.name) ? 'type-pub' : 'type-priv');

  // ── Street View iframe ───────────────────────────────────────
  const coords = UNI_COORDS[uni.name];
  const iframe  = document.getElementById('exp3dStreetView');
  const noData  = document.getElementById('svNoData');
  const fallbackLink = document.getElementById('svFallbackLink');
  const mapsUrl = 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(uni.name + ' ' + uni.city + ' Colombia');

  if (coords && iframe) {
    const lat = coords[0], lng = coords[1];
    iframe.style.display = 'block';
    if (noData) noData.style.display = 'none';
    iframe.src = 'https://www.google.com/maps?q=' + lat + ',' + lng + '&layer=c&output=svembed';
  } else {
    if (iframe) iframe.style.display = 'none';
    if (noData) {
      noData.style.display = 'flex';
      if (fallbackLink) fallbackLink.href = mapsUrl;
    }
  }

  // ── Info panel ──────────────────────────────────────────────
  const tipo    = EXP_PUBLIC.has(uni.name) ? 'Pública' : 'Privada';
  const tipoCls = tipo === 'Pública' ? 'pub' : 'priv';
  const tipoLbl = tipo === 'Pública' ? '🏛️ Pública' : '🏢 Privada';
  const icfesSpan = (uni.icfes && uni.icfes.min)
    ? '<span class="e3d-icfes">ICFES mín: <strong>' + uni.icfes.min + '</strong></span>' : '';
  const careersHtml = (uni.careers || [])
    .map(c => '<span class="e3d-career">' + c + '</span>').join('');
  const svDirectUrl = coords
    ? 'https://www.google.com/maps/@?api=1&map_action=pano&viewpoint=' + coords[0] + ',' + coords[1]
    : mapsUrl;

  document.getElementById('exp3dUniInfo').innerHTML =
    '<div class="e3d-uni-name">' + uni.icon + ' ' + uni.name + '</div>' +
    '<div class="e3d-uni-meta">' +
      '<span class="e3d-badge-tipo ' + tipoCls + '">' + tipoLbl + '</span>' +
      '<span class="e3d-city">📍 ' + uni.city + '</span>' +
      icfesSpan +
    '</div>' +
    '<div class="e3d-careers">' + careersHtml + '</div>' +
    '<div style="display:flex;gap:10px;flex-wrap:wrap;margin-top:10px;">' +
      '<a class="e3d-link" href="' + svDirectUrl + '" target="_blank" style="background:#1a73e8;color:#fff;padding:8px 14px;border-radius:8px;text-decoration:none;font-size:13px;">🚶 Abrir Street View completo →</a>' +
      '<a class="e3d-link" href="' + mapsUrl + '" target="_blank" style="color:#4ade80;font-size:13px;padding:8px 0;">🗺️ Ver en Maps</a>' +
      '<a class="e3d-link" href="' + (uni.url || '#') + '" target="_blank" style="color:#aaa;font-size:13px;padding:8px 0;">🌐 Sitio oficial</a>' +
    '</div>';

  // ── Carousel ─────────────────────────────────────────────────
  const carousel = document.getElementById('exp3dCarousel');
  const topUnis  = EXP_STATE.results.slice(0, 8);
  const carItems = topUnis.map(function(u) {
    const active   = u.name === uniName ? ' active' : '';
    const safeName = JSON.stringify(u.name);
    return '<button class="e3d-carousel-item' + active + '" onclick="expShow3D(' + safeName + ')">' +
      '<span class="e3d-ci-icon">' + u.icon + '</span>' +
      '<span class="e3d-ci-name">' + u.name.split(' ').slice(0, 3).join(' ') + '</span>' +
      '</button>';
  }).join('');
  carousel.innerHTML =
    '<div class="e3d-carousel-label">Ver otras universidades:</div>' +
    '<div class="e3d-carousel-scroll">' + carItems + '</div>';

  sec.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

// Helper: Street View by index
function expShow3DByIdx(idx){
  const uni = EXP_STATE.results[idx];
  if(uni) expShow3D(uni.name);
}


// ══════════════════════════════════════════════════════════════
// CENTRO DE AYUDA — FAQ programado (sin IA, sin costo, sin riesgo
// de respuestas inventadas). Preguntas fijas escritas a mano.
// ══════════════════════════════════════════════════════════════
const FAQ_DATA = [
  { cat: 'Cuenta y acceso', q: '¿Cómo creo una cuenta?', a: 'En la pantalla de inicio, toca "Registrarse", llena tu nombre, correo, ciudad y una contraseña de mínimo 6 caracteres. También puedes entrar directo con tu cuenta de Google usando el botón "Continuar con Google".' },
  { cat: 'Cuenta y acceso', q: 'Olvidé mi contraseña, ¿qué hago?', a: 'En la pantalla de inicio de sesión toca "¿Olvidaste tu contraseña?", escribe tu correo y te llegará un enlace para crear una nueva. El enlace es válido por 1 hora y solo se puede usar una vez.' },
  { cat: 'Cuenta y acceso', q: '¿Qué es el "Modo Demo"?', a: 'Te deja probar OrientaU sin crear una cuenta. Puedes hacer el test y ver cómo funciona, pero tus resultados no quedan guardados — si cierras sesión, se pierden.' },
  { cat: 'Cuenta y acceso', q: '¿Cómo cambio mi foto de perfil o mis datos?', a: 'Toca tu nombre/foto arriba a la derecha para abrir "Mi Perfil". Ahí puedes subir una foto (o pegar el link de una imagen), cambiar tu color/ícono, bio, teléfono y grado.' },
  { cat: 'Cuenta y acceso', q: '¿Puedo borrar mi cuenta y mis datos?', a: 'Sí. Escríbenos a orientauoffv@gmail.com pidiendo la eliminación de tu cuenta e indicando tu correo registrado — tienes ese derecho según nuestra Política de Tratamiento de Datos.' },

  { cat: 'Test vocacional', q: '¿Cuánto dura el test?', a: 'El banco tiene 500 preguntas repartidas en 10 áreas, pero no necesitas responder todas de una sentada — normalmente toma entre 15 y 25 minutos dependiendo de qué tan seguido reflexiones cada respuesta.' },
  { cat: 'Test vocacional', q: '¿Puedo repetir el test?', a: 'Sí, las veces que quieras. Cada intento queda guardado en tu historial para que puedas comparar cómo cambia tu perfil vocacional con el tiempo.' },
  { cat: 'Test vocacional', q: '¿Cómo se calcula mi perfil vocacional?', a: 'Cada pregunta suma puntos a una o más áreas (Ingeniería, Salud, Ciencias Sociales, etc.) según qué tan de acuerdo estés con la afirmación. El área con más puntos define tu perfil dominante, y de ahí se recomiendan carreras y universidades.' },
  { cat: 'Test vocacional', q: '¿Qué es el "Modo VS"?', a: 'Es un modo para hacer el test junto a otra persona en el mismo dispositivo (por turnos) y comparar los dos perfiles vocacionales al final — pensado para hacerlo con un amigo o compañero de clase.' },

  { cat: 'Universidades y carreras', q: '¿De dónde salen los datos de las universidades?', a: 'La lista de instituciones está verificada contra el registro oficial del Ministerio de Educación (SNIES). Las coordenadas de ubicación vienen de Google Maps. Los puntajes ICFES son estimaciones de referencia, no cifras oficiales publicadas por cada universidad (la mayoría no las publica).' },
  { cat: 'Universidades y carreras', q: '¿Qué significa el puntaje ICFES que aparece en cada universidad?', a: 'Es una referencia orientativa de qué tan competitivo suele ser el ingreso a esa carrera en esa universidad — no un corte oficial garantizado. Úsalo para hacerte una idea general, no como un número exacto.' },
  { cat: 'Universidades y carreras', q: '¿Por qué no aparece mi universidad?', a: 'Estamos ampliando la base progresivamente por región, siempre verificando contra el registro oficial antes de agregar cualquier institución (para evitar mostrar datos inventados). Si no encuentras la tuya, escríbenos y la agregamos con datos reales.' },
  { cat: 'Universidades y carreras', q: '¿Cómo funciona el Explorador de Universidades?', a: 'Te deja buscar por ciudad, carrera de interés y tus habilidades, sin necesidad de hacer el test completo. Muestra las universidades que mejor calzan y las más cercanas a ti aparecen primero, marcadas en azul.' },

  { cat: 'Privacidad y datos', q: '¿Mis datos están seguros?', a: 'Tu contraseña se guarda cifrada (nunca en texto plano). Los enlaces de recuperación expiran en 1 hora. Puedes leer el detalle completo en "Términos y Política de Datos" (enlace en la pantalla de inicio de sesión).' },
  { cat: 'Privacidad y datos', q: '¿OrientaU usa Inteligencia Artificial? ¿Cómo?', a: 'El análisis de tus resultados se genera automáticamente a partir de tus respuestas y de datos reales de universidades colombianas (ICFES, carreras, ubicación) — no envía tu información a ningún servicio externo de IA.' },
  { cat: 'Privacidad y datos', q: '¿Le mandan mi nombre o mi foto a la Inteligencia Artificial?', a: 'No. El análisis de resultados se genera dentro de la misma app, sin enviar tus datos a ningún servicio externo.' },

  { cat: 'Sobre OrientaU', q: '¿Quién hizo OrientaU?', a: 'Un equipo de estudiantes del programa técnico en programación de la I.E. Misael Pastrana Borrero (Cúcuta), como proyecto educativo para Expotécnica.' },
  { cat: 'Sobre OrientaU', q: '¿Cómo reporto un error o una sugerencia?', a: 'Escríbenos a orientauoffv@gmail.com contándonos qué pasó (entre más detalle, mejor: qué pantalla, qué intentabas hacer). Leemos todos los mensajes.' },
];

function toggleFAQ(){
  const overlay = document.getElementById('faqOverlay');
  const isOpen = overlay.style.display === 'flex';
  if (isOpen) {
    overlay.style.display = 'none';
  } else {
    overlay.style.display = 'flex';
    document.getElementById('faqSearch').value = '';
    renderFAQList();
    setTimeout(() => document.getElementById('faqSearch')?.focus(), 100);
  }
}

function _faqNorm(s){
  return (s||'').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'');
}

// Busca la pregunta frecuente que mejor coincide con lo que escribió el
// usuario, por palabras clave en común — sin llamar ninguna IA externa.
function findFaqAnswer(query){
  const qWords = _faqNorm(query).split(/\s+/).filter(w => w.length > 2);
  if(!qWords.length) return null;
  let best = null, bestScore = 0;
  FAQ_DATA.forEach(f => {
    const haystack = _faqNorm(f.q + ' ' + f.a);
    const score = qWords.filter(w => haystack.includes(w)).length;
    if(score > bestScore){ bestScore = score; best = f; }
  });
  return bestScore >= 2 ? best : null; // exige al menos 2 palabras en común
}

function renderFAQList(){
  const listEl = document.getElementById('faqList');
  const query = _faqNorm(document.getElementById('faqSearch').value.trim());
  const filtered = query
    ? FAQ_DATA.filter(f => _faqNorm(f.q).includes(query) || _faqNorm(f.a).includes(query))
    : FAQ_DATA;

  if (filtered.length === 0) {
    listEl.innerHTML = `<div class="faq-empty">🤔 No encontramos nada con eso.<br>Prueba con otra palabra, o escríbenos directo.</div>`;
    return;
  }

  let html = '';
  let lastCat = null;
  filtered.forEach((f, i) => {
    if (f.cat !== lastCat) {
      html += `<div class="faq-cat-label">${f.cat}</div>`;
      lastCat = f.cat;
    }
    html += `
      <div class="faq-item" id="faqItem${i}">
        <button class="faq-q" onclick="toggleFAQItem(${i})">
          <span>${f.q}</span>
          <span class="faq-arrow">▾</span>
        </button>
        <div class="faq-a"><div class="faq-a-inner">${f.a}</div></div>
      </div>`;
  });
  listEl.innerHTML = html;
}

function toggleFAQItem(i){
  document.getElementById(`faqItem${i}`)?.classList.toggle('open');
}

// ══════════════════════════════════════════════════════════════
// CHAT ABIERTO CON IA — grounded en el catálogo REAL de universidades.
// La IA solo puede hablar de lo que está en CHAT_UNI_CATALOG; nunca
// inventa instituciones. Tope de mensajes por sesión para controlar
// costo/abuso (además del check de usuario_id/demo en el backend).
// ══════════════════════════════════════════════════════════════
const CHAT_MAX_USER_MESSAGES = 12;
let chatHistory = [];       // [{role:'user'|'assistant', content:'...'}]
let chatUserMsgCount = 0;
let chatBusy = false;
let _chatCatalogCache = null;

function getChatUniCatalog(){
  if(_chatCatalogCache) return _chatCatalogCache;
  _chatCatalogCache = UNIVERSITIES.map(u =>
    `${u.name} (${u.city}): ${u.careers.join(', ')} — ICFES desde ${u.icfes.min}`
  ).join('\n');
  return _chatCatalogCache;
}

function switchHelpTab(tab){
  const isFaq = tab === 'faq';
  document.getElementById('faqTabFaq').classList.toggle('active', isFaq);
  document.getElementById('faqTabChat').classList.toggle('active', !isFaq);
  document.getElementById('helpViewFaq').style.display  = isFaq ? 'flex' : 'none';
  document.getElementById('helpViewChat').style.display = isFaq ? 'none' : 'flex';
  if(!isFaq){
    const countEl = document.getElementById('chatUniCount');
    if(countEl) countEl.textContent = UNIVERSITIES.length;
    if(chatHistory.length === 0) renderChatMessages(); // muestra el estado vacío
    updateChatCounter();
    setTimeout(() => document.getElementById('chatInput')?.focus(), 100);
  }
}

function renderChatMessages(){
  const el = document.getElementById('chatMessages');
  if(chatHistory.length === 0){
    el.innerHTML = `<div class="chat-empty">👋 Pregúntame sobre carreras, universidades colombianas o el proceso de admisión.<br><br>Ej: "¿Qué universidades en Bucaramanga tienen Ingeniería de Sistemas?"</div>`;
    return;
  }
  el.innerHTML = chatHistory.map(m =>
    `<div class="chat-msg ${m.role}${m.error ? ' error' : ''}">${escapeHtml(m.content)}</div>`
  ).join('');
  el.scrollTop = el.scrollHeight;
}

function escapeHtml(s){
  const d = document.createElement('div');
  d.textContent = s;
  return d.innerHTML;
}

function updateChatCounter(){
  const remaining = CHAT_MAX_USER_MESSAGES - chatUserMsgCount;
  const el = document.getElementById('chatCounter');
  if(!el) return;
  el.textContent = remaining > 0
    ? `${remaining} preguntas restantes en esta sesión`
    : 'Llegaste al límite de preguntas de esta sesión — mira las FAQ o escríbenos por correo';
}

async function sendChatMessage(){
  if(chatBusy) return;
  const input = document.getElementById('chatInput');
  const text = input.value.trim();
  if(!text) return;

  if(chatUserMsgCount >= CHAT_MAX_USER_MESSAGES){
    updateChatCounter();
    return;
  }

  chatBusy = true;
  input.value = '';
  input.disabled = true;
  document.getElementById('chatSendBtn').disabled = true;

  chatHistory.push({ role: 'user', content: text });
  chatUserMsgCount++;
  renderChatMessages();
  updateChatCounter();

  // Indicador de "escribiendo..." (pausa breve para que se sienta natural,
  // aunque la respuesta se genera localmente, sin llamar ninguna IA)
  const el = document.getElementById('chatMessages');
  el.insertAdjacentHTML('beforeend', `<div class="chat-msg assistant typing" id="chatTyping"><span></span><span></span><span></span></div>`);
  el.scrollTop = el.scrollHeight;

  await new Promise(r => setTimeout(r, 500 + Math.random() * 400));
  document.getElementById('chatTyping')?.remove();

  const match = findFaqAnswer(text);
  if(match){
    chatHistory.push({ role: 'assistant', content: match.a });
  } else {
    chatHistory.push({ role: 'assistant', content: 'No tengo una respuesta exacta para eso todavía 🤔. Revisa las Preguntas Frecuentes o escríbenos a orientauoffv@gmail.com y te ayudamos directo.' });
  }

  renderChatMessages();
  chatBusy = false;
  const stillHasMessages = chatUserMsgCount < CHAT_MAX_USER_MESSAGES;
  input.disabled = !stillHasMessages;
  document.getElementById('chatSendBtn').disabled = !stillHasMessages;
  if(stillHasMessages) input.focus();
}

// ══════════════════════════════════════════════════════════════
// RECOMENDACIÓN RÁPIDA — IA de un solo disparo (sin chat, sin
// historial). Mucho más barata que el chat: una sola llamada,
// grounded solo en universidades reales cerca de la ciudad dada.
// ══════════════════════════════════════════════════════════════
function openQuickRecommend(){
  document.getElementById('quickRecOverlay').style.display = 'flex';
  document.getElementById('quickRecForm').style.display = 'block';
  document.getElementById('quickRecResult').style.display = 'none';
  document.getElementById('quickRecResult').innerHTML = '';
  const cityInput = document.getElementById('quickRecCity');
  cityInput.value = currentUser?.ciudad || '';
  document.getElementById('quickRecBtn').disabled = false;
  document.getElementById('quickRecBtn').textContent = 'Recomendarme →';
  setTimeout(() => cityInput.focus(), 100);
}

function closeQuickRecommend(){
  document.getElementById('quickRecOverlay').style.display = 'none';
}

async function getQuickRecommendation(){
  const city = document.getElementById('quickRecCity').value.trim();
  if(!city){
    document.getElementById('quickRecCity').focus();
    return;
  }

  const btn = document.getElementById('quickRecBtn');
  btn.disabled = true;
  btn.textContent = 'Buscando... ⏳';

  // Universidades reales cerca de esa ciudad (mismo sistema de regiones
  // que ya usa el resto de la app). Si no hay ninguna cerca, se usa la
  // base completa a nivel nacional.
  let pool = UNIVERSITIES.filter(u => isLocalUni(u.city, u.region || '', city));
  let isNational = false;
  if(pool.length === 0){ pool = UNIVERSITIES; isNational = true; }

  await new Promise(r => setTimeout(r, 500 + Math.random() * 400)); // se siente natural, no instantáneo

  // Elegimos localmente la opción más "sólida y versátil": buen puntaje
  // ICFES (referencia de reconocimiento) y varias carreras disponibles —
  // sin llamar ninguna IA externa.
  const uni = [...pool].sort((a, b) => {
    const scoreA = (a.icfes?.min || 0) + (a.careers?.length || 0) * 5;
    const scoreB = (b.icfes?.min || 0) + (b.careers?.length || 0) * 5;
    return scoreB - scoreA;
  })[0];

  const resultEl = document.getElementById('quickRecResult');
  if(uni){
    const motivo = `Es una opción sólida y reconocida${uni.careers?.length > 1 ? ', con varios programas disponibles' : ''}. Para una recomendación 100% personalizada según tus intereses, lo ideal es hacer el test vocacional completo.`;
    resultEl.innerHTML = `
      <div style="background:rgba(79,142,247,0.08);border:1px solid rgba(79,142,247,0.25);border-radius:var(--radius-sm);padding:16px;">
        ${isNational ? '<div style="font-size:0.72rem;color:#fbbf24;margin-bottom:8px;">⚠ No encontramos universidades muy cerca de esa ciudad — esta es una recomendación a nivel nacional.</div>' : ''}
        <div style="font-size:1.05rem;font-weight:700;margin-bottom:4px;">${escapeHtml(uni.name)}</div>
        <div style="font-size:0.78rem;color:rgba(255,255,255,0.5);margin-bottom:10px;">📍 ${escapeHtml(uni.city)} · ICFES desde ${uni.icfes.min}</div>
        <div style="font-size:0.85rem;line-height:1.6;color:rgba(255,255,255,0.85);">${escapeHtml(motivo)}</div>
        <a href="${uni.url}" target="_blank" style="display:inline-block;margin-top:12px;font-size:0.82rem;color:var(--blue-300);">🌐 Visitar sitio oficial →</a>
      </div>`;
  } else {
    resultEl.innerHTML = `<div class="chat-msg assistant error">No encontramos universidades para mostrar. Intenta con otra ciudad.</div>`;
  }
  document.getElementById('quickRecForm').style.display = 'none';
  resultEl.style.display = 'block';
}
