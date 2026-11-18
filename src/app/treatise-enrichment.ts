import { MusicAudioEngine } from './lab-engine';

export interface TreatiseSearchMeta {
  catId: string;
  catLabel: string;
  sectionId: string;
  sectionTitle: string;
  nivel: string;
  keywords: string;
  snippet: string;
}

export const TREATISE_ENRICHMENT_SEARCH_META: TreatiseSearchMeta[] = [
  {
    catId: 'teoria',
    catLabel: '1. Teoría y Acústica',
    sectionId: 't-modos',
    sectionTitle: '🗺️ Cartografía Modal de 14 Modos, Técnica por Descarte e Ingredientes Emocionales',
    nivel: '3-4',
    keywords: 'modos ilustrados brian callipari tecnica por descarte 14 modos lidio b7 mixolidio b13 frigio mayor dorico #4 ingredientes emocionales',
    snippet: 'Mapa de 14 nodos (Mayor, Menor Melódica y Armónica), los 3 acordes pilares por modo y el color emocional de cada nota característica.',
  },
  {
    catId: 'teoria',
    catLabel: '1. Teoría y Acústica',
    sectionId: 't-escalas',
    sectionTitle: '🦴 Regla "Esqueleto Pentatónico + 2 Notas" y Atlas de Escalas Simétricas/Exóticas',
    nivel: '2-4',
    keywords: 'esqueleto + 2 notas pentatonica bebop alterada superlocria lidia dominante disminuida tonos enteros hungara menor hirajoshi',
    snippet: 'Cómo las 5 notas pentatónicas forman el chasis universal y cómo las 2 notas extra definen el modo, más atlas de escalas avanzadas.',
  },
  {
    catId: 'teoria',
    catLabel: '1. Teoría y Acústica',
    sectionId: 't-ritmo',
    sectionTitle: '🥁 Método Konnakol (Ta-ka / Ta-ki-ta) y Claves Afro-Latinas (3-2 vs 2-3)',
    nivel: '3-4',
    keywords: 'konnakol ta-ka ta-ki-ta compases amalgamados 5/4 7/8 9/8 11/8 clave de son 3-2 2-3 polirritmia',
    snippet: 'Domina cualquier compás irregular (5/4, 7/8, 9/8, 11/8) mediante sílabas rítmicas del sur de la India y la clave afro-latina.',
  },
  {
    catId: 'armonia',
    catLabel: '2. Armonía Práctica',
    sectionId: 'h-extensiones',
    sectionTitle: '🚑 Operación Rescate de 9nas/11nas/13nas, Tensiones Glue y Rearmonización del Feliz Cumpleaños',
    nivel: '3-4',
    keywords: 'tensiones ilustradas operacion rescate 5 tipos de acordes con tension tensiones glue anticipadas retrospectiva ir al 5 de feliz cumpleanos #11',
    snippet: 'Por qué Em no tiene 9 ni 13, C y G no tienen 11 y Dm no admite 13; cómo justificar cualquier tensión con Tensiones Glue.',
  },
  {
    catId: 'armonia',
    catLabel: '2. Armonía Práctica',
    sectionId: 'h-poli-hibridos',
    sectionTitle: '⚖️ Matriz Definitiva: Poliacorde vs. Acorde Híbrido vs. Inversión (/3, /5) vs. Line Cliché',
    nivel: '4',
    keywords: 'poliacordes acordes hibridos inversiones line cliche slash chords Fm/C F/G Am/G#',
    snippet: 'Distinción exacta entre dos estructuras completas superpuestas (Poliacorde), acorde sin 3ª sobre otro bajo (Híbrido) e inversión.',
  },
  {
    catId: 'armonia',
    catLabel: '2. Armonía Práctica',
    sectionId: 'h-neoriemann',
    sectionTitle: '🧲 Índice de Familiaridad (Glue 1 a 0), Alineación de Inversiones, Función Gamma y Ejes de Bartók',
    nivel: '4',
    keywords: 'armonia ilustrada indice de familiaridad rango de cercania alineacion de inversiones funcion gamma apertura de cluster ejes de bartok',
    snippet: 'De C a F# y Ebm por niveles de cercanía, empaquetado de inversiones (C-Ab-F), divisi en abanico y ejes simétricos de Bartók.',
  },
  {
    catId: 'armonia',
    catLabel: '2. Armonía Práctica',
    sectionId: 'h-ii-v-i',
    sectionTitle: '🎻 Deformación del Canon de Pachelbel: Curva de Tensión, La Escalera que Baja y La Escalera que Sube',
    nivel: '3-4',
    keywords: 'canon de pachelbel deformacion escalera que baja escalera que sube 2 5 1 sustituto tritonal puentes',
    snippet: 'Cómo Pachelbel diseñó su curva de tensión y cómo deformar cualquier progresión con cadenas 2-5-1, tritonos y acordes puente.',
  },
  {
    catId: 'guitarra-ac',
    catLabel: '4. Guitarra Acústica',
    sectionId: 'ga-acordes',
    sectionTitle: '🎬 Efecto Kuleshov Musical (Mi4 al Aire), CAGED en 4 Trastes y Las 3 Figuras Maestras (Triángulo, Gancho y Ala)',
    nivel: '2-4',
    keywords: 'glue magico guitarristas efecto kuleshov musical 3 figuras triangulo gancho ala caged 4 trastes armonia cuartal mastil guitarra colombiana vallenato',
    snippet: 'Por qué 6 cuerdas no son 6 notas, el Mi agudo al aire bajo 5 acordes, tríadas cerradas en cuerdas 1-2-3 y décimas vallenatas.',
  },
  {
    catId: 'guitarra-el',
    catLabel: '5. Guitarra Eléctrica',
    sectionId: 'ge-riffs-solos',
    sectionTitle: '⚡ Solución al Abuso de la Pentatónica en el Blues: Tríadas 1-2-3, Bordaduras, Cromatismos y 5 Octavas',
    nivel: '3-4',
    keywords: 'blues mayor pentatonica choques semitono triadas triangulo gancho ala bordaduras notas de paso 5 formas de octava',
    snippet: 'Por qué la pentatónica choca en un Blues Mayor (A7-D7-E7) y cómo conectar las figuras Triángulo, Gancho y Ala con cromatismos.',
  },
  {
    catId: 'canto',
    catLabel: '8. Canto y Calentamiento Vocal',
    sectionId: 'v-calentamiento',
    sectionTitle: '🩺 Matriz de Autodiagnóstico Vocal (Motor/Fuente/Filtro/Audiación), Test del Canario y Nebulización',
    nivel: '2-4',
    keywords: 'autodiagnostico vocal motor fuente filtro audiacion test del canario m2 carraspeo silencioso huff nebulizador salino',
    snippet: 'Las 4 preguntas para diagnosticar cualquier fallo técnico, hidratación sistémica vs. tópica y el Test del Canario en M2.',
  },
  {
    catId: 'canto',
    catLabel: '8. Canto y Calentamiento Vocal',
    sectionId: 'v-interpretacion-estilos',
    sectionTitle: '🎭 Método de las 6 Capas para Montar una Canción, Belting Sano vs. Mixed Belt y Coreografía de Micrófono',
    nivel: '3-4',
    keywords: 'metodo 6 capas montar cancion desarme quirurgico belting sano mixed belt una oreja libre coreografia microfono respiracion vagal 4-2-6',
    snippet: 'Protocolo paso a paso desde ritmo hablado y TVSO hasta subtexto dramático, Mixed Belt seguro y técnica de estudio.',
  },
  {
    catId: 'arreglos',
    catLabel: '10. Arreglos y Orquestación',
    sectionId: 'a-fundamentos',
    sectionTitle: '🛡️ El "Colchón a Prueba de Balas" a 4 Voces (Los 4 Power Rangers), Cmaj6 vs. Cmaj7 y Línea de Acción',
    nivel: '3-4',
    keywords: 'arreglos ilustrados colchon a prueba de balas 4 voces power rangers cmaj6 vs cmaj7 dividir dominante g g7 linea de accion embudo 3+1',
    snippet: 'Por qué Cmaj6 supera a Cmaj7 en un colchón coral, cómo dividir G → G7 al estilo Bach y la apertura en embudo al 70% de la obra.',
  },
];

function appendInsideSection(html: string, sectionId: string, blockHtml: string): string {
  const sectionStartRegex = new RegExp(`<section\\s+id="${sectionId}"[^>]*>`, 'i');
  const startMatch = sectionStartRegex.exec(html);
  if (!startMatch) return html;

  const startIndex = startMatch.index;
  const closeTag = '</section>';
  const closeIndex = html.indexOf(closeTag, startIndex);
  if (closeIndex === -1) return html;

  return html.slice(0, closeIndex) + '\n' + blockHtml + '\n' + html.slice(closeIndex);
}

export function injectTreatiseEnrichmentIntoCategoryHtml(catId: string, html: string): string {
  let out = html;

  if (catId === 'teoria' || catId === 'all') {
    out = appendInsideSection(out, 't-escalas', buildScalesSkeletonAndAtlasHtml());
    out = appendInsideSection(out, 't-modos', buildModosIlustradosCartographyHtml());
    out = appendInsideSection(out, 't-ritmo', buildKonnakolAndClaveHtml());
  }

  if (catId === 'armonia' || catId === 'all') {
    out = appendInsideSection(out, 'h-extensiones', buildTensionesIlustradasRescueAndGlueHtml());
    out = appendInsideSection(out, 'h-poli-hibridos', buildPolychordVsHybridMatrixHtml());
    out = appendInsideSection(out, 'h-ii-v-i', buildPachelbelAndStaircasesHtml());
    out = appendInsideSection(out, 'h-neoriemann', buildArmoniaIlustradaAdvancedSystemsHtml());
  }

  if (catId === 'guitarra-ac' || catId === 'all') {
    out = appendInsideSection(out, 'ga-acordes', buildGuitarKuleshovCagedAndColombianHtml());
  }

  if (catId === 'guitarra-el' || catId === 'all') {
    out = appendInsideSection(out, 'ge-riffs-solos', buildElectricGuitarGlueTriadsAndOctavesHtml());
  }

  if (catId === 'canto' || catId === 'all') {
    out = appendInsideSection(out, 'v-calentamiento', buildVocalDiagnosticAndHygieneHtml());
    out = appendInsideSection(out, 'v-interpretacion-estilos', buildVocalSixLayersBeltAndMicHtml());
  }

  if (catId === 'arreglos' || catId === 'all') {
    out = appendInsideSection(out, 'a-fundamentos', buildArreglosIlustradosBulletproofPadHtml());
  }

  return out;
}

export function hydrateTreatiseEnrichment(
  root: HTMLElement,
  audio: MusicAudioEngine,
  onStatus: (msg: string) => void
): void {
  root.querySelectorAll<HTMLButtonElement>('.js-treatise-chord').forEach((btn) => {
    if (btn.dataset['bound'] === '1') return;
    btn.dataset['bound'] = '1';

    btn.addEventListener('click', () => {
      const notesRaw = btn.dataset['notes'] || '';
      const label = btn.dataset['label'] || 'Ejemplo Armónico';
      const mode = btn.dataset['mode'] || 'chord';
      const timb = (btn.dataset['inst'] as 'piano' | 'guitar') || 'piano';
      const midis = notesRaw
        .split(',')
        .map((n) => parseInt(n.trim(), 10))
        .filter((n) => !Number.isNaN(n));

      if (midis.length === 0) return;
      audio.stopAll();
      onStatus(`🔊 ${label}`);

      if (mode === 'seq') {
        midis.forEach((m, i) => {
          if (timb === 'guitar') {
            audio.playPluckedGuitar(m, 0.55, i * 0.28, 0.28, false);
          } else {
            audio.playAcousticPiano(m, 0.55, i * 0.28, 0.25, false);
          }
        });
      } else if (mode === 'prog') {
        const groups = (btn.dataset['groups'] || '')
          .split('|')
          .map((g) =>
            g
              .split(',')
              .map((n) => parseInt(n.trim(), 10))
              .filter((n) => !Number.isNaN(n))
          )
          .filter((g) => g.length > 0);
        groups.forEach((chord, idx) => {
          audio.strumChord(chord, timb, idx * 0.85, false);
        });
      } else {
        audio.strumChord(midis, timb, 0, false);
      }
    });
  });
}

function buildScalesSkeletonAndAtlasHtml(): string {
  return `
  <div class="callout-box mt-6" style="border-left: 4px solid #f59e0b;">
    <h3>🦴 La Regla del "Esqueleto Pentatónico + 2 Notas" y Atlas de Escalas Avanzadas</h3>
    <p class="text-sm mb-3">
      La <strong>Pentatónica Mayor (1 – 2 – 3 – 5 – 6)</strong> y su relativa <strong>Pentatónica Menor (1 – ♭3 – 4 – 5 – ♭7)</strong> son la escala diatónica despojada de sus dos semitonos conflictivos (el tritono <code>4–7</code> en Mayor, o <code>2–♭6</code> en Menor). Esas <strong>5 notas son el chasis universal</strong>; las <strong>2 notas extra</strong> son los "faros modales" que definen el sabor exacto del modo:
    </p>
    <div class="table-wrap mb-4">
      <table>
        <thead>
          <tr>
            <th>Esqueleto Base (5 Notas)</th>
            <th>+ 2 Notas "Sabor Modal"</th>
            <th>Modo Resultante (7 Notas)</th>
            <th>Escuchar Comparación</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><strong>Pentatónica Mayor</strong> <code>C–D–E–G–A</code></td>
            <td><code>+ F (4)</code> y <code>+ B (7)</code></td>
            <td><strong>Do Jónico (Mayor Natural)</strong> — Luminoso y estable</td>
            <td><button type="button" class="btn-audio js-treatise-chord" data-mode="seq" data-notes="60,62,64,65,67,69,71,72" data-label="Do Jónico: Esqueleto Pentatónico + F y B">🔊 Jónico</button></td>
          </tr>
          <tr>
            <td><strong>Pentatónica Mayor</strong> <code>C–D–E–G–A</code></td>
            <td><code>+ F# (#4)</code> y <code>+ B (7)</code></td>
            <td><strong>Do Lidio</strong> — Magia cinematográfica y flotación</td>
            <td><button type="button" class="btn-audio js-treatise-chord" data-mode="seq" data-notes="60,62,64,66,67,69,71,72" data-label="Do Lidio: Esqueleto Pentatónico + F# (#11) y B">🔊 Lidio (#4)</button></td>
          </tr>
          <tr>
            <td><strong>Pentatónica Mayor</strong> <code>C–D–E–G–A</code></td>
            <td><code>+ F (4)</code> y <code>+ Bb (♭7)</code></td>
            <td><strong>Do Mixolidio</strong> — Rock, Blues, Funk y Folclore</td>
            <td><button type="button" class="btn-audio js-treatise-chord" data-mode="seq" data-notes="60,62,64,65,67,69,70,72" data-label="Do Mixolidio: Esqueleto Pentatónico + F y Bb (b7)">🔊 Mixolidio (♭7)</button></td>
          </tr>
          <tr>
            <td><strong>Pentatónica Menor</strong> <code>A–C–D–E–G</code></td>
            <td><code>+ B (2)</code> y <code>+ F (♭6)</code></td>
            <td><strong>La Eólico (Menor Natural)</strong> — Melancolía clásica</td>
            <td><button type="button" class="btn-audio js-treatise-chord" data-mode="seq" data-notes="57,59,60,62,64,65,67,69" data-label="La Eólico: Pentatónica Menor + B (2) y F (b6)">🔊 Eólico (♭6)</button></td>
          </tr>
          <tr>
            <td><strong>Pentatónica Menor</strong> <code>A–C–D–E–G</code></td>
            <td><code>+ B (2)</code> y <code>+ F# (6)</code></td>
            <td><strong>La Dórico</strong> — Menor sofisticado y heroico (Santana / Jazz)</td>
            <td><button type="button" class="btn-audio js-treatise-chord" data-mode="seq" data-notes="57,59,60,62,64,66,67,69" data-label="La Dórico: Pentatónica Menor + B (2) y F# (6 natural)">🔊 Dórico (6♮)</button></td>
          </tr>
          <tr>
            <td><strong>Pentatónica Menor</strong> <code>A–C–D–E–G</code></td>
            <td><code>+ Bb (♭2)</code> y <code>+ F (♭6)</code></td>
            <td><strong>La Frigio</strong> — Oscuridad andaluza, flamenco y metal</td>
            <td><button type="button" class="btn-audio js-treatise-chord" data-mode="seq" data-notes="57,58,60,62,64,65,67,69" data-label="La Frigio: Pentatónica Menor + Bb (b2) y F (b6)">🔊 Frigio (♭2)</button></td>
          </tr>
        </tbody>
      </table>
    </div>

    <h4>🌍 Atlas de Escalas Simétricas, Bebop y Exóticas (Con Audio Instantáneo en Do)</h4>
    <div class="table-wrap">
      <table>
        <thead>
          <tr>
            <th>Escala</th>
            <th>Fórmula Interválica</th>
            <th>Notas en Do (C)</th>
            <th>Aplicación Armónica Clave</th>
            <th>Escuchar</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><strong>Bebop Dominante (8 notas)</strong></td>
            <td><code>1–2–3–4–5–6–♭7–7</code></td>
            <td><code>C–D–E–F–G–A–Bb–B</code></td>
            <td>Alinea las notas del acorde <code>C7</code> en los tiempos fuertes al tocar en corcheas.</td>
            <td><button type="button" class="btn-audio js-treatise-chord" data-mode="seq" data-notes="60,62,64,65,67,69,70,71,72" data-label="Escala Bebop Dominante en Do (8 notas)">🔊 Bebop Dom</button></td>
          </tr>
          <tr>
            <td><strong>Alterada / Superlocria</strong> <em>(7º Menor Melódica)</em></td>
            <td><code>1–♭9–#9–3–#11–♭13–♭7</code></td>
            <td><code>C–Db–D#–E–F#–Ab–Bb</code></td>
            <td>Sobre <code>V7alt (C7alt → Fm)</code>: contiene 3ª, ♭7 y todas las tensiones alteradas.</td>
            <td><button type="button" class="btn-audio js-treatise-chord" data-mode="seq" data-notes="60,61,63,64,66,68,70,72" data-label="Escala Alterada (Superlocria) sobre C7alt">🔊 Alterada</button></td>
          </tr>
          <tr>
            <td><strong>Lidia Dominante (Lidio ♭7)</strong> <em>(4º Menor Melódica)</em></td>
            <td><code>1–2–3–#4–5–6–♭7</code></td>
            <td><code>C–D–E–F#–G–A–Bb</code></td>
            <td>Sobre dominantes no resolutivos, <code>IV7</code> de Blues y sustitutos tritonales (<code>♭II7(#11)</code>).</td>
            <td><button type="button" class="btn-audio js-treatise-chord" data-mode="seq" data-notes="60,62,64,66,67,69,70,72" data-label="Escala Lidia Dominante (Lidio b7)">🔊 Lidio ♭7</button></td>
          </tr>
          <tr>
            <td><strong>Frigia Dominante (Frigio Mayor)</strong> <em>(5º Menor Armónica)</em></td>
            <td><code>1–♭2–3–4–5–♭6–♭7</code></td>
            <td><code>C–Db–E–F–G–Ab–Bb</code></td>
            <td>Cadencia andaluza, flamenco, metal neoclásico y dominante <code>V7(♭9,♭13)</code> hacia menor.</td>
            <td><button type="button" class="btn-audio js-treatise-chord" data-mode="seq" data-notes="60,61,64,65,67,68,70,72" data-label="Escala Frigia Dominante (5º grado de Fm Armónica)">🔊 Frigio Mayor</button></td>
          </tr>
          <tr>
            <td><strong>Disminuida (ST–T / Simétrica)</strong></td>
            <td><code>1–♭2–#2–3–#4–5–6–♭7</code></td>
            <td><code>C–Db–Eb–E–F#–G–A–Bb</code></td>
            <td>Sobre <code>C7(♭9,13)</code>: combina 4 tríadas mayores separadas por 3ª menor (C, Eb, F#, A).</td>
            <td><button type="button" class="btn-audio js-treatise-chord" data-mode="seq" data-notes="60,61,63,64,66,67,69,70,72" data-label="Escala Disminuida Semitono-Tono (8 notas)">🔊 Disminuida ST-T</button></td>
          </tr>
          <tr>
            <td><strong>Tonos Enteros (Hexatónica)</strong></td>
            <td><code>1–2–3–#4–#5–♭7</code></td>
            <td><code>C–D–E–F#–G#–Bb</code></td>
            <td>Sobre <code>C7+ / C9(#11,♭13)</code>: atmósfera onírica e ingrávida (Debussy / Stevie Wonder).</td>
            <td><button type="button" class="btn-audio js-treatise-chord" data-mode="seq" data-notes="60,62,64,66,68,70,72" data-label="Escala por Tonos Enteros (Whole Tone)">🔊 Tonos Enteros</button></td>
          </tr>
          <tr>
            <td><strong>Doble Armónica Mayor (Bizantina)</strong></td>
            <td><code>1–♭2–3–4–5–♭6–7</code></td>
            <td><code>C–Db–E–F–G–Ab–B</code></td>
            <td>Dos segundas aumentadas (<code>Db–E</code> y <code>Ab–B</code>): surf rock (Misirlou) y cine oriental.</td>
            <td><button type="button" class="btn-audio js-treatise-chord" data-mode="seq" data-notes="60,61,64,65,67,68,71,72" data-label="Escala Doble Armónica Mayor (Bizantina)">🔊 Bizantina</button></td>
          </tr>
          <tr>
            <td><strong>Hirajoshi (Pentatónica Japonesa)</strong></td>
            <td><code>1–2–♭3–5–♭6</code></td>
            <td><code>C–D–Eb–G–Ab</code></td>
            <td>Sonoridad contemplativa de koto japonés y metal progresivo (Marty Friedman).</td>
            <td><button type="button" class="btn-audio js-treatise-chord" data-mode="seq" data-notes="60,62,63,67,68,72" data-label="Escala Pentatónica Japonesa Hirajoshi">🔊 Hirajoshi</button></td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
  `;
}

function buildModosIlustradosCartographyHtml(): string {
  return `
  <div class="callout-box mt-6" style="border-left: 4px solid #38bdf8;">
    <h3>🗺️ Cartografía Modal de 14 Modos, Técnica "Por Descarte" e Ingredientes Emocionales (Método Callipari)</h3>
    <p class="text-sm mb-3">
      Para que una progresión suene verdaderamente <strong>modal</strong> y no sea absorbida por el imán tonal del Jónico o Eólico, aplicamos la <strong>Técnica por Descarte en 3 pasos</strong>:
      <br>1️⃣ <strong>Descartar acordes con tritono internos (<code>°</code> disminuidos y <code>V7</code> con 4ª y 7ª)</strong> porque su gravedad empuja la música hacia la tónica mayor relativa.
      <br>2️⃣ <strong>Descartar los acordes genéricos</strong> que no contienen la nota característica del modo (porque suenan a Jónico o Eólico común).
      <br>3️⃣ <strong>Quedarse con el Acorde Tónica + los 2 Acordes Cadenciales que sí contienen el ingrediente modal</strong>, o condensar el modo entero en <strong>un solo acorde con tensión o poliacorde</strong>.
    </p>

    <div class="table-wrap mb-4">
      <table>
        <thead>
          <tr>
            <th>Modo (Centro en C)</th>
            <th>Escala Madre y Diferencia</th>
            <th>Ingrediente Característico (Color Emocional)</th>
            <th>Los 3 Acordes Pilares ("Por Descarte")</th>
            <th>Condensación en 1 Acorde / Poliacorde</th>
            <th>Escuchar Clima</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><strong>1. Do Lidio</strong></td>
            <td>Mayor (Jónico con <code>#4</code>)</td>
            <td><code>F# (#4)</code> — ✨ <em>Magia, vuelo, sueño espacial</em></td>
            <td><strong>C</strong> (I) · <strong>D</strong> (II Mayor) · <strong>Bm</strong> (vii menor)</td>
            <td><code>C(add#11)</code> o Poliacorde <code>D/C</code></td>
            <td><button type="button" class="btn-audio js-treatise-chord" data-mode="prog" data-groups="48,55,60,64|50,57,62,66|47,54,59,62|48,55,62,66" data-label="Do Lidio: C → D → Bm → Cadd#11">🔊 C → D → Bm</button></td>
          </tr>
          <tr>
            <td><strong>2. Do Mixolidio</strong></td>
            <td>Mayor (Jónico con <code>♭7</code>)</td>
            <td><code>Bb (♭7)</code> — 🏔️ <em>Aventura épica, nobleza, rock</em></td>
            <td><strong>C</strong> (I) · <strong>Bb</strong> (♭VII Mayor) · <strong>Gm</strong> (v menor)</td>
            <td><code>F/C</code> o <code>Bb/C (C9sus4)</code></td>
            <td><button type="button" class="btn-audio js-treatise-chord" data-mode="prog" data-groups="48,55,60,64|46,53,58,62|43,50,55,58|48,53,57,60" data-label="Do Mixolidio: C → Bb → Gm → F/C">🔊 C → Bb → Gm</button></td>
          </tr>
          <tr>
            <td><strong>3. Do Lidio ♭7</strong></td>
            <td>4º Menor Melódica (<code>#4 + ♭7</code>)</td>
            <td><code>F# + Bb</code> — 🛸 <em>Los Simpson, misterio travieso</em></td>
            <td><strong>C7</strong> · <strong>D</strong> (II Mayor) · <strong>Bbaug</strong> (♭VII+)</td>
            <td><code>C7(#11)</code> o Poliacorde <code>D/C7</code></td>
            <td><button type="button" class="btn-audio js-treatise-chord" data-notes="48,52,58,62,66" data-label="Do Lidio b7: C9(#11) = C7 + Tríada de D">🔊 C9(#11)</button></td>
          </tr>
          <tr>
            <td><strong>4. Do Mixolidio ♭13</strong></td>
            <td>5º Menor Melódica (<code>3♮ + ♭6 + ♭7</code>)</td>
            <td><code>E♮ + Ab (♭6)</code> — 🌅 <em>Nostalgia cinematográfica agridulce</em></td>
            <td><strong>C</strong> (I) · <strong>Fm</strong> (iv menor) · <strong>Abaug</strong> (♭VI+)</td>
            <td><code>C7(9,♭13)</code> o <code>Fm/C</code></td>
            <td><button type="button" class="btn-audio js-treatise-chord" data-mode="prog" data-groups="48,55,60,64|41,53,56,60|48,52,58,62,68" data-label="Do Mixolidio b13: C → Fm → C9(b13)">🔊 C → Fm → C9(♭13)</button></td>
          </tr>
          <tr>
            <td><strong>5. Do Frigio Mayor</strong></td>
            <td>5º Menor Armónica (<code>♭2 + 3♮</code>)</td>
            <td><code>Db (♭2) + E♮</code> — 🔥 <em>Filo flamenco, desierto y rito</em></td>
            <td><strong>C</strong> (I) · <strong>Db</strong> (♭II Mayor) · <strong>Bbm</strong> (♭vii)</td>
            <td><code>Db/C</code> o <code>C7(♭9,♭13)</code></td>
            <td><button type="button" class="btn-audio js-treatise-chord" data-mode="prog" data-groups="48,55,60,64|49,56,61,65|46,53,58,61|48,55,60,64" data-label="Do Frigio Mayor: C → Db → Bbm → C">🔊 C → Db → Bbm</button></td>
          </tr>
          <tr>
            <td><strong>6. Do Lidio #2</strong></td>
            <td>6º Menor Armónica (<code>#2 + #4</code>)</td>
            <td><code>D# (#2) + F# (#4)</code> — 🔮 <em>Exotismo hipnótico luminoso</em></td>
            <td><strong>C</strong> (I) · <strong>B</strong> (VII Mayor) · <strong>G#m</strong> (#v)</td>
            <td><code>B/C</code> (Poliacorde Lidio #2)</td>
            <td><button type="button" class="btn-audio js-treatise-chord" data-notes="48,55,59,63,66" data-label="Do Lidio #2: Poliacorde B/C">🔊 Poliacorde B/C</button></td>
          </tr>
          <tr>
            <td><strong>7. Do Dórico</strong></td>
            <td>Menor (Eólico con <code>6♮</code>)</td>
            <td><code>A (6♮)</code> — 🌿 <em>Dulzura menor esperanzadora, bosque</em></td>
            <td><strong>Cm</strong> (i) · <strong>F</strong> (IV Mayor) · <strong>Dm</strong> (ii menor)</td>
            <td><code>Cm6 / Cm(add13)</code> o <code>Dm/Cm</code></td>
            <td><button type="button" class="btn-audio js-treatise-chord" data-mode="prog" data-groups="48,55,60,63|41,53,57,60|50,57,62,65|48,55,60,63,69" data-label="Do Dórico: Cm → F → Dm → Cm6">🔊 Cm → F → Dm</button></td>
          </tr>
          <tr>
            <td><strong>8. Do Frigio</strong></td>
            <td>Menor (Eólico con <code>♭2</code>)</td>
            <td><code>Db (♭2)</code> — 🌑 <em>Misterio antiguo, tensión oscura</em></td>
            <td><strong>Cm</strong> (i) · <strong>Db</strong> (♭II Mayor) · <strong>Bbm</strong> (♭vii)</td>
            <td><code>Cm(add♭9)</code> o <code>Dbmaj7/C</code></td>
            <td><button type="button" class="btn-audio js-treatise-chord" data-mode="prog" data-groups="48,55,60,63|49,56,61,65|46,53,58,61|48,55,60,63" data-label="Do Frigio: Cm → Db → Bbm → Cm">🔊 Cm → Db → Bbm</button></td>
          </tr>
          <tr>
            <td><strong>9. Do Dórico #4</strong></td>
            <td>4º Menor Armónica (<code>♭3 + #4 + 6♮</code>)</td>
            <td><code>Eb + F# + A</code> — 🏜️ <em>Caravana gitana / Klezmer</em></td>
            <td><strong>Cm</strong> (i) · <strong>D</strong> (II Mayor) · <strong>Ab</strong> (♭VI)</td>
            <td><code>D/Cm</code></td>
            <td><button type="button" class="btn-audio js-treatise-chord" data-mode="prog" data-groups="48,55,60,63|50,57,62,66|48,55,60,63" data-label="Do Dórico #4: Cm ↔ D Mayor">🔊 Cm ↔ D</button></td>
          </tr>
          <tr>
            <td><strong>10. Do Dórico ♭2</strong></td>
            <td>2º Menor Melódica (<code>♭2 + 6♮</code>)</td>
            <td><code>Db (♭2) + A (6♮)</code> — 🌊 <em>Jazz contemporáneo oscuro pero cálido</em></td>
            <td><strong>Cm</strong> (i) · <strong>Ebaug</strong> (♭III+) · <strong>F7</strong> (IV7)</td>
            <td><code>Cm6(♭9)</code></td>
            <td><button type="button" class="btn-audio js-treatise-chord" data-mode="prog" data-groups="48,55,60,63|51,55,59,63|41,51,57,60" data-label="Do Dórico b2: Cm → Eb+ → F7">🔊 Cm → Eb+ → F7</button></td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
  `;
}

function buildKonnakolAndClaveHtml(): string {
  return `
  <div class="callout-box mt-6" style="border-left: 4px solid #10b981;">
    <h3>🥁 El Método Konnakol (Células de 2 y 3) y la Clave Afro-Latina (3-2 vs. 2-3)</h3>
    <p class="text-sm mb-3">
      Cualquier compás irregular o de amalgama (<code>5/4</code>, <code>7/8</code>, <code>9/8</code>, <code>11/8</code>) se domina sin esfuerzo al descomponerlo en <strong>ladrillos de 2 pulsos (<code>Ta-ka</code>)</strong> y <strong>ladrillos de 3 pulsos (<code>Ta-ki-ta</code>)</strong> del sistema vocal <em>Konnakol</em> del sur de la India:
    </p>
    <div class="table-wrap mb-3">
      <table>
        <thead>
          <tr>
            <th>Compás</th>
            <th>Subdivisión Matemática</th>
            <th>Fórmula Vocal Konnakol</th>
            <th>Obra / Género de Referencia</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><strong>5/4 o 5/8</strong></td>
            <td><code>3 + 2</code> (o <code>2 + 3</code>)</td>
            <td><strong>TA</strong>-ki-ta · <strong>TA</strong>-ka</td>
            <td><em>Take Five</em> (Dave Brubeck), Merengue Venezolano (5/8)</td>
          </tr>
          <tr>
            <td><strong>7/8</strong></td>
            <td><code>2 + 2 + 3</code> (o <code>3 + 2 + 2</code>)</td>
            <td><strong>TA</strong>-ka · <strong>TA</strong>-ka · <strong>TA</strong>-ki-ta</td>
            <td><em>Money</em> (Pink Floyd, 7/4), <em>Tom Sawyer</em> (Rush), Folclore Balcánico</td>
          </tr>
          <tr>
            <td><strong>9/8 Aksak</strong></td>
            <td><code>2 + 2 + 2 + 3</code></td>
            <td><strong>TA</strong>-ka · <strong>TA</strong>-ka · <strong>TA</strong>-ka · <strong>TA</strong>-ki-ta</td>
            <td><em>Blue Rondo à la Turk</em> (Dave Brubeck)</td>
          </tr>
          <tr>
            <td><strong>11/8</strong></td>
            <td><code>3 + 3 + 3 + 2</code></td>
            <td><strong>TA</strong>-ki-ta · <strong>TA</strong>-ki-ta · <strong>TA</strong>-ki-ta · <strong>TA</strong>-ka</td>
            <td>Rock/Metal Progresivo (Dream Theater, Animals as Leaders)</td>
          </tr>
          <tr>
            <td><strong>Clave de Son 3-2</strong></td>
            <td>Compás 1: <code>Tresillo (3)</code> · Compás 2: <code>Golpes 2 y 3 (2)</code></td>
            <td><strong>1</strong> . <strong>2+</strong> . <strong>4</strong> | . <strong>2</strong> <strong>3</strong> .</td>
            <td>Columna vertebral de la Salsa, Son Cubano, Montuno y Latin Jazz</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
  `;
}

function buildTensionesIlustradasRescueAndGlueHtml(): string {
  return `
  <div class="callout-box mt-6" style="border-left: 4px solid #a855f7;">
    <h3>🚑 "Operación Rescate" de 9nas, 11nas y 13nas, "Tensiones Glue" y Rearmonización del Feliz Cumpleaños</h3>
    <p class="text-sm mb-3">
      En el libro <em>Tensiones Ilustradas</em>, al superponer 9nas, 11nas y 13nas diatónicas sobre los 7 grados de Do Mayor descubrimos por qué algunas tensiones chocan a semitono (<code>♭9</code>, <code>11</code> sobre acorde mayor, <code>♭13</code>) o forman un tritono interno que destruye la función del acorde. Así queda la <strong>Auditoría y Operación Rescate grado por grado</strong>:
    </p>
    <div class="table-wrap mb-4">
      <table>
        <thead>
          <tr>
            <th>Grado en Do Mayor</th>
            <th>¿9na Disponible?</th>
            <th>¿11na Disponible?</th>
            <th>¿13na Disponible?</th>
            <th>Diagnóstico y "Operación Rescate"</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><strong>I (C Mayor)</strong></td>
            <td>✅ <code>D (add9)</code></td>
            <td>❌ <code>F</code> choca con <code>E</code> → <strong>Rescate: <code>F# (#11)</code></strong></td>
            <td>✅ <code>A (add13 / C6)</code></td>
            <td>Admite <strong>9, #11 (Lidio) y 13</strong>.</td>
          </tr>
          <tr>
            <td><strong>ii (Dm)</strong></td>
            <td>✅ <code>E (add9)</code></td>
            <td>✅ <code>G (add11)</code></td>
            <td>⚠️ <code>B (13)</code> forma tritono con <code>F</code></td>
            <td>Aunque <code>B</code> está a tono de <code>A</code>, el tritono <code>F–B</code> convierte a <code>Dm</code> en un dominante <code>G7</code> disfrazado. Úsala solo en contexto Dórico modal.</td>
          </tr>
          <tr>
            <td><strong>iii (Em)</strong></td>
            <td>❌ <code>F (♭9)</code> → Rescate: <code>F# (9)</code></td>
            <td>✅ <code>A (add11)</code></td>
            <td>❌ <code>C (♭13)</code></td>
            <td>Diatónicamente <strong>Em solo tiene disponible la 11na (<code>Em add11</code>)</strong>. Si rescatas la 9na con <code>F#</code>, cambia a color Eólico/Dórico de Mi.</td>
          </tr>
          <tr>
            <td><strong>IV (F Mayor)</strong></td>
            <td>✅ <code>G (add9)</code></td>
            <td>✅ <code>B (#11)</code> natural de la escala</td>
            <td>✅ <code>D (add13)</code></td>
            <td>¡El único acorde mayor diatónico donde 9, #11 y 13 están disponibles sin alterar la escala!</td>
          </tr>
          <tr>
            <td><strong>V (G Mayor / G7)</strong></td>
            <td>✅ <code>A (add9)</code></td>
            <td>❌ <code>C (11)</code> choca con <code>B</code> (o úsalo como <code>G7sus4</code>)</td>
            <td>✅ <code>E (add13)</code></td>
            <td>En <code>G7</code> puedes usar 9 y 13 en reposo, o <code>♭9, #9, #11, ♭13</code> cuando resuelve a <code>C</code> o <code>Cm</code>.</td>
          </tr>
          <tr>
            <td><strong>vi (Am)</strong></td>
            <td>✅ <code>B (add9)</code></td>
            <td>✅ <code>D (add11)</code></td>
            <td>❌ <code>F (♭13)</code> choca con <code>E</code> → Rescate Dórico: <code>F# (13)</code></td>
            <td>Como <code>Am(add9)</code> o <code>Am11</code> es el colchón menor más estable.</td>
          </tr>
        </tbody>
      </table>
    </div>

    <p class="text-sm mb-3">
      📌 <strong>Conclusión de Oro (Los 5 Únicos Acordes con Tensión Simple):</strong> Todo el universo de tensiones limpias se resume en solo <strong>3 tipos Mayores</strong> (<code>Mayor add9</code>, <code>Mayor add#11</code>, <code>Mayor add13</code>) y <strong>2 tipos Menores</strong> (<code>Menor add9</code>, <code>Menor add11</code>).
    </p>

    <h4>🧪 Las 3 Técnicas de "Tensiones Glue" (Cómo justificar cualquier tensión)</h4>
    <div class="grid-cards mb-4">
      <div class="card">
        <h4>1. Tensión Anticipada (Spoiler del Acorde Siguiente)</h4>
        <p class="text-xs">
          Inyecta dentro del acorde actual una nota que pertenece al acorde siguiente. Ej.: Para ir de <strong>C → Ebm</strong> (distancia 0, sin notas en común), metemos <code>Bb</code> y <code>Gb/F#</code> dentro de Do: <strong><code>C9(#11) → Ebm</code></strong>. ¡El oído acepta el salto lejano porque ya escuchó sus notas antes!
        </p>
        <button type="button" class="btn-audio js-treatise-chord mt-2" data-mode="prog" data-groups="48,52,55,62,66|51,54,58,63" data-label="Tensión Glue Anticipada: C9(#11) → Ebm">🔊 Escuchar C9(#11) → Ebm</button>
      </div>
      <div class="card">
        <h4>2. Tensión en Retrospectiva (Estela del Acorde Anterior)</h4>
        <p class="text-xs">
          Deja sonando una nota del acorde anterior como tensión dentro del nuevo acorde. Ej.: Al pasar de <strong><code>C → F(add9, #11)</code></strong>, las notas <code>G</code> (9na de F) y <code>E</code> (7M de F) son la estela que dejó Do Mayor.
        </p>
        <button type="button" class="btn-audio js-treatise-chord mt-2" data-mode="prog" data-groups="48,55,60,64|41,53,57,64,67" data-label="Tensión Glue en Retrospectiva: C → Fmaj9">🔊 Escuchar C → Fmaj9</button>
      </div>
      <div class="card">
        <h4>3. "Ir al 5 de..." (Fusión con el V7 del Destino)</h4>
        <p class="text-xs">
          Para ir de <strong>C → Ebm</strong>, pensamos en el dominante de Ebm (<code>Bb7 = Bb–D–F–Ab</code>) y fusionamos sus notas como tensiones de Do: <strong><code>C(add9, ♭13) → Ebm</code></strong>. Así conviertes cualquier acorde en un trampolín magnético hacia cualquier tonalidad.
        </p>
        <button type="button" class="btn-audio js-treatise-chord mt-2" data-mode="prog" data-groups="48,52,55,62,68|51,54,58,63" data-label="Técnica 'Ir al 5 de': C(add9, b13) [C + Bb7] → Ebm">🔊 Escuchar C(add9,♭13) → Ebm</button>
      </div>
    </div>

    <h4>🎂 Estudio de Caso: El Pico del 70% y la Rearmonización del "Feliz Cumpleaños"</h4>
    <p class="text-sm mb-2">
      En <em>"Feliz Cumpleaños"</em> (en Do Mayor), el clímax melódico ocurre exactamente al <strong>70% de la canción</strong> (el salto de octava <code>Sol4 → Sol5</code> en <em>"¡Que los cumplas fe-LIZ!"</em> antes del final). En vez de armonizar ese pico con un simple <code>C</code> o <code>F</code>, puedes graduar la emoción colocando una <strong><code>#11</code> luminosa</strong> bajo la nota cumbre <code>C5/E5</code>:
    </p>
    <div class="flex flex-wrap gap-2">
      <button type="button" class="btn-audio js-treatise-chord" data-mode="prog" data-groups="48,55,60,64|43,55,59,65|48,55,60,64|41,53,57,60|48,52,55,60|43,53,59,62|48,52,55,60" data-label="Feliz Cumpleaños Nivel 1: Armonía Básica (C - G7 - C - F - C - G7 - C)">🔊 Nivel 1: Básico (C – G7 – F)</button>
      <button type="button" class="btn-audio js-treatise-chord" data-mode="prog" data-groups="48,55,62,64|43,53,57,59,64|48,52,58,62|54,60,64,69|41,53,56,60,62|43,53,56,59,64|48,55,62,64,66" data-label="Feliz Cumpleaños Nivel Jazz/Cine: Cadd9 → G13 → C9 → F#m7b5 (Pico #11) → Fm6 → G7(b9,13) → Cmaj9(#11)">🔊 Nivel 2: Clímax con #11, IVm6 y Tensiones Glue</button>
    </div>
  </div>
  `;
}

function buildPolychordVsHybridMatrixHtml(): string {
  return `
  <div class="callout-box mt-6" style="border-left: 4px solid #ec4899;">
    <h3>⚖️ Matriz Definitiva de "Slash Chords" (<code>X/Y</code>): Poliacorde vs. Híbrido vs. Inversión vs. Line Cliché</h3>
    <p class="text-sm mb-3">
      No todo lo que lleva una barra diagonal (<code>/</code>) es lo mismo. En arreglo profesional distinguimos <strong>4 arquitecturas completamente diferentes</strong>:
    </p>
    <div class="table-wrap">
      <table>
        <thead>
          <tr>
            <th>Categoría</th>
            <th>Notación Exacta</th>
            <th>Regla Estructural</th>
            <th>Ejemplo en Do</th>
            <th>Escuchar</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><strong>1. Inversión</strong></td>
            <td><code>C/E</code> (o <code>C/3</code>, <code>C/5</code>)</td>
            <td>El bajo es una nota que <strong>ya pertenece</strong> a la tríada o cuatríada superior (la 3ª o la 5ª).</td>
            <td><code>C/E</code> (Bajo en Mi + C–G–C arriba)</td>
            <td><button type="button" class="btn-audio js-treatise-chord" data-notes="40,55,60,64" data-label="Inversión C/E (C/3): Bajo en la 3ª">🔊 C/E (Inversión)</button></td>
          </tr>
          <tr>
            <td><strong>2. Acorde Híbrido</strong></td>
            <td><code>F/G</code>, <code>G/C</code>, <code>Dm7/G</code></td>
            <td>Una tríada o cuatríada sobre una <strong>nota de bajo ajena</strong>, diseñada deliberadamente para <strong>omitir la 3ª del bajo</strong> y sonar suspendida/moderna.</td>
            <td><code>F/G</code> = Bajo <code>G</code> + Tríada <code>F–A–C</code> (equivale a <code>G9sus4</code> sin la 3ª <code>B</code>)</td>
            <td><button type="button" class="btn-audio js-treatise-chord" data-notes="43,53,57,60,65" data-label="Acorde Híbrido F/G (G9sus4 sin tercera)">🔊 F/G (Híbrido)</button></td>
          </tr>
          <tr>
            <td><strong>3. Poliacorde</strong></td>
            <td><code>[Fm sobre C]</code> o <code>[D sobre C]</code></td>
            <td><strong>Dos acordes completos e independientes</strong> (tríada sobre tríada, o tríada sobre cuatríada) superpuestos en registros separados.</td>
            <td><code>[Fm / C]</code> = Tríada <code>C–E–G</code> grave + Tríada <code>F–Ab–C</code> aguda (sonoridad <em>Saw / Terror Cinematográfico</em>)</td>
            <td><button type="button" class="btn-audio js-treatise-chord" data-notes="48,52,55,65,68,72" data-label="Poliacorde Fm sobre C Mayor (C–E–G + F–Ab–C)">🔊 Poliacorde Fm/C</button></td>
          </tr>
          <tr>
            <td><strong>4. Line Cliché</strong></td>
            <td><code>Am → Am/G# → Am/G → Am/F#</code></td>
            <td>Un acorde estático donde <strong>una sola voz interna o el bajo se mueve cromáticamente</strong> paso a paso creando contrapunto interno.</td>
            <td>Descenso cromático desde la tónica (<em>Stairway to Heaven / My Funny Valentine</em>)</td>
            <td><button type="button" class="btn-audio js-treatise-chord" data-mode="prog" data-groups="45,57,60,64|44,56,60,64|43,55,60,64|42,54,60,64|41,53,60,64" data-label="Line Cliché: Am → Am(maj7)/G# → Am7/G → Am6/F# → Fmaj7">🔊 Line Cliché</button></td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
  `;
}

function buildPachelbelAndStaircasesHtml(): string {
  return `
  <div class="callout-box mt-6" style="border-left: 4px solid #f97316;">
    <h3>🎻 Deformación del Canon de Pachelbel, "La Escalera que Baja" y "La Escalera que Sube"</h3>
    <p class="text-sm mb-3">
      En <em>Armonía Ilustrada</em> analizamos por qué el <strong>Canon de Pachelbel</strong> (<code>I – V – vi – iii – IV – I – IV – V</code>, en Do: <code>C – G – Am – Em – F – C – F – G</code>) funciona como una montaña rusa perfecta de tensión y cómo podemos <strong>deformarlo con las dos escaleras maestras</strong>:
    </p>
    <div class="grid-cards mb-3">
      <div class="card">
        <h4>1. Canon Original (Curva Suave Diatónica)</h4>
        <p class="text-xs">
          Alterna caída por cuartas y subida por segundas manteniendo siempre notas en común (<em>Glue 1/3 y 2/3</em>). El punto más introspectivo ocurre en la mitad (<code>vi → iii → IV</code>).
        </p>
        <button type="button" class="btn-audio js-treatise-chord mt-2" data-mode="prog" data-groups="48,55,60,64|43,55,59,62|45,57,60,64|40,55,59,64|41,53,57,60|48,52,55,60|41,53,57,60|43,55,59,62" data-label="Canon de Pachelbel en Do: C - G - Am - Em - F - C - F - G">🔊 Canon Original</button>
      </div>
      <div class="card">
        <h4>2. "La Escalera que Baja" (Quintas + Sustitutos Tritonales)</h4>
        <p class="text-xs">
          Todo encadenamiento <code>ii → V → I</code> baja por quintas justas. Si reemplazamos cada <code>V7</code> por su <strong>Sustituto Tritonal (<code>♭II7</code>)</strong>, la escalera de quintas se transforma en un <strong>descenso cromático implacable por semitonos</strong>: <code>Em7 → Eb7 → Dm7 → Db7 → Cmaj7</code>.
        </p>
        <button type="button" class="btn-audio js-treatise-chord mt-2" data-mode="prog" data-groups="52,55,59,62|51,55,58,61|50,53,57,60|49,53,56,59|48,52,55,59" data-label="La Escalera que Baja Cromática: Em7 → Eb7 → Dm7 → Db7 → Cmaj7">🔊 Escalera que Baja</button>
      </div>
      <div class="card">
        <h4>3. "La Escalera que Sube" (Dominantes Secundarios + Puentes °7)</h4>
        <p class="text-xs">
          Para subir peldaño a peldaño (<code>C → Dm → Em → F → G → Am</code>), insertamos entre cada grado su dominante secundario en 1ª inversión o su <strong>acorde puente disminuido (<code>#I°7</code>, <code>#II°7</code>, <code>#IV°7</code>, <code>#V°7</code>)</strong>: <code>C → C#°7 → Dm7 → D#°7 → Em7 → F → F#°7 → G</code>.
        </p>
        <button type="button" class="btn-audio js-treatise-chord mt-2" data-mode="prog" data-groups="48,55,60,64|49,55,58,64|50,57,60,65|51,57,60,66|52,55,59,64|53,57,60,65|54,57,60,66|55,59,62,67" data-label="La Escalera que Sube: C → C#°7 → Dm7 → D#°7 → Em7 → F → F#°7 → G">🔊 Escalera que Sube</button>
      </div>
    </div>
  </div>
  `;
}

function buildArmoniaIlustradaAdvancedSystemsHtml(): string {
  return `
  <div class="callout-box mt-6" style="border-left: 4px solid #06b6d4;">
    <h3>🧲 Sistemas de Armonía Ilustrada 1 y 2: Índice de Familiaridad, Alineación de Inversiones, Función Gamma (Γ) y Ejes de Bartók</h3>
    <p class="text-sm mb-3">
      Más allá de la tonalidad clásica, Brian Callipari sistematiza <strong>4 motores de composición moderna y cinematográfica</strong>:
    </p>
    <div class="table-wrap mb-4">
      <table>
        <thead>
          <tr>
            <th>Sistema</th>
            <th>Principio Técnico</th>
            <th>Fórmula / Progresión en Do</th>
            <th>Escuchar Demostración</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><strong>1. Índice de Familiaridad (Rango de Cercanía)</strong></td>
            <td>Clasifica los 24 acordes mayores y menores según cuántas notas comparten con <code>C Mayor (C–E–G)</code>: <strong>2/3</strong> (2 notas en común), <strong>1/3</strong> (1 nota en común) o <strong>0</strong> (ninguna nota en común, máxima sorpresa espacial).</td>
            <td>
              • <strong>Glue 2/3:</strong> <code>Am, Em, Cm, E, Abm</code><br>
              • <strong>Glue 0 (Polos Lejanos):</strong> <code>F# Mayor</code>, <code>Ebm</code>, <code>Db</code>, <code>Bbm</code>
            </td>
            <td><button type="button" class="btn-audio js-treatise-chord" data-mode="prog" data-groups="48,52,55,60|46,54,58,63|48,52,55,60|42,54,58,61" data-label="Contraste Glue 0 (Polos Lejanos): C ↔ Ebm y C ↔ F# Mayor">🔊 Polos Glue 0 (C ↔ Ebm ↔ F#)</button></td>
          </tr>
          <tr>
            <td><strong>2. Alineación de Inversiones (Empaquetado)</strong></td>
            <td>Toma una tríada mayor (4+3 semitonos), su 1ª inversión (3+5) y su 2ª inversión (5+4), y <strong>alinéalas todas partiendo desde la misma nota grave Do</strong>. Obtienes 3 acordes hermanos sin salir de la misma ventana de registro.</td>
            <td>
              • <strong>Mayores alineados en Do:</strong> <code>C (C–E–G) → Ab/C (C–Eb–Ab) → F/C (C–F–A)</code><br>
              • <strong>Menores alineados en Do:</strong> <code>Cm (C–Eb–G) → Am/C → Fm/C</code>
            </td>
            <td><button type="button" class="btn-audio js-treatise-chord" data-mode="prog" data-groups="48,60,64,67|48,60,63,68|48,60,65,69|48,60,64,67" data-label="Alineación de Inversiones sobre Bajo C: C → Ab/C → F/C → C">🔊 C → Ab/C → F/C</button></td>
          </tr>
          <tr>
            <td><strong>3. Apertura de Cluster / Función Gamma (Γ)</strong></td>
            <td>Notación <code>Γ(E5; C5, E5, G5)</code>: múltiples instrumentos arrancan en un <strong>unísono puro (<code>Mi5</code>)</strong> y se abren en abanico (<em>glissando / divisi</em>) pasando por un cluster de semitonos hasta cristalizar en un acorde amplio.</td>
            <td><code>Unísono E5 → Cluster (D#–E–F) → Tríada Abierta (C–E–G)</code> (Efecto THX / Ligeti / Penderecki)</td>
            <td><button type="button" class="btn-audio js-treatise-chord" data-mode="prog" data-groups="64,64,64|63,64,65|62,64,66|60,64,67" data-label="Función Gamma Γ(E5; C5, E5, G5): Unísono → Cluster → Acorde Abierto">🔊 Apertura Γ</button></td>
          </tr>
          <tr>
            <td><strong>4. Ejes de Bartók + "Componer en Zoom-Out"</strong></td>
            <td>Divide el círculo de quintas en una cruz simétrica de <strong>4 polos separados por 3ª menor (<code>C – Eb – F# – A</code>)</strong> que comparten la misma función. Combina <strong>Columnas de Consonancia</strong> fijas (ej. <code>C</code>) con <strong>Enlaces Volados</strong> por los 4 polos del eje.</td>
            <td><code>[Columna C] → Eb → F# → A → [Columna C]</code></td>
            <td><button type="button" class="btn-audio js-treatise-chord" data-mode="prog" data-groups="48,55,60,64|51,58,63,67|54,61,66,70|57,64,69,73|48,55,60,64" data-label="Eje Tónico de Bartók: C → Eb → F# → A → C">🔊 Eje Bartók (C–Eb–F#–A)</button></td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
  `;
}

function buildGuitarKuleshovCagedAndColombianHtml(): string {
  return `
  <div class="callout-box mt-6" style="border-left: 4px solid #f59e0b;">
    <h3>🎬 Efecto Kuleshov Musical en la Guitarra, CAGED en 4 Trastes y Guitarra Colombiana (Vallenato y Cumbia)</h3>
    <p class="text-sm mb-3">
      En <em>Glue Mágico para Guitarristas</em> y el <em>Método Completo de Guitarra</em> partimos de una revelación crucial: <strong>tocar 6 cuerdas no significa tocar 6 notas diferentes</strong>. En el clásico Sol Mayor abierto (<code>3-2-0-0-0-3</code>) solo hay 3 notas repetidas: tres <code>Sol</code>, dos <code>Si</code> y un <code>Re</code>. Además, la guitarra es un instrumento de <strong>unísonos</strong>: el mismo <code>Mi4</code> (1ª cuerda al aire) existe en 5 cuerdas distintas (2ª traste 5, 3ª traste 9, 4ª traste 14, 5ª traste 19).
    </p>

    <h4>🎥 El Efecto Kuleshov Musical: La 1ª Cuerda al Aire (<code>Mi4</code>) bajo 5 Acordes</h4>
    <p class="text-xs mb-2">
      Igual que en el cine de Lev Kuleshov donde el mismo rostro inexpresivo parece triste o feliz según la imagen que lo acompaña, deja la <strong>1ª cuerda al aire (<code>Mi4</code>)</strong> fija en el tope y cambia el acorde inferior para sentir cómo esa misma nota cambia radicalmente de emoción:
    </p>
    <div class="flex flex-wrap gap-2 mb-4">
      <button type="button" class="btn-audio js-treatise-chord" data-inst="guitar" data-notes="48,55,60,64" data-label="Efecto Kuleshov 1: Mi4 como 3ª Mayor de C (Luminoso y estable)">🔊 1. Sobre C (Mi = 3ª Mayor)</button>
      <button type="button" class="btn-audio js-treatise-chord" data-inst="guitar" data-notes="45,52,60,64" data-label="Efecto Kuleshov 2: Mi4 como 5ª Justa de Am (Sólido y melancólico)">🔊 2. Sobre Am (Mi = 5ª Justa)</button>
      <button type="button" class="btn-audio js-treatise-chord" data-inst="guitar" data-notes="41,53,57,60,64" data-label="Efecto Kuleshov 3: Mi4 como 7ª Mayor de Fmaj7 (Nostálgico y flotante)">🔊 3. Sobre Fmaj7 (Mi = 7ª Mayor)</button>
      <button type="button" class="btn-audio js-treatise-chord" data-inst="guitar" data-notes="49,56,59,64" data-label="Efecto Kuleshov 4: Mi4 como ♭3 de C#m7 (Heroico y dramático)">🔊 4. Sobre C#m7 (Mi = ♭3)</button>
      <button type="button" class="btn-audio js-treatise-chord" data-inst="guitar" data-notes="50,57,61,64" data-label="Efecto Kuleshov 5: Mi4 como 9na de D(add9) (Abierto y cinematográfico)">🔊 5. Sobre Dadd9 (Mi = 9na)</button>
    </div>

    <h4>🪗 Especial Guitarra Colombiana y Latina: Paseo Vallenato por Décimas y Cumbia</h4>
    <p class="text-xs mb-2">
      En el <strong>Paseo Vallenato</strong> (escuela de Hernando Marín, Buitrago y el Binomio de Oro), la guitarra traduce los bajos y pitos del acordeón diatónico usando <strong>intervalos de Décima (3ª + una octava, tocados con pulgar en 6ª/5ª cuerda y anular en 2ª/1ª cuerda)</strong> junto con el bajo sincopado de caja y guacharaca:
    </p>
    <div class="table-wrap">
      <table>
        <thead>
          <tr>
            <th>Grado en Sol Mayor</th>
            <th>Postura de Décima (6ª y 2ª cuerda)</th>
            <th>Intervalo</th>
            <th>Toque Vallenato / Cumbia</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><strong>I (Sol Mayor) → ii (Lam) → iii (Sim) → IV (Do)</strong></td>
            <td><code>(6ª tr.3 + 2ª tr.0) → (6ª tr.5 + 2ª tr.1) → (6ª tr.7 + 2ª tr.3) → (6ª tr.8 + 2ª tr.5)</code></td>
            <td>Décimas paralelas (<code>G–B</code>, <code>A–C</code>, <code>B–D</code>, <code>C–E</code>)</td>
            <td><button type="button" class="btn-audio js-treatise-chord" data-inst="guitar" data-mode="prog" data-groups="43,59|45,60|47,62|48,64|47,62|45,60|43,59" data-label="Introducción de Paseo Vallenato por Décimas en Sol Mayor">🔊 Paseo por Décimas</button></td>
          </tr>
          <tr>
            <td><strong>Bordoneo de Cumbia / Porro (Am – E7)</strong></td>
            <td>Arpegio sincopado en el bajo (<code>Tónica – 5ª – 8ª</code>) respondiendo al llamador y la tambora.</td>
            <td>Tríada grave + rasgueo percusivo en contratiempo</td>
            <td><button type="button" class="btn-audio js-treatise-chord" data-inst="guitar" data-mode="seq" data-notes="45,52,57,60,57,52,40,47,52,56,52,47,45" data-label="Bordoneo de Cumbia Colombiana en La Menor (Am - E7 - Am)">🔊 Bordoneo Cumbia</button></td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
  `;
}

function buildElectricGuitarGlueTriadsAndOctavesHtml(): string {
  return `
  <div class="callout-box mt-6" style="border-left: 4px solid #ef4444;">
    <h3>⚡ Solución al Abuso de la Pentatónica en el Blues: Las 3 Figuras Maestras (Triángulo, Gancho y Ala) y las 5 Octavas</h3>
    <p class="text-sm mb-3">
      ¿Por qué cuando improvisas con la <strong>Pentatónica Menor de La (<code>A–C–D–E–G</code>)</strong> sobre un Blues Mayor en La (<code>A7 – D7 – E7</code>) algunas notas suenan "desconectadas"? Porque en <code>A7 (A–C#–E–G)</code> el <code>Do natural</code> choca con <code>C#</code>, y en <code>E7 (E–G#–B–D)</code> el <code>Sol natural</code> y el <code>La</code> chocan contra <code>G#</code>. La solución profesional de <em>Glue Mágico para Guitarristas</em> es dominar las <strong>3 Figuras Geométricas de Tríadas en las cuerdas 1, 2 y 3</strong> sin mover la mano de una sola zona de 4 trastes:
    </p>
    <div class="table-wrap mb-4">
      <table>
        <thead>
          <tr>
            <th>Nombre Visual (Callipari)</th>
            <th>Inversión en Cuerdas 3–2–1</th>
            <th>Trastes para La Mayor (A)</th>
            <th>Versión Menor (Bajar 1 traste la 3ª)</th>
            <th>Escuchar en Guitarra</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><strong>1. Figura "Triángulo" (🔺)</strong></td>
            <td><strong>2ª Inversión</strong> (<code>5ª – 1ª – 3ª</code>) · Forma de <em>D Mayor</em></td>
            <td><code>3ªc tr.9 (E) · 2ªc tr.10 (A) · 1ªc tr.9 (C#)</code></td>
            <td><strong>Am:</strong> <code>9 – 10 – 8</code> (Forma de <em>Dm</em>)</td>
            <td><button type="button" class="btn-audio js-treatise-chord" data-inst="guitar" data-notes="64,69,73" data-label="Figura 1 'Triángulo' (La Mayor en traste 9-10-9)">🔊 Triángulo (A)</button></td>
          </tr>
          <tr>
            <td><strong>2. Figura "Gancho" (🪝)</strong></td>
            <td><strong>Estado Fundamental</strong> (<code>1ª – 3ª – 5ª</code>) · Forma de <em>G/E</em></td>
            <td><code>3ªc tr.2 (A) · 2ªc tr.2 (C#) · 1ªc tr.0 (E)</code> (o <code>14–14–12</code>)</td>
            <td><strong>Am:</strong> <code>2 – 1 – 0</code> (o <code>14 – 13 – 12</code>)</td>
            <td><button type="button" class="btn-audio js-treatise-chord" data-inst="guitar" data-notes="57,61,64" data-label="Figura 2 'Gancho' (La Mayor: A - C# - E)">🔊 Gancho (A)</button></td>
          </tr>
          <tr>
            <td><strong>3. Figura "Ala" (🪽)</strong></td>
            <td><strong>1ª Inversión</strong> (<code>3ª – 5ª – 1ª</code>) · Forma de <em>A/C</em></td>
            <td><code>3ªc tr.6 (C#) · 2ªc tr.5 (E) · 1ªc tr.5 (A)</code></td>
            <td><strong>Am:</strong> <code>5 – 5 – 5</code> (Mini-cejilla)</td>
            <td><button type="button" class="btn-audio js-treatise-chord" data-inst="guitar" data-notes="61,64,69" data-label="Figura 3 'Ala' (La Mayor en trastes 6-5-5)">🔊 Ala (A)</button></td>
          </tr>
        </tbody>
      </table>
    </div>
    <p class="text-xs mb-3">
      💡 <strong>Enlace en una sola zona (Trastes 4 al 7 para un Blues <code>A – D – E</code>):</strong> Toca <strong>A con figura "Ala" (<code>6-5-5</code>)</strong> → cambia a <strong>D con figura "Gancho" (<code>7-7-5</code>)</strong> → cambia a <strong>E con figura "Triángulo" (<code>4-5-4</code>)</strong>. ¡Enlazaste los 3 acordes sin saltar por el mástil! Ahora únelos con <strong>Bordaduras</strong> (nota + vecina + nota), <strong>Notas de Paso</strong> y <strong>Cromatismos en tiempo débil</strong> hacia las notas de la tríada siguiente.
    </p>
    <div class="flex flex-wrap gap-2">
      <button type="button" class="btn-audio js-treatise-chord" data-inst="guitar" data-mode="prog" data-groups="61,64,69|62,66,69|59,64,68|61,64,69" data-label="Enlace en Zona de 4 Trastes: A (Ala 6-5-5) → D (Gancho 7-7-5) → E (Triángulo 4-5-4) → A">🔊 Escuchar Enlace A → D → E en 3 trastes</button>
      <button type="button" class="btn-audio js-treatise-chord" data-inst="guitar" data-mode="seq" data-notes="61,62,64,66,68,69,68,66,64,61,57" data-label="Fraseo con Bordaduras y Cromatismos conectando las 3 Tríadas">🔊 Fraseo con Bordaduras y Cromatismos</button>
    </div>
  </div>
  `;
}

function buildVocalDiagnosticAndHygieneHtml(): string {
  return `
  <div class="callout-box mt-6" style="border-left: 4px solid #14b8a6;">
    <h3>🩺 La Matriz de Autodiagnóstico del Cantante Autónomo (4 Preguntas) y Protocolo Clínico Vocal</h3>
    <p class="text-sm mb-3">
      Del <em>Capítulo 33 del Libro Completo de Canto</em>: cuando una nota falla, pica o desafina, el cantante autónomo no repite a ciegas; aplica el <strong>Escáner de los 4 Subsistemas</strong> para localizar la causa exacta en menos de 10 segundos:
    </p>
    <div class="table-wrap mb-4">
      <table>
        <thead>
          <tr>
            <th>Pregunta de Diagnóstico</th>
            <th>Síntoma Auditivo o Físico</th>
            <th>Causa Anatómica Real</th>
            <th>Prescripción Inmediata (En 30 Segundos)</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><strong>1. ¿Falló el MOTOR?</strong><br><em>(Respiración y Apoyo)</em></td>
            <td>La nota tiembla, se cae al final de la frase o los hombros suben al inhalar.</td>
            <td>Falta de expansión intercostal o exceso de aire subglótico empujado de golpe.</td>
            <td>Hacer 3 ciclos de <strong>Farinelli (4s inhala – 4s suspende – 8s exhala en "Ssss")</strong> manteniendo las costillas abiertas.</td>
          </tr>
          <tr>
            <td><strong>2. ¿Falló la FUENTE?</strong><br><em>(Pliegues Vocales: TA vs. CT)</em></td>
            <td>Gallos bruscos en el passaggio, voz aireada sin cuerpo o garganta apretada al subir.</td>
            <td>Arrastrar exceso de masa de pecho (M1/TA) hacia arriba sin inclinar el tiroides (CT).</td>
            <td>Desarmar la frase a <strong>sirena SOVT (<code>Brrrr</code> o pajita en agua)</strong> y luego cantarla con un leve <em>quejido/llanto</em>.</td>
          </tr>
          <tr>
            <td><strong>3. ¿Falló el FILTRO?</strong><br><em>(Tracto Vocal y Vocales)</em></td>
            <td>El agudo suena estridente, chillón o ahogado al cantar las vocales <code>/i/</code> o <code>/e/</code>.</td>
            <td>Laringe alta, lengua retraída o falta de espacio vertical faríngeo (<em>covering</em>).</td>
            <td>Redondear ligeramente la vocal (pensar <code>/e/ → /œ/</code>, <code>/i/ → /ɪ/</code>), soltar la mandíbula y relajar la base de la lengua.</td>
          </tr>
          <tr>
            <td><strong>4. ¿Falló la AUDIACIÓN?</strong><br><em>(Oído Interno y Cerebro)</em></em></td>
            <td>Entrar calado (bajo) o alto en un salto melódico aunque la garganta esté relajada.</td>
            <td>Lanzarse a emitir el sonido antes de pre-escuchar mentalmente el centro del tono.</td>
            <td>Pausar 2 segundos, tocar la nota objetivo, <strong>audiarla en silencio mental</strong> y entrar con ataque coordinado.</td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="grid-cards">
      <div class="card">
        <h4>🐦 El Test del Canario en M2 (Detector de Edema)</h4>
        <p class="text-xs">
          Después de un concierto o al despertar, haz un <strong>glissando ultra suave (<em>pianissimo</em>) en voz de cabeza/falsete (M2) con una <code>/u/</code></strong> en tu zona media-aguda. Si el sonido se corta, tarda en arrancar o tiene "agujeros" de aire, hay una leve inflamación de los bordes libres: <strong>prescribe reposo relativo + ejercicios SOVT suaves</strong>.
        </p>
      </div>
      <div class="card">
        <h4>💧 Hidratación Sistémica (4 h) vs. Tópica (Nebulizador)</h4>
        <p class="text-xs">
          El agua que bebes no toca las cuerdas vocales (iría a los pulmones); tarda <strong>2 a 4 horas</strong> en llegar por vía sanguínea. Para hidratar la mucosa <strong>al instante</strong> antes de cantar, usa <strong>vapor de agua o un nebulizador ultrasónico con solución salina isotónica estéril al 0.9%</strong> durante 5–8 minutos.
        </p>
      </div>
      <div class="card">
        <h4>🤫 El "Carraspeo Silencioso" (<code>¡Huff!</code> + Sorbo)</h4>
        <p class="text-xs">
          Carraspear con sonido equivale a lijar un pliegue vocal contra el otro a alta fricción. Si sientes flema en el escenario, haz una <strong>exhalación rápida de aire sin voz (<code>¡Huff!</code> desde el abdomen)</strong>, traga saliva o toma un sorbo de agua a temperatura ambiente.
        </p>
      </div>
    </div>
  </div>
  `;
}

function buildVocalSixLayersBeltAndMicHtml(): string {
  return `
  <div class="callout-box mt-6" style="border-left: 4px solid #f43f5e;">
    <h3>🎭 El Método de las 6 Capas para Montar una Canción, Belting Sano vs. Mixed Belt y Coreografía de Micrófono</h3>
    <p class="text-sm mb-3">
      Síntesis de los <em>Capítulos 19, 25, 29, 30 y 31 del Libro Completo de Canto</em>: nunca intentes aprender letra, melodía, agudos y emoción al mismo tiempo. Usa el <strong>Protocolo de las 6 Capas (y el Desarme Quirúrgico en 3 pasos para compases difíciles)</strong>:
    </p>
    <div class="table-wrap mb-4">
      <table>
        <thead>
          <tr>
            <th>Capa de Estudio</th>
            <th>Acción Técnica Exacta</th>
            <th>Objetivo Fisiológico</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><strong>Capa 1: Tonalidad y Mapa</strong></td>
            <td>Verifica que la nota cumbre (clímax) caiga en tu <strong>zona de oro</strong>; si no, transporta la canción <code>±1 o 2</code> semitonos. Marca con <code>(V)</code> cada respiración.</td>
            <td>Evitar fatiga estructural por cantar en una tonalidad ajena a tu tesitura.</td>
          </tr>
          <tr>
            <td><strong>Capa 2: Ritmo Hablado</strong></td>
            <td>Recita el texto en voz hablada proyectada sobre el pulso antes de cantar una sola nota.</td>
            <td>Independizar la dicción y el groove de la tensión laríngea.</td>
          </tr>
          <tr>
            <td><strong>Capa 3: Melodía en TVSO / Vocal Única</strong></td>
            <td>Canta toda la canción (o el pasaje difícil) solo con <strong><code>Brrrr</code> / <code>Ng</code></strong>, luego con <strong><code>Gug</code> o <code>Mum</code></strong>, y luego con una sola vocal continua.</td>
            <td>Calibrar la presión subglótica y cruzar el passaggio sin que las consonantes descoloquen la laringe.</td>
          </tr>
          <tr>
            <td><strong>Capa 4: Fonética y Diptongos (90% / 10%)</strong></td>
            <td>En palabras con diptongo (<em>cielo, aire, amor</em>), sostén el <strong>90% de la duración en la vocal abierta principal</strong> y coloca la semivocal/consonante final en el último 10%.</td>
            <td>Maximizar la resonancia y evitar cerrar la boca prematuramente en notas largas.</td>
          </tr>
          <tr>
            <td><strong>Capa 5: Subtexto Dramático y Palabras Cumbre</strong></td>
            <td>Responde las 4 preguntas de Stanislavski (<em>¿Quién soy? ¿A quién le canto? ¿Qué quiero conseguir? ¿Qué tengo que perder?</em>) y <strong>nunca acentúes artículos ni preposiciones</strong> (<em>"de", "la", "que"</em>).</td>
            <td>Lograr que la dinámica y el timbre nazcan de una intención humana real.</td>
          </tr>
          <tr>
            <td><strong>Capa 6: Puntos de Rescate y Coreografía de Micrófono</strong></td>
            <td>Memoriza la 1ª palabra de cada sección y ensaya la <strong>distancia al micrófono (<code>2 cm</code> en graves íntimos → <code>10–15 cm</code> con ángulo de 45° en agudos potentes/belting)</strong>.</td>
            <td>Comprimir acústicamente tu voz y mantener seguridad escénica total.</td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="grid-cards">
      <div class="card">
        <h4>🔥 Belting Sano vs. Mixed Belt</h4>
        <p class="text-xs">
          • <strong>Belting Puro:</strong> Dominancia TA (M1) con laringe estable, apoyo torácico firme y vocales abiertas (<code>/eh/</code>, <code>/ah/</code>). Úsalo solo en estallidos cortos.<br>
          • <strong>Mixed Belt (El Secreto Comercial):</strong> Sonido de pecho para el público, pero con <strong>inclinación tiroidea (<em>cry/llanto</em>) + brillo epilaríngeo (<em>twang</em> a 3 kHz)</strong>. Aporta el 100% de la potencia con el 40% del esfuerzo físico.
        </p>
      </div>
      <div class="card">
        <h4>🎧 Técnica de "Una Oreja Libre" en Estudio</h4>
        <p class="text-xs">
          Al grabar con audífonos cerrados, si la mezcla está muy fuerte tenderás a cantar <strong>sostenido (alto)</strong>; si tu voz está muy fuerte, cantarás <strong>calado (bajo)</strong>. Desliza <strong>media copa de un audífono fuera de una oreja</strong> para escuchar tu conducción ósea y acústica real en la sala: tu afinación mejorará al instante.
        </p>
      </div>
      <div class="card">
        <h4>🧘‍♂️ Respiración Vagal Anti-Adrenalina (4–2–6)</h4>
        <p class="text-xs">
          3 minutos antes de salir al escenario o grabar: <strong>Inhala por la nariz en 4 s → Retén 2 s → Exhala lento por labios fruncidos en 6 s</strong>. Al ser la exhalación más larga que la inhalación, estimulas el nervio vago y reduces la frecuencia cardíaca y el temblor de manos/voz.
        </p>
      </div>
    </div>
  </div>
  `;
}

function buildArreglosIlustradosBulletproofPadHtml(): string {
  return `
  <div class="callout-box mt-6" style="border-left: 4px solid #6366f1;">
    <h3>🛡️ El "Colchón a Prueba de Balas" a 4 Voces (Los 4 Power Rangers), <code>Cmaj6</code> vs. <code>Cmaj7</code> y la Línea de Acción en Embudo</h3>
    <p class="text-sm mb-3">
      En <em>Arreglos Ilustrados</em> (Brian Callipari), cuando escribimos para un cuarteto (cuerdas, vientos, coro SATB o sintetizador polifónico) visualizamos las 4 voces como <strong>4 líneas horizontales independientes con color propio (Voz 1 Rosa/Soprano, Voz 2 Celeste/Contralto, Voz 3 Verde/Tenor, Voz 4 Amarilla/Bajo)</strong> gobernadas por 5 leyes de oro:
    </p>
    <div class="table-wrap mb-4">
      <table>
        <thead>
          <tr>
            <th>Principio de Arreglos Ilustrados</th>
            <th>El Problema Común</th>
            <th>La Solución Profesional ("A Prueba de Balas")</th>
            <th>Escuchar Comparación</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><strong>1. Por qué <code>Cmaj6</code> supera a <code>Cmaj7</code> en un Colchón</strong></td>
            <td>En un colchón de fondo, el <code>Si natural (7M)</code> de <code>Cmaj7</code> forma un semitono con <code>Do</code> que reclama demasiada atención o choca si la melodía principal canta un <code>Do</code>.</td>
            <td>Para tener 4 notas distintas sin que el colchón pierda su redondez de tríada, <strong>agrega la 6ª (<code>La</code>) y sacrifica la 5ª (<code>Sol</code>)</strong> si necesitas duplicar la fundamental (porque el <code>Sol</code> ya suena solo como 3er armónico natural de <code>Do</code>).</td>
            <td><button type="button" class="btn-audio js-treatise-chord" data-mode="prog" data-groups="48,55,60,64,69|41,53,57,62,65|43,55,59,62|43,53,59,62|48,55,60,64,69" data-label="Colchón a Prueba de Balas: Cmaj6 → Fmaj6 → G → G7 → Cmaj6">🔊 Colchón Cmaj6 → F6 → G→G7</button></td>
          </tr>
          <tr>
            <td><strong>2. Dividir el Dominante en 2 Tiempos (<code>G → G7</code>)</strong></td>
            <td>Entrar de golpe en <code>G7</code> con las 4 voces estáticas durante todo el compás suena plano y predecible.</td>
            <td>Al estilo de los corales de J. S. Bach, entra primero en <strong>tríada limpia de <code>G Mayor</code></strong> y a mitad de compás haz que la voz que duplica el <code>Sol</code> baje por grado conjunto al <strong><code>Fa (7ª)</code></strong> para precipitar la resolución a <code>Mi</code>.</td>
            <td><button type="button" class="btn-audio js-treatise-chord" data-mode="prog" data-groups="43,55,59,67|43,55,59,65|48,55,60,64" data-label="Técnica Coral de Bach: G tríada → G7 (movimiento 8 → 7) → C">🔊 G → G7 → C (Coral Bach)</button></td>
          </tr>
          <tr>
            <td><strong>3. Línea de Acción en Embudo (Apertura al 70%)</strong></td>
            <td>Si todas las voces empiezan ya en registro extremo (muy graves y muy agudas desde el compás 1), la obra no tiene hacia dónde crecer.</td>
            <td>Arranca en <strong>disposición cerrada central</strong> y abre gradualmente las voces extremas en movimiento contrario (la voz 1 sube hacia su nota cumbre y la voz 4 baja al subgrave) exactamente en el <strong>clímax al 70% de la pieza</strong>.</td>
            <td><button type="button" class="btn-audio js-treatise-chord" data-mode="prog" data-groups="60,64,67,72|57,60,64,74|53,60,69,77|43,55,67,79|48,55,64,72" data-label="Embudo Orquestal: Disposición Cerrada → Apertura Máxima al 70% → Cierre">🔊 Apertura en Embudo</button></td>
          </tr>
          <tr>
            <td><strong>4. Combinaciones de Textura (<code>3+1</code>, <code>2+2</code>, <code>1+3</code>)</strong></td>
            <td>Hacer que las 4 voces toquen el mismo ritmo todo el tiempo fatiga al oyente.</td>
            <td>Alterna entre <strong><code>4</code> (Coral homofónico)</strong>, <strong><code>3+1</code> (3 voces en bloque/Soli + 1 bajo con ritmo propio o melodía solista)</strong> y <strong><code>2+2</code> (pregunta-respuesta entre registros)</strong> sin cruzar nunca las voces.</td>
            <td><button type="button" class="btn-audio js-treatise-chord" data-mode="prog" data-groups="48,60,64,67|50,60,64,67|52,60,64,67|53,60,65,69" data-label="Textura 3+1: 3 voces superiores en bloque + Bajo en movimiento melódico">🔊 Textura 3+1</button></td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
  `;
}
