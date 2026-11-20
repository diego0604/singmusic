import {
  DrumKitPieceCode,
  MusicAudioEngine,
  NOTE_NAMES,
} from './lab-engine';
import {
  analyzePedalInterval,
  analyzeSpanishLyricLine,
  classifyVocalRangeDetailed,
  midiToNoteName,
  verifySimonStep,
} from './music-games-logic';

const CHROME_GRID_SCALES: Record<string, { label: string; notes: number[]; colors: string[] }> = {
  major: {
    label: 'Escala Mayor (Do Mayor: C4–C5)',
    notes: [72, 71, 69, 67, 65, 64, 62, 60],
    colors: ['#ef4444', '#a855f7', '#3b82f6', '#14b8a6', '#22c55e', '#eab308', '#f97316', '#ef4444'],
  },
  pentatonic: {
    label: 'Pentatónica Mayor (C - D - E - G - A)',
    notes: [76, 74, 72, 69, 67, 64, 62, 60],
    colors: ['#eab308', '#f97316', '#ef4444', '#3b82f6', '#14b8a6', '#eab308', '#f97316', '#ef4444'],
  },
  dorian: {
    label: 'Menor Dórica Funk/Andina (C - D - Eb - F - G - A - Bb)',
    notes: [72, 70, 69, 67, 65, 63, 62, 60],
    colors: ['#ef4444', '#8b5cf6', '#3b82f6', '#14b8a6', '#22c55e', '#06b6d4', '#f97316', '#ef4444'],
  },
  andean: {
    label: 'Pentatónica Andina (La Menor: A3–A4)',
    notes: [72, 69, 67, 64, 62, 60, 57, 55],
    colors: ['#ef4444', '#3b82f6', '#14b8a6', '#eab308', '#f97316', '#ef4444', '#3b82f6', '#14b8a6'],
  },
};

const RHYTHM_DICTIONARY: Record<string, { consonante: string[]; asonante: string[] }> = {
  amor: {
    consonante: ['dolor', 'calor', 'color', 'rumor', 'fulgor', 'temor', 'valor', 'flor'],
    asonante: ['sol', 'voz', 'canción', 'adiós', 'corazón', 'pasión', 'reloj'],
  },
  cielo: {
    consonante: ['vuelo', 'suelo', 'anhelo', 'consuelo', 'hielo', 'desvelo', 'terciopelo'],
    asonante: ['viento', 'tiempo', 'fuego', 'sueño', 'silencio', 'invierno', 'lejos'],
  },
  vida: {
    consonante: ['herida', 'partida', 'salida', 'medida', 'guarida', 'encendida', 'olvida'],
    asonante: ['brisa', 'risa', 'ceniza', 'orilla', 'esquina', 'camina', 'mira'],
  },
  noche: {
    consonante: ['derroche', 'reproche', 'broche', 'medianoche'],
    asonante: ['voces', 'horizonte', 'bosque', 'nombre', 'insomne', 'donde'],
  },
  mar: {
    consonante: ['cantar', 'soñar', 'volar', 'despertar', 'caminar', 'olvidar', 'brillar'],
    asonante: ['paz', 'ciudad', 'verdad', 'libertad', 'tempestad', 'cristal'],
  },
  luz: {
    consonante: ['cruz', 'trasluz', 'contraluz', 'andaluz'],
    asonante: ['sur', 'azul', 'quietud', 'juventud', 'multitud', 'gratitud'],
  },
};

export interface SectionGameSearchMeta {
  catId: string;
  catLabel: string;
  sectionId: string;
  sectionTitle: string;
  nivel: string;
  keywords: string;
  snippet: string;
}

export const SECTION_GAMES_SEARCH_META: SectionGameSearchMeta[] = [
  {
    catId: 'teoria',
    catLabel: '1. Teoría y Acústica',
    sectionId: 'juego-espectrograma-fisica',
    sectionTitle: '🌈 Espectrograma en Cascada y Osciloscopio en Tiempo Real',
    nivel: '1',
    keywords: 'espectrograma ondas osciloscopio tiempo real microfono voz armonicos frecuencias formantes acustica',
    snippet: 'Visualiza la forma de onda y la cascada de frecuencias en tiempo real con micrófono o síntesis interna.',
  },
  {
    catId: 'teoria',
    catLabel: '1. Teoría y Acústica',
    sectionId: 'juego-simon',
    sectionTitle: '🧠 Simón Musical: Juego de Patrón de Escucha',
    nivel: '1-3',
    keywords: 'simon musical patron de escucha memoria auditiva secuencia notas juego oido',
    snippet: 'Escucha la secuencia progresiva de notas y repítela en orden (modo visual o modo ciego).',
  },
  {
    catId: 'teoria',
    catLabel: '1. Teoría y Acústica',
    sectionId: 't-oido',
    sectionTitle: '🎯 Test de Agudeza Auditiva (Unísono, Semitono, Tono y Microtono)',
    nivel: '1-4',
    keywords: 'test agudeza auditiva oido relativo unisono semitono tono microtono cents afinacion',
    snippet: 'Distingue intervalos, grados funcionales y diferencias microtonales de afinación.',
  },
  {
    catId: 'armonia',
    catLabel: '2. Armonía Práctica',
    sectionId: 'juego-pedal-c',
    sectionTitle: '🧲 Reto del Pedal C: Gravedad Armónica y Colores Modales',
    nivel: '3',
    keywords: 'pedal c nota pedal drone gravedad armonica lidio dorico frigio mixolidio modos',
    snippet: 'Comprende para qué sirve el Pedal C dejando sonando C3 mientras identificas la tensión de cada grado.',
  },
  {
    catId: 'composicion',
    catLabel: '3. Composición y Letras',
    sectionId: 'juego-chrome-seq',
    sectionTitle: '🎹 Secuenciador Visual y Caja de Ritmos (Estilo Chrome Music Lab)',
    nivel: '1-3',
    keywords: 'secuenciador caja de ritmos chrome music lab song maker cuadricula melodia ritmo',
    snippet: 'Dibuja melodías y patrones rítmicos en una cuadrícula visual de colores en bucle.',
  },
  {
    catId: 'composicion',
    catLabel: '3. Composición y Letras',
    sectionId: 'juego-letras-canciones',
    sectionTitle: '✍️ Estudio Creativo de Canciones, Letras, Sinalefas y Rimas',
    nivel: '2-4',
    keywords: 'crear canciones letras compositor silabas metricas sinalefa rimas consonante asonante acordes',
    snippet: 'Escribe versos y analiza sílabas métricas, sinalefas y rimas en tiempo real sobre una base armónica.',
  },
  {
    catId: 'bateria',
    catLabel: '7. Batería y Percusión',
    sectionId: 'd-gimnasio',
    sectionTitle: '🥁 Batería Interactiva Cenital (Top-View SVG) y Reto Rítmico',
    nivel: '1-4',
    keywords: 'bateria interactiva vista cenital svg topview bombo caja hihat toms crash ride reto ritmo rudimentos',
    snippet: 'Toca la batería completa vista desde arriba (ratón, táctil o teclado B/S/H/T/Y/U/C/R) y supera el reto rítmico.',
  },
  {
    catId: 'canto',
    catLabel: '8. Canto y Calentamiento Vocal',
    sectionId: 'juego-espectrograma-voz',
    sectionTitle: '🌈 Espectrograma Vocal en Tiempo Real (Formantes y Micrófono)',
    nivel: '2',
    keywords: 'espectrograma vocal voz formantes microfono tiempo real afinacion canto ondas',
    snippet: 'Observa las formantes vocálicas y armónicos de tu voz en vivo por micrófono o con vocales sintetizadas.',
  },
  {
    catId: 'canto',
    catLabel: '8. Canto y Calentamiento Vocal',
    sectionId: 'guia-e2-d5-pedal',
    sectionTitle: '🎤 Diagnóstico Vocal E2–D5 (Baritenor / 3 Octavas) y Pedal C',
    nivel: '1-4',
    keywords: 'rango vocal e2 d5 baritenor tenor baritono 3 octavas tesitura detector microfono pedal c',
    snippet: 'Por qué tu rango E2–D5 abarca 34 semitonos (Baritenor) y cómo usar el Pedal C para entrenar afinación.',
  },
];

export function buildSpectrogramWidgetHtml(
  widgetId = 'juego-espectrograma-fisica',
  title = '🌈 Laboratorio Visual: Espectrograma en Cascada y Osciloscopio en Tiempo Real',
  subtitle = 'Visualiza la forma de onda (tiempo) y la huella de armónicos/formantes (frecuencia) con tu micrófono o con los instrumentos del motor.'
): string {
  return `
    <article id="${widgetId}" class="interactive-widget js-arcade-spectrogram">
      <div class="widget-header">
        <div class="min-w-0">
          <strong>${title}</strong>
          <p>${subtitle}</p>
        </div>
        <div class="widget-controls">
          <button type="button" class="btn btn-primary js-spec-mic">🎙️ Conectar Micrófono</button>
          <button type="button" class="btn js-spec-vowel" data-v="a">🗣 Vocal "A"</button>
          <button type="button" class="btn js-spec-vowel" data-v="i">🗣 Vocal "I"</button>
          <button type="button" class="btn js-spec-siren">🚀 Sirena E2 → D5</button>
          <button type="button" class="btn js-spec-quena">🪈 Quena</button>
          <button type="button" class="btn js-spec-chord">🎸 Acorde</button>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-3 my-2">
        <div class="p-2.5 rounded-xl bg-[#050811] border border-slate-800 min-w-0">
          <div class="flex flex-wrap items-center justify-between gap-1 text-xs mb-1.5">
            <span class="font-bold text-sky-400">📈 Osciloscopio + Barras FFT</span>
            <span class="font-mono text-amber-300 js-spec-peak">Pico: — Hz</span>
          </div>
          <canvas class="js-spec-wave-canvas w-full h-auto rounded-lg bg-[#03060c] block" width="560" height="165"></canvas>
        </div>

        <div class="p-2.5 rounded-xl bg-[#050811] border border-slate-800 min-w-0">
          <div class="flex flex-wrap items-center justify-between gap-1 text-xs mb-1.5">
            <span class="font-bold text-amber-400">🌈 Espectrograma de Cascada</span>
            <span class="font-mono text-emerald-300 js-spec-source">Fuente: Síntesis Interna</span>
          </div>
          <canvas class="js-spec-waterfall-canvas w-full h-auto rounded-lg bg-[#03060c] block" width="560" height="165"></canvas>
        </div>
      </div>
    </article>
  `;
}

export function buildSimonMusicalWidgetHtml(): string {
  return `
    <article id="juego-simon" class="interactive-widget js-arcade-simon">
      <div class="widget-header">
        <div class="min-w-0">
          <strong>🧠 Juego de Patrón de Escucha: Simón Musical Progresivo</strong>
          <p>Escucha la secuencia de notas que toca el sintetizador y repítela en el mismo orden. Cada ronda añade una nota más al patrón.</p>
        </div>
        <div class="widget-controls">
          <label>Velocidad:</label>
          <select class="lab-select js-simon-speed">
            <option value="520">Normal (Andante)</option>
            <option value="360">Rápido (Allegro)</option>
            <option value="250">Experto (Presto)</option>
          </select>
          <button type="button" class="btn js-simon-blind">👁️ Visual + Oído</button>
          <button type="button" class="btn js-simon-replay">🔄 Repetir</button>
          <button type="button" class="btn btn-primary js-simon-start">▶ Nuevo Juego</button>
        </div>
      </div>

      <div class="grid grid-cols-2 sm:grid-cols-4 gap-2.5 my-3 js-simon-pads">
        ${[
          { midi: 60, name: 'C4 (Do)', degree: '1 Tónica', color: '#ef4444' },
          { midi: 62, name: 'D4 (Re)', degree: '2 Supertónica', color: '#f97316' },
          { midi: 64, name: 'E4 (Mi)', degree: '3 Mediante', color: '#eab308' },
          { midi: 65, name: 'F4 (Fa)', degree: '4 Subdominante', color: '#22c55e' },
          { midi: 67, name: 'G4 (Sol)', degree: '5 Dominante', color: '#14b8a6' },
          { midi: 69, name: 'A4 (La)', degree: '6 Superdominante', color: '#3b82f6' },
          { midi: 71, name: 'B4 (Si)', degree: '7 Sensible', color: '#8b5cf6' },
          { midi: 72, name: 'C5 (Do 8va)', degree: '8 Octava', color: '#ec4899' },
        ]
          .map(
            (pad, idx) => `
          <button
            type="button"
            class="js-simon-pad rounded-xl p-3 text-left transition-all cursor-pointer border-2 select-none"
            data-idx="${idx}"
            data-midi="${pad.midi}"
            style="background:rgba(15,23,42,0.85); border-color:${pad.color}; box-shadow: inset 0 0 12px ${pad.color}22;">
            <div class="flex items-center justify-between gap-1">
              <span class="text-xs sm:text-sm font-extrabold text-white">${pad.name}</span>
              <span class="w-2.5 h-2.5 rounded-full shrink-0" style="background:${pad.color};"></span>
            </div>
            <div class="text-[11px] font-semibold mt-1" style="color:${pad.color};">${pad.degree}</div>
          </button>
        `
          )
          .join('')}
      </div>

      <div class="flex flex-wrap items-center justify-between gap-2 p-3 rounded-xl bg-slate-900/90 border border-slate-800 text-xs">
        <div class="js-simon-status font-bold text-sky-300 min-w-0">
          Pulsa "▶ Nuevo Juego" para escuchar el primer patrón musical.
        </div>
        <div class="flex items-center gap-3 font-mono shrink-0">
          <span class="text-amber-300 font-bold js-simon-level">Nivel: 0</span>
          <span class="text-emerald-300 font-bold js-simon-best">Récord: 0</span>
        </div>
      </div>
    </article>
  `;
}

export function buildPedalCGameWidgetHtml(): string {
  return `
    <article id="juego-pedal-c" class="interactive-widget js-arcade-pedal-game">
      <div class="widget-header">
        <div class="min-w-0">
          <strong>🧲 Laboratorio y Reto del Pedal C: Gravedad Armónica y Colores Modales</strong>
          <p>Al dejar sonando la nota raíz <code>C3</code> (Pedal Tónica) en el bajo, cada nota superior adquiere un color modal o de tensión inconfundible.</p>
        </div>
        <div class="widget-controls">
          <button type="button" class="btn btn-primary js-pg-quiz">🎲 Adivinar Grado sobre Pedal C</button>
          <button type="button" class="btn js-pg-repeat">🔄 Repetir</button>
          <button type="button" class="btn js-pg-demo-lidia">✨ 4 (F) vs #4 Lidia (F#)</button>
        </div>
      </div>

      <div class="text-xs text-slate-400 mb-2">Haz clic en cualquier grado para escucharlo contra el Bajo Pedal C3 o responder al reto:</div>
      <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-1.5 js-pg-buttons">
        ${[
          { st: 0, label: '1 (C4) Reposo' },
          { st: 1, label: 'b2 (Db) Frigio' },
          { st: 2, label: '2 (D) Novena' },
          { st: 3, label: 'b3 (Eb) Menor' },
          { st: 4, label: '3 (E) Mayor' },
          { st: 5, label: '4 (F) Sus4' },
          { st: 6, label: '#4 (F#) Lidio' },
          { st: 7, label: '5 (G) Quinta' },
          { st: 8, label: 'b6 (Ab) Épico' },
          { st: 9, label: '6 (A) Dórico' },
          { st: 10, label: 'b7 (Bb) Mixo' },
          { st: 11, label: '7 (B) Maj7' },
        ]
          .map(
            (item) => `
          <button type="button" class="btn text-xs js-pg-deg" data-st="${item.st}">${item.label}</button>
        `
          )
          .join('')}
      </div>
      <div class="mt-3 p-2.5 rounded-lg bg-slate-900 border border-slate-800 text-xs js-pg-info text-sky-300 font-semibold">
        Toca cualquier botón superior para escuchar cómo choca o reposa contra el Bajo Pedal C3.
      </div>
    </article>
  `;
}

export function buildChromeLabWidgetHtml(): string {
  return `
    <article id="juego-chrome-seq" class="interactive-widget js-arcade-chromelab">
      <div class="widget-header">
        <div class="min-w-0">
          <strong>🎹 Secuenciador Visual y Caja de Ritmos (Estilo Chrome Music Lab)</strong>
          <p>Dibuja melodías en la cuadrícula de colores (8 alturas) y combina batería en las 4 filas inferiores (16 semicorcheas).</p>
        </div>
        <div class="widget-controls">
          <label>Escala:</label>
          <select class="lab-select js-cml-scale">
            <option value="pentatonic">Pentatónica Mayor</option>
            <option value="major">Escala Mayor (Do)</option>
            <option value="dorian">Menor Dórica (Funk)</option>
            <option value="andean">Pentatónica Andina</option>
          </select>
          <label>Timbre:</label>
          <select class="lab-select js-cml-inst">
            <option value="marimba">Marimba / Synth</option>
            <option value="piano">Piano Acústico</option>
            <option value="guitar">Guitarra Pulsada</option>
            <option value="quena">Quena Andina</option>
          </select>
          <label>BPM:</label>
          <input type="range" min="75" max="155" value="112" class="js-cml-bpm" style="width:80px; accent-color:#38bdf8;" />
          <span class="js-cml-bpm-val text-xs font-mono text-sky-300 font-bold">112</span>
        </div>
      </div>

      <div class="flex flex-wrap gap-2 mb-3">
        <button type="button" class="btn btn-primary js-cml-play">▶ Reproducir en Bucle</button>
        <button type="button" class="btn js-cml-preset" data-preset="sun">☀️ Melodía Solar</button>
        <button type="button" class="btn js-cml-preset" data-preset="andes">🏔️ Carnaval Andino</button>
        <button type="button" class="btn js-cml-preset" data-preset="funk">🕺 Groove Dórico</button>
        <button type="button" class="btn js-cml-random">🎲 Aleatorio</button>
        <button type="button" class="btn js-cml-clear">🧹 Limpiar</button>
      </div>

      <div class="overflow-x-auto pb-2 max-w-full">
        <div class="js-cml-grid min-w-[620px] space-y-1"></div>
      </div>
    </article>
  `;
}

export function buildLyricStudioWidgetHtml(): string {
  return `
    <article id="juego-letras-canciones" class="interactive-widget js-arcade-lyrics">
      <div class="widget-header">
        <div class="min-w-0">
          <strong>✍️ Estudio Creativo de Canciones y Letras (Métrica, Sinalefas, Rimas y Acordes)</strong>
          <p>Escribe versos en español y visualiza sílabas gramaticales, <strong>sinalefas</strong>, ley del acento final y rima mientras suena tu base armónica.</p>
        </div>
        <div class="widget-controls">
          <label>Base Musical:</label>
          <select class="lab-select js-lyr-prog">
            <option value="pop">Pop Himno: C – G – Am – F</option>
            <option value="andean">Andino: Am – F – C – G</option>
            <option value="pedal">Pedal C: C – F/C – G/C – Fm/C</option>
            <option value="neosoul">Neo-Soul: Dm9 – G13 – Cmaj9 – A7alt</option>
          </select>
          <button type="button" class="btn btn-primary js-lyr-loop">▶ Base de Acordes</button>
          <button type="button" class="btn js-lyr-template" data-tpl="octosilabo">📜 Octosílabo (8)</button>
          <button type="button" class="btn js-lyr-template" data-tpl="endecasilabo">📜 Canción (11)</button>
          <button type="button" class="btn js-lyr-idea">💡 Semilla</button>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-12 gap-4 my-2">
        <div class="lg:col-span-6 flex flex-col min-w-0">
          <label class="text-xs font-bold text-amber-300 mb-1.5">Escribe o edita tus versos (1 verso por línea):</label>
          <textarea
            rows="5"
            class="js-lyr-input w-full p-3 rounded-xl bg-[#070b14] border border-slate-700 text-slate-100 text-sm font-medium leading-relaxed focus:outline-none focus:border-sky-400"
            placeholder="Escribe tus versos aquí...">Canta el viento en la montaña
bajo el fuego de tu voz
cruza el cielo en la mañana
encendiendo el corazón</textarea>

          <div class="mt-3 p-3 rounded-xl bg-slate-900/90 border border-slate-800">
            <div class="flex flex-wrap items-center gap-1.5 mb-2">
              <span class="text-xs font-bold text-sky-300">🔎 Rimas rápidas:</span>
              ${Object.keys(RHYTHM_DICTIONARY)
                .map(
                  (key) => `
                <button type="button" class="btn text-xs py-1 px-2 js-lyr-rhyme-btn" data-word="${key}">-${key}</button>
              `
                )
                .join('')}
            </div>
            <div class="js-lyr-rhyme-out text-xs text-slate-300">
              Selecciona una terminación para ver rimas consonantes y asonantes listas para tus versos.
            </div>
          </div>
        </div>

        <div class="lg:col-span-6 min-w-0">
          <div class="text-xs font-bold text-emerald-300 mb-1.5">Análisis Métrico y Rítmico en Tiempo Real:</div>
          <div class="table-container m-0">
            <table>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Verso y Sinalefas</th>
                  <th>Gram.</th>
                  <th>Final</th>
                  <th>Métr.</th>
                  <th>Rima</th>
                </tr>
              </thead>
              <tbody class="js-lyr-table-body"></tbody>
            </table>
          </div>
        </div>
      </div>
    </article>
  `;
}

export function buildE2D5GuideCalloutHtml(): string {
  const e2d5Report = classifyVocalRangeDetailed(40, 74, 'mid');
  return `
    <div id="guia-e2-d5-pedal" class="callout pro">
      <div class="callout-title">🎤 Diagnóstico Vocal Avanzado: Rango E2 a D5 (Baritenor / 3 Octavas) y Uso del Pedal C</div>
      <div class="grid-2">
        <div class="card">
          <h4>1. Tu Rango Vocal <code>E2 a D5</code> (${e2d5Report.semitones} Semitonos / ${e2d5Report.octaves} Octavas)</h4>
          <p class="text-xs">
            Los detectores simples comparan solo con 2 octavas corales y al llegar a <strong>D5 (587.3 Hz)</strong> te etiquetan como "Tenor", ignorando que bajas hasta <strong>E2 (82.4 Hz)</strong>. Clasificación real: <strong>${e2d5Report.primaryClassification}</strong> (${e2d5Report.secondaryPossibilities[0]}).
          </p>
          <div class="flex flex-wrap gap-1.5 mt-2">
            <button type="button" class="btn text-xs js-e2d5-play" data-midi="40" data-vowel="o">🔊 Grave E2 (82.4 Hz)</button>
            <button type="button" class="btn text-xs js-e2d5-play" data-midi="55" data-vowel="a">🔊 Pecho G3 (196 Hz)</button>
            <button type="button" class="btn text-xs js-e2d5-play" data-midi="66" data-vowel="e">🔊 Passaggio F#4 (370 Hz)</button>
            <button type="button" class="btn text-xs js-e2d5-play" data-midi="74" data-vowel="i">🔊 Agudo D5 (587.3 Hz)</button>
          </div>
        </div>

        <div class="card">
          <h4>2. ¿Para qué sirve el botón <code>🔊 Pedal Tónica (C)</code>?</h4>
          <p class="text-xs">
            Sostiene la raíz grave <code>C3 (130.8 Hz)</code> para darte un centro gravitacional fijo:
          </p>
          <ul class="text-xs space-y-1 mb-0">
            <li><strong>Afinación Vocal Pura:</strong> Escuchas el batimiento acústico para clavar 3as, 5as y 7as sin desafinar.</li>
            <li><strong>Oído Modal:</strong> Distingues al instante el color Dórico (6ª) o Lidio (#4) contra C3.</li>
          </ul>
        </div>
      </div>
    </div>
  `;
}

function appendInsideSection(html: string, sectionId: string, insertion: string): string {
  const regex = new RegExp(`(<section\\s+id="${sectionId}"[\\s\\S]*?)(<\\/section>)`);
  if (!regex.test(html)) return html;
  return html.replace(regex, `$1\n${insertion}\n$2`);
}

export function injectSectionGamesIntoCategoryHtml(catId: string, html: string): string {
  let out = html;

  if (catId === 'teoria' || catId === 'all') {
    out = appendInsideSection(
      out,
      't-sonido',
      buildSpectrogramWidgetHtml(
        'juego-espectrograma-fisica',
        '🌈 Espectrograma en Cascada y Osciloscopio de Ondas en Tiempo Real',
        'Observa en vivo la forma de onda y los armónicos de tu voz (por micrófono) o de cualquier sonido del sintetizador.'
      )
    );
    out = appendInsideSection(out, 't-oido', buildSimonMusicalWidgetHtml());
  }

  if (catId === 'armonia' || catId === 'all') {
    out = appendInsideSection(out, 'h-modal', buildPedalCGameWidgetHtml());
  }

  if (catId === 'composicion' || catId === 'all') {
    out = appendInsideSection(out, 'c-motivos-melodia', buildChromeLabWidgetHtml());
    out = appendInsideSection(out, 'c-letra', buildLyricStudioWidgetHtml());
  }

  if (catId === 'canto' || catId === 'all') {
    out = appendInsideSection(
      out,
      'v-afinacion-registros',
      buildSpectrogramWidgetHtml(
        'juego-espectrograma-voz',
        '🌈 Espectrograma Vocal en Tiempo Real (Formantes, Vibrato y Micrófono)',
        'Canta frente al micrófono o dispara las vocales sintetizadas para observar tus formantes F1/F2 y armónicos agudos.'
      )
    );
    out = appendInsideSection(out, 'v-detector-tesitura', buildE2D5GuideCalloutHtml());
  }

  return out;
}

export function hydrateInteractiveArcade(
  root: HTMLElement,
  audio: MusicAudioEngine,
  onStatus: (msg: string) => void
): void {
  hydrateSimonMusicalArcade(root, audio, onStatus);
  hydrateChromeMusicLabArcade(root, audio, onStatus);
  hydratePedalCGameArcade(root, audio);
  hydrateSpectrogramArcade(root, audio, onStatus);
  hydrateLyricStudioArcade(root, audio, onStatus);
  hydrateE2D5QuickButtons(root, audio, onStatus);
}

function hydrateSimonMusicalArcade(
  root: HTMLElement,
  audio: MusicAudioEngine,
  onStatus: (msg: string) => void
): void {
  root.querySelectorAll<HTMLElement>('.js-arcade-simon').forEach((widget) => {
    if (widget.dataset['bound'] === '1') return;
    widget.dataset['bound'] = '1';

    const pads = Array.from(widget.querySelectorAll<HTMLButtonElement>('.js-simon-pad'));
    const statusEl = widget.querySelector<HTMLElement>('.js-simon-status');
    const levelEl = widget.querySelector<HTMLElement>('.js-simon-level');
    const bestEl = widget.querySelector<HTMLElement>('.js-simon-best');
    const speedSelect = widget.querySelector<HTMLSelectElement>('.js-simon-speed');
    const blindBtn = widget.querySelector<HTMLButtonElement>('.js-simon-blind');

    const padMidis = [60, 62, 64, 65, 67, 69, 71, 72];
    let sequence: number[] = [];
    let currentStepIndex = 0;
    let bestLevel = 0;
    let blindMode = false;
    let isPlayingSeq = false;

    const flashPad = (idx: number, durationMs = 340) => {
      const pad = pads[idx];
      if (!pad) return;
      pad.style.transform = 'scale(1.04)';
      pad.style.filter = 'brightness(1.65)';
      setTimeout(() => {
        pad.style.transform = '';
        pad.style.filter = '';
      }, durationMs);
    };

    const playPadNote = (idx: number, visual = true) => {
      const midi = padMidis[idx] ?? 60;
      audio.playAcousticPiano(midi, 0.55, 0, 0.28, false);
      if (visual) flashPad(idx, 300);
    };

    const playCurrentSequence = () => {
      if (sequence.length === 0) return;
      isPlayingSeq = true;
      currentStepIndex = 0;
      const stepMs = parseInt(speedSelect?.value || '520', 10);
      if (statusEl) {
        statusEl.textContent = `👂 Escuchando patrón de ${sequence.length} nota(s)...`;
      }
      sequence.forEach((midi, i) => {
        const padIdx = padMidis.indexOf(midi);
        setTimeout(() => {
          playPadNote(padIdx >= 0 ? padIdx : 0, !blindMode);
          if (i === sequence.length - 1) {
            setTimeout(() => {
              isPlayingSeq = false;
              if (statusEl) {
                statusEl.textContent = `🎹 ¡Tu turno! Repite las ${sequence.length} nota(s) en orden.`;
              }
            }, stepMs);
          }
        }, i * stepMs);
      });
    };

    const nextRound = () => {
      const nextMidi = padMidis[Math.floor(Math.random() * padMidis.length)];
      sequence.push(nextMidi);
      if (levelEl) levelEl.textContent = `Nivel: ${sequence.length}`;
      playCurrentSequence();
    };

    blindBtn?.addEventListener('click', () => {
      blindMode = !blindMode;
      blindBtn.classList.toggle('active', blindMode);
      blindBtn.textContent = blindMode ? '🙈 Solo Oído' : '👁️ Visual + Oído';
    });

    widget.querySelector<HTMLButtonElement>('.js-simon-start')?.addEventListener('click', () => {
      audio.stopAll();
      sequence = [];
      currentStepIndex = 0;
      onStatus('🧠 Simón Musical iniciado: Escucha el patrón');
      nextRound();
    });

    widget.querySelector<HTMLButtonElement>('.js-simon-replay')?.addEventListener('click', () => {
      if (sequence.length === 0) {
        nextRound();
      } else {
        playCurrentSequence();
      }
    });

    pads.forEach((pad, idx) => {
      pad.addEventListener('click', () => {
        if (isPlayingSeq) return;
        playPadNote(idx, true);
        const playedMidi = padMidis[idx] ?? 60;
        if (sequence.length === 0) {
          onStatus(`Nota libre: ${NOTE_NAMES[playedMidi % 12]}`);
          return;
        }

        const check = verifySimonStep(sequence, currentStepIndex, playedMidi);
        if (check.status === 'wrong') {
          audio.playFreqTone(110, 0.45, 0, 0.22, false);
          if (statusEl) {
            statusEl.textContent = `❌ Nota incorrecta en el paso ${currentStepIndex + 1} (esperaba ${midiToNoteName(check.expectedMidi)}). Nivel ${sequence.length}.`;
          }
          currentStepIndex = 0;
          return;
        }

        currentStepIndex = check.matchedCount;
        if (check.status === 'level_complete') {
          bestLevel = Math.max(bestLevel, sequence.length);
          if (bestEl) bestEl.textContent = `Récord: ${bestLevel}`;
          if (statusEl) {
            statusEl.textContent = `✅ ¡Nivel ${sequence.length} superado! Preparando Nivel ${sequence.length + 1}...`;
          }
          setTimeout(() => nextRound(), 750);
        } else if (statusEl) {
          statusEl.textContent = `👍 Correcto (${currentStepIndex}/${sequence.length})...`;
        }
      });
    });
  });
}

function hydrateChromeMusicLabArcade(
  root: HTMLElement,
  audio: MusicAudioEngine,
  onStatus: (msg: string) => void
): void {
  root.querySelectorAll<HTMLElement>('.js-arcade-chromelab').forEach((widget) => {
    if (widget.dataset['bound'] === '1') return;
    widget.dataset['bound'] = '1';

    const gridHost = widget.querySelector<HTMLElement>('.js-cml-grid');
    const scaleSelect = widget.querySelector<HTMLSelectElement>('.js-cml-scale');
    const instSelect = widget.querySelector<HTMLSelectElement>('.js-cml-inst');
    const bpmInput = widget.querySelector<HTMLInputElement>('.js-cml-bpm');
    const bpmVal = widget.querySelector<HTMLElement>('.js-cml-bpm-val');
    const playBtn = widget.querySelector<HTMLButtonElement>('.js-cml-play');

    const melodyGrid: boolean[][] = Array.from({ length: 8 }, () => Array(16).fill(false));
    const drumGrid: boolean[][] = Array.from({ length: 4 }, () => Array(16).fill(false));
    const drumLabels: { name: string; code: DrumKitPieceCode; color: string }[] = [
      { name: '🟡 HH / Plato', code: 'HH', color: '#f59e0b' },
      { name: '🔵 SD Caja', code: 'SD', color: '#3b82f6' },
      { name: '🟣 Toms', code: 'T1', color: '#8b5cf6' },
      { name: '🔴 BD Bombo', code: 'BD', color: '#ef4444' },
    ];

    let currentStep = -1;
    let timerId: ReturnType<typeof setInterval> | null = null;

    const loadPreset = (name: string) => {
      for (let r = 0; r < 8; r++) melodyGrid[r].fill(false);
      for (let r = 0; r < 4; r++) drumGrid[r].fill(false);

      if (name === 'sun') {
        [
          [7, 0], [5, 2], [4, 4], [2, 6], [0, 8], [2, 10], [4, 12], [5, 14],
          [7, 8], [4, 0],
        ].forEach(([r, c]) => {
          melodyGrid[r][c] = true;
        });
        [0, 2, 4, 6, 8, 10, 12, 14].forEach((c) => (drumGrid[0][c] = true));
        [4, 12].forEach((c) => (drumGrid[1][c] = true));
        [0, 6, 8, 10].forEach((c) => (drumGrid[3][c] = true));
      } else if (name === 'andes') {
        if (scaleSelect) scaleSelect.value = 'andean';
        if (instSelect) instSelect.value = 'quena';
        [
          [4, 0], [2, 2], [0, 4], [0, 6], [2, 8], [3, 10], [4, 12], [5, 14],
        ].forEach(([r, c]) => {
          melodyGrid[r][c] = true;
        });
        [0, 3, 4, 7, 8, 11, 12, 15].forEach((c) => (drumGrid[3][c] = true));
        [2, 6, 10, 14].forEach((c) => (drumGrid[0][c] = true));
        [13, 14, 15].forEach((c) => (drumGrid[2][c] = true));
      } else if (name === 'funk') {
        if (scaleSelect) scaleSelect.value = 'dorian';
        [
          [7, 0], [6, 2], [5, 3], [4, 6], [2, 8], [4, 11], [5, 12], [7, 14],
        ].forEach(([r, c]) => {
          melodyGrid[r][c] = true;
        });
        for (let c = 0; c < 16; c++) drumGrid[0][c] = true;
        [4, 12].forEach((c) => (drumGrid[1][c] = true));
        [0, 3, 6, 10, 14].forEach((c) => (drumGrid[3][c] = true));
      }
    };

    const playNoteForCell = (row: number) => {
      const scaleKey = scaleSelect?.value || 'pentatonic';
      const scaleDef = CHROME_GRID_SCALES[scaleKey] || CHROME_GRID_SCALES['pentatonic'];
      const midi = scaleDef.notes[row] ?? 60;
      const inst = instSelect?.value || 'marimba';
      if (inst === 'piano') {
        audio.playAcousticPiano(midi, 0.34, 0, 0.22, false);
      } else if (inst === 'guitar') {
        audio.playPluckedGuitar(midi, 0.38, 0, 0.24, false);
      } else if (inst === 'quena') {
        audio.playQuenaFlute(midi, 0.34, 0, 0.22, false);
      } else {
        audio.playFreqTone(audio.midiToFreq(midi), 0.28, 0, 0.22, false);
      }
    };

    const renderGrid = () => {
      if (!gridHost) return;
      const scaleKey = scaleSelect?.value || 'pentatonic';
      const scaleDef = CHROME_GRID_SCALES[scaleKey] || CHROME_GRID_SCALES['pentatonic'];

      const melodyHtml = scaleDef.notes
        .map((midi, r) => {
          const noteName = `${NOTE_NAMES[midi % 12]}${Math.floor(midi / 12) - 1}`;
          const color = scaleDef.colors[r];
          const cells = Array.from({ length: 16 }, (_, c) => {
            const isOn = melodyGrid[r][c];
            const isBeat = c % 4 === 0;
            const isCurrent = c === currentStep;
            const bg = isOn ? color : isBeat ? '#162033' : '#0f172a';
            const outline = isCurrent ? '2px solid #ffffff' : '1px solid #283548';
            return `<button type="button" class="js-cml-mcell h-7 rounded transition-transform cursor-pointer" data-r="${r}" data-c="${c}" style="background:${bg}; border:${outline};"></button>`;
          }).join('');
          return `
            <div class="grid items-center gap-1" style="grid-template-columns: 76px repeat(16, minmax(24px, 1fr));">
              <span class="text-[11px] font-bold font-mono px-1.5 py-0.5 rounded truncate" style="color:${color}; background:${color}18;">${noteName}</span>
              ${cells}
            </div>
          `;
        })
        .join('');

      const drumHtml = drumLabels
        .map((d, r) => {
          const cells = Array.from({ length: 16 }, (_, c) => {
            const isOn = drumGrid[r][c];
            const isCurrent = c === currentStep;
            const bg = isOn ? d.color : c % 4 === 0 ? '#162033' : '#0b111e';
            const outline = isCurrent ? '2px solid #ffffff' : '1px solid #283548';
            return `<button type="button" class="js-cml-dcell h-6 rounded-full transition-transform cursor-pointer" data-r="${r}" data-c="${c}" style="background:${bg}; border:${outline};"></button>`;
          }).join('');
          return `
            <div class="grid items-center gap-1" style="grid-template-columns: 76px repeat(16, minmax(24px, 1fr));">
              <span class="text-[10px] font-bold text-slate-300 truncate">${d.name}</span>
              ${cells}
            </div>
          `;
        })
        .join('');

      gridHost.innerHTML = `
        <div class="space-y-1">${melodyHtml}</div>
        <div class="my-2 border-t border-slate-700/80 pt-2 space-y-1">${drumHtml}</div>
      `;

      gridHost.querySelectorAll<HTMLButtonElement>('.js-cml-mcell').forEach((cell) => {
        cell.addEventListener('click', () => {
          const r = parseInt(cell.dataset['r'] || '0', 10);
          const c = parseInt(cell.dataset['c'] || '0', 10);
          melodyGrid[r][c] = !melodyGrid[r][c];
          if (melodyGrid[r][c]) playNoteForCell(r);
          renderGrid();
        });
      });

      gridHost.querySelectorAll<HTMLButtonElement>('.js-cml-dcell').forEach((cell) => {
        cell.addEventListener('click', () => {
          const r = parseInt(cell.dataset['r'] || '0', 10);
          const c = parseInt(cell.dataset['c'] || '0', 10);
          drumGrid[r][c] = !drumGrid[r][c];
          if (drumGrid[r][c]) audio.playDrumPiece(drumLabels[r].code, 0);
          renderGrid();
        });
      });
    };

    const stopLoop = () => {
      if (timerId) {
        clearInterval(timerId);
        timerId = null;
      }
      currentStep = -1;
      if (playBtn) {
        playBtn.textContent = '▶ Reproducir en Bucle';
        playBtn.classList.remove('active');
      }
      renderGrid();
    };

    const unsubStop = audio.onStop(() => {
      if (timerId || currentStep >= 0) {
        stopLoop();
      }
    });

    const startLoop = () => {
      stopLoop();
      const bpm = parseInt(bpmInput?.value || '112', 10);
      const stepMs = (60 / bpm / 4) * 1000;
      currentStep = 0;
      if (playBtn) {
        playBtn.textContent = '⏹ Detener Bucle';
        playBtn.classList.add('active');
      }

      const tick = () => {
        if (!document.body.contains(widget)) {
          stopLoop();
          unsubStop();
          return;
        }
        for (let r = 0; r < 8; r++) {
          if (melodyGrid[r][currentStep]) {
            playNoteForCell(r);
          }
        }
        for (let r = 0; r < 4; r++) {
          if (drumGrid[r][currentStep]) {
            audio.playDrumPiece(drumLabels[r].code, 0);
          }
        }
        renderGrid();
        currentStep = (currentStep + 1) % 16;
      };

      tick();
      timerId = setInterval(tick, stepMs);
    };

    playBtn?.addEventListener('click', () => {
      if (timerId) {
        stopLoop();
        onStatus('⏹ Secuenciador Chrome Music Lab detenido');
      } else {
        onStatus('🎹 Reproduciendo Secuenciador Visual Chrome Music Lab');
        startLoop();
      }
    });

    bpmInput?.addEventListener('input', () => {
      if (bpmVal) bpmVal.textContent = bpmInput.value;
      if (timerId) startLoop();
    });

    scaleSelect?.addEventListener('change', () => renderGrid());

    widget.querySelectorAll<HTMLButtonElement>('.js-cml-preset').forEach((btn) => {
      btn.addEventListener('click', () => {
        loadPreset(btn.dataset['preset'] || 'sun');
        renderGrid();
      });
    });

    widget.querySelector<HTMLButtonElement>('.js-cml-random')?.addEventListener('click', () => {
      for (let r = 0; r < 8; r++) melodyGrid[r].fill(false);
      for (let r = 0; r < 4; r++) drumGrid[r].fill(false);
      for (let c = 0; c < 16; c++) {
        if (Math.random() < 0.65) {
          const r = Math.floor(Math.random() * 8);
          melodyGrid[r][c] = true;
        }
        if (c % 2 === 0) drumGrid[0][c] = true;
        if (c === 4 || c === 12) drumGrid[1][c] = true;
        if (c === 0 || c === 8 || (c % 4 === 2 && Math.random() < 0.4)) drumGrid[3][c] = true;
      }
      renderGrid();
    });

    widget.querySelector<HTMLButtonElement>('.js-cml-clear')?.addEventListener('click', () => {
      stopLoop();
      for (let r = 0; r < 8; r++) melodyGrid[r].fill(false);
      for (let r = 0; r < 4; r++) drumGrid[r].fill(false);
      renderGrid();
    });

    loadPreset('sun');
    renderGrid();
  });
}

function hydratePedalCGameArcade(
  root: HTMLElement,
  audio: MusicAudioEngine
): void {
  root.querySelectorAll<HTMLElement>('.js-arcade-pedal-game').forEach((pedalWidget) => {
    if (pedalWidget.dataset['bound'] === '1') return;
    pedalWidget.dataset['bound'] = '1';
    const infoEl = pedalWidget.querySelector<HTMLElement>('.js-pg-info');
    let targetSt: number | null = null;

    const playPedalAndDegree = (st: number) => {
      audio.stopAll();
      audio.playAcousticPiano(48, 2.2, 0, 0.25, false);
      audio.playElectricBass(36, 2.2, 0, 0.28, 'finger', false);
      audio.playAcousticPiano(60 + st, 1.7, 0.35, 0.28, false);
      audio.playPluckedGuitar(60 + st, 1.7, 0.35, 0.22, false);
    };

    pedalWidget.querySelector<HTMLButtonElement>('.js-pg-quiz')?.addEventListener('click', () => {
      targetSt = Math.floor(Math.random() * 12);
      playPedalAndDegree(targetSt);
      if (infoEl) {
        infoEl.textContent =
          '👂 Escuchando Bajo Pedal C3 + nota misteriosa... Haz clic en el grado que sientes que está sonando.';
      }
    });

    pedalWidget.querySelector<HTMLButtonElement>('.js-pg-repeat')?.addEventListener('click', () => {
      if (targetSt !== null) playPedalAndDegree(targetSt);
    });

    pedalWidget.querySelector<HTMLButtonElement>('.js-pg-demo-lidia')?.addEventListener('click', () => {
      audio.stopAll();
      audio.playAcousticPiano(48, 3.2, 0, 0.26, false);
      audio.playElectricBass(36, 3.2, 0, 0.28, 'finger', false);
      audio.playAcousticPiano(65, 1.2, 0.25, 0.28, false);
      audio.playAcousticPiano(66, 1.5, 1.65, 0.3, false);
      if (infoEl) {
        infoEl.textContent =
          '✨ Comparación sobre Pedal C: Primero sonó el 4º grado (Fa = pide bajar a Mi), y luego el #4 Lidio (Fa# = brillo espacial flotante).';
      }
    });

    pedalWidget.querySelectorAll<HTMLButtonElement>('.js-pg-deg').forEach((btn) => {
      btn.addEventListener('click', () => {
        const st = parseInt(btn.dataset['st'] || '0', 10);
        playPedalAndDegree(st);
        const analysis = analyzePedalInterval(60 + st, 48);
        if (targetSt !== null) {
          if (st === targetSt) {
            targetSt = null;
            if (infoEl) {
              infoEl.textContent = `✅ ¡Correcto! Grado ${analysis.degreeLabel} (${analysis.intervalName}) — ${analysis.consonanceLevel}. ${analysis.coachingTip}`;
            }
          } else if (infoEl) {
            infoEl.textContent = `👂 Ese fue ${analysis.degreeLabel} (${analysis.intervalName}). Pulsa "🔄 Repetir" para comparar.`;
          }
        } else if (infoEl) {
          infoEl.textContent = `🔊 Pedal C3 + ${analysis.degreeLabel} (${analysis.intervalName}): ${analysis.consonanceLevel} — ${analysis.modalFlavor}.`;
        }
      });
    });
  });
}

function hydrateSpectrogramArcade(
  root: HTMLElement,
  audio: MusicAudioEngine,
  onStatus: (msg: string) => void
): void {
  root.querySelectorAll<HTMLElement>('.js-arcade-spectrogram').forEach((widget) => {
    if (widget.dataset['bound'] === '1') return;
    widget.dataset['bound'] = '1';

    const waveCanvas = widget.querySelector<HTMLCanvasElement>('.js-spec-wave-canvas');
    const fallCanvas = widget.querySelector<HTMLCanvasElement>('.js-spec-waterfall-canvas');
    const peakEl = widget.querySelector<HTMLElement>('.js-spec-peak');
    const sourceEl = widget.querySelector<HTMLElement>('.js-spec-source');
    const micBtn = widget.querySelector<HTMLButtonElement>('.js-spec-mic');

    if (!waveCanvas || !fallCanvas) return;
    const waveCtx = waveCanvas.getContext('2d');
    const fallCtx = fallCanvas.getContext('2d');
    if (!waveCtx || !fallCtx) return;

    let activeAnalyser: AnalyserNode | null = null;
    let micStream: MediaStream | null = null;
    let animId = 0;
    const timeBuf = new Uint8Array(1024);
    const freqBuf = new Uint8Array(512);

    const ensureSynthAnalyser = () => {
      if (!micStream) {
        activeAnalyser = audio.getMasterAnalyser();
      }
    };

    const renderLoop = () => {
      if (!document.body.contains(widget)) {
        cancelAnimationFrame(animId);
        return;
      }

      if (!activeAnalyser) {
        activeAnalyser = audio.getMasterAnalyser();
      }

      const w = waveCanvas.width;
      const h = waveCanvas.height;
      waveCtx.fillStyle = '#03060c';
      waveCtx.fillRect(0, 0, w, h);

      if (activeAnalyser) {
        activeAnalyser.getByteTimeDomainData(timeBuf);
        activeAnalyser.getByteFrequencyData(freqBuf);

        const numBars = 64;
        const barWidth = w / numBars;
        let maxVal = 0;
        let maxIdx = 0;
        for (let i = 0; i < numBars; i++) {
          const val = freqBuf[i];
          if (val > maxVal) {
            maxVal = val;
            maxIdx = i;
          }
          const barH = (val / 255) * (h * 0.85);
          waveCtx.fillStyle = `hsla(${195 + i * 2.2}, 90%, 55%, 0.28)`;
          waveCtx.fillRect(i * barWidth, h - barH, barWidth - 2, barH);
        }

        if (peakEl && maxVal > 18) {
          const nyquist = 22050;
          const approxHz = Math.round((maxIdx / freqBuf.length) * nyquist);
          peakEl.textContent = `Pico: ~${approxHz} Hz`;
        }

        waveCtx.lineWidth = 2.2;
        waveCtx.strokeStyle = '#38bdf8';
        waveCtx.beginPath();
        const slice = w / timeBuf.length;
        for (let i = 0; i < timeBuf.length; i++) {
          const v = timeBuf[i] / 128.0;
          const y = (v * h) / 2;
          if (i === 0) waveCtx.moveTo(0, y);
          else waveCtx.lineTo(i * slice, y);
        }
        waveCtx.stroke();

        const fw = fallCanvas.width;
        const fh = fallCanvas.height;
        fallCtx.drawImage(fallCanvas, 2, 0, fw - 2, fh, 0, 0, fw - 2, fh);
        const binsToShow = 96;
        for (let y = 0; y < fh; y++) {
          const normY = 1 - y / fh;
          const bin = Math.min(binsToShow - 1, Math.floor(normY * binsToShow));
          const mag = freqBuf[bin] || 0;
          if (mag < 8) {
            fallCtx.fillStyle = '#03060c';
          } else {
            const hue = 240 - (mag / 255) * 230;
            const light = 15 + (mag / 255) * 55;
            fallCtx.fillStyle = `hsl(${hue}, 95%, ${light}%)`;
          }
          fallCtx.fillRect(fw - 2, y, 2, 1);
        }
      }

      animId = requestAnimationFrame(renderLoop);
    };

    animId = requestAnimationFrame(renderLoop);

    micBtn?.addEventListener('click', async () => {
      if (micStream) {
        micStream.getTracks().forEach((t) => t.stop());
        micStream = null;
        activeAnalyser = audio.getMasterAnalyser();
        micBtn.textContent = '🎙️ Conectar Micrófono';
        micBtn.classList.remove('active');
        if (sourceEl) sourceEl.textContent = 'Fuente: Síntesis Interna';
        return;
      }

      try {
        micStream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const ctx = new AudioContext();
        const src = ctx.createMediaStreamSource(micStream);
        const analyser = ctx.createAnalyser();
        analyser.fftSize = 1024;
        analyser.smoothingTimeConstant = 0.78;
        src.connect(analyser);
        activeAnalyser = analyser;
        micBtn.textContent = '⏹ Desconectar Mic';
        micBtn.classList.add('active');
        if (sourceEl) sourceEl.textContent = 'Fuente: 🎙️ Micrófono en Vivo';
        onStatus('🎙️ Micrófono conectado al Espectrograma en tiempo real');
      } catch {
        ensureSynthAnalyser();
        if (sourceEl) {
          sourceEl.textContent = 'Sin micrófono: Usando Síntesis Interna';
        }
        audio.playVocalFormant(60, 1.3, 0, 0.3, 'a');
      }
    });

    widget.querySelectorAll<HTMLButtonElement>('.js-spec-vowel').forEach((btn) => {
      btn.addEventListener('click', () => {
        ensureSynthAnalyser();
        const v = (btn.dataset['v'] || 'a') as 'a' | 'i';
        audio.playVocalFormant(57, 1.3, 0, 0.32, v);
        onStatus(`🌈 Visualizando formantes de la vocal "${v.toUpperCase()}" en el espectrograma`);
      });
    });

    widget.querySelector<HTMLButtonElement>('.js-spec-siren')?.addEventListener('click', () => {
      ensureSynthAnalyser();
      const notes = [40, 45, 50, 55, 60, 64, 67, 71, 74];
      notes.forEach((m, idx) => {
        audio.playVocalFormant(m, 0.26, idx * 0.16, 0.28, idx < 4 ? 'o' : idx < 7 ? 'a' : 'i', false);
      });
      onStatus('🚀 Sirena Vocal E2 → D5 en el espectrograma');
    });

    widget.querySelector<HTMLButtonElement>('.js-spec-quena')?.addEventListener('click', () => {
      ensureSynthAnalyser();
      [64, 67, 69, 72, 71, 69].forEach((m, i) =>
        audio.playQuenaFlute(m, 0.35, i * 0.24, 0.28, false)
      );
      onStatus('🪈 Visualizando armónicos y soplo de Quena Andina');
    });

    widget.querySelector<HTMLButtonElement>('.js-spec-chord')?.addEventListener('click', () => {
      ensureSynthAnalyser();
      audio.strumChord([48, 55, 60, 64, 67, 72], 'guitar', 0, true);
      onStatus('🎸 Acorde rico en armónicos en el espectrograma');
    });
  });
}

function hydrateLyricStudioArcade(
  root: HTMLElement,
  audio: MusicAudioEngine,
  onStatus: (msg: string) => void
): void {
  root.querySelectorAll<HTMLElement>('.js-arcade-lyrics').forEach((widget) => {
    if (widget.dataset['bound'] === '1') return;
    widget.dataset['bound'] = '1';

    const textarea = widget.querySelector<HTMLTextAreaElement>('.js-lyr-input');
    const tbody = widget.querySelector<HTMLElement>('.js-lyr-table-body');
    const progSelect = widget.querySelector<HTMLSelectElement>('.js-lyr-prog');
    const loopBtn = widget.querySelector<HTMLButtonElement>('.js-lyr-loop');
    const rhymeOut = widget.querySelector<HTMLElement>('.js-lyr-rhyme-out');

    let loopTimer: ReturnType<typeof setInterval> | null = null;

    const updateLyricAnalysis = () => {
      if (!textarea || !tbody) return;
      const lines = textarea.value
        .split('\n')
        .map((l) => l.trim())
        .filter((l) => l.length > 0);

      if (lines.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6" class="text-xs text-slate-400">Escribe al menos un verso para analizar su métrica y rima.</td></tr>`;
        return;
      }

      const analyzed = lines.map((line) => analyzeSpanishLyricLine(line));
      tbody.innerHTML = analyzed
        .map((item, idx) => {
          const meterBadgeColor =
            item.metricSyllables === 8
              ? 'text-emerald-300 font-extrabold'
              : item.metricSyllables === 11
                ? 'text-amber-300 font-extrabold'
                : 'text-sky-300 font-bold';
          return `
            <tr>
              <td class="font-mono text-xs text-slate-400">${idx + 1}</td>
              <td class="text-xs text-slate-200">
                <div>${item.text}</div>
                ${item.sinalefas > 0 ? `<span class="text-[10px] text-amber-400">(${item.sinalefas} sinalefa${item.sinalefas > 1 ? 's' : ''} 🔗)</span>` : ''}
              </td>
              <td class="font-mono text-xs">${item.grammaticalSyllables}</td>
              <td class="text-xs">${item.stressType}</td>
              <td class="font-mono text-sm ${meterBadgeColor}">${item.metricSyllables}</td>
              <td class="text-xs font-mono text-purple-300">-${item.rhymeKeyConsonant} / (${item.rhymeKeyAssonant})</td>
            </tr>
          `;
        })
        .join('');
    };

    textarea?.addEventListener('input', updateLyricAnalysis);
    updateLyricAnalysis();

    widget.querySelectorAll<HTMLButtonElement>('.js-lyr-rhyme-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        const w = btn.dataset['word'] || 'amor';
        const entry = RHYTHM_DICTIONARY[w];
        if (entry && rhymeOut) {
          rhymeOut.innerHTML = `
            <div><strong class="text-amber-300">Rima Consonante (-${w}):</strong> ${entry.consonante.join(', ')}</div>
            <div class="mt-1"><strong class="text-sky-300">Rima Asonante:</strong> ${entry.asonante.join(', ')}</div>
          `;
        }
      });
    });

    widget.querySelectorAll<HTMLButtonElement>('.js-lyr-template').forEach((btn) => {
      btn.addEventListener('click', () => {
        if (!textarea) return;
        const tpl = btn.dataset['tpl'];
        if (tpl === 'octosilabo') {
          textarea.value = [
            'Canta el viento en la montaña',
            'bajo el fuego de tu voz',
            'cruza el cielo en la mañana',
            'encendiendo el corazón',
          ].join('\n');
        } else {
          textarea.value = [
            'Camino por la sombra del silencio',
            'buscando la señal de tu mirada',
            'y escucho en el latido de la noche',
            'la música que nace en la alborada',
          ].join('\n');
        }
        updateLyricAnalysis();
      });
    });

    widget.querySelector<HTMLButtonElement>('.js-lyr-idea')?.addEventListener('click', () => {
      if (!textarea) return;
      const seeds = [
        'En la cuerda más grave de la noche\nresuena tu recuerdo como un faro\ny el eco de la lluvia en la ventana\ndespierta la canción que hoy te declaro',
        'Sube la melodía por el aire\nrompiendo el laberinto del invierno\ny en cada acorde libre que tocamos\nel pulso del instante se hace eterno',
        'Brilla sobre los Andes la mañana\ncon voz de quena, viento y cordillera\nla tierra canta libre su latido\nabriendo el horizonte donde espera',
      ];
      textarea.value = seeds[Math.floor(Math.random() * seeds.length)];
      updateLyricAnalysis();
    });

    const playChordLoop = () => {
      if (!document.body.contains(widget)) {
        if (loopTimer) {
          clearInterval(loopTimer);
          loopTimer = null;
        }
        return;
      }
      const prog = progSelect?.value || 'pop';
      const chordsMap: Record<string, number[][]> = {
        pop: [
          [48, 55, 60, 64],
          [43, 50, 55, 59],
          [45, 52, 57, 60],
          [41, 48, 53, 57],
        ],
        andean: [
          [45, 52, 57, 60],
          [41, 48, 53, 57],
          [48, 55, 60, 64],
          [43, 50, 55, 59],
        ],
        pedal: [
          [36, 48, 55, 60, 64],
          [36, 48, 53, 57, 60],
          [36, 48, 55, 59, 62],
          [36, 48, 53, 56, 60],
        ],
        neosoul: [
          [50, 53, 57, 60, 64],
          [43, 53, 57, 59, 64],
          [48, 52, 55, 59, 62],
          [45, 52, 55, 61, 64],
        ],
      };
      const chords = chordsMap[prog] || chordsMap['pop'];
      chords.forEach((c, i) => {
        audio.strumChord(c, 'guitar', i * 1.25, false);
        audio.playElectricBass(c[0] - 12, 1.1, i * 1.25, 0.25, 'finger', false);
      });
    };

    const stopLyricLoop = () => {
      if (loopTimer) {
        clearInterval(loopTimer);
        loopTimer = null;
      }
      if (loopBtn) {
        loopBtn.textContent = '▶ Base de Acordes';
        loopBtn.classList.remove('active');
      }
    };

    const unsubLyricStop = audio.onStop(() => {
      if (loopTimer) {
        stopLyricLoop();
      }
    });

    loopBtn?.addEventListener('click', () => {
      if (loopTimer) {
        stopLyricLoop();
        audio.stopAll();
        return;
      }
      playChordLoop();
      loopTimer = setInterval(() => {
        if (!document.body.contains(widget)) {
          stopLyricLoop();
          unsubLyricStop();
          return;
        }
        playChordLoop();
      }, 5000);
      loopBtn.textContent = '⏹ Detener Base';
      loopBtn.classList.add('active');
      onStatus('🎸 Reproduciendo base armónica para tus letras');
    });
  });
}

function hydrateE2D5QuickButtons(
  root: HTMLElement,
  audio: MusicAudioEngine,
  onStatus: (msg: string) => void
): void {
  root.querySelectorAll<HTMLButtonElement>('.js-e2d5-play').forEach((btn) => {
    if (btn.dataset['bound'] === '1') return;
    btn.dataset['bound'] = '1';
    btn.addEventListener('click', () => {
      const midi = parseInt(btn.dataset['midi'] || '60', 10);
      const vowel = (btn.dataset['vowel'] || 'a') as 'a' | 'e' | 'i' | 'o' | 'u';
      audio.stopAll();
      audio.playVocalFormant(midi, 1.35, 0, 0.3, vowel, false);
      audio.playAcousticPiano(midi, 1.35, 0, 0.2, false);
      const noteName = `${NOTE_NAMES[midi % 12]}${Math.floor(midi / 12) - 1}`;
      onStatus(`🎤 Referencia Rango E2–D5: ${noteName} (${audio.midiToFreq(midi).toFixed(1)} Hz)`);
    });
  });
}
