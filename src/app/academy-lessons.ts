function insertAfterModuleHeader(sectionHtml: string, insertionHtml: string): string {
  const headerMatch = sectionHtml.match(/<div\s+class="(?:module-header|section-header)"[^>]*>[\s\S]*?<\/div>/i);
  if (!headerMatch || headerMatch.index === undefined) {
    return sectionHtml.replace(/(<section\b[^>]*>)/i, `$1\n${insertionHtml}`);
  }
  const insertAt = headerMatch.index + headerMatch[0].length;
  return sectionHtml.slice(0, insertAt) + '\n' + insertionHtml + sectionHtml.slice(insertAt);
}

function buildGuidedFundamentalsWidgetHtml(
  lessonId: string,
  title: string,
  subtitle: string
): string {
  return `
  <article class="interactive-widget mt-4 mb-5" id="lab-fundamentos-${lessonId}" data-lab="fundamentals-guided-lab" data-lesson="${lessonId}" data-nivel="1">
    <div class="widget-header">
      <div>
        <span class="widget-tag">Serie Guiada de Fundamentos · Explicación + Práctica Táctil</span>
        <h3>${title}</h3>
        <p class="text-sm">${subtitle}</p>
      </div>
    </div>
    <div class="lab-stage"></div>
  </article>`;
}

function buildEtapa0SectionHtml(): string {
  return `<section id="intro" class="module-section" data-cat="teoria" data-nivel="1" data-menu="0. Etapa 0: Alfabetización Musical">
  <div class="module-header">
    <span class="nav-badge badge-lvl1">Etapa 0 · Principiante Absoluto · Sin Tecnicismos</span>
    <h2 class="module-title">0. Alfabetización Musical: Tu Primer Contacto con la Música</h2>
    <p class="module-subtitle">Antes de nombres italianos, partituras o fórmulas: entiende cómo funciona la música en capas, orienta tus manos en el piano o el mástil y educa tu oído desde el minuto uno.</p>
  </div>

  <h3 id="intro-que-es-musica">1. ¿Qué es realmente la música y cómo escucharla por capas?</h3>
  <p>
    La música es el arte de organizar <strong>sonido y silencio en el tiempo</strong>. Cuando escuchas cualquier canción —sea rock, salsa, música clásica o huayno andino— tu cerebro procesa al mismo tiempo <strong>tres capas independientes</strong>. Aprender a escucharlas por separado es el primer superpoder de un músico:
  </p>

  <div class="grid-3">
    <div class="card">
      <h4>💓 1. El Pulso (El reloj invisible)</h4>
      <p class="text-xs mb-2">Es el latido constante y regular que te hace mover el pie o asentir con la cabeza (<code>1 · 2 · 3 · 4</code>). Aunque todos los instrumentos guarden silencio durante un segundo, el pulso sigue caminando por debajo. Su velocidad se mide en <strong>BPM</strong> (<em>pulsos por minuto</em>): <code>60 BPM</code> es un golpe por segundo (balada lenta), <code>90 BPM</code> es medio tiempo (bolero o hip-hop) y <code>120 BPM</code> es un paso enérgico (pop o marcha).</p>
      <button type="button" class="btn-audio" data-run="demoPulseOnly">🔊 Escuchar solo Pulso</button>
    </div>
    <div class="card">
      <h4>🥁 2. El Ritmo (Cómo viaja el tiempo)</h4>
      <p class="text-xs mb-2">Si el pulso es la cuadrícula fija de un cuaderno, el ritmo es el dibujo que trazas encima combinando <strong>golpes largos, golpes cortos, acentos y silencios</strong>. Por ejemplo, el pulso <code>1</code> suele sentirse más pesado (<em>tiempo fuerte</em>) que los pulsos <code>2, 3 y 4</code>. Dos canciones a exactamente 100 BPM se sienten opuestas si cambian dónde caen los acentos.</p>
      <button type="button" class="btn-audio" data-run="demoRhythmClap">🔊 Escuchar Ritmo sobre Pulso</button>
    </div>
    <div class="card">
      <h4>🎶 3. La Melodía (La voz que recuerdas)</h4>
      <p class="text-xs mb-2">Es la línea que tarareas en la ducha. Una melodía une <strong>ritmo</strong> (cuándo empieza y cuánto dura cada sonido) con <strong>altura</strong> (qué tan grave o aguda es cada nota). Por debajo de ella suele moverse la <em>armonía</em> (los acordes que le dan color emocional —alegre, tenso o nostálgico— a la misma nota cantada).</p>
      <button type="button" class="btn-audio" data-run="demoMelodyHook">🔊 Escuchar Melodía Completa</button>
    </div>
  </div>

  <h3 id="intro-notas-octavas">2. Las 12 notas, el semitono y por qué los nombres se repiten</h3>
  <p>
    En toda la música occidental existen únicamente <strong>12 sonidos distintos</strong> antes de volver a empezar. Siete llevan nombre propio (<strong>Do, Re, Mi, Fa, Sol, La, Si</strong> — que en cifrado universal anglosajón se escriben <strong>C, D, E, F, G, A, B</strong>) y entre casi todos ellos hay una nota intermedia (las teclas negras del piano, llamadas <em>sostenidos #</em> o <em>bemoles ♭</em>).
  </p>
  <p>
    Para medir distancias entre notas no usamos centímetros sino <strong>semitonos</strong> y <strong>tonos</strong>:
  </p>
  <ul>
    <li><strong>Semitono (1 st):</strong> es el paso más pequeño posible entre dos teclas vecinas del piano (blanca con negra, o blanca con blanca donde no hay negra en medio) o entre <strong>un traste y el siguiente</strong> en una guitarra o bajo.</li>
    <li><strong>Tono (2 st):</strong> equivale a sumar <strong>dos semitonos</strong> (saltar 2 trastes en el mástil o dejar una tecla por medio en el piano).</li>
    <li><strong>La excepción natural (Mi–Fa y Si–Do):</strong> si miras un teclado verás que entre <code>Mi (E)</code> y <code>Fa (F)</code>, y entre <code>Si (B)</code> y <code>Do (C)</code>, <strong>no existe tecla negra</strong>. Eso significa que de Mi a Fa y de Si a Do hay solo <strong>1 semitono</strong> de distancia; entre todas las demás notas blancas hay 1 tono completo.</li>
    <li><strong>¿Qué es una Octava?</strong> Cuando subes los 12 semitonos completos, la vibración del aire se duplica exactamente al doble de velocidad y llegas al mismo nombre de nota pero en un piso más agudo (<code>C3 → C4 → C5</code>). Por eso una voz grave y una voz aguda pueden cantar la misma melodía a distancia de octava sin chocar.</li>
  </ul>

  <div class="callout why">
    <div class="callout-title">Escucha el mismo "Do" en tres pisos (octavas) distintos</div>
    <p class="text-sm mb-2">Pulsa cada botón y nota cómo cambia la altura (grave vs. agudo) pero la sensación de identidad es idéntica:</p>
    <div class="flex flex-wrap gap-2">
      <button type="button" class="btn-audio" data-play-note="48">🔊 C3 (Do grave)</button>
      <button type="button" class="btn-audio" data-play-note="60">🔊 C4 (Do central)</button>
      <button type="button" class="btn-audio" data-play-note="72">🔊 C5 (Do agudo)</button>
      <button type="button" class="btn-audio" data-run="demoOctaves">🔊 Escalera de 5 Octavas</button>
    </div>
  </div>

  <h3 id="intro-primer-contacto">3. Cómo orientarte hoy mismo en tu instrumento (sin saber leer partitura)</h3>
  <p>
    Cada instrumento tiene un "truco visual" para no perderse el primer día. Prueba los botones de referencia y ubica estas marcas físicas en tu teclado, guitarra o bajo:
  </p>

  <div class="grid-2">
    <div class="card">
      <h4>🎹 Mapa instantáneo del Piano</h4>
      <p class="text-xs mb-2">
        Un piano de 88 teclas parece intimidante hasta que notas que las teclas negras están agrupadas en bloques repetidos de <strong>2 negras y 3 negras</strong>:
      </p>
      <ul class="text-xs space-y-1 mb-2">
        <li>La tecla blanca justo a la <strong>izquierda del grupo de 2 negras</strong> siempre es <strong>Do (C)</strong>.</li>
        <li>La tecla blanca justo a la <strong>izquierda del grupo de 3 negras</strong> siempre es <strong>Fa (F)</strong>.</li>
      </ul>
      <div class="flex flex-wrap gap-1.5">
        <button type="button" class="btn-audio" data-play-note="60">🎹 C4 (izq. de 2 negras)</button>
        <button type="button" class="btn-audio" data-play-note="65">🎹 F4 (izq. de 3 negras)</button>
      </div>
    </div>
    <div class="card">
      <h4>🎸 Mapa rápido de Guitarra, Bajo y Voz</h4>
      <p class="text-xs mb-2">
        En guitarra y bajo, tocar una cuerda sin pisar ningún traste se llama tocar <strong>al aire (traste 0)</strong>. Para que suene limpia sin trasteo, pisa <strong>justo detrás de la varilla metálica</strong> del traste (no en mitad de la madera). Los puntos incrustados en el mástil (trastes <strong>3, 5, 7, 9</strong>) te sirven de brújula, y el <strong>doble punto del traste 12</strong> marca la octava exacta de la cuerda al aire.
      </p>
      <div class="flex flex-wrap gap-1.5">
        <button type="button" class="btn-audio" data-play-note="40">6ª E2</button>
        <button type="button" class="btn-audio" data-play-note="45">5ª A2</button>
        <button type="button" class="btn-audio" data-play-note="50">4ª D3</button>
        <button type="button" class="btn-audio" data-play-note="55">3ª G3</button>
        <button type="button" class="btn-audio" data-play-note="59">2ª B3</button>
        <button type="button" class="btn-audio" data-play-note="64">1ª e4</button>
        <button type="button" class="btn-audio" data-play-note="28">Bajo E1</button>
        <button type="button" class="btn-audio" data-run="vocalSovtSlide">🎤 Calentamiento suave</button>
      </div>
    </div>
  </div>

  <h3 id="intro-tension-registro">3B. Registro (Grave, Medio, Agudo) y Tensión vs. Reposo Melódico</h3>
  <p>
    Cuando escuchas una melodía, no solo importa qué nota suena, sino <strong>en qué piso de altura vive</strong> y <strong>si la frase parece terminar o quedar abierta en el aire</strong>:
  </p>
  <div class="grid-2 mb-4">
    <div class="card">
      <h4>↕️ Los 3 Registros Físicos</h4>
      <p class="text-xs"><strong>Registro Grave:</strong> ondas lentas que sientes en el pecho (bajo eléctrico, mano izquierda del piano, cuerdas 6ª–5ª de guitarra). Da peso y cimiento, pero si amontonas notas muy juntas suena borroso. <strong>Registro Medio:</strong> zona de la voz hablada y los acordes principales. <strong>Registro Agudo:</strong> ondas rápidas y brillantes (melodías principales, solos, flautas y voz en clímax).</p>
    </div>
    <div class="card">
      <h4>🧲 Tensión vs. Reposo (La Gravedad Musical)</h4>
      <p class="text-xs">Casi toda melodía juega a alejarse de la nota hogar (<strong>Tónica</strong>) para crear expectativa —como hacer una pregunta cuya entonación sube al final— y luego regresar a ella para dar descanso. Si te detienes en la nota <code>Si (B)</code> de Do Mayor, sientes que algo falta; al dar un solo paso hacia <code>Do (C)</code>, la frase aterriza.</p>
    </div>
  </div>

  ${buildGuidedFundamentalsWidgetHtml(
    'f1-orientacion',
    '🎹 Práctica Guiada 1/8 · Encuentra Do, Fa y tu Primera Octava en Pantalla',
    'Aplica de inmediato el mapa de 2 y 3 teclas negras tocando directamente sobre el teclado.'
  )}

  <h3 id="intro-habitos-practica">4. Plan de práctica realista (20 minutos efectivos) y errores a evitar</h3>
  <p>
    La diferencia entre quien abandona al mes y quien progresa durante años no es el "talento innato", sino <strong>cómo estructura sus primeros 20 minutos diarios</strong>:
  </p>
  <div class="grid-3">
    <div class="card">
      <h4>⏱️ 1. Consistencia diaria (15–20 min)</h4>
      <p class="text-xs">Practicar <strong>15 minutos cada día</strong> supera por goleada a tocar 3 horas solo el domingo. El cerebro consolida coordinación motora y memoria auditiva durante el descanso nocturno entre sesiones cortas. Divide tu sesión en: <strong>4 min pulso/oído + 8 min técnica lenta + 8 min canción real</strong>.</p>
    </div>
    <div class="card">
      <h4>🐢 2. Lento y relajado primero</h4>
      <p class="text-xs">Si tocas algo rápido con tensión en hombros, cuello o muñeca, estás grabando en tu memoria muscular un error difícil de borrar. Baja el metrónomo a <code>55–60 BPM</code> hasta que puedas respirar tranquilo mientras tocas. La velocidad es simplemente precisión acelerada.</p>
    </div>
    <div class="card">
      <h4>👂 3. Canta antes de mover los dedos</h4>
      <p class="text-xs">Si no puedes aplaudir un ritmo o tararear una melodía sencilla de 4 notas, tus dedos estarán adivinando a ciegas. Canta las notas o cuenta <code>1 – 2 – 3 – 4</code> en voz alta antes y durante la ejecución para conectar tu oído con tus manos.</p>
    </div>
  </div>

  <div class="callout pro" id="intro-proyecto-etapa0">
    <div class="callout-title">Proyecto de Graduación · Etapa 0</div>
    <p class="text-sm mb-2"><strong>Meta práctica:</strong> Interpretar una melodía sencilla de 5 notas (como <em>Estrellita</em> o el tema de la <em>Oda a la Alegría</em>: <code>E–E–F–G–G–F–E–D–C–C–D–E–E–D–D</code>) manteniendo un pulso constante con el pie sin detenerte entre compases.</p>
    <details>
      <summary>Lista de verificación antes de pasar a la Etapa 1 (Fundamentos)</summary>
      <ol class="text-xs mt-2">
        <li>¿Puedes dar palmas constantes sobre 8 compases de 4 pulsos acentuando levemente el pulso 1?</li>
        <li>Al escuchar dos notas seguidas, ¿distingues sin dudar cuál es más aguda, más grave o si es la misma nota en otra octava?</li>
        <li>¿Sabes ubicar <strong>C (Do)</strong> y <strong>F (Fa)</strong> en el teclado, o tocar limpias las cuerdas al aire de guitarra/bajo sin rozar las vecinas?</li>
      </ol>
    </details>
  </div>
</section>`;
}

function buildBeginnerSoundBridgeHtml(): string {
  return `
  <div class="callout why mb-4" data-nivel="1" id="t-sonido-intuitivo">
    <div class="callout-title">1. Fundamento Desde Cero · Las 4 Cualidades Reales del Sonido</div>
    <p class="text-sm mb-2">
      Antes de entrar en ecuaciones de acústica o serie armónica, tu oído juzga cualquier sonido musical a través de <strong>cuatro propiedades concretas</strong>. Entender qué cambia físicamente en cada una explica cómo afinamos, mezclamos y orquestamos:
    </p>
    <div class="grid-2 mb-3">
      <div class="card">
        <h4>1. Altura (Grave ↔ Agudo · Frecuencia en Hz)</h4>
        <p class="text-xs mb-2">Es la velocidad a la que vibra el aire (medida en ciclos por segundo o <strong>Hercios, Hz</strong>). Vibración lenta = sonido profundo (bajo/bombo). Vibración rápida = sonido brillante (flauta/cuerda 1ª). La referencia universal de afinación es <strong>La central (A4) = 440 Hz</strong>; si bajas a la mitad (<code>220 Hz</code>) obtienes A3 una octava abajo, y si duplicas (<code>880 Hz</code>) obtienes A5 una octava arriba.</p>
        <div class="flex flex-wrap gap-1.5">
          <button type="button" class="btn-audio" data-play-note="40">🔊 Grave (E2 · 82 Hz)</button>
          <button type="button" class="btn-audio" data-play-note="69">🔊 Referencia A4 (440 Hz)</button>
          <button type="button" class="btn-audio" data-play-note="76">🔊 Agudo (E5 · 659 Hz)</button>
        </div>
      </div>
      <div class="card">
        <h4>2. Timbre (El ADN o "color" del instrumento)</h4>
        <p class="text-xs mb-2">¿Por qué si un piano, una guitarra y una voz cantan exactamente la misma nota <code>C4</code> a la misma intensidad, los reconoces en medio segundo? Porque ningún instrumento real produce una frecuencia pura aislada: junto a la nota principal suenan <em>armónicos secundarios</em> y un ataque inicial distinto (martillo vs. púa vs. aire).</p>
        <div class="flex flex-wrap gap-1.5">
          <button type="button" class="btn-audio js-treatise-chord" data-inst="piano" data-notes="60" data-label="Timbre Piano C4">🎹 Do en Piano</button>
          <button type="button" class="btn-audio js-treatise-chord" data-inst="guitar" data-notes="60" data-label="Timbre Guitarra C4">🎸 Do en Guitarra</button>
        </div>
      </div>
    </div>
    <p class="text-xs mb-3">
      Las otras dos cualidades son la <strong>Duración</strong> (cuánto tiempo vibra el sonido antes de apagarse, base del ritmo) y la <strong>Intensidad o Dinámica</strong> (amplitud de la onda: tocar suave <em>piano</em> vs. tocar fuerte <em>forte</em>, clave para la expresividad).
    </p>

    <h4 class="mt-2">1.0b ¿Cómo respira una nota? (Ataque, Cuerpo y Cola) y Consonancia vs. Disonancia</h4>
    <p class="text-xs mb-2">
      Cada nota viva pasa por tres fases en el tiempo: un <strong>Ataque</strong> inicial (el golpe del martillo del piano o la púa en la cuerda), un <strong>Cuerpo o Sostenimiento</strong> (un violín o una voz pueden mantener el volumen largo rato; una guitarra se va apagando poco a poco) y una <strong>Cola</strong> al soltar la tecla o apagar la cuerda. Y cuando juntas dos notas al mismo tiempo: si sus vibraciones encajan en proporciones limpias (como la Octava o la 5ª), suenan <strong>consonantes y estables</strong>; si están pegadas a un semitono o un tritono, sus ondas chocan y producen <strong>disonancia</strong> (energía que pide avanzar hacia una nota estable).
    </p>
  </div>
  ${buildGuidedFundamentalsWidgetHtml(
    'f2-consonancia',
    '🎹 Práctica Guiada 2/8 · Consonancia Abierta vs. Fricción de Semitono',
    'Compara al instante el sonido hueco y estable de una 5ª Justa frente al roce tenso de dos notas vecinas.'
  )}`;
}

function buildBeginnerNotesBridgeHtml(): string {
  return `
  <div class="callout why mb-4" data-nivel="1" id="t-notas-guia-practica">
    <div class="callout-title">2.0b Paso a Paso · Cómo Contar Tonos y Semitonos Sin Tropezar</div>
    <p class="text-sm mb-2">
      El error más común al empezar es creer que de una tecla blanca a la siguiente siempre hay la misma distancia. Antes de construir escalas, comprueba esta regla recorriendo el teclado de izquierda a derecha:
    </p>
    <ul class="text-xs mb-0">
      <li><strong>De C a D:</strong> entre medio está la tecla negra <code>C#</code> → distan <strong>2 semitonos (1 Tono)</strong>.</li>
      <li><strong>De E (Mi) a F (Fa):</strong> no hay tecla negra entre ambas → distan solo <strong>1 Semitono</strong>. Por eso subir <strong>1 Tono desde Mi</strong> te obliga a saltar Fa natural y caer en la tecla negra <code>F#</code>.</li>
      <li><strong>De B (Si) a C (Do):</strong> tampoco hay tecla negra en medio → distan <strong>1 Semitono</strong>. Por eso subir <strong>1 Tono desde Si</strong> cae en <code>C#</code>.</li>
      <li><strong>¿Por qué una misma tecla negra tiene dos nombres (# y ♭)?</strong> Si subes desde Fa hacia Sol, pasas por <code>F#</code>; si bajas desde Sol hacia Fa, pasas por <code>G♭</code>. Suenan idénticas, pero el nombre depende de si estás subiendo, bajando o respetando las 7 letras de la escala.</li>
    </ul>
  </div>
  ${buildGuidedFundamentalsWidgetHtml(
    'f3-semitonos',
    '🎹 Práctica Guiada 3/8 · Toca los Semitonos Naturales, un Tono Completo y un Sostenido',
    'Verifica directamente en pantalla dónde no hay tecla negra y cómo cambia el sonido al alterar Fa en F#.'
  )}`;
}

function buildBeginnerRhythmFoundationHtml(): string {
  return `
  <div class="mb-5" data-nivel="1" id="t-ritmo-desde-cero">
    <div class="callout why mb-4">
      <div class="callout-title">3.0 Qué significan los dos números del compás (4/4, 3/4, 6/8)</div>
      <p class="text-sm mb-2">
        Un <strong>compás</strong> es simplemente una caja de tiempo que agrupa pulsos para que no te pierdas contando hasta el infinito. Al inicio de la partitura ves una fracción como <code>4/4</code> o <code>3/4</code>. No es una división matemática: cada número responde una pregunta diferente:
      </p>
      <div class="grid-3 mb-2">
        <div class="card">
          <h4>Numerador (arriba): ¿Cuántos pulsos caben?</h4>
          <p class="text-xs">Indica cuántos tiempos hay dentro de cada caja antes de dibujar una barra vertical. En <code>4/4</code> cuentas <code>1 – 2 – 3 – 4</code>; en <code>3/4</code> (vals) cuentas <code>1 – 2 – 3</code>.</p>
        </div>
        <div class="card">
          <h4>Denominador (abajo): ¿Qué figura vale 1 pulso?</h4>
          <p class="text-xs">El número de abajo identifica la figura unidad respecto a la redonda: un <code>4</code> abajo significa <strong>la Negra</strong> (1/4 de redonda) vale 1 pulso. Un <code>8</code> abajo significa que contamos en <strong>Corcheas</strong> (1/8 de redonda).</p>
        </div>
        <div class="card">
          <h4>¿Por qué 6/8 no es igual que 3/4?</h4>
          <p class="text-xs">Aunque matemáticamente sumen igual, <code>3/4</code> se siente en <strong>3 pulsos de 2 corcheas</strong> (<em>UN-y dos-y tres-y</em>, vals), mientras <code>6/8</code> se siente en <strong>2 pulsos grandes de 3 corcheas</strong> (<em><strong>UN</strong>-dos-tres <strong>CUATRO</strong>-cinco-seis</em>, balada/folclore).</p>
        </div>
      </div>
    </div>

    <div class="callout why mb-4">
      <div class="callout-title">3.1 Figuras Rítmicas, Silencios Gemelos y Cómo Contar en Voz Alta</div>
      <p class="text-sm mb-3">
        Toda lectura rítmica funciona bajo una regla simétrica: <strong>cada figura sonora tiene un silencio gemelo</strong> que ocupa exactamente el mismo espacio temporal. Además, para no adivinar la subdivisión dentro de un pulso, los músicos usan sílabas fijas: <strong>Negras</strong> (<code>1  2  3  4</code>), <strong>Corcheas</strong> (<code>1 y  2 y  3 y  4 y</code>) y <strong>Semicorcheas</strong> (<code>1 e y a  2 e y a</code>).
      </p>
      <div class="w-full overflow-x-auto rounded-xl bg-[#0b0e14] border border-white/10 p-3 mb-3">
        <svg viewBox="0 0 760 220" class="w-full min-w-[600px] h-auto block" role="img" aria-label="Tabla visual de figuras rítmicas y sus silencios equivalentes en 4/4">
          <rect x="0" y="0" width="760" height="220" fill="#0b0e14" rx="10" />
          <text x="18" y="24" fill="#94a3b8" font-size="11" font-weight="700">FIGURA</text>
          <text x="18" y="122" fill="#94a3b8" font-size="11" font-weight="700">SILENCIO</text>
          <text x="18" y="182" fill="#94a3b8" font-size="11" font-weight="700">EN 4/4</text>

          <!-- Redonda -->
          <g transform="translate(105,0)">
            <ellipse cx="42" cy="54" rx="13" ry="9" fill="none" stroke="#f8fafc" stroke-width="3.2" />
            <text x="42" y="88" text-anchor="middle" fill="#f8fafc" font-size="12" font-weight="700">Redonda</text>
            <line x1="22" y1="114" x2="62" y2="114" stroke="#475569" stroke-width="1.5" />
            <rect x="33" y="114" width="18" height="8" fill="#8ab4f8" />
            <text x="42" y="144" text-anchor="middle" fill="#cbd5e1" font-size="10">Cuelga de línea</text>
            <text x="42" y="182" text-anchor="middle" fill="#e5a93c" font-size="13" font-weight="800">4 pulsos</text>
            <text x="42" y="200" text-anchor="middle" fill="#64748b" font-size="10">(1 compás entero)</text>
          </g>

          <!-- Blanca -->
          <g transform="translate(235,0)">
            <ellipse cx="38" cy="60" rx="11" ry="8" transform="rotate(-18 38 60)" fill="none" stroke="#f8fafc" stroke-width="3" />
            <line x1="48" y1="58" x2="48" y2="20" stroke="#f8fafc" stroke-width="2.6" />
            <text x="42" y="88" text-anchor="middle" fill="#f8fafc" font-size="12" font-weight="700">Blanca</text>
            <line x1="22" y1="126" x2="62" y2="126" stroke="#475569" stroke-width="1.5" />
            <rect x="33" y="118" width="18" height="8" fill="#8ab4f8" />
            <text x="42" y="144" text-anchor="middle" fill="#cbd5e1" font-size="10">Sombrero arriba</text>
            <text x="42" y="182" text-anchor="middle" fill="#e5a93c" font-size="13" font-weight="800">2 pulsos</text>
            <text x="42" y="200" text-anchor="middle" fill="#64748b" font-size="10">(caben 2 por compás)</text>
          </g>

          <!-- Negra -->
          <g transform="translate(365,0)">
            <ellipse cx="38" cy="60" rx="11" ry="8" transform="rotate(-18 38 60)" fill="#f8fafc" />
            <line x1="48" y1="58" x2="48" y2="20" stroke="#f8fafc" stroke-width="2.6" />
            <text x="42" y="88" text-anchor="middle" fill="#f8fafc" font-size="12" font-weight="700">Negra</text>
            <path d="M39,106 L46,115 L38,122 L46,130 C41,131 38,134 42,138" fill="none" stroke="#8ab4f8" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" />
            <text x="42" y="150" text-anchor="middle" fill="#cbd5e1" font-size="10">Rayo (𝄽)</text>
            <text x="42" y="182" text-anchor="middle" fill="#6ee7b7" font-size="13" font-weight="800">1 pulso</text>
            <text x="42" y="200" text-anchor="middle" fill="#64748b" font-size="10">(cuenta: 1 - 2 - 3 - 4)</text>
          </g>

          <!-- Corchea -->
          <g transform="translate(495,0)">
            <ellipse cx="36" cy="60" rx="10" ry="7.5" transform="rotate(-18 36 60)" fill="#f8fafc" />
            <line x1="45" y1="58" x2="45" y2="20" stroke="#f8fafc" stroke-width="2.6" />
            <path d="M45,20 C58,27 59,37 52,46" fill="none" stroke="#e5a93c" stroke-width="2.8" stroke-linecap="round" />
            <text x="44" y="88" text-anchor="middle" fill="#f8fafc" font-size="12" font-weight="700">Corchea</text>
            <circle cx="38" cy="116" r="3.5" fill="#8ab4f8" />
            <path d="M39,117 Q46,118 49,112 L42,135" fill="none" stroke="#8ab4f8" stroke-width="2.6" stroke-linecap="round" />
            <text x="44" y="150" text-anchor="middle" fill="#cbd5e1" font-size="10">1 gancho (𝄾)</text>
            <text x="44" y="182" text-anchor="middle" fill="#8ab4f8" font-size="13" font-weight="800">1/2 pulso</text>
            <text x="44" y="200" text-anchor="middle" fill="#64748b" font-size="10">(cuenta: 1 y 2 y)</text>
          </g>

          <!-- Semicorchea -->
          <g transform="translate(625,0)">
            <ellipse cx="36" cy="60" rx="10" ry="7.5" transform="rotate(-18 36 60)" fill="#f8fafc" />
            <line x1="45" y1="58" x2="45" y2="20" stroke="#f8fafc" stroke-width="2.6" />
            <path d="M45,20 C58,26 59,34 52,41" fill="none" stroke="#e5a93c" stroke-width="2.6" stroke-linecap="round" />
            <path d="M45,28 C58,34 59,42 52,49" fill="none" stroke="#e5a93c" stroke-width="2.6" stroke-linecap="round" />
            <text x="46" y="88" text-anchor="middle" fill="#f8fafc" font-size="12" font-weight="700">Semicorchea</text>
            <circle cx="37" cy="112" r="3.2" fill="#8ab4f8" />
            <circle cx="35" cy="122" r="3.2" fill="#8ab4f8" />
            <path d="M38,113 Q45,114 48,108 L41,136 M36,123 Q43,124 46,119" fill="none" stroke="#8ab4f8" stroke-width="2.4" stroke-linecap="round" />
            <text x="46" y="150" text-anchor="middle" fill="#cbd5e1" font-size="10">2 ganchos (𝄿)</text>
            <text x="46" y="182" text-anchor="middle" fill="#c4b5fd" font-size="13" font-weight="800">1/4 pulso</text>
            <text x="46" y="200" text-anchor="middle" fill="#64748b" font-size="10">(cuenta: 1-e-y-a)</text>
          </g>
        </svg>
      </div>
      <p class="text-xs m-0">
        <strong>Ejemplo resuelto de suma en 4/4:</strong> Imagina un compás con <code>Blanca + Silencio de Negra + Dos Corcheas</code>. La Blanca ocupa los pulsos <strong>1 y 2</strong> (dejas sonar la nota); en el pulso <strong>3</strong> apagas el sonido por el silencio de negra; y en el pulso <strong>4</strong> tocas dos notas rápidas iguales (<strong>4 y</strong>). Total: <code>2 + 1 + (0.5 + 0.5) = 4 pulsos exactos</code>.
      </p>
    </div>

    <h3 id="t-ritmo-modificadores">3.2 Los 5 recursos que dan movimiento y groove al ritmo</h3>
    <p>
      Si toda la música usara solo figuras cuadradas sobre los pulsos 1–2–3–4 sonaría robótica. Estos cinco modificadores explican el 95% de los ritmos modernos en pop, rock, funk, jazz y música latina:
    </p>
    <div class="grid-3 mb-4">
      <div class="card">
        <h4>• El Puntillo (+50% de duración)</h4>
        <p class="text-xs">Un punto colocado a la derecha de cualquier figura o silencio le suma <strong>exactamente la mitad de su valor</strong>. Así, una Blanca (2) con puntillo dura <code>2 + 1 = 3 pulsos</code> (llena un compás entero de 3/4), y una Negra (1) con puntillo dura <code>1 + 0.5 = 1.5 pulsos</code> (3 corcheas seguidas, muy común antes de una corchea suelta).</p>
      </div>
      <div class="card">
        <h4>⌒ Ligadura de Prolongación</h4>
        <p class="text-xs">Es un arco curvo que une <strong>dos notas de exactamente la misma altura</strong>. No vuelves a golpear ni pulsar la segunda nota: simplemente sumas sus tiempos. Es la única forma de hacer que un acorde empiece al final de un compás y siga sonando al cruzar la barra hacia el compás siguiente.</p>
      </div>
      <div class="card">
        <h4>🚀 Anacrusa (Entrada antes del 1)</h4>
        <p class="text-xs">No todas las melodías empiezan en el pulso 1. Cuando una frase arranca en los pulsos 3 o 4 del compás previo para "tomar impulso" hacia el pulso 1 fuerte, esa entrada se llama <strong>anacrusa</strong> (por ejemplo, al cantar <em>"Cum-ple-"</em> antes de caer con fuerza en <em>"<strong>años</strong>"</em>).</p>
      </div>
      <div class="card">
        <h4>⚡ Contratiempo vs. Síncopa</h4>
        <p class="text-xs"><strong>Contratiempo:</strong> guardas silencio en los pulsos fuertes (1 y 3) y golpeas en los intermedios débiles (como el "skank" del reggae o la guitarra ska). <strong>Síncopa:</strong> atacas en una subdivisión débil (<em>"y"</em> del 2) y <strong>prolongas</strong> esa nota por encima del tiempo fuerte siguiente (el 3), desplazando el peso rítmico.</p>
      </div>
      <div class="card">
        <h4>🎷 Swing / Shuffle (Rebote 2:1)</h4>
        <p class="text-xs">Aunque en partitura se vean dos corcheas iguales, en el blues, jazz y rock &amp; roll se interpretan como si el pulso estuviera partido en tres (tresillo) y la primera nota se quedara con dos partes y la segunda con una (<code>2/3 + 1/3</code>). Crea esa sensación saltarina de <em>"da-ba-da-ba-da"</em>.</p>
      </div>
      <div class="card">
        <h4>🔺 El Tresillo (3 golpes en el espacio de 2)</h4>
        <p class="text-xs">Normalmente un pulso se parte en 2 corcheas (<em>1-y</em>) o 4 semicorcheas (<em>1-e-y-a</em>). El <strong>tresillo</strong> rompe esa regla metiendo <strong>3 golpes idénticos en 1 solo pulso</strong> (di en voz alta <em>"MÚ-si-ca, MÚ-si-ca"</em> sobre cada golpe de pie). Es el motor de baladas lentas, blues y arpegios fluidos.</p>
      </div>
    </div>

    <article class="interactive-widget mt-4" id="lab-ritmo-inicio" data-lab="rhythm-starter-lab" data-nivel="1">
      <div class="widget-header">
        <div>
          <span class="widget-tag">Laboratorio Etapa 1 · Ritmo Desde Cero</span>
          <h3>⏱️ Entrenador Visual de Pulso 4/4, Silencios, Puntillo, Síncopa y Swing</h3>
          <p class="text-sm">Elige cualquier patrón abajo, observa en qué casilla del compás suena cada golpe o silencio y escúchalo sobre el metrónomo.</p>
        </div>
      </div>
      <div class="lab-stage"></div>
    </article>
  </div>`;
}

function buildBeginnerMajorScaleLadderHtml(): string {
  return `
  <div class="mb-5" data-nivel="1" id="t-escalas-escalera-intuitiva">
    <div class="callout pro mb-4">
      <div class="callout-title">4.0 Antes de hablar de "tetracordos": ¿Cómo nace una Escala Mayor?</div>
      <p class="text-sm mb-2">
        Una escala es simplemente una selección ordenada de notas que suben desde una nota de partida (llamada <strong>Tónica</strong> o grado <code>1</code>) hasta su octava (grado <code>8</code>). Para que cualquier grupo de 7 notas suene con esa sensación luminosa, abierta y familiar de la <strong>Escala Mayor</strong>, sus escalones deben respetar siempre la misma huella de distancias:
      </p>
      <p class="text-sm mb-3">
        Fórmula fija: <code>Tono – Tono – Semitono – Tono – Tono – Tono – Semitono</code> (<code>2 – 2 – 1 – 2 – 2 – 2 – 1</code> semitonos). En otras palabras, <strong>todos los pasos son grandes (1 Tono = 2 trastes) excepto dos pasos pequeños (1 Semitono = 1 traste) entre los grados 3→4 y 7→8</strong>.
      </p>

      <div class="table-wrap mb-3">
        <table>
          <thead>
            <tr>
              <th>Escala</th>
              <th>1 → 2 (T)</th>
              <th>2 → 3 (T)</th>
              <th>3 → 4 (S)</th>
              <th>4 → 5 (T)</th>
              <th>5 → 6 (T)</th>
              <th>6 → 7 (T)</th>
              <th>7 → 8 (S)</th>
              <th>¿Por qué cambia?</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><strong>C Mayor</strong></td>
              <td>C → D (2 st)</td>
              <td>D → E (2 st)</td>
              <td><strong>E → F (1 st)</strong></td>
              <td>F → G (2 st)</td>
              <td>G → A (2 st)</td>
              <td>A → B (2 st)</td>
              <td><strong>B → C (1 st)</strong></td>
              <td>0 alteraciones: los semitonos naturales caen justo en 3→4 y 7→8.</td>
            </tr>
            <tr>
              <td><strong>G Mayor</strong></td>
              <td>G → A (2 st)</td>
              <td>A → B (2 st)</td>
              <td><strong>B → C (1 st)</strong></td>
              <td>C → D (2 st)</td>
              <td>D → E (2 st)</td>
              <td>E → <strong>F#</strong> (2 st)</td>
              <td><strong>F# → G (1 st)</strong></td>
              <td>Sin alterar, E→F mide solo 1 st; subimos F a <strong>F#</strong> para cumplir T en 6→7 y S en 7→8.</td>
            </tr>
            <tr>
              <td><strong>F Mayor</strong></td>
              <td>F → G (2 st)</td>
              <td>G → A (2 st)</td>
              <td>A → <strong>B♭</strong> (1 st)</td>
              <td><strong>B♭</strong> → C (2 st)</td>
              <td>C → D (2 st)</td>
              <td>D → E (2 st)</td>
              <td><strong>E → F (1 st)</strong></td>
              <td>Sin alterar, A→B mide 2 st; bajamos B a <strong>B♭</strong> para cumplir el S obligatorio en 3→4.</td>
            </tr>
          </tbody>
        </table>
      </div>

      <h4 id="t-escalas-origen-menor" class="mt-3">4.0b ¿Por qué existen 3 Escalas Menores (Natural, Armónica y Melódica)?</h4>
      <p class="text-xs mb-2">
        Si tocas exactamente las mismas 7 teclas blancas de Do Mayor, pero empiezas y terminas tu melodía en la <strong>6ª nota (La / A)</strong> (<code>A – B – C – D – E – F – G – A</code>), los dos semitonos naturales (<code>B–C</code> y <code>E–F</code>) se mueven de lugar y quedan entre los grados <strong>2→3</strong> y <strong>5→6</strong>. Eso produce la <strong>Escala Menor Natural</strong> (<code>1 - 2 - ♭3 - 4 - 5 - ♭6 - ♭7</code>), cuya tercera rebajada (<code>♭3</code>) crea ese color íntimo y melancólico.
      </p>
      <ul class="text-xs mb-2">
        <li><strong>¿Por qué inventaron la Menor Armónica?</strong> En la menor natural, el 7º grado (<code>G</code>) está a un tono entero debajo de la tónica (<code>A</code>) y le falta fuerza para cerrar un acorde dominante fuerte (<code>E7 → Am</code>). Por eso subieron medio tono el 7º grado (<code>G → G#</code>), creando una escala con fuerza armónica y un salto exótico de 3 semitonos entre <code>F</code> y <code>G#</code> (sello del flamenco, música árabe y metal neoclásico).</li>
        <li><strong>¿Por qué nació la Menor Melódica?</strong> Para suavizar al cantar ese salto brusco de 3 semitonos (<code>F → G#</code>), subieron también medio tono el 6º grado al subir (<code>F# → G# → A</code>), creando una escala híbrida: parte grave menor (<code>♭3</code>) y parte aguda brillante como la mayor.</li>
      </ul>
      <h4 id="t-escalas-pentatonica-segura" class="mt-2">4.0c ¿Por qué la Escala Pentatónica "nunca suena mal" al improvisar?</h4>
      <p class="text-xs m-0">
        Una escala Mayor tiene 7 notas, pero dos de ellas (el <strong>4º</strong> y el <strong>7º grado</strong>, como <code>F</code> y <code>B</code> en Do Mayor) forman entre sí un <strong>tritono tenso</strong> que puede chocar si te quedas apoyado en ellas sobre el acorde incorrecto. La <strong>Pentatónica</strong> simplemente quita esas dos notas conflictivas y conserva las <strong>5 notas más estables</strong> (Mayor: <code>1–2–3–5–6</code>; Menor: <code>1–♭3–4–5–♭7</code>), convirtiéndose en una red de seguridad sonora en rock, blues, pop y música tradicional mundial.
      </p>
    </div>

    ${buildGuidedFundamentalsWidgetHtml(
      'f4-mayor-menor',
      '🎹 Práctica Guiada 4/8 · Escucha y Toca Mayor vs. Menor y Menor Armónica',
      'Cambia con tus propios dedos la 3ª nota y descubre en directo cómo cambia la emoción de toda la frase.'
    )}

    <article class="interactive-widget mb-4" id="lab-escala-escalera" data-lab="major-scale-ladder-lab" data-nivel="1">
      <div class="widget-header">
        <div>
          <span class="widget-tag">Visualizador Etapa 1 · Escalera T–T–S–T–T–T–S</span>
          <h3>🪜 Constructor Intuitivo de la Escala Mayor (C vs. G vs. F) y Grados 1–7</h3>
          <p class="text-sm">Compara escalón por escalón cómo aparecen el sostenido en G Mayor y el bemol en F Mayor, y haz clic en cada grado para escucharlo.</p>
        </div>
      </div>
      <div class="lab-stage"></div>
    </article>
  </div>`;
}

function buildBeginnerIntervalsBridgeHtml(): string {
  return `
  <div class="callout why mb-4" data-nivel="1" id="t-intervalos-mapa-emocional">
    <div class="callout-title">5.0 Antes de memorizar números · ¿Qué siente el oído con cada intervalo?</div>
    <p class="text-sm mb-2">
      Un intervalo no es solo una resta de trastes o teclas: es un <strong>gesto expresivo</strong>. Si relacionas los intervalos principales con su papel en canciones reales, los recordarás para siempre:
    </p>
    <div class="grid-3 mb-0">
      <div class="card">
        <h4>🎭 3ª Menor vs. 3ª Mayor</h4>
        <p class="text-xs">Son el corazón emocional del acorde. La <strong>3ª Mayor (4 st)</strong> suena abierta y optimista; la <strong>3ª Menor (3 st)</strong> suena introspectiva, bluesera o nostálgica.</p>
      </div>
      <div class="card">
        <h4>🛡️ 4ª Justa vs. 5ª Justa</h4>
        <p class="text-xs">La <strong>4ª Justa (5 st)</strong> tiene empuje ascendente de fanfarria o inicio de estribillo. La <strong>5ª Justa (7 st)</strong> es el ancla más sólida: casi todo riff de rock con distorsión usa raíz + 5ª.</p>
      </div>
      <div class="card">
        <h4>⚡ 2ª Menor y Tritono</h4>
        <p class="text-xs">La <strong>2ª Menor (1 st)</strong> es roce inmediato y suspenso. El <strong>Tritono (6 st)</strong> divide la octava exactamente a la mitad y exige resolver hacia un acorde estable.</p>
      </div>
    </div>
  </div>
  ${buildGuidedFundamentalsWidgetHtml(
    'f5-intervalos-emocion',
    '🎹 Práctica Guiada 5/8 · Construye y Reconoce Intervalos Tocando en Pantalla',
    'Arma una 4ª Justa y un Tritono desde Do, y supera el reto auditivo distinguiendo la 3ª Mayor.'
  )}`;
}

function buildBeginnerTonalityAndKeySigHtml(): string {
  return `
  <div class="mb-5" data-nivel="1" id="t-tonalidades-que-es">
    <div class="callout why mb-4">
      <div class="callout-title">6.0 En lenguaje claro · Qué es una Tonalidad y Cómo Identificarla</div>
      <p class="text-sm mb-2">
        Decir que una canción "está en tonalidad de <strong>Sol Mayor</strong>" no es un tecnicismo abstracto: significa tres cosas muy prácticas para cualquier músico que la toque o la improvise:
      </p>
      <div class="grid-3 mb-3">
        <div class="card">
          <h4>🏠 1. El centro de gravedad (Tónica)</h4>
          <p class="text-xs">La nota <code>Sol</code> (y el acorde <code>G</code>) funciona como "la casa". Todas las demás notas crean mayor o menor tensión hasta que regresan a Sol, donde la frase se siente conclusiva y estable.</p>
        </div>
        <div class="card">
          <h4>🎨 2. Una paleta compartida de 7 notas</h4>
          <p class="text-xs">Tanto la voz como el bajo, los solos y los acordes se fabrican usando principalmente las 7 notas de esa escala (en Sol Mayor: <code>G–A–B–C–D–E–F#</code>) para sonar cohesivos sin notas "fuera de lugar".</p>
        </div>
        <div class="card">
          <h4>👂 3. Cómo sacar el tono de oído en 3 pasos</h4>
          <p class="text-xs"><strong>1)</strong> Canta la nota que más pide descanso al final del estribillo y búscala en una cuerda/tecla. <strong>2)</strong> Prueba tocar su acorde Mayor y Menor encima para oír cuál encaja. <strong>3)</strong> Verifica si aparecen sus acordes vecinos (IV y V) o su relativo menor (6º grado).</p>
        </div>
      </div>

      <h4 class="mt-2">6.0b ¿Cómo leer una Armadura de Clave en menos de 5 segundos?</h4>
      <p class="text-xs mb-2">
        La <strong>Armadura</strong> son los sostenidos (<code>#</code>) o bemoles (<code>♭</code>) dibujados al principio de cada renglón de la partitura. Siempre aparecen en un orden fijo (Sostenidos: <code>F# – C# – G# – D# – A# – E# – B#</code>; Bemoles en orden exactamente opuesto: <code>B♭ – E♭ – A♭ – D♭ – G♭ – C♭ – F♭</code>). Para saber al instante qué tonalidad Mayor representan, usa estas dos reglas infalibles:
      </p>
      <ul class="text-xs mb-0">
        <li><strong>Si ves Sostenidos (#):</strong> mira el <strong>último sostenido</strong> de la derecha y súbele <strong>1 semitono (1 nota arriba)</strong>. Ejemplos: <code>1# (F#) → G Mayor</code>; <code>2# (F#, C#) → D Mayor</code>; <code>4# (F#, C#, G#, D#) → E Mayor</code>.</li>
        <li><strong>Si ves Bemoles (♭):</strong> si hay solo 1 bemol (<code>B♭</code>), memoriza la única excepción: es <strong>F Mayor</strong>. Con 2 o más bemoles, la respuesta es directamente el <strong>penúltimo bemol</strong>. Ejemplos: <code>2♭ (B♭, E♭) → B♭ Mayor</code>; <code>3♭ (B♭, E♭, A♭) → E♭ Mayor</code>.</li>
        <li><strong>Y para saber su Relativa Menor:</strong> baja <strong>3 semitonos</strong> desde la tónica Mayor (ej. G Mayor → Em; F Mayor → Dm; E♭ Mayor → Cm).</li>
      </ul>
      <h4 class="mt-3">6.0c Relativa vs. Paralela: dos formas opuestas de cambiar el color</h4>
      <ul class="text-xs mb-0">
        <li><strong>Tonalidad Relativa (mismas notas, distinto hogar):</strong> <code>Do Mayor</code> y <code>La menor</code> usan exactamente las mismas 7 teclas blancas (<code>0 alteraciones</code>), pero cambian la nota de descanso (<code>C → Am → F → G</code> suena abierto; <code>Am → F → C → G</code> suena reflexivo).</li>
        <li><strong>Tonalidad Paralela (mismo hogar, distintas notas):</strong> <code>Do Mayor</code> (<code>C–D–E–F–G–A–B</code>) frente a <code>Do menor</code> (<code>C–D–E♭–F–G–A♭–B♭</code>). Conservan la misma nota raíz <code>Do</code> como casa, pero introducen 3 bemoles para volver oscuro o épico el paisaje (por eso cuando una canción en <code>C</code> mete de golpe <code>Fm</code> o <code>A♭</code> suena tan cinematográfica).</li>
      </ul>
    </div>

    ${buildGuidedFundamentalsWidgetHtml(
      'f6-centro-tonal',
      '🎹 Práctica Guiada 6/8 · Siente la Nota Sensible y los Dos Hogares de una Tonalidad',
      'Comprueba tocando B→C y F#→G por qué las alteraciones nacen para empujar la melodía hacia su Tónica.'
    )}

    <article class="interactive-widget mb-4" id="lab-lector-armaduras" data-lab="key-signature-lab" data-nivel="1">
      <div class="widget-header">
        <div>
          <span class="widget-tag">Entrenador Etapa 1 · Lectura Rápida de Partituras</span>
          <h3>🗝️ Lector de Armaduras en 5 Segundos (Regla del Último # / Penúltimo ♭)</h3>
          <p class="text-sm">Suma o quita sostenidos y bemoles en Clave de Sol o Clave de Fa para deducir la tonalidad mayor, su relativa menor y escuchar la cadencia de reposo.</p>
        </div>
      </div>
      <div class="lab-stage"></div>
    </article>
  </div>`;
}

function buildBeginnerReadingSymbolsHtml(): string {
  return `
  <div class="callout why mb-4" data-nivel="1" id="t-lectura-simbolos-base">
    <div class="callout-title">7.0 Guía Visual Rápida · Señales de Navegación en Partituras y Lead Sheets</div>
    <p class="text-sm mb-2">
      Saber leer alturas (en qué línea/espacio está cada óvalo) y ritmos (cuánto dura) no basta si no conoces las "señales de tráfico" que indican cuándo repetir un pasaje, qué casilla tomar en la segunda vuelta o qué significa una barra diagonal encima de un acorde. Observa estos cuatro pares esenciales:
    </p>
    <div class="w-full overflow-x-auto rounded-xl bg-[#0b0e14] border border-white/10 p-3">
      <svg viewBox="0 0 760 155" class="w-full min-w-[600px] h-auto block" role="img" aria-label="Símbolos básicos de lectura: barra de compás, doble barra, repetición, casillas 1 y 2, ligaduras y cifrado con barra">
        <rect x="0" y="0" width="760" height="155" fill="#0b0e14" rx="10" />
        <!-- Barra simple y doble barra -->
        <g transform="translate(20,16)">
          <rect width="168" height="122" rx="8" fill="#121722" stroke="#232c3d" />
          <line x1="20" y1="36" x2="148" y2="36" stroke="#334155" stroke-width="1.2" />
          <line x1="20" y1="48" x2="148" y2="48" stroke="#334155" stroke-width="1.2" />
          <line x1="20" y1="60" x2="148" y2="60" stroke="#334155" stroke-width="1.2" />
          <line x1="65" y1="32" x2="65" y2="64" stroke="#f8fafc" stroke-width="2" />
          <line x1="126" y1="32" x2="126" y2="64" stroke="#f8fafc" stroke-width="2" />
          <line x1="133" y1="32" x2="133" y2="64" stroke="#e5a93c" stroke-width="5" />
          <text x="84" y="88" text-anchor="middle" fill="#f8fafc" font-size="11" font-weight="700">Compás y Barra Final</text>
          <text x="84" y="106" text-anchor="middle" fill="#94a3b8" font-size="9.5">Separa compases / Cierra obra</text>
        </g>

        <!-- Repetición y Casillas -->
        <g transform="translate(204,16)">
          <rect width="168" height="122" rx="8" fill="#121722" stroke="#232c3d" />
          <line x1="18" y1="46" x2="150" y2="46" stroke="#334155" stroke-width="1.2" />
          <line x1="18" y1="58" x2="150" y2="58" stroke="#334155" stroke-width="1.2" />
          <path d="M26,28 L26,20 L80,20 L80,28" fill="none" stroke="#8ab4f8" stroke-width="1.8" />
          <text x="34" y="34" fill="#8ab4f8" font-size="10" font-weight="800">1.</text>
          <path d="M84,28 L84,20 L146,20" fill="none" stroke="#4ea87b" stroke-width="1.8" />
          <text x="92" y="34" fill="#4ea87b" font-size="10" font-weight="800">2.</text>
          <circle cx="72" cy="48" r="2.6" fill="#e5a93c" />
          <circle cx="72" cy="56" r="2.6" fill="#e5a93c" />
          <line x1="78" y1="38" x2="78" y2="66" stroke="#e5a93c" stroke-width="2" />
          <line x1="83" y1="38" x2="83" y2="66" stroke="#e5a93c" stroke-width="4" />
          <text x="84" y="88" text-anchor="middle" fill="#f8fafc" font-size="11" font-weight="700">Repetición :|| y Casillas</text>
          <text x="84" y="106" text-anchor="middle" fill="#94a3b8" font-size="9.5">1ª vuelta va por 1., 2ª salta a 2.</text>
        </g>

        <!-- Ligadura Prolongación vs Expresión -->
        <g transform="translate(388,16)">
          <rect width="168" height="122" rx="8" fill="#121722" stroke="#232c3d" />
          <ellipse cx="40" cy="52" rx="8" ry="6" fill="#f8fafc" />
          <ellipse cx="82" cy="52" rx="8" ry="6" fill="#f8fafc" />
          <path d="M42,40 Q61,24 80,40" fill="none" stroke="#4ea87b" stroke-width="2.5" />
          <ellipse cx="114" cy="56" rx="7" ry="5.5" fill="#cbd5e1" />
          <ellipse cx="142" cy="40" rx="7" ry="5.5" fill="#cbd5e1" />
          <path d="M114,46 Q126,22 142,30" fill="none" stroke="#c4b5fd" stroke-width="2.2" stroke-dasharray="3,2" />
          <text x="84" y="88" text-anchor="middle" fill="#f8fafc" font-size="11" font-weight="700">Prolongación vs. Expresión</text>
          <text x="84" y="106" text-anchor="middle" fill="#94a3b8" font-size="9.5">Misma nota = suma / Distintas = legato</text>
        </g>

        <!-- Cortesía y Slash Chord -->
        <g transform="translate(572,16)">
          <rect width="168" height="122" rx="8" fill="#121722" stroke="#232c3d" />
          <text x="48" y="54" text-anchor="middle" fill="#8ab4f8" font-size="17" font-weight="800">(♮)</text>
          <text x="116" y="54" text-anchor="middle" fill="#e5a93c" font-size="18" font-weight="800">C / E</text>
          <text x="84" y="88" text-anchor="middle" fill="#f8fafc" font-size="11" font-weight="700">Cortesía (♮) y Bajo C/E</text>
          <text x="84" y="106" text-anchor="middle" fill="#94a3b8" font-size="9.5">(♮) recuerda / C/E = Do con bajo Mi</text>
        </g>
      </svg>
    </div>

    <h4 class="mt-3">7.0b Cómo leer notas en Pentagrama y Tablatura (TAB) desde cero</h4>
    <div class="grid-2 mt-2">
      <div class="card">
        <h4>🎼 Regla de Contorno en Pentagrama (Paso vs. Salto)</h4>
        <p class="text-xs mb-0">
          En lugar de contar desde abajo nota por nota, lee la <strong>forma del dibujo</strong> desde tres anclas (<code>C4</code> abajo con su rayita, <code>G4</code> en la 2ª línea y <code>C5</code> en el 3er espacio): si una nota pasa de <strong>línea a espacio pegado</strong> (o viceversa), solo avanzaste <strong>1 paso</strong> (2ª: Do→Re); si salta de <strong>línea a siguiente línea</strong> o de espacio a siguiente espacio, saltaste una <strong>3ª</strong> (Do→Mi).
        </p>
      </div>
      <div class="card">
        <h4>🎸 Cómo leer Tablatura (TAB) sin invertir las cuerdas</h4>
        <p class="text-xs mb-0">
          Una TAB tiene 6 líneas (guitarra) o 4 (bajo), y aquí ocurre el error #1: <strong>la línea de arriba es la cuerda 1ª más aguda y delgada (<code>e</code>), y la de abajo es la 6ª gruesa (<code>E</code>)</strong> (como mirar el mástil hacia abajo mientras tocas). Un <code>0</code> es cuerda al aire, <code>5</code> es traste 5; <code>h</code> = ligado ascendente (<em>hammer-on</em>), <code>p</code> = descendente (<em>pull-off</em>), <code>/</code> = deslizar (<em>slide</em>) y <code>b</code> = estirar la cuerda (<em>bend</em>).
        </p>
      </div>
    </div>
  </div>
  ${buildGuidedFundamentalsWidgetHtml(
    'f7-lectura-anclas',
    '🎼 Práctica Guiada 7/8 · Lee el Pentagrama en Vivo Tocando la Tecla Correcta',
    'Observa en qué línea o espacio del pentagrama cae cada nota ancla y tócala directamente en el teclado.'
  )}`;
}

function buildBeginnerEarBridgeHtml(): string {
  return `
  <div class="callout why mb-4" data-nivel="1" id="t-oido-ruta-progresiva">
    <div class="callout-title">8.0 Método Práctico en 4 Niveles · Cómo Entrenar el Oído Sin "Oído Absoluto"</div>
    <p class="text-sm mb-2">
      Educar el oído no consiste en adivinar notas sueltas por magia, sino en hacerle cuatro preguntas ordenadas a la música mientras la escuchas:
    </p>
    <div class="grid-2 mb-0">
      <div class="card">
        <h4>1. Dirección y Estabilidad (Nivel 1)</h4>
        <p class="text-xs">Antes de nombrar intervalos, entrena si la melodía <strong>sube, baja o repite</strong> y cuál es la nota final donde toda la banda descansa (la <strong>Tónica = 1</strong>). Cántala con la sílaba <em>"La"</em> o mantén un zumbido suave mientras suena la canción.</p>
      </div>
      <div class="card">
        <h4>2. Color Mayor vs. Menor y Progresiones (Niveles 1–2)</h4>
        <p class="text-xs">Al escuchar un acorde, pregunta si su 3ª suena abierta/alegre (Mayor) o recogida/oscura (Menor), y si el bajo sube por pasos (<code>I–ii–iii–IV</code>) o cae con fuerza resolutiva al final del estribillo (<code>V → I</code>). Combina esto con el entrenador táctil de abajo todos los días 5 minutos.</p>
      </div>
    </div>
  </div>
  ${buildGuidedFundamentalsWidgetHtml(
    'f8-oido-activo',
    '👂 Práctica Guiada 8/8 · Oído Relativo en Vivo (Escucha y Toca la Nota en Pantalla)',
    'Escucha la nota hogar Do (C4) + una nota incógnita y encuéntrala directamente con tus dedos en el teclado.'
  )}`;
}

function gatePolyrhythmSectionForBeginners(html: string): string {
  // Wrap the advanced h3#t-ritmo-polirritmia block and anything after it inside <div data-nivel="3">
  const polyIdx = html.indexOf('<h3 id="t-ritmo-polirritmia"');
  if (polyIdx === -1) return html;
  const endSectionIdx = html.lastIndexOf('</section>');
  if (endSectionIdx === -1 || endSectionIdx <= polyIdx) return html;
  const advancedPart = html.slice(polyIdx, endSectionIdx);
  const gated = `
  <div data-nivel="3" data-menu="Polirritmia (MCM), Compases Irregulares y Konnakol (Etapa 4)" class="mt-6">
    <div class="callout pro mb-4">
      <div class="callout-title">Profundización · Compases Irregulares, Polirritmia y Konnakol</div>
      <p class="text-xs">Esta segunda mitad del capítulo explora métricas asimétricas (<code>5/4, 7/8, 11/8</code>), polirritmia por Mínimo Común Múltiplo y sílabas rítmicas Konnakol. Si estás empezando, domina primero la tabla de figuras, el puntillo y el entrenador de 4/4 de la parte superior.</p>
    </div>
    ${advancedPart}
  </div>`;
  return html.slice(0, polyIdx) + gated + html.slice(endSectionIdx);
}

function insertBeforeFirstExerciseCallout(sectionHtml: string, insertionHtml: string): string {
  const match = sectionHtml.match(/<div\s+class="callout\s+exercise\b/i);
  if (match && match.index !== undefined) {
    return sectionHtml.slice(0, match.index) + '\n' + insertionHtml + '\n' + sectionHtml.slice(match.index);
  }
  const endIdx = sectionHtml.lastIndexOf('</section>');
  if (endIdx !== -1) {
    return sectionHtml.slice(0, endIdx) + '\n' + insertionHtml + '\n' + sectionHtml.slice(endIdx);
  }
  return sectionHtml + '\n' + insertionHtml;
}

function buildCounterpointStage3Html(): string {
  return `
  <div class="mb-5" data-nivel="2" id="c-contrapunto-avanzado">
    <h3 id="c-contrapunto-polifonia">3. Reglas Reales del Contrapunto: Consonancias, Canon, Fuga y Conducción Moderna</h3>
    <p>
      El contrapunto enseña a escribir dos o más melodías que suenan bien juntas pero conservan su propia personalidad rítmica y direccional. Para evitar que dos voces se fundan en un bloque rígido o suenen "pegadas", la tradición clásica y el arreglo moderno comparten tres principios claros:
    </p>
    <ul>
      <li><strong>Prioriza 3ªs y 6ªs (consonancias imperfectas):</strong> son intervalos cálidos que admiten movimiento fluido de una voz respecto a la otra sin perder claridad.</li>
      <li><strong>Evita 5ªs y 8ªs paralelas:</strong> si dos voces forman una 5ª justa (ej. <code>C–G</code>) y ambas suben al mismo tiempo otra 5ª (<code>D–A</code>), el oído deja de percibir dos melodías independientes y escucha un único sonido engrosado.</li>
      <li><strong>Prefiere movimiento contrario y oblicuo:</strong> cuando una voz sube, la otra baja (contrario) o se queda quieta en una nota común mientras la otra camina (oblicuo).</li>
    </ul>
    <div class="grid-2 mb-4">
      <div class="card">
        <h4>🔁 Imitación y Canon (Diálogo Desfasado)</h4>
        <p class="text-xs">Una misma melodía (el <em>antecedente</em>) es imitada uno o dos compases después por otra voz (el <em>consecuente</em>) al unísono, a la octava o a la quinta. Funciona porque cada compás fue compuesto para armonizar por 3ªs y 6ªs con el compás que viene detrás.</p>
      </div>
      <div class="card">
        <h4>🏛️ Fuga: Sujeto, Respuesta y Contrasujeto</h4>
        <p class="text-xs">La voz 1 expone el <strong>Sujeto</strong> (tema corto con perfil rítmico reconocible); cuando entra la voz 2 con la <strong>Respuesta</strong> (transportada a la 5ª), la voz 1 teje un <strong>Contrasujeto</strong> de ritmo complementario: cuando una voz corre en corcheas, la otra respira con notas largas.</p>
      </div>
      <div class="card">
        <h4>🎼 Contrapunto a 3 y 4 Voces (Coral S–A–T–B)</h4>
        <p class="text-xs">Al añadir 3ª y 4ª voz, el oído percibe con más nitidez los extremos: <strong>Soprano y Bajo</strong> forman la columna vertebral mediante movimiento contrario, mientras Contralto y Tenor mantienen notas comunes o resuelven por semitono evitando cruzar registros.</p>
      </div>
      <div class="card">
        <h4>🎷 Conducción Moderna (Guías 3ª–7ª)</h4>
        <p class="text-xs">En <code>Dm7 → G7 → Cmaj7</code>, la 7ª de Dm7 (<code>C</code>) baja solo medio tono a la 3ª de G7 (<code>B</code>), y la 7ª de G7 (<code>F</code>) baja medio tono a la 3ª de Cmaj7 (<code>E</code>). Es contrapunto puro aplicado a cifrado moderno para que los acordes fluyan sin saltos bruscos.</p>
      </div>
    </div>

    <article class="interactive-widget mt-4 mb-4" id="lab-contrapunto-estudio" data-lab="counterpoint-lab" data-nivel="2">
      <div class="widget-header">
        <div>
          <span class="widget-tag">Laboratorio Etapa 5 · Polifonía y Voice Leading</span>
          <h3>🎼 Estudio Interactivo de Contrapunto (Especies, Canon, Fuga y 3–4 Voces)</h3>
          <p class="text-sm">Explora movimientos contrario, oblicuo y paralelo, detecta al instante 5ªs y 8ªs paralelas y corrige cada nota con <code>▲ / ▼</code> mientras escuchas el resultado.</p>
        </div>
      </div>
      <div class="lab-stage"></div>
    </article>
  </div>`;
}

function buildImprovisationGymStage3Html(): string {
  return `
  <div class="mb-5" data-nivel="2" id="ge-improvisacion-bloque">
    <h3 id="ge-improvisacion-lenguaje">3. Cómo Construir Solos que Digan Algo: Frases, Motivos y Notas Objetivo</h3>
    <p>
      El error más común al empezar a improvisar es tocar sin parar todas las notas de la escala pentatónica de arriba abajo como un ejercicio mecánico. Un solo memorable funciona igual que hablar: usa <strong>frases cortas, pausas para respirar y aterrizajes exactos</strong> sobre las notas que definen el acorde que suena debajo (especialmente su <strong>3ª</strong> y su <strong>7ª</strong>, nunca dejando la frase colgada al azar).
    </p>
    <p>
      Aplica la <strong>regla 50/50</strong>: deja al menos un silencio equivalente a la mitad de tu frase antes de responderla. Si lanzas una idea rítmica de 4 notas (<em>Pregunta</em>) y luego la repites cambiando solo las dos últimas notas para resolver a la 3ª del acorde nuevo (<em>Respuesta</em>), el oyente siente coherencia inmediata en cualquier estilo:
    </p>
    <div class="grid-3 mb-4">
      <div class="card">
        <h4>💬 1. Frases y Motivos (A → A’)</h4>
        <p class="text-xs">Lanza un motivo breve de 3–4 notas que termine en tensión (<strong>Pregunta</strong>, por ejemplo sobre la 2ª o la 4ª), deja un respiro real y respóndelo conservando el mismo ritmo con final estable hacia tónica o 3ª (<strong>Respuesta</strong>).</p>
      </div>
      <div class="card">
        <h4>🎸 2. Blues (I7–IV7–V7 + Blue Note)</h4>
        <p class="text-xs">Combina la pentatónica menor con la <code>♭5</code> (<em>Blue Note</em>) usada únicamente como nota de paso rápida, y desliza o estira levemente de <code>♭3 → 3M</code> cuando suene el acorde I7 para conseguir mordida blues auténtica.</p>
      </div>
      <div class="card">
        <h4>🎷 3. Jazz y Estándares (ii–V–I)</h4>
        <p class="text-xs">Apunta directamente a las notas guía (<strong>3ª y 7ª</strong>) justo en el pulso 1 de cada cambio de acorde y rodéalas con <em>enclosures</em> (una nota diatónica arriba y un semitono abajo antes de aterrizar).</p>
      </div>
      <div class="card">
        <h4>⚡ 4. Rock y Pop sobre Cambios</h4>
        <p class="text-xs">Sobre <code>I–V–vi–IV</code>, evita quedarte siempre en la misma nota de reposo: subraya la 3ª del acorde activo cuando pase el <code>V</code> (la sensible) y el <code>IV</code> para que la melodía del solo narre la progresión.</p>
      </div>
      <div class="card">
        <h4>🌴 5. Música Latina y Tumbao</h4>
        <p class="text-xs">Sobre cadencias <code>i–♭VII–♭VI–V7</code>, usa síncopas de corchea anticipando la nota del acorde siguiente medio tiempo antes del compás fuerte, y destaca la sensible mayor sobre el <code>V7</code>.</p>
      </div>
      <div class="card">
        <h4>🌊 6. Improvisación Modal (Dórico / Lidio)</h4>
        <p class="text-xs">Cuando la base se queda estática en 1 o 2 acordes, pinta el carácter del modo enfatizando su <strong>nota característica</strong> (la 6ª Mayor natural en Dórico o la #4 en Lidio) en partes métricas visibles.</p>
      </div>
    </div>

    <article class="interactive-widget mt-4 mb-4" id="lab-improvisacion-gym" data-lab="improvisation-gym-lab" data-nivel="2">
      <div class="widget-header">
        <div>
          <span class="widget-tag">Laboratorio Etapa 4 · Lenguaje e Improvisación</span>
          <h3>🔥 Gimnasio de Fraseo, Motivos y Cambios Armónicos en 6 Estilos</h3>
          <p class="text-sm">Elige género y tonalidad, genera frases de Pregunta–Respuesta con notas guía y digitación en guitarra, y escúchalas junto con su base rítmico-armónica.</p>
        </div>
      </div>
      <div class="lab-stage"></div>
    </article>
  </div>`;
}

function buildAnatomyWidgetHtml(inst: 'guitar' | 'bass' | 'drum' | 'voice'): string {
  const meta: Record<
    'guitar' | 'bass' | 'drum' | 'voice',
    { tag: string; title: string; subtitle: string }
  > = {
    guitar: {
      tag: 'Diagrama Etapa 2 · Anatomía Instrumental',
      title: '🎸 Anatomía Interactiva de la Guitarra Acústica (5 Zonas)',
      subtitle:
        'Pulsa cada zona numerada para descubrir su papel acústico, posición de manos, error habitual que debes evitar y escuchar su timbre real.',
    },
    bass: {
      tag: 'Diagrama Etapa 2 · Anatomía Instrumental',
      title: '🎸 Anatomía Interactiva del Bajo Eléctrico (4 Cuerdas)',
      subtitle:
        'Explora cuerdas graves E1–G2, simetría del mástil, pastillas Precision vs. Jazz y técnica de mano derecha (i–m y Floating Thumb).',
    },
    drum: {
      tag: 'Diagrama Etapa 2 · Anatomía del Kit',
      title: '🥁 Anatomía Interactiva del Kit de Batería (Vista Superior)',
      subtitle:
        'Haz clic en Hi-Hat, Tarola, Bombo, Toms o Platos para oír cada cuerpo y entender su extremidad y función en el groove.',
    },
    voice: {
      tag: 'Diagrama Etapa 2 · Anatomía Vocal',
      title: '🎤 Anatomía Interactiva de la Voz (Motor, Vibrador y Resonadores)',
      subtitle:
        'Recorre diafragma, laringe, faringe y máscara frontal para visualizar dónde nace el apoyo, la afinación y la proyección sana.',
    },
  };
  const cfg = meta[inst];
  return `
  <article class="interactive-widget mt-4 mb-4" id="lab-anatomia-${inst}" data-lab="anatomy-lab" data-instrument="${inst}" data-nivel="1">
    <div class="widget-header">
      <div>
        <span class="widget-tag">${cfg.tag}</span>
        <h3>${cfg.title}</h3>
        <p class="text-sm">${cfg.subtitle}</p>
      </div>
    </div>
    <div class="lab-stage"></div>
  </article>`;
}

function buildSynthMidiStage4Html(): string {
  return `
  <div class="mb-5" data-nivel="2" id="p-fundamentos-sintesis-midi">
    <h3 id="p-sintesis-midi-fundamentos">1.2 Síntesis Sonora (Osciladores, Filtro y ADSR) y Protocolo MIDI</h3>
    <p>
      La <strong>síntesis sustractiva</strong> funciona como esculpir una piedra: empiezas con una onda muy brillante llena de armónicos (<strong>Sierra</strong> para bajos/cuerdas sintéticas o <strong>Cuadrada</strong> para timbres huecos tipo clarinete/retro) y luego le quitas frecuencias agudas usando un <strong>Filtro Pasa-Bajos (Cutoff + Resonancia Q)</strong>.
    </p>
    <p>
      Para que no suene como un zumbido eléctrico inmóvil, la envolvente <strong>ADSR</strong> moldea el volumen de cada nota en el tiempo: <strong>Ataque (A)</strong> define si golpea de golpe como un piano (<code>5 ms</code>) o entra lento como un violín (<code>400 ms</code>); <strong>Decaimiento (D)</strong> y <strong>Sostenimiento (S)</strong> fijan cuánto cae el volumen mientras dejas pulsada la tecla; y <strong>Liberación (R)</strong> controla la cola cuando sueltas el dedo.
    </p>
    <p>
      Paralelamente, el protocolo <strong>MIDI</strong> no transmite audio grabado sino partitura digital en tiempo real (<em>Note On/Off</em>, nota 0–127, <em>Velocity</em> o fuerza 1–127 y micro-desplazamientos). Variar levemente la <em>Velocity</em> y correr ±10 ms respecto a la rejilla convierte un patrón robótico en un groove humano vivo.
    </p>
    <article class="interactive-widget mt-4 mb-4" id="lab-sintesis-midi" data-lab="synth-midi-lab" data-nivel="2">
      <div class="widget-header">
        <div>
          <span class="widget-tag">Laboratorio Etapa 6 · Síntesis y MIDI</span>
          <h3>🎛️ Sintetizador Sustractivo (ADSR + Filtro) y Secuenciador MIDI</h3>
          <p class="text-sm">Modifica onda, corte de filtro y envolvente ADSR en tiempo real, o experimenta en el secuenciador MIDI con <em>Velocity</em> y humanización.</p>
        </div>
      </div>
      <div class="lab-stage"></div>
    </article>
  </div>`;
}

function buildMixMasterStage4Html(): string {
  return `
  <div class="mb-5" data-nivel="3" id="p-mezcla-masterizacion">
    <h3 id="p-mezcla-mastering-lufs">2.3 Mezcla Sustractiva y Masterización: HPF, 250 Hz, LUFS y True Peak</h3>
    <p>
      La causa número uno de una mezcla turbia o sin pegada no es falta de volumen, sino <strong>enmascaramiento</strong>: varios instrumentos compitiendo en las mismas frecuencias al mismo tiempo. Antes de subir agudos o añadir compresión, aplica estos tres criterios técnicos en orden:
    </p>
    <ul>
      <li><strong>1. Limpieza de subgraves (HPF):</strong> voces, guitarras acústicas y platos no producen música útil por debajo de <code>80–110 Hz</code>, pero sí ruido de sala y golpes de mano que roban margen al bombo y al bajo. Cortarlos con un Filtro Pasa-Altos aclara la mezcla al instante.</li>
      <li><strong>2. Control del "barro" (200–350 Hz):</strong> si guitarras, piano y voz acumulan energía en <code>250 Hz</code>, la canción suena encajonada. Atenuar <code>2–3 dB</code> con EQ sustractiva abre espacio inmediato para la voz principal.</li>
      <li><strong>3. Masterización segura (-14 LUFS y -1.0 dBTP):</strong> vigila el <strong>Crest Factor</strong> (diferencia entre picos y volumen promedio, ideal <code>7–13 dB</code>). Aplastar una mezcla a -7 LUFS destruye la pegada de la batería y provoca distorsión al convertir a streaming (<code>-1.0 dBTP</code> de techo evita picos entre muestras).</li>
    </ul>
    <article class="interactive-widget mt-4 mb-4" id="lab-mezcla-master" data-lab="mix-master-lab" data-nivel="3">
      <div class="widget-header">
        <div>
          <span class="widget-tag">Laboratorio Etapa 6 · Mezcla y Masterización</span>
          <h3>🎚️ Consola Visual de EQ Sustractiva, Compresión y Medidor LUFS / True Peak</h3>
          <p class="text-sm">Alterna entre proceso activo y Bypass en vivo mientras limpias los 250 Hz, ajustas el HPF por instrumento y evitas la sobrelimitación.</p>
        </div>
      </div>
      <div class="lab-stage"></div>
    </article>
  </div>`;
}

function buildWorkAnalysisStage4Html(): string {
  return `
  <div class="mb-5" data-nivel="3" id="c-ejemplo-inspector-maestro">
    <h3 id="c-ejemplo-guiado-secciones">9.3 Anatomía de una Obra Completa: Forma, Contrapunto Externo y Modulación</h3>
    <p>
      Analizar una obra compleja te enseña cómo sostener el interés durante varios minutos sin repetir el mismo bucle. En <em>"Horizonte de Cristal"</em> se aplican tres decisiones concretas de compositor: <strong>1)</strong> mantener el bajo y la melodía en movimiento contrario o grado conjunto (<em>contrapunto externo</em>) para que los acordes extendidos suenen naturales; <strong>2)</strong> reservar la mayor densidad armónica (intercambio modal y dominantes secundarias) para el clímax en el Puente; y <strong>3)</strong> contrastar secciones íntimas con secciones abiertas regulando el registro de cada instrumento.
    </p>
    <article class="interactive-widget mt-4 mb-4" id="lab-analisis-obra-maestra" data-lab="work-analysis-lab" data-nivel="3">
      <div class="widget-header">
        <div>
          <span class="widget-tag">Laboratorio Etapa 7 · Análisis de Obra Completa</span>
          <h3>🔬 Analizador Guiado de "Horizonte de Cristal" (Intro a Puente Modulado)</h3>
          <p class="text-sm">Audiciona cada sección completa o aísla solo Bajo + Melodía para comprobar cómo las voces externas sostienen los acordes alterados.</p>
        </div>
      </div>
      <div class="lab-stage"></div>
    </article>
  </div>`;
}

function buildMasterProjectStage4Html(): string {
  return `
  <div class="mb-5" data-nivel="3" id="pr-proyectos-taller-integrador">
    <h3 id="pr-taller-arquitecto-final">1.2 Taller Integrador: Separación de Registros, Delay al Tempo y Maqueta Final</h3>
    <p>
      Un proyecto original suena profesional mucho antes de abrir los plugins de mezcla si su <strong>arquitectura de frecuencias</strong> está bien diseñada desde el arreglo. La regla de oro es evitar colisiones en la zona media-grave (<code>C2–G3</code>): el bajo eléctrico o synth bass ocupa la octava inferior (<code>E1–C3</code>), mientras los voicings de guitarra y teclado habitan del <code>C3</code> hacia arriba dejando aire entre ambos. Además, sincronizar los retardos (negra = <code>60.000 / BPM</code> ms; corchea con puntillo = <code>0.75 × negra</code>) mantiene la rítmica limpia sin emborronar la letra.
    </p>
    <article class="interactive-widget mt-4 mb-4" id="lab-taller-proyecto-integrador" data-lab="master-project-lab" data-nivel="3">
      <div class="widget-header">
        <div>
          <span class="widget-tag">Laboratorio Etapa 7 · Taller de Proyecto Integrador</span>
          <h3>🏛️ Arquitecto y Auditor de Proyecto Original (Registros, Delay ms y Progresión)</h3>
          <p class="text-sm">Configura estilo, tonalidad, octava del bajo, registro armónico y recurso maestro para validar la claridad de tu arreglo antes de producir.</p>
        </div>
      </div>
      <div class="lab-stage"></div>
    </article>
  </div>`;
}

export function applyStage1LessonUpgrades(sectionId: string, sectionHtml: string): string {
  if (sectionId === 'intro') {
    return buildEtapa0SectionHtml();
  }

  if (sectionId === 't-sonido') {
    let updated = insertAfterModuleHeader(sectionHtml, buildBeginnerSoundBridgeHtml());
    updated = updated.replace(
      /<div class="callout why">\s*<div class="callout-title">Por qué los graves/,
      '<div class="callout why" data-nivel="3" data-menu="Acústica de Graves: Banda Crítica de la Cóclea"><div class="callout-title">Por qué los graves'
    );
    return updated;
  }

  if (sectionId === 't-notas') {
    return insertAfterModuleHeader(sectionHtml, buildBeginnerNotesBridgeHtml());
  }

  if (sectionId === 't-ritmo') {
    let updated = insertAfterModuleHeader(sectionHtml, buildBeginnerRhythmFoundationHtml());
    updated = gatePolyrhythmSectionForBeginners(updated);
    return updated;
  }

  if (sectionId === 't-escalas') {
    const firstH3 = sectionHtml.indexOf('<h3 id="t-escalas-mayor"');
    if (firstH3 !== -1) {
      return (
        sectionHtml.slice(0, firstH3) +
        buildBeginnerMajorScaleLadderHtml() +
        sectionHtml.slice(firstH3)
      );
    }
    return insertAfterModuleHeader(sectionHtml, buildBeginnerMajorScaleLadderHtml());
  }

  if (sectionId === 't-intervalos') {
    return insertAfterModuleHeader(sectionHtml, buildBeginnerIntervalsBridgeHtml());
  }

  if (sectionId === 't-tonalidades') {
    return insertAfterModuleHeader(sectionHtml, buildBeginnerTonalityAndKeySigHtml());
  }

  if (sectionId === 't-lectura') {
    return insertAfterModuleHeader(sectionHtml, buildBeginnerReadingSymbolsHtml());
  }

  if (sectionId === 't-oido') {
    return insertAfterModuleHeader(sectionHtml, buildBeginnerEarBridgeHtml());
  }

  // Stage 3: Counterpoint Studio, Improvisation Gym, & Initial Instrument Anatomy Diagrams
  if (sectionId === 'c-contrapunto') {
    return insertBeforeFirstExerciseCallout(sectionHtml, buildCounterpointStage3Html());
  }

  if (sectionId === 'ge-riffs-solos') {
    return insertBeforeFirstExerciseCallout(sectionHtml, buildImprovisationGymStage3Html());
  }

  if (sectionId === 'ga-fundamentos') {
    return insertAfterModuleHeader(sectionHtml, buildAnatomyWidgetHtml('guitar'));
  }

  if (sectionId === 'b-fundamentos') {
    return insertAfterModuleHeader(sectionHtml, buildAnatomyWidgetHtml('bass'));
  }

  if (sectionId === 'd-fundamentos') {
    return insertAfterModuleHeader(sectionHtml, buildAnatomyWidgetHtml('drum'));
  }

  if (sectionId === 'v-fundamentos') {
    return insertAfterModuleHeader(sectionHtml, buildAnatomyWidgetHtml('voice'));
  }

  // Stage 4: Synthesis/MIDI, Mix/EQ/Mastering, Complex Work Analysis, & Integrator Workshop
  if (sectionId === 'p-fundamentos') {
    return insertBeforeFirstExerciseCallout(sectionHtml, buildSynthMidiStage4Html());
  }

  if (sectionId === 'p-mezcla') {
    return insertBeforeFirstExerciseCallout(sectionHtml, buildMixMasterStage4Html());
  }

  if (sectionId === 'c-ejemplo') {
    return insertBeforeFirstExerciseCallout(sectionHtml, buildWorkAnalysisStage4Html());
  }

  if (sectionId === 'pr-proyectos') {
    return insertBeforeFirstExerciseCallout(sectionHtml, buildMasterProjectStage4Html());
  }

  return sectionHtml;
}
