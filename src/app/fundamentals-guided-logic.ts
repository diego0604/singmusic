export interface PianoKeySpec {
  midi: number;
  latinName: string;
  americanName: string;
  isBlack: boolean;
  whiteIndex: number; // 0..7 for white keys; left whiteIndex for black keys
  shortLabel: string;
  altLabel?: string;
}

export const FUNDAMENTALS_PIANO_KEYS: PianoKeySpec[] = [
  { midi: 60, latinName: 'Do4', americanName: 'C4', isBlack: false, whiteIndex: 0, shortLabel: 'Do / C' },
  { midi: 61, latinName: 'Do#4', americanName: 'C#4', isBlack: true, whiteIndex: 0, shortLabel: 'C#', altLabel: 'D♭' },
  { midi: 62, latinName: 'Re4', americanName: 'D4', isBlack: false, whiteIndex: 1, shortLabel: 'Re / D' },
  { midi: 63, latinName: 'Re#4', americanName: 'D#4', isBlack: true, whiteIndex: 1, shortLabel: 'D#', altLabel: 'E♭' },
  { midi: 64, latinName: 'Mi4', americanName: 'E4', isBlack: false, whiteIndex: 2, shortLabel: 'Mi / E' },
  { midi: 65, latinName: 'Fa4', americanName: 'F4', isBlack: false, whiteIndex: 3, shortLabel: 'Fa / F' },
  { midi: 66, latinName: 'Fa#4', americanName: 'F#4', isBlack: true, whiteIndex: 3, shortLabel: 'F#', altLabel: 'G♭' },
  { midi: 67, latinName: 'Sol4', americanName: 'G4', isBlack: false, whiteIndex: 4, shortLabel: 'Sol / G' },
  { midi: 68, latinName: 'Sol#4', americanName: 'G#4', isBlack: true, whiteIndex: 4, shortLabel: 'G#', altLabel: 'A♭' },
  { midi: 69, latinName: 'La4', americanName: 'A4', isBlack: false, whiteIndex: 5, shortLabel: 'La / A' },
  { midi: 70, latinName: 'La#4', americanName: 'A#4', isBlack: true, whiteIndex: 5, shortLabel: 'A#', altLabel: 'B♭' },
  { midi: 71, latinName: 'Si4', americanName: 'B4', isBlack: false, whiteIndex: 6, shortLabel: 'Si / B' },
  { midi: 72, latinName: 'Do5', americanName: 'C5', isBlack: false, whiteIndex: 7, shortLabel: 'Do5 / C5' },
];

export type GuidedStepKind = 'sequence' | 'ear-match' | 'staff-read';

export interface GuidedFundamentalsStep {
  id: string;
  kind: GuidedStepKind;
  prompt: string;
  hint: string;
  targetMidis: number[];
  /** Optional demo audio played when the user clicks "Escuchar ejercicio" (e.g. [ref, target]) */
  demoMidis: number[];
  /** Whether demo plays sequentially (melodic) or simultaneously (harmonic) */
  demoMode: 'melodic' | 'harmonic';
  /** For staff-read steps, show this MIDI note on the treble staff SVG */
  staffMidi?: number;
  staffHint?: string;
  successFeedback: string;
}

export interface GuidedFundamentalsLesson {
  id: string;
  orderNumber: number;
  sectionId: string;
  badge: string;
  title: string;
  briefExplanation: string;
  takeaway: string;
  steps: GuidedFundamentalsStep[];
  allowsInfiniteEarDrill?: boolean;
  earDrillPoolMidis?: number[];
}

export const FUNDAMENTALS_GUIDED_LESSONS: GuidedFundamentalsLesson[] = [
  {
    id: 'f1-orientacion',
    orderNumber: 1,
    sectionId: 'intro',
    badge: 'Lección Guiada 1/8 · Etapa 0',
    title: 'Orientación Táctil: Encuentra Do, Fa y tu Primera Octava',
    briefExplanation:
      'Las teclas negras se agrupan siempre de 2 en 2 y de 3 en 3. La tecla blanca pegada a la izquierda del grupo de 2 negras siempre es Do (C), y la blanca a la izquierda del grupo de 3 negras siempre es Fa (F). Subir las 12 teclas completas te lleva a la octava: el mismo sonido un piso más agudo.',
    takeaway: 'Ya sabes ubicar dos puntos de anclaje sin leer partituras y distinguir dirección y octava.',
    steps: [
      {
        id: 'f1-s1',
        kind: 'sequence',
        prompt: 'Paso 1: Toca Do central (C4), justo a la izquierda del grupo de 2 teclas negras.',
        hint: 'Busca el primer botón blanco a la izquierda del teclado (Do / C).',
        targetMidis: [60],
        demoMidis: [60],
        demoMode: 'melodic',
        successFeedback: '¡Exacto! Ese es C4 (Do central, 261.6 Hz). Memoriza su referencia visual junto a las 2 negras.',
      },
      {
        id: 'f1-s2',
        kind: 'sequence',
        prompt: 'Paso 2: Ahora toca Fa (F4), justo a la izquierda del grupo de 3 teclas negras.',
        hint: 'Salta Re y Mi hasta la tecla blanca pegada al bloque de 3 negras (Fa / F).',
        targetMidis: [65],
        demoMidis: [60, 65],
        demoMode: 'melodic',
        successFeedback: '¡Perfecto! De Do (C4) a Fa (F4) subiste cinco semitonos (una cuarta justa).',
      },
      {
        id: 'f1-s3',
        kind: 'sequence',
        prompt: 'Paso 3: Toca la octava completa tocando primero C4 (Do grave) y luego C5 (Do agudo).',
        hint: 'Pulsa la primera tecla blanca (Do / C) y después la última tecla blanca de la derecha (Do5 / C5).',
        targetMidis: [60, 72],
        demoMidis: [60, 72],
        demoMode: 'melodic',
        successFeedback: '¡Octava lograda! Aunque C5 vibra exactamente al doble de velocidad que C4, el oído reconoce la misma identidad.',
      },
    ],
  },
  {
    id: 'f2-consonancia',
    orderNumber: 2,
    sectionId: 't-sonido',
    badge: 'Lección Guiada 2/8 · Sonido',
    title: 'Por qué unas Notas se Funden (Consonancia) y Otras Rozan (Tensión)',
    briefExplanation:
      'Cuando dos frecuencias mantienen proporciones simples (como 2:1 en la octava o 3:2 en la quinta justa), sus ondas encajan limpias sin vibraciones ásperas. Cuando dos notas vecinas están a solo 1 semitono, chocan dentro de la misma zona del oído generando tensión que pide moverse.',
    takeaway: 'La consonancia da estabilidad (reposo) y la disonancia crea movimiento dramático.',
    steps: [
      {
        id: 'f2-s1',
        kind: 'sequence',
        prompt: 'Paso 1: Toca C4 y luego G4 (Sol) para escuchar la Quinta Justa: el pilar más estable después de la octava.',
        hint: 'Pulsa Do / C (C4) y enseguida Sol / G (G4).',
        targetMidis: [60, 67],
        demoMidis: [60, 67],
        demoMode: 'harmonic',
        successFeedback: '¡Bien! C4 + G4 (proporción 3:2) suena hueco, abierto y firme: es la base de los power chords.',
      },
      {
        id: 'f2-s2',
        kind: 'sequence',
        prompt: 'Paso 2: Ahora toca dos vecinas inmediatas: E4 (Mi) y F4 (Fa) para sentir la fricción de 1 semitono.',
        hint: 'Pulsa Mi / E y justo al lado Fa / F (sin tecla negra en medio).',
        targetMidis: [64, 65],
        demoMidis: [64, 65],
        demoMode: 'harmonic',
        successFeedback: '¿Notas el roce? Esa vibración apretada es una segunda menor (1 semitono): pura tensión cinematográfica.',
      },
      {
        id: 'f2-s3',
        kind: 'ear-match',
        prompt: 'Paso 3 (Reto auditivo): Pulsa "🔊 Escuchar objetivo". Suena C4 seguida de otra nota: ¿cuál es la nota tensa o estable que acabas de oír?',
        hint: 'Presta atención: si suena muy pegada y oscura cerca de C4 es C#4; si suena abierta y luminosa es G4.',
        targetMidis: [61],
        demoMidis: [60, 61],
        demoMode: 'melodic',
        successFeedback: '¡Oído fino! Identificaste C#4 (Re♭4) a solo 1 semitono por encima de C4.',
      },
    ],
  },
  {
    id: 'f3-semitonos',
    orderNumber: 3,
    sectionId: 't-notas',
    badge: 'Lección Guiada 3/8 · Notas y Alteraciones',
    title: 'Semitonos Naturales (Mi–Fa, Si–Do), Tonos y Sostenidos (#)',
    briefExplanation:
      'Un semitono es la distancia mínima de una tecla a la siguiente (contando blancas y negras). Un tono equivale a sumar dos semitonos. Entre Mi–Fa y Si–Do no existe tecla negra: por eso ahí el paso blanco-blanco ya mide 1 solo semitono.',
    takeaway: 'Dominar dónde caen los semitonos naturales evita casi todos los errores al armar escalas y acordes.',
    steps: [
      {
        id: 'f3-s1',
        kind: 'sequence',
        prompt: 'Paso 1: Toca los dos únicos semitonos naturales del teclado: primero Mi→Fa (E4→F4) y luego Si→Do (B4→C5).',
        hint: 'Pulsa en orden: Mi (E4), Fa (F4), Si (B4), Do5 (C5).',
        targetMidis: [64, 65, 71, 72],
        demoMidis: [64, 65, 71, 72],
        demoMode: 'melodic',
        successFeedback: '¡Excelente! Acabas de tocar las dos parejas blancas sin tecla negra intermedia: E–F y B–C.',
      },
      {
        id: 'f3-s2',
        kind: 'sequence',
        prompt: 'Paso 2: Toca un Tono completo hacia arriba desde C4 (C4 → D4) dejando la tecla negra C#4 en medio.',
        hint: 'Pulsa Do (C4) y luego Re (D4).',
        targetMidis: [60, 62],
        demoMidis: [60, 62],
        demoMode: 'melodic',
        successFeedback: '¡Correcto! Como entre C4 y D4 está C#4 en medio, diste dos semitonos = 1 Tono.',
      },
      {
        id: 'f3-s3',
        kind: 'sequence',
        prompt: 'Paso 3: Desde Fa (F4), sube 1 semitono usando una alteración: toca F#4 (la tecla negra a su derecha).',
        hint: 'Pulsa Fa (F4) y luego la primera tecla negra del grupo de 3 (F# / G♭).',
        targetMidis: [65, 66],
        demoMidis: [65, 66],
        demoMode: 'melodic',
        successFeedback: '¡Exacto! F#4 (Fa sostenido) y G♭4 (Sol bemol) son la misma tecla física con dos nombres enarmónicos.',
      },
    ],
  },
  {
    id: 'f4-mayor-menor',
    orderNumber: 4,
    sectionId: 't-escalas',
    badge: 'Lección Guiada 4/8 · Escalas',
    title: 'El Interruptor Emocional: Escala Mayor vs. Menor y Menor Armónica',
    briefExplanation:
      'Cambiar una sola nota —el tercer escalón— transforma por completo la emoción: 3ª Mayor (4 semitonos desde C = E) suena luminosa; 3ª Menor (3 semitonos = E♭) suena íntima o melancólica. Y subir el 7º grado en menor (G# en La menor) crea ese giro exótico de la escala Menor Armónica.',
    takeaway: 'La 3ª define si una escala o acorde es Mayor o Menor; el 7º grado decide cuánto tira hacia casa.',
    steps: [
      {
        id: 'f4-s1',
        kind: 'sequence',
        prompt: 'Paso 1: Toca los primeros 5 grados luminosos de Do Mayor: C4 → D4 → E4 → F4 → G4.',
        hint: 'Cinco teclas blancas seguidas empezando en Do (C4).',
        targetMidis: [60, 62, 64, 65, 67],
        demoMidis: [60, 62, 64, 65, 67],
        demoMode: 'melodic',
        successFeedback: '¡Brillante! Siente cómo E4 (3ª Mayor) ilumina toda la subida Tono–Tono–Semitono–Tono.',
      },
      {
        id: 'f4-s2',
        kind: 'sequence',
        prompt: 'Paso 2: Ahora baja la 3ª medio tono para sentir el modo Menor: toca C4 → D4 → E♭4(D#4) → F4 → G4.',
        hint: 'Igual que antes, pero en lugar de Mi blanco (E4) pulsa la tecla negra D# / E♭.',
        targetMidis: [60, 62, 63, 65, 67],
        demoMidis: [60, 62, 63, 65, 67],
        demoMode: 'melodic',
        successFeedback: '¡Lo sentiste! Un solo semitono (E4 → E♭4) cambió la luz completa de la melodía.',
      },
      {
        id: 'f4-s3',
        kind: 'sequence',
        prompt: 'Paso 3: Prueba el sello de la Escala Menor Armónica tocando F4 → G#4 → A4 (el salto exótico de 3 semitonos).',
        hint: 'Pulsa Fa (F4), luego la tecla negra central del grupo de 3 (G# / A♭), y resuelve en La (A4).',
        targetMidis: [65, 68, 69],
        demoMidis: [65, 68, 69],
        demoMode: 'melodic',
        successFeedback: '¡Ese es el sonido clásico, flamenco y neoclásico! La sensible G#4 atrae con fuerza magnética hacia A4.',
      },
    ],
  },
  {
    id: 'f5-intervalos-emocion',
    orderNumber: 5,
    sectionId: 't-intervalos',
    badge: 'Lección Guiada 5/8 · Intervalos',
    title: 'Las 4 Distancias Clave que Reconocerás en Cualquier Canción',
    briefExplanation:
      'Más allá de contar semitonos, cada intervalo tiene carácter propio: la 3ª Mayor abre una tríada alegre, la 4ª Justa suena heroica, el Tritono (6 semitonos) pide resolver con urgencia, y la 5ª Justa (7 semitonos) construye potencia.',
    takeaway: 'Puedes construir cualquier acorde si sabes ubicar desde la raíz la 3ª (menor o mayor) y la 5ª.',
    steps: [
      {
        id: 'f5-s1',
        kind: 'sequence',
        prompt: 'Paso 1: Desde C4 (Do), construye una 4ª Justa heroica tocando C4 → F4.',
        hint: 'Pulsa Do (C4) y luego Fa (F4) — 5 semitonos arriba.',
        targetMidis: [60, 65],
        demoMidis: [60, 65],
        demoMode: 'melodic',
        successFeedback: '¡4ª Justa limpia! Es el arranque típico de marchas y estribillos épicos.',
      },
      {
        id: 'f5-s2',
        kind: 'sequence',
        prompt: 'Paso 2: Ahora toca el Tritono desde C4: pulsa C4 → F#4 (6 semitonos exactos, mitad de la octava).',
        hint: 'Pulsa Do (C4) y la tecla negra F# / G♭.',
        targetMidis: [60, 66],
        demoMidis: [60, 66],
        demoMode: 'melodic',
        successFeedback: '¡Tritono detectado! Es el motor de tensión dentro de todo acorde Dominante (G7 tiene B y F a distancia de tritono).',
      },
      {
        id: 'f5-s3',
        kind: 'ear-match',
        prompt: 'Paso 3 (Reto auditivo): Pulsa "🔊 Escuchar objetivo". Oirás C4 y luego un intervalo: ¿cuál es la segunda nota?',
        hint: 'Escucha si es cálida (E4 = 3ª Mayor) o muy estable (G4 = 5ª Justa).',
        targetMidis: [64],
        demoMidis: [60, 64],
        demoMode: 'melodic',
        successFeedback: '¡Exacto! Era E4: la 3ª Mayor (4 semitonos) que da dulzura y claridad a C Mayor.',
      },
    ],
  },
  {
    id: 'f6-centro-tonal',
    orderNumber: 6,
    sectionId: 't-tonalidades',
    badge: 'Lección Guiada 6/8 · Tonalidades',
    title: 'Experimenta la Gravedad Tonal: Sensible → Casa y Relativa Menor',
    briefExplanation:
      'Una canción está "en Do Mayor" cuando Do funciona como el centro de gravedad. La 7ª nota (Si / B, a solo 1 semitono por debajo de Do) actúa como un imán que pide subir a Do. Y si usas las mismas teclas blancas pero descansas en La (A), cambias al hogar Relativo Menor.',
    takeaway: 'La nota sensible (medio tono debajo de la tónica) explica por qué F# aparece en Sol Mayor.',
    steps: [
      {
        id: 'f6-s1',
        kind: 'sequence',
        prompt: 'Paso 1: Siente la atracción magnética de la sensible: toca B4 (Si), espera un instante y resuelve tocando C5 (Do).',
        hint: 'Pulsa Si (B4) y justo a su derecha Do5 (C5).',
        targetMidis: [71, 72],
        demoMidis: [60, 64, 67, 71, 72],
        demoMode: 'melodic',
        successFeedback: '¡Eso es gravedad tonal! Sin resolver B4 → C5 el oído queda en suspenso; al tocar C5 todo descansa.',
      },
      {
        id: 'f6-s2',
        kind: 'sequence',
        prompt: 'Paso 2: En Sol Mayor ocurre lo mismo, pero su sensible es F#4: toca F#4 → G4 para resolver en Sol.',
        hint: 'Pulsa la tecla negra F# / G♭ y luego la tecla blanca Sol / G.',
        targetMidis: [66, 67],
        demoMidis: [67, 66, 67],
        demoMode: 'melodic',
        successFeedback: '¡Ahí ves por qué Sol Mayor necesita F#! Sin el sostenido, F natural sonaría apagado y sin empuje hacia Sol.',
      },
      {
        id: 'f6-s3',
        kind: 'sequence',
        prompt: 'Paso 3: Compara los dos hogares de la armadura limpia: toca el acorde de Do Mayor (C4–E4–G4) y luego la tónica relativa La (A4).',
        hint: 'Pulsa C4, E4, G4 y termina tocando A4 (La).',
        targetMidis: [60, 64, 67, 69],
        demoMidis: [60, 64, 67, 69],
        demoMode: 'melodic',
        successFeedback: '¡Genial! C Mayor y La menor comparten exactamente las 7 teclas blancas, pero cambian su centro de descanso.',
      },
    ],
  },
  {
    id: 'f7-lectura-anclas',
    orderNumber: 7,
    sectionId: 't-lectura',
    badge: 'Lección Guiada 7/8 · Lectura en Vivo',
    title: 'Lee el Pentagrama por Anclas y Contorno Tocando la Tecla Real',
    briefExplanation:
      'No cuentes líneas de memoria desde abajo: usa 3 anclas visuales en Clave de Sol — Do central (C4) con su propia rayita debajo, Sol (G4) atravesado por la 2ª línea donde nace el rizo de la clave, y Do5 (C5) en el 3er espacio — y lee el resto avanzando paso a paso (línea↔espacio).',
    takeaway: 'Leer por anclas y movimiento relativo (sube un paso, baja un salto) multiplica por 3 tu velocidad de lectura.',
    steps: [
      {
        id: 'f7-s1',
        kind: 'staff-read',
        prompt: 'Nota en pentagrama 1/4: Está sobre la 2ª línea (donde gira el espiral de la Clave de Sol). Tócala en el teclado:',
        hint: 'La Clave de Sol señala la nota Sol (G4) en la 2ª línea.',
        targetMidis: [67],
        demoMidis: [67],
        demoMode: 'melodic',
        staffMidi: 67,
        staffHint: '2ª línea = Ancla G4 (Sol)',
        successFeedback: '¡Correcto! Siempre que veas una nota en la 2ª línea en Clave de Sol es G4 (Sol).',
      },
      {
        id: 'f7-s2',
        kind: 'staff-read',
        prompt: 'Nota en pentagrama 2/4: Vive justo debajo de la 1ª línea con su propia rayita (línea adicional). ¿Qué tecla es?',
        hint: 'Es el puente entre la Clave de Sol y la Clave de Fa: Do central (C4).',
        targetMidis: [60],
        demoMidis: [60],
        demoMode: 'melodic',
        staffMidi: 60,
        staffHint: 'Línea adicional inferior = Do central (C4)',
        successFeedback: '¡Muy bien! Ese es C4 (Do central), la frontera exacta entre mano derecha e izquierda del piano.',
      },
      {
        id: 'f7-s3',
        kind: 'staff-read',
        prompt: 'Nota en pentagrama 3/4: Sube a la 1ª línea del pentagrama (un paso de 3ª sobre Do central). Tócala:',
        hint: 'Si abajo con rayita es Do (C4) y el espacio intermedio es Re (D4), la 1ª línea es Mi (E4).',
        targetMidis: [64],
        demoMidis: [60, 64],
        demoMode: 'melodic',
        staffMidi: 64,
        staffHint: '1ª línea = E4 (Mi)',
        successFeedback: '¡Exacto! E4 en la 1ª línea. Nota cómo pasar de C4 (línea adicional) a E4 (1ª línea) es un salto de línea a línea = 3ª.',
      },
      {
        id: 'f7-s4',
        kind: 'staff-read',
        prompt: 'Nota en pentagrama 4/4: Mira el 3er espacio desde abajo. Toca esta última nota ancla en el teclado:',
        hint: 'Los 4 espacios de Clave de Sol forman F–A–C–E: 1º Fa, 2º La, 3º Do5 (C5).',
        targetMidis: [72],
        demoMidis: [72],
        demoMode: 'melodic',
        staffMidi: 72,
        staffHint: '3er espacio = Ancla C5 (Do agudo)',
        successFeedback: '¡Lectura completada! Con C4, E4, G4 y C5 dominados ya puedes ubicar cualquier nota vecina al instante.',
      },
    ],
  },
  {
    id: 'f8-oido-activo',
    orderNumber: 8,
    sectionId: 't-oido',
    badge: 'Lección Guiada 8/8 · Oído Funcional',
    title: 'Oído Relativo Activo: Escucha la Tónica y Encuentra la Nota en Pantalla',
    briefExplanation:
      'El oído relativo se entrena escuchando primero una nota hogar (C4 = grado 1) y sintiendo a qué altura o grado viajó la segunda nota: el grado 2 (D4) queda flotando, el grado 3 (E4) brilla dulce, el grado 5 (G4) suena firme y el grado 7 (B4) pide subir urgente a C5.',
    takeaway: 'Puedes practicar infinitos dictados auditivos de 2 notas directamente con el botón de nuevo reto.',
    allowsInfiniteEarDrill: true,
    earDrillPoolMidis: [62, 64, 65, 67, 69, 71, 72],
    steps: [
      {
        id: 'f8-s1',
        kind: 'ear-match',
        prompt: 'Reto 1: Escucha Do (C4) seguido del grado 5 (el pilar abierto) y tócalo en el teclado:',
        hint: 'Cuenta 5 teclas blancas desde Do: Do–Re–Mi–Fa–Sol (G4).',
        targetMidis: [67],
        demoMidis: [60, 67],
        demoMode: 'melodic',
        successFeedback: '¡Acertaste la 5ª justa (Sol / G4)! Es el ancla más fácil de reconocer junto a la octava.',
      },
      {
        id: 'f8-s2',
        kind: 'ear-match',
        prompt: 'Reto 2: Escucha Do (C4) seguido de la nota que más tensión pide resolver hacia arriba. ¿Cuál es?',
        hint: 'Está justo un paso debajo de C5: la sensible Si (B4).',
        targetMidis: [71],
        demoMidis: [60, 71],
        demoMode: 'melodic',
        successFeedback: '¡Oído agudo! B4 (7º grado) tiene una gravedad inconfundible hacia C5.',
      },
      {
        id: 'f8-s3',
        kind: 'ear-match',
        prompt: 'Reto 3: Escucha Do (C4) seguido de una nota cálida y estable en el centro del acorde. Tócala:',
        hint: 'Es el tercer escalón de la escala mayor: Mi (E4).',
        targetMidis: [64],
        demoMidis: [60, 64],
        demoMode: 'melodic',
        successFeedback: '¡Dominado! Reconociste el 3er grado (E4). Usa ahora "🎲 Nuevo Reto de Oído" para entrenar con toda la escala mayor.',
      },
    ],
  },
];

export interface GuidedTapEvalResult {
  matchedStep: boolean;
  advancedProgress: number;
  completedStep: boolean;
  feedbackText: string;
  tone: 'ok' | 'info' | 'hint';
}

export function getPianoKeySpec(midi: number): PianoKeySpec | undefined {
  return FUNDAMENTALS_PIANO_KEYS.find((k) => k.midi === midi);
}

export function evaluateFundamentalsKeyTap(
  step: GuidedFundamentalsStep,
  tappedMidi: number,
  currentMatchedCount: number
): GuidedTapEvalResult {
  const key = getPianoKeySpec(tappedMidi);
  const keyLabel = key ? `${key.latinName} (${key.americanName})` : `MIDI ${tappedMidi}`;

  if (step.kind === 'ear-match' || step.kind === 'staff-read') {
    const expected = step.targetMidis[0];
    if (tappedMidi === expected) {
      return {
        matchedStep: true,
        advancedProgress: 1,
        completedStep: true,
        feedbackText: step.successFeedback,
        tone: 'ok',
      };
    }
    const diff = tappedMidi - expected;
    const dirMsg =
      diff > 0
        ? `Tocaste ${keyLabel}, que suena más aguda que el objetivo. Prueba un poco más a la izquierda.`
        : `Tocaste ${keyLabel}, que suena más grave que el objetivo. Prueba un poco más a la derecha.`;
    return {
      matchedStep: false,
      advancedProgress: 0,
      completedStep: false,
      feedbackText: dirMsg,
      tone: 'hint',
    };
  }

  // Sequence mode
  const safeIdx = Math.max(0, Math.min(currentMatchedCount, step.targetMidis.length - 1));
  const expectedMidi = step.targetMidis[safeIdx];
  if (tappedMidi === expectedMidi) {
    const nextProgress = safeIdx + 1;
    const completed = nextProgress >= step.targetMidis.length;
    return {
      matchedStep: true,
      advancedProgress: nextProgress,
      completedStep: completed,
      feedbackText: completed
        ? step.successFeedback
        : `✓ Bien (${keyLabel}, ${nextProgress}/${step.targetMidis.length}). Continúa con la siguiente nota.`,
      tone: completed ? 'ok' : 'info',
    };
  }

  const expectedKey = getPianoKeySpec(expectedMidi);
  const expectedLabel = expectedKey ? `${expectedKey.latinName} (${expectedKey.americanName})` : `MIDI ${expectedMidi}`;
  return {
    matchedStep: false,
    advancedProgress: safeIdx,
    completedStep: false,
    feedbackText: `Tocaste ${keyLabel}. Para completar este paso (${safeIdx + 1}/${step.targetMidis.length}), busca ahora ${expectedLabel}.`,
    tone: 'hint',
  };
}

export function pickNextEarDrillMidi(pool: number[], previousMidi?: number): number {
  const candidates = pool.filter((m) => m !== previousMidi);
  const source = candidates.length > 0 ? candidates : pool;
  return source[Math.floor(Math.random() * source.length)] ?? 67;
}

export function renderTrebleStaffNoteSvg(midi: number, showAnchorLabel = false): string {
  // Diatonic step offset relative to C4 (y=88, ledger line) -> 6px per diatonic step
  const stepByMidi: Record<number, { y: number; name: string; sharp: boolean; ledgerC4: boolean }> = {
    60: { y: 88, name: 'C4 (Do central)', sharp: false, ledgerC4: true },
    61: { y: 88, name: 'C#4', sharp: true, ledgerC4: true },
    62: { y: 82, name: 'D4 (Re)', sharp: false, ledgerC4: false },
    63: { y: 82, name: 'D#4', sharp: true, ledgerC4: false },
    64: { y: 76, name: 'E4 (Mi)', sharp: false, ledgerC4: false },
    65: { y: 70, name: 'F4 (Fa)', sharp: false, ledgerC4: false },
    66: { y: 70, name: 'F#4', sharp: true, ledgerC4: false },
    67: { y: 64, name: 'G4 (Sol)', sharp: false, ledgerC4: false },
    68: { y: 64, name: 'G#4', sharp: true, ledgerC4: false },
    69: { y: 58, name: 'A4 (La)', sharp: false, ledgerC4: false },
    70: { y: 58, name: 'A#4', sharp: true, ledgerC4: false },
    71: { y: 52, name: 'B4 (Si)', sharp: false, ledgerC4: false },
    72: { y: 46, name: 'C5 (Do5)', sharp: false, ledgerC4: false },
  };
  const info = stepByMidi[midi] ?? stepByMidi[67];
  const lines = [28, 40, 52, 64, 76]
    .map((y) => `<line x1="18" y1="${y}" x2="252" y2="${y}" stroke="#475569" stroke-width="1.4" />`)
    .join('');
  const ledger = info.ledgerC4
    ? `<line x1="146" y1="88" x2="178" y2="88" stroke="#e5a93c" stroke-width="2" />`
    : '';
  const sharp = info.sharp
    ? `<text x="140" y="${info.y + 5}" fill="#e5a93c" font-size="16" font-weight="800">♯</text>`
    : '';
  const anchorText = showAnchorLabel
    ? `<text x="72" y="67" fill="#8ab4f8" font-size="8.5" font-weight="700">2ª línea = Sol</text>`
    : '';
  return `
    <svg viewBox="0 0 270 110" class="block mx-auto w-auto max-w-full h-[108px]" role="img" aria-label="Nota en pentagrama en Clave de Sol">
      <rect x="0" y="0" width="270" height="110" rx="10" fill="#0b0e14" stroke="#232c3d" />
      ${lines}
      <text x="26" y="72" fill="#cbd5e1" font-size="50">𝄞</text>
      <circle cx="64" cy="64" r="3" fill="#8ab4f8" opacity="0.65" />
      ${anchorText}
      ${ledger}
      ${sharp}
      <ellipse cx="162" cy="${info.y}" rx="9.5" ry="6.8" transform="rotate(-16 162 ${info.y})" fill="#e5a93c" />
    </svg>
  `;
}
