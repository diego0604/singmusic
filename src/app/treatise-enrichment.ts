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
    catId: 'armonia',
    catLabel: '2. Armonía Práctica',
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
  {
    catId: 'teoria',
    catLabel: '1. Teoría y Acústica',
    sectionId: 't-notas',
    sectionTitle: '🌱 Conceptos Desde Cero: Semitono, Tono, Sostenido (#), Bemol (♭), Diatónico vs. Cromático',
    nivel: '1',
    keywords: 'desde cero que es semitono tono sostenido bemol becuadro diatonico cromatico conceptos basicos',
    snippet: 'Explicación paso a paso desde cero de qué es un semitono, un tono, para qué sirven # y ♭, y la diferencia entre diatónico y cromático.',
  },
  {
    catId: 'teoria',
    catLabel: '1. Teoría y Acústica',
    sectionId: 't-intervalos',
    sectionTitle: '🌱 Conceptos Desde Cero: ¿Qué es un Intervalo, una Tercera y una Quinta Justa, Disminuida o Aumentada?',
    nivel: '1',
    keywords: 'que es un intervalo para que sirve tercera mayor menor quinta justa quinta disminuida tritono quinta aumentada',
    snippet: 'Cómo medir distancias entre notas, por qué existen intervalos Justos vs. Mayores/Menores y cómo suenan las terceras y las quintas.',
  },
  {
    catId: 'armonia',
    catLabel: '2. Armonía Práctica',
    sectionId: 'h-triadas',
    sectionTitle: '🌱 Conceptos Desde Cero: Cómo Nace un Acorde Apilando Terceras (Mayor, Menor, Disminuido ° y Aumentado +)',
    nivel: '1',
    keywords: 'como nace un acorde triadas desde cero mayor menor disminuido aumentado apilar terceras musica tonal vs modal',
    snippet: 'La receta de los 2 pisos de terceras para entender y escuchar por qué un acorde es Mayor, Menor, Disminuido o Aumentado.',
  },
  {
    catId: 'armonia',
    catLabel: '2. Armonía Práctica',
    sectionId: 't-visualizador-9nintervalos',
    sectionTitle: '📐 Visualizador de Intervalos y 9nas (Simples y Compuestos: 1ª a 9ª, 11ª y 13ª) en Mástil y Teclado',
    nivel: '1-3',
    keywords: 'visualizador de 9nintervalos intervalos novenas 9nas b9 #9 11 #11 13 simples compuestos regla del 9 mastil guitarra bajo',
    snippet: 'Explora los 19 intervalos simples y compuestos (incluyendo ♭9, 9, #9, 11, #11, ♭13, 13) con diagramas SVG de guitarra (6c) y bajo (4c).',
  },
  {
    catId: 'armonia',
    catLabel: '2. Armonía Práctica',
    sectionId: 'h-visualizador-poliacordes',
    sectionTitle: '🏛️ Poliacordes (X | Y) y Upper Structure Triads: Visualizador Bicolor en el Mástil',
    nivel: '3-4',
    keywords: 'polyacodes poliacordes polychords upper structures D|C Bm|C F#|C7 A|C7 Ab|C7 triada superior sobre acorde base',
    snippet: 'Superposición de dos acordes independientes (Superior | Base) con diagramas SVG individuales y combinados para guitarra y bajo.',
  },
  {
    catId: 'armonia',
    catLabel: '2. Armonía Práctica',
    sectionId: 'h-acordes-vecinos',
    sectionTitle: '🧭 Acordes Vecinos (Neighbor Chords), Bordaduras Cromáticas (±1 Traste), Diatónicas y Disminuidas',
    nivel: '2-4',
    keywords: 'acordes vecinos neighbor chords bordadura cromatica planing sideslip disminuido auxiliar aproximacion conduccion de voces mastil',
    snippet: 'Cómo rodear y ornamentar cualquier acorde objetivo mediante acordes vecinos a ±1 semitono, sobre bajo pedal o con disminuidos auxiliares.',
  },
  {
    catId: 'armonia',
    catLabel: '2. Armonía Práctica',
    sectionId: 'h-triadas-mastil',
    sectionTitle: '🎸 Tríadas en el Mástil: Estado Fundamental, 1ª y 2ª Inversión por Grupos de 3 Cuerdas y Spread Triads',
    nivel: '2-3',
    keywords: 'triadas en el mastil inversiones estado fundamental primera segunda inversion sets de 3 cuerdas spread triads triangulo gancho ala',
    snippet: 'Mapa interactivo de las 3 inversiones de cualquier tríada (Mayor, Menor, Disminuida, Aumentada, Sus2, Sus4) por grupos de 3 cuerdas en guitarra y bajo.',
  },
  {
    catId: 'guitarra-ac',
    catLabel: '4. Guitarra Acústica',
    sectionId: 'ga-rasgueos',
    sectionTitle: '🎸 Rasgueos y Ejercicios Prácticos (Pop, 6/8, Funk Mute X y Reggae)',
    nivel: '1-2',
    keywords: 'rasgueos ejercicios guitarra acustica mano derecha pendulo apagados funk mute reggae 6/8',
    snippet: 'Aprende el movimiento pendular de mano derecha, apagados percusivos (X), patrones en 4/4 y 6/8 y ejercicios guiados paso a paso.',
  },
  {
    catId: 'teoria',
    catLabel: '1. Teoría y Acústica',
    sectionId: 't-lectura',
    sectionTitle: '🎼 Escritor Interactivo de Pentagrama (Claves de Sol, Fa y Do 3ª)',
    nivel: '1-2',
    keywords: 'escritura musical pentagrama clave de sol fa do 3a figuras silencios compases',
    snippet: 'Escribe y escucha tus propias melodías en clave de Sol, Fa o Do 3ª con compases 4/4, 3/4 y 6/8.',
  },
  {
    catId: 'arreglos',
    catLabel: '10. Arreglos y Orquestación',
    sectionId: 'a-integracion',
    sectionTitle: '🎺 Escritura Práctica de Banda (Kicks & Nashville) y Arreglo a 2, 3 y 4 Voces',
    nivel: '2-3',
    keywords: 'escritura practica de banda lead sheet kicks sistema nashville arreglo escrito 2 3 4 voces drop 2 satb',
    snippet: 'Cómo escribir cifrados universales en Sistema Nashville, cortes rítmicos (kicks) y armonizar melodías a 2, 3 y 4 voces sin choques.',
  },
  {
    catId: 'bateria',
    catLabel: '7. Batería y Percusión',
    sectionId: 'd-grooves',
    sectionTitle: '🥁 Notación de Batería PAS, Gap Click, Sonido del Kit y Ejercicios de Práctica',
    nivel: '1-3',
    keywords: 'notacion de bateria pentagrama sincronizada entrenador de tempo interno gap click tecnicas sonido kit ejercicios practica motricidad',
    snippet: 'Lee y programa grooves sobre el pentagrama PAS sincronizado, entrena tu reloj interno con Gap Click, explora técnicas del kit y practica rutinas de motricidad.',
  },
  {
    catId: 'bajo',
    catLabel: '6. Bajo Eléctrico (4 Cuerdas)',
    sectionId: 'b-bajo-bateria',
    sectionTitle: '🔒 Laboratorio "Lock-In" Bajo + Bombo y Recursos Expresivos Avanzados (4c / 5c)',
    nivel: '2-3',
    keywords: 'laboratorio lock-in bajo bombo staccato sustain anticipacion 5 cuerdas b0 armonicos naturales artificiales decimos fretless palm mute',
    snippet: 'Sincroniza el ataque del bajo con el bombo en 4 o 5 cuerdas y domina armónicos, décimas, glissando fretless y palm mute.',
  },
  {
    catId: 'canto',
    catLabel: '8. Canto y Calentamiento Vocal',
    sectionId: 'v-calentamiento',
    sectionTitle: '⚡ Gimnasio de Agilidad, Respiración 4-2-8, SOVT y Modificación de Vocales',
    nivel: '1-3',
    keywords: 'gimnasio de agilidad riffs melismas trinos modificacion de vocales i e a o u passaggio respiracion appoggio sovt afinacion vibrato',
    snippet: 'Entrena respiración 4-2-8, calentamiento SOVT, afinación guiada, riffs/melismas por velocidad y modificación de vocales en el passaggio.',
  },
  {
    catId: 'guitarra-ac',
    catLabel: '4. Guitarra Acústica',
    sectionId: 'ga-motricidad-memoria',
    sectionTitle: '⚡ Digitación por BPM (1–4), Ejercicios de Motricidad y Memorizador de Acordes en Mástil',
    nivel: '1-3',
    keywords: 'digitacion guitarra motricidad arana 1 2 3 4 permutaciones ligados velocidad bpm memorizador acordes aleatorios mastil dedos mano izquierda',
    snippet: 'Entrena velocidad y motricidad con los dedos 1–4 al metrónomo (+5 BPM) y memoriza acordes aleatorios tocándolos y reconociéndolos en el mástil.',
  },
  {
    catId: 'guitarra-ac',
    catLabel: '4. Guitarra Acústica',
    sectionId: 'entreno-diario',
    sectionTitle: '⏱️ Sesión Diaria de Entrenamiento Guiada (Guitarra, Bajo, Batería y Canto)',
    nivel: '1-3',
    keywords: 'sesion de entrenamiento diario rutina 10 20 30 minutos guitarra bajo bateria canto motricidad temporizador metronomo',
    snippet: 'Rutinas cronometradas de 10, 20 o 30 minutos con metrónomo guía y bloques progresivos de motricidad, técnica y groove.',
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

function insertAfterSection(html: string, sectionId: string, newSectionHtml: string): string {
  const sectionStartRegex = new RegExp(`<section\\s+id="${sectionId}"[^>]*>`, 'i');
  const startMatch = sectionStartRegex.exec(html);
  if (!startMatch) return html;

  const startIndex = startMatch.index;
  const closeTag = '</section>';
  const closeIndex = html.indexOf(closeTag, startIndex);
  if (closeIndex === -1) return html;

  const insertPos = closeIndex + closeTag.length;
  return html.slice(0, insertPos) + '\n\n' + newSectionHtml + '\n' + html.slice(insertPos);
}

function prependAfterSectionHeader(html: string, sectionId: string, blockHtml: string): string {
  const sectionStartRegex = new RegExp(`<section\\s+id="${sectionId}"[^>]*>`, 'i');
  const startMatch = sectionStartRegex.exec(html);
  if (!startMatch) return html;

  const startIndex = startMatch.index;
  const closeSectionIndex = html.indexOf('</section>', startIndex);
  if (closeSectionIndex === -1) return html;

  // Prefer inserting immediately after <div class="module-header">...</div> or <div class="section-header">...</div>
  const mhIdx = html.indexOf('class="module-header"', startIndex);
  const shIdx = html.indexOf('class="section-header"', startIndex);
  const hdrIdx = mhIdx !== -1 && mhIdx < closeSectionIndex ? mhIdx : shIdx !== -1 && shIdx < closeSectionIndex ? shIdx : -1;
  if (hdrIdx !== -1) {
    const hdrClose = html.indexOf('</div>', hdrIdx);
    if (hdrClose !== -1 && hdrClose < closeSectionIndex) {
      const insertPos = hdrClose + '</div>'.length;
      return html.slice(0, insertPos) + '\n' + blockHtml + '\n' + html.slice(insertPos);
    }
  }

  const h2CloseIndex = html.indexOf('</h2>', startIndex);
  if (h2CloseIndex !== -1 && h2CloseIndex < closeSectionIndex) {
    const insertPos = h2CloseIndex + '</h2>'.length;
    return html.slice(0, insertPos) + '\n' + blockHtml + '\n' + html.slice(insertPos);
  }

  const tagEndIndex = startIndex + startMatch[0].length;
  return html.slice(0, tagEndIndex) + '\n' + blockHtml + '\n' + html.slice(tagEndIndex);
}

function wrapDenseSubheadingInDetails(
  html: string,
  sectionId: string,
  headingId: string,
  summaryTitle: string,
  nivel = '3'
): string {
  const secStart = html.indexOf(`id="${sectionId}"`);
  if (secStart === -1) return html;
  const secEnd = html.indexOf('</section>', secStart);
  if (secEnd === -1) return html;

  const h3Marker = `<h3 id="${headingId}"`;
  const h3Idx = html.indexOf(h3Marker, secStart);
  if (h3Idx === -1 || h3Idx > secEnd) return html;

  // Wrap from h3Idx until next <h3 or <article class="interactive-widget" or </section>
  const nextH3 = html.indexOf('<h3', h3Idx + h3Marker.length);
  const nextArticle = html.indexOf('<article', h3Idx + h3Marker.length);
  let blockEnd = secEnd;
  if (nextH3 !== -1 && nextH3 < blockEnd) blockEnd = nextH3;
  if (nextArticle !== -1 && nextArticle < blockEnd) blockEnd = nextArticle;

  const innerBlock = html.slice(h3Idx, blockEnd);
  const wrapped = `<details data-nivel="${nivel}" class="callout-box mt-4"><summary style="color:#fbbf24; font-weight:800;">🎓 ${summaryTitle} (Nivel ${nivel} — Pulsa para ver fórmulas matemáticas y detalle avanzado)</summary>${innerBlock}</details>`;
  return html.slice(0, h3Idx) + wrapped + html.slice(blockEnd);
}

export function injectTreatiseEnrichmentIntoCategoryHtml(catId: string, html: string): string {
  let out = html;

  if (catId === 'teoria' || catId === 'all') {
    out = prependAfterSectionHeader(out, 'intro', buildSoftBeginnerIntroPrimerHtml());
    out = prependAfterSectionHeader(out, 't-sonido', buildSoftBeginnerSoundPrimerHtml());
    out = wrapDenseSubheadingInDetails(out, 't-sonido', 't-sonido-temperamento', 'Profundización Matemática: Pitágoras, Cents y Temperamento Igual (2^(n/12))', '3');
    out = prependAfterSectionHeader(out, 't-notas', buildZeroToHeroNotesAndAccidentalsHtml());
    out = prependAfterSectionHeader(out, 't-intervalos', buildZeroToHeroIntervalsThirdsAndFifthsHtml());
    out = insertAfterSection(out, 't-intervalos', buildInterval9thVisualizerSectionHtml());
    out = prependAfterSectionHeader(out, 't-modos', buildZeroToHeroTonalVsModalPrimerHtml());
    out = appendInsideSection(out, 't-escalas', buildScalesSkeletonAndAtlasHtml());
    out = appendInsideSection(out, 't-modos', buildModosIlustradosCartographyHtml());
    out = appendInsideSection(out, 't-tonalidades', buildCircleOfFifthsDeepGuideHtml());
    out = appendInsideSection(out, 't-ritmo', buildKonnakolAndClaveHtml());
    out = appendInsideSection(out, 't-lectura', buildNotationWriterIntroAndLabHtml('score'));
  }

  if (catId === 'armonia' || catId === 'all') {
    out = prependAfterSectionHeader(out, 'h-triadas', buildZeroToHeroChordBuildingHtml());
    out = insertAfterSection(out, 'h-triadas', buildFretboardTriadsSectionHtml('h-triadas-mastil', 'armonia', '1B. Tríadas en el Mástil (Inversiones y Sets de 3 Cuerdas)'));
    out = appendInsideSection(out, 'h-extensiones', buildTensionesIlustradasRescueAndGlueHtml());
    out = appendInsideSection(out, 'h-poli-hibridos', buildPolychordVsHybridMatrixHtml());
    out = insertAfterSection(out, 'h-poli-hibridos', buildPolychordVisualizerSectionHtml());
    out = appendInsideSection(out, 'h-ii-v-i', buildPachelbelAndStaircasesHtml());
    out = appendInsideSection(out, 'h-neoriemann', buildArmoniaIlustradaAdvancedSystemsHtml());
    out = insertAfterSection(out, 'h-neoriemann', buildNeighborChordsSectionHtml());
  }

  if (catId === 'guitarra-ac' || catId === 'all') {
    out = appendInsideSection(out, 'ga-acordes', buildGuitarKuleshovCagedAndColombianHtml());
    out = insertAfterSection(out, 'ga-acordes', buildFretboardTriadsSectionHtml('ga-triadas-mastil', 'guitarra-ac', '2B. Tríadas en el Mástil (Inversiones y Sets de 3 Cuerdas)'));
    out = insertAfterSection(out, 'ga-ritmo-fingerstyle', buildGuitarStrummingSectionHtml());
    out = insertAfterSection(out, 'ga-rasgueos', buildGuitarDexterityAndMemorySectionHtml());
    out = insertAfterSection(out, 'ga-motricidad-memoria', buildDailyTrainingSectionHtml());
  }

  if (catId === 'guitarra-el' || catId === 'all') {
    out = appendInsideSection(out, 'ge-riffs-solos', buildElectricGuitarGlueTriadsAndOctavesHtml());
    out = appendInsideSection(out, 'ge-gimnasio', buildInstrumentSessionCalloutHtml('guitarra', 'ge'));
  }

  if (catId === 'bajo' || catId === 'all') {
    out = appendInsideSection(out, 'b-bajo-bateria', buildBassLockInAndExpressiveHtml());
    out = appendInsideSection(out, 'b-gimnasio', buildInstrumentSessionCalloutHtml('bajo', 'bajo'));
    out = appendInsideSection(out, 'b-mutear-articulacion', buildBassExpressiveQuickJumpHtml());
  }

  if (catId === 'bateria' || catId === 'all') {
    out = appendInsideSection(out, 'd-grooves', buildDrumProNotationGapAndKitHtml());
    out = appendInsideSection(out, 'd-gimnasio', buildInstrumentSessionCalloutHtml('bateria', 'bateria'));
  }

  if (catId === 'canto' || catId === 'all') {
    out = prependAfterSectionHeader(out, 'v-calentamiento', buildVocalAgilityAndVowelLabHtml());
    out = appendInsideSection(out, 'v-calentamiento', buildVocalDiagnosticAndHygieneHtml());
    out = appendInsideSection(out, 'v-calentamiento', buildInstrumentSessionCalloutHtml('canto', 'canto'));
    out = appendInsideSection(out, 'v-interpretacion-estilos', buildVocalSixLayersBeltAndMicHtml());
  }

  if (catId === 'arreglos' || catId === 'all') {
    out = appendInsideSection(out, 'a-fundamentos', buildArreglosIlustradosBulletproofPadHtml());
    out = appendInsideSection(out, 'a-integracion', buildBandChartAndVoicesSectionHtml());
  }

  return out;
}

function buildSoftBeginnerIntroPrimerHtml(): string {
  return `
  <div class="callout-box mb-5" style="border-left: 4px solid #10b981;" data-nivel="1">
    <h3>🌱 Empieza Aquí (Sin Tecnicismos): Cómo Usar Esta Enciclopedia</h3>
    <p class="text-sm mb-2">
      No necesitas saber leer partituras ni dominar física acústica para tocar o componer música hoy mismo. Usa el selector de nivel en la barra superior (<strong>🌱 Novato</strong>) para enfocarte en las bases esenciales (<em>Notas, Intervalos, Acordes básicos, Ritmo y Rasgueos</em>), escucha cada ejemplo haciendo clic en los botones <code>🔊</code> y observa cómo las notas se <strong>iluminan en vivo</strong> sobre el mástil y el monitor.
    </p>
  </div>
  `;
}

function buildSoftBeginnerSoundPrimerHtml(): string {
  return `
  <div class="callout-box mb-5" style="border-left: 4px solid #38bdf8;" data-nivel="1">
    <h3>🌱 Paso 0 (Sin Fórmulas): ¿Por qué unas Notas Combinan y Otras Chocan?</h3>
    <p class="text-sm mb-2">
      Todo sonido musical es simplemente aire vibrando rápido o lento: <strong>más lento = sonido grave (bajo/bombo)</strong>; <strong>más rápido = sonido agudo (voz/flauta/guitarra)</strong>. Cuando una cuerda vibra, además de su nota principal produce ecos suaves llamados <strong>armónicos</strong>. Esos ecos naturales explican por qué una octava o una quinta suenan firmes y agradables sin necesidad de cálculos matemáticos (si quieres ver las ecuaciones de Pitágoras y hercios más adelante, las encontrarás desplegables al final del capítulo).
    </p>
  </div>
  `;
}

function buildZeroToHeroNotesAndAccidentalsHtml(): string {
  return `
  <div class="callout-box mb-5" style="border-left: 4px solid #38bdf8;">
    <h3>🌱 Paso 0 (Desde Cero): ¿Qué es un Semitono, un Tono, un Sostenido (<code>#</code>), un Bemol (<code>♭</code>) y qué significa "Diatónico"?</h3>
    <p class="text-sm mb-3">
      Antes de hablar de escalas o acordes, imagina la música como una <strong>escalera de 12 escalones</strong> que se repite hacia arriba y hacia abajo. Si entiendes estos 4 conceptos básicos, todo el resto de la teoría encaja como piezas de LEGO:
    </p>
    <div class="grid-cards mb-4">
      <div class="card">
        <h4>1. El Semitono (<code>1 st</code>) y el Tono (<code>2 st</code>)</h4>
        <p class="text-xs">
          • <strong>Semitono (<code>S</code> o <code>1 st</code>):</strong> Es el <strong>paso más pequeño posible</strong> entre dos notas en nuestra música. En la guitarra equivale a moverte <strong>1 solo traste</strong> al lado; en el piano, pasar a la tecla inmediatamente pegada (blanca o negra).<br>
          • <strong>Tono (<code>T</code> o <code>2 st</code>):</strong> Equivale exactamente a <strong>sumar 2 semitonos</strong> (saltar 2 trastes en la guitarra, por ejemplo de <code>Do</code> a <code>Re</code>).
        </p>
        <div class="flex flex-wrap gap-2 mt-2">
          <button type="button" class="btn-audio js-treatise-chord" data-mode="seq" data-notes="60,61" data-label="1 Semitono (Do → Do#): El paso más pequeño (tensión de Tiburón/Jaws)">🔊 Escuchar 1 Semitono</button>
          <button type="button" class="btn-audio js-treatise-chord" data-mode="seq" data-notes="60,62" data-label="1 Tono = 2 Semitonos (Do → Re): Paso abierto y natural">🔊 Escuchar 1 Tono (2 st)</button>
        </div>
      </div>
      <div class="card">
        <h4>2. ¿Qué hacen el Sostenido (<code>#</code>) y el Bemol (<code>♭</code>)?</h4>
        <p class="text-xs">
          Entre dos notas separadas por 1 Tono (como <code>Do</code> y <code>Re</code>) hay un escalón intermedio. Para nombrarlo usamos las <strong>alteraciones</strong>:<br>
          • <strong>Sostenido (<code>#</code>):</strong> Sube la nota <strong>medio tono (+1 semitono / +1 traste)</strong>. Ej.: <code>Do → Do#</code>.<br>
          • <strong>Bemol (<code>♭</code>):</strong> Baja la nota <strong>medio tono (-1 semitono / -1 traste)</strong>. Ej.: <code>Re → Re♭</code>.<br>
          • <strong>Enarmonía:</strong> ¡<code>Do#</code> y <code>Re♭</code> son exactamente el mismo sonido físico (el mismo traste), solo cambia el nombre según la dirección!
        </p>
        <div class="flex flex-wrap gap-2 mt-2">
          <button type="button" class="btn-audio js-treatise-chord" data-mode="seq" data-notes="60,61,62" data-label="Subiendo con Sostenido: Do (60) → Do# (61) → Re (62)">🔊 Do → Do# → Re</button>
          <button type="button" class="btn-audio js-treatise-chord" data-mode="seq" data-notes="62,61,60" data-label="Bajando con Bemol: Re (62) → Re♭ (61) → Do (60)">🔊 Re → Re♭ → Do</button>
        </div>
      </div>
      <div class="card">
        <h4>3. ¿Qué significa "Diatónico" vs. "Cromático"?</h4>
        <p class="text-xs">
          • <strong>Diatónico ("De la familia"):</strong> Cuando de los 12 semitonos elegimos solo las <strong>7 notas naturales de una escala</strong> (usando la receta <code>T–T–S–T–T–T–S</code>, como las teclas blancas <code>Do–Re–Mi–Fa–Sol–La–Si</code>). Todo lo que construyas solo con esas 7 notas se llama <em>diatónico</em>.<br>
          • <strong>Cromático ("Con todos los colores"):</strong> Cuando metes cualquiera de las <strong>5 notas alteradas restantes</strong> para crear sorpresa, tensión o deslizar una nota paso a paso por semitonos.
        </p>
        <div class="flex flex-wrap gap-2 mt-2">
          <button type="button" class="btn-audio js-treatise-chord" data-mode="seq" data-notes="60,62,64,65,67,69,71,72" data-label="Escala Diatónica de Do Mayor (7 notas de la familia)">🔊 7 Notas Diatónicas</button>
          <button type="button" class="btn-audio js-treatise-chord" data-mode="seq" data-notes="60,61,62,63,64,65,66,67" data-label="Paso Cromático (Todos los semitonos seguidos uno por uno)">🔊 Paso Cromático</button>
        </div>
      </div>
    </div>

    <div class="card mb-4" style="border-left: 3px solid #10b981;">
      <h4>🎯 4. ¿Qué significan Mayor, Menor, Aumentado (<code>+</code>) y Disminuido (<code>°</code>)?</h4>
      <p class="text-xs">
        Antes de entrar a medir intervalos y acordes, aprende estas cuatro etiquetas simples que verás en toda la música:<br>
        • <strong>Mayor:</strong> distancia o acorde luminoso y estable (la medida "estándar" abierta).<br>
        • <strong>Menor:</strong> se reduce <strong>1 semitono</strong>; suena más íntimo, serio o melancólico.<br>
        • <strong>Aumentado (<code>+</code>):</strong> se estira <strong>+1 semitono</strong> hacia arriba (suena flotante o espacial).<br>
        • <strong>Disminuido (<code>°</code>):</strong> se encoge <strong>-1 semitono</strong> hacia abajo (suena tenso o apretado y pide resolver).
      </p>
    </div>

    <div class="card mb-4" style="border-left: 3px solid #f59e0b;">
      <h4>🕰️ 5. ¿Qué es una Enarmonía, el Becuadro (<code>♮</code>) y la "Regla de Oro de la Enarmonía"?</h4>
      <p class="text-xs">
        • <strong>¿Qué es una Enarmonía?</strong> Cuando <strong>un mismo sonido físico (la misma tecla o el mismo traste)</strong> puede escribirse con <strong>dos nombres distintos</strong> según la dirección o la escala. Ejemplos clave: <code>Do# = Re♭</code>, <code>Fa# = Sol♭</code>, e incluso entre notas naturales sin tecla negra en medio: <code>Mi# = Fa</code> y <code>Do♭ = Si</code>.<br>
        • <strong>Becuadro (<code>♮</code>):</strong> Borra temporalmente un sostenido o bemol anterior y devuelve la nota a su estado natural.<br>
        • <strong>La Regla de Oro de la Enarmonía (¿Por qué Fa Mayor lleva <code>Si♭</code> y NO <code>La#</code>?):</strong> En toda escala diatónica de 7 notas, debes usar las <strong>7 letras del abecedario musical (<code>Do – Re – Mi – Fa – Sol – La – Si</code>) UNA SOLA VEZ cada una</strong>, sin repetir letras ni saltarte ninguna. Si en Fa Mayor escribieras <code>Fa – Sol – La – La#</code> estarías repitiendo la letra <code>La</code> y saltándote el <code>Si</code>. Por eso la regla exige llamarlo <strong><code>Si♭</code></strong>. Explóralo en el reloj interactivo:
      </p>
    </div>

    <article class="interactive-widget mt-4" id="lab-reloj-cromatico" data-lab="chromatic-clock-lab" data-nivel="1">
      <div class="widget-header">
        <span class="widget-tag">Nivel 1 · Base Obligatoria</span>
        <h3>🕰️ Reloj Cromático de 12 Horas y Regla de Oro de la Enarmonía</h3>
        <p class="text-sm">Haz clic en cualquier hora del reloj para escuchar la nota, ver su pareja enarmónica (<code># / ♭</code>) y comprobar cómo se aplica la Regla de Oro de las 7 letras sin repeticiones.</p>
      </div>
      <div class="lab-stage"></div>
    </article>
  </div>
  `;
}

function buildZeroToHeroIntervalsThirdsAndFifthsHtml(): string {
  return `
  <div class="callout-box mb-5" style="border-left: 4px solid #f59e0b;">
    <h3>🌱 Paso 0 (Desde Cero): ¿Qué es un Intervalo, Cómo se Forma y qué son las Terceras y Quintas (Justa, Disminuida, Aumentada)?</h3>
    <p class="text-sm mb-3">
      Si tocas una sola nota aislada (por ejemplo, <code>Do</code>), todavía no hay emoción: no sabes si la canción es alegre, triste, heroica o de terror. La emoción aparece en el instante en que tocas una <strong>segunda nota</strong>. La <strong>distancia sonora entre dos notas se llama INTERVALO</strong> y es el ladrillo fundamental de la música porque <strong>todos los acordes y escalas son simplemente intervalos combinados</strong>.
    </p>
    <div class="card mb-4" style="border-left: 3px solid #38bdf8;">
      <h4>🛠️ ¿Cómo se forma y nombra exactamente cualquier Intervalo? (Fórmula en 3 Pasos)</h4>
      <p class="text-xs">
        <strong>Paso 1 — Cuenta el número de letras (Grado Diatónico):</strong> Cuenta inclusivamente desde la nota base hasta la nota superior siguiendo el orden <code>Do–Re–Mi–Fa–Sol–La–Si</code>. Ejemplo: de <code>Do</code> a <code>Fa#</code> hay 4 letras (<code>Do-Re-Mi-Fa</code> = es una <strong>4ª</strong>). De <code>Do</code> a <code>Sol♭</code> hay 5 letras (<code>Do-Re-Mi-Fa-Sol</code> = es una <strong>5ª</strong>). ¡Aunque suenen en el mismo traste (6 semitonos), su función armónica cambia según el nombre!<br>
        <strong>Paso 2 — Mide los semitonos exactos (Trastes / Teclas):</strong> Compara esos semitonos contra la escala Mayor de referencia:<br>
        • Si el intervalo <strong>Justo</strong> (<code>4ªJ=5 st</code>, <code>5ªJ=7 st</code>) gana <code>+1 st</code> → se vuelve <strong>Aumentado (<code>#4</code>, <code>#5</code>)</strong>; si pierde <code>-1 st</code> → <strong>Disminuido (<code>♭5</code>)</strong>.<br>
        • Si el intervalo <strong>Mayor</strong> (<code>2ªM=2</code>, <code>3ªM=4</code>, <code>6ªM=9</code>, <code>7ªM=11</code>) baja <code>-1 st</code> → se vuelve <strong>Menor</strong>; si baja <code>-2 st</code> → <strong>Disminuido</strong>.<br>
        <strong>Paso 3 — La Regla del 9 (Inversión de Intervalos):</strong> Si inviertes un intervalo (pones la nota grave una octava arriba), el número nuevo siempre suma <strong>9</strong> y la cualidad se invierte (<code>Mayor ↔ Menor</code>, <code>Aum ↔ Dism</code>, <code>Justo ↔ Justo</code>). Ej.: una <strong>3ª Mayor</strong> (<code>Do → Mi</code>) invertida se vuelve una <strong>6ª Menor</strong> (<code>Mi → Do</code>, porque <code>3 + 6 = 9</code>).
      </p>
    </div>
    <div class="grid-cards mb-4">
      <div class="card">
        <h4>1. ¿Por qué unos intervalos se llaman "Justos" y otros "Mayores o Menores"?</h4>
        <p class="text-xs">
          Al dividir una cuerda en proporciones matemáticas simples nacen dos grupos con funciones distintas:<br>
          • <strong>Los Intervalos JUSTOS (Unísono <code>1J</code>, Cuarta <code>4J</code>, Quinta <code>5J</code> y Octava <code>8J</code>):</strong> Son las <strong>columnas de cemento</strong> del sonido. Suenan puros, estables y abiertos, pero son emocionalmente neutros (no dicen si el acorde es mayor o menor).<br>
          • <strong>Los Intervalos MAYORES o MENORES (<code>2ª</code>, <code>3ª</code>, <code>6ª</code> y <code>7ª</code>):</strong> Son la <strong>pintura emocional</strong>. Cada uno tiene una versión <strong>Mayor</strong> (más amplia y luminosa) y una versión <strong>Menor</strong> (1 semitono más pequeña, íntima y melancólica).
        </p>
      </div>
      <div class="card">
        <h4>2. Las Terceras (<code>3m</code> vs. <code>3M</code>): El Interruptor de Alegría o Melancolía</h4>
        <p class="text-xs">
          La <strong>Tercera</strong> es la distancia desde la 1ª hasta la 3ª nota de una escala (por ejemplo, de <code>Do</code> a <code>Mi</code>):<br>
          • <strong>Tercera Mayor (<code>4 semitonos</code> = 2 tonos, <code>Do → Mi</code>):</strong> Define al mundo <strong>Mayor</strong> (luminoso, estable, alegre).<br>
          • <strong>Tercera Menor (<code>3 semitonos</code> = 1 tono y medio, <code>Do → Mi♭</code>):</strong> Solo baja 1 traste respecto a la mayor, ¡pero cambia instantáneamente el clima a <strong>Menor</strong> (serio, nostálgico, íntimo)!
        </p>
        <div class="flex flex-wrap gap-2 mt-2">
          <button type="button" class="btn-audio js-treatise-chord" data-notes="60,64" data-label="Tercera Mayor (Do + Mi = 4 semitonos): Luminosa y alegre">🔊 3ª Mayor (Do–Mi, 4 st)</button>
          <button type="button" class="btn-audio js-treatise-chord" data-notes="60,63" data-label="Tercera Menor (Do + Mi♭ = 3 semitonos): Íntima y melancólica">🔊 3ª Menor (Do–Mi♭, 3 st)</button>
        </div>
      </div>
      <div class="card">
        <h4>3. Las 3 Quintas: Justa (<code>7 st</code>), Disminuida (<code>6 st</code>) y Aumentada (<code>8 st</code>)</h4>
        <p class="text-xs">
          La <strong>Quinta</strong> (de <code>Do</code> a <code>Sol</code>) es el marco externo de todo acorde. Según cuántos semitonos mida, tiene 3 personalidades:<br>
          • <strong>Quinta Justa (<code>7 semitonos</code>, <code>Do → Sol</code>):</strong> Fuerza, reposo y firmeza total (el famoso <em>Power Chord</em> del Rock).<br>
          • <strong>Quinta Disminuida o Tritono (<code>6 semitonos</code>, <code>Do → Sol♭</code>):</strong> La quinta justa encogida 1 semitono. Suena inquieta, peligrosa y pide resolver.<br>
          • <strong>Quinta Aumentada (<code>8 semitonos</code>, <code>Do → Sol#</code>):</strong> La quinta justa estirada 1 semitono. Suena flotante, mágica y en suspenso.
        </p>
        <div class="flex flex-wrap gap-2 mt-2">
          <button type="button" class="btn-audio js-treatise-chord" data-notes="60,67" data-label="Quinta Justa (Do + Sol = 7 semitonos): Estable y potente">🔊 5ª Justa (7 st)</button>
          <button type="button" class="btn-audio js-treatise-chord" data-notes="60,66" data-label="Quinta Disminuida / Tritono (Do + Sol♭ = 6 semitonos): Máxima tensión">🔊 5ª Disminuida (6 st)</button>
          <button type="button" class="btn-audio js-treatise-chord" data-notes="60,68" data-label="Quinta Aumentada (Do + Sol# = 8 semitonos): Misterio flotante">🔊 5ª Aumentada (8 st)</button>
        </div>
      </div>
    </div>

    <div class="table-wrap">
      <table>
        <thead>
          <tr>
            <th>Intervalo (Desde Do)</th>
            <th>Semitonos (Trastes)</th>
            <th>Ejemplo de Notas</th>
            <th>¿Para qué sirve en la práctica?</th>
            <th>Escuchar</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><strong>2ª Menor (Semitono)</strong></td>
            <td><code>1 st</code></td>
            <td><code>Do → Re♭</code></td>
            <td>Crea roce dramático, suspenso cinematográfico y sabor Frigio/Flamenco.</td>
            <td><button type="button" class="btn-audio js-treatise-chord" data-notes="60,61" data-label="Segunda Menor (1 semitono: Do - Re♭)">🔊 2ª Menor</button></td>
          </tr>
          <tr>
            <td><strong>2ª Mayor (Tono)</strong></td>
            <td><code>2 st</code></td>
            <td><code>Do → Re</code></td>
            <td>Paso melódico natural; una octava más arriba se convierte en la <strong>Novena (<code>9</code>)</strong>.</td>
            <td><button type="button" class="btn-audio js-treatise-chord" data-notes="60,62" data-label="Segunda Mayor (2 semitonos: Do - Re)">🔊 2ª Mayor</button></td>
          </tr>
          <tr>
            <td><strong>3ª Menor (<code>♭3</code>)</strong></td>
            <td><code>3 st</code></td>
            <td><code>Do → Mi♭</code></td>
            <td>Construye todos los <strong>acordes y escalas Menores y Disminuidos</strong>.</td>
            <td><button type="button" class="btn-audio js-treatise-chord" data-notes="60,63" data-label="Tercera Menor (3 semitonos: Do - Mi♭)">🔊 3ª Menor</button></td>
          </tr>
          <tr>
            <td><strong>3ª Mayor (<code>3</code>)</strong></td>
            <td><code>4 st</code></td>
            <td><code>Do → Mi</code></td>
            <td>Construye todos los <strong>acordes Mayores, Dominantes y Aumentados</strong>.</td>
            <td><button type="button" class="btn-audio js-treatise-chord" data-notes="60,64" data-label="Tercera Mayor (4 semitonos: Do - Mi)">🔊 3ª Mayor</button></td>
          </tr>
          <tr>
            <td><strong>4ª Justa (<code>4J</code>)</strong></td>
            <td><code>5 st</code></td>
            <td><code>Do → Fa</code></td>
            <td>Crea los acordes suspendidos (<code>Csus4</code>) y la afinación por cuartas de la guitarra y el bajo.</td>
            <td><button type="button" class="btn-audio js-treatise-chord" data-notes="60,65" data-label="Cuarta Justa (5 semitonos: Do - Fa)">🔊 4ª Justa</button></td>
          </tr>
          <tr>
            <td><strong>5ª Disminuida / Tritono (<code>♭5 / #4</code>)</strong></td>
            <td><code>6 st</code> (3 tonos)</td>
            <td><code>Do → Sol♭ (Fa#)</code></td>
            <td>Divide la octava exactamente por la mitad. Motor de tensión del acorde <code>V7</code> y del disminuido <code>°</code>.</td>
            <td><button type="button" class="btn-audio js-treatise-chord" data-notes="60,66" data-label="Quinta Disminuida o Tritono (6 semitonos: Do - Sol♭)">🔊 Tritono (5°)</button></td>
          </tr>
          <tr>
            <td><strong>5ª Justa (<code>5J</code>)</strong></td>
            <td><code>7 st</code></td>
            <td><code>Do → Sol</code></td>
            <td>Columna vertebral de estabilidad de todo acorde Mayor o Menor y eje del Círculo de Quintas.</td>
            <td><button type="button" class="btn-audio js-treatise-chord" data-notes="60,67" data-label="Quinta Justa (7 semitonos: Do - Sol)">🔊 5ª Justa</button></td>
          </tr>
          <tr>
            <td><strong>8ª Justa (Octava)</strong></td>
            <td><code>12 st</code></td>
            <td><code>Do4 → Do5</code></td>
            <td>La misma nota con el doble exacto de frecuencia (Hz): refuerza melodías y bajos sin cambiar la armonía.</td>
            <td><button type="button" class="btn-audio js-treatise-chord" data-notes="60,72" data-label="Octava Justa (12 semitonos: Do4 - Do5)">🔊 Octava (8J)</button></td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
  `;
}

function buildZeroToHeroTonalVsModalPrimerHtml(): string {
  return `
  <div class="callout-box mb-5" style="border-left: 4px solid #10b981;">
    <h3>🌱 Paso 0 (Desde Cero): ¿Qué es la Música Tonal vs. la Música Modal y qué son los Modos?</h3>
    <p class="text-sm mb-3">
      Mucha gente memoriza nombres griegos (<em>Jónico, Dórico, Frigio, Lidio, Mixolidio, Eólico, Locrio</em>) sin entender para qué existen. Aquí tienes la diferencia real en lenguaje humano:
    </p>
    <div class="grid-cards mb-3">
      <div class="card">
        <h4>🧲 1. ¿Qué es la Música TONAL? (Viaje con Gravedad)</h4>
        <p class="text-xs">
          En la música tonal hay un centro de gravedad absoluto llamado <strong>Tónica (Grado I, ej. Do Mayor)</strong>. Los demás acordes se alejan (Subdominante <code>IV = Fa</code>), acumulan tensión máxima en el <strong>Dominante (<code>V7 = Sol7</code>)</strong> y resuelven de vuelta a casa (<code>G7 → C</code>). Es como lanzar una pelota al aire y verla caer al suelo.
        </p>
        <button type="button" class="btn-audio js-treatise-chord mt-2" data-mode="prog" data-groups="48,55,60,64|41,53,57,60|43,53,59,62|48,55,60,64" data-label="Música Tonal: C (Casa) → F (Viaje) → G7 (Tensión Tritono) → C (Resolución)">🔊 Escuchar Gravedad Tonal (I–IV–V7–I)</button>
      </div>
      <div class="card">
        <h4>🎨 2. ¿Qué es la Música MODAL? (Habitar un Paisaje)</h4>
        <p class="text-xs">
          En la música modal <strong>apagamos el imán del <code>V7</code></strong> para que no nos arrastre a la escala mayor tradicional, y en su lugar nos quedamos <strong>flotando dentro de un clima emocional específico</strong> definido por <strong>1 sola nota característica</strong> (el "ingrediente secreto" de cada modo).
        </p>
        <button type="button" class="btn-audio js-treatise-chord mt-2" data-mode="prog" data-groups="48,55,60,63|41,53,57,60|48,55,60,63|41,53,57,60" data-label="Música Modal (Do Dórico): Cm ↔ F Mayor (La nota La natural ilumina el acorde menor)">🔊 Escuchar Clima Modal (Cm ↔ F Dórico)</button>
      </div>
      <div class="card">
        <h4>💡 3. Cómo Entender los 7 Modos en 10 Segundos</h4>
        <p class="text-xs">
          En vez de pensar "Dórico empieza en Re", compáralos todos <strong>desde la misma nota Do</strong>:<br>
          • <strong>3 Modos Mayores (tienen 3ª Mayor <code>Mi</code>):</strong> <strong>Jónico</strong> (Mayor normal), <strong>Lidio</strong> (Mayor + <code>#4</code> mágica) y <strong>Mixolidio</strong> (Mayor + <code>♭7</code> rockera).<br>
          • <strong>3 Modos Menores (tienen 3ª Menor <code>Mi♭</code>):</strong> <strong>Eólico</strong> (Menor normal), <strong>Dórico</strong> (Menor + <code>6ª natural</code> luminosa) y <strong>Frigio</strong> (Menor + <code>♭2</code> flamenca).<br>
          • <strong>1 Modo Disminuido:</strong> <strong>Locrio</strong> (tiene <code>♭2</code> y <code>♭5</code> disminuida).
        </p>
      </div>
    </div>
  </div>
  `;
}

function buildZeroToHeroChordBuildingHtml(): string {
  return `
  <div class="callout-box mb-5" style="border-left: 4px solid #a855f7;">
    <h3>🌱 Paso 0 (Desde Cero): ¿Cómo Nace un Acorde? La Regla de Apilar Dos Terceras (Mayor, Menor, Disminuido y Aumentado)</h3>
    <p class="text-sm mb-3">
      Un acorde básico de 3 notas se llama <strong>Tríada</strong> y funciona exactamente como un <strong>edificio de 2 pisos construido apilando Terceras</strong>: el <strong>Piso 1</strong> va de la Fundamental (<code>1</code>) a la Tercera (<code>3</code>), y el <strong>Piso 2</strong> va de la Tercera (<code>3</code>) a la Quinta (<code>5</code>). Combinando Terceras Mayores (<code>4 semitonos</code>) y Terceras Menores (<code>3 semitonos</code>) nacen las <strong>4 familias universales de acordes</strong>:
    </p>
    <div class="table-wrap">
      <table>
        <thead>
          <tr>
            <th>Familia de Acorde</th>
            <th>Piso 1 (1ª → 3ª)</th>
            <th>Piso 2 (3ª → 5ª)</th>
            <th>Quinta Resultante (1ª → 5ª)</th>
            <th>Fórmula y Notas en Do</th>
            <th>Emoción y Audio</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><strong>1. Tríada MAYOR (<code>C</code>)</strong></td>
            <td><strong>3ª Mayor</strong> (<code>4 st</code>)</td>
            <td><strong>3ª Menor</strong> (<code>3 st</code>)</td>
            <td><strong>Quinta Justa</strong> (<code>4 + 3 = 7 st</code>)</td>
            <td><code>1 – 3 – 5</code> (<code>Do – Mi – Sol</code>)</td>
            <td><button type="button" class="btn-audio js-treatise-chord" data-notes="48,60,64,67" data-label="Acorde Do Mayor (C = Do - Mi - Sol): 3ª Mayor (4 st) + 3ª Menor (3 st) = Quinta Justa">🔊 Do Mayor (Luminoso)</button></td>
          </tr>
          <tr>
            <td><strong>2. Tríada MENOR (<code>Cm</code>)</strong></td>
            <td><strong>3ª Menor</strong> (<code>3 st</code>)</td>
            <td><strong>3ª Mayor</strong> (<code>4 st</code>)</td>
            <td><strong>Quinta Justa</strong> (<code>3 + 4 = 7 st</code>)</td>
            <td><code>1 – ♭3 – 5</code> (<code>Do – Mi♭ – Sol</code>)</td>
            <td><button type="button" class="btn-audio js-treatise-chord" data-notes="48,60,63,67" data-label="Acorde Do Menor (Cm = Do - Mi♭ - Sol): 3ª Menor (3 st) + 3ª Mayor (4 st) = Quinta Justa">🔊 Do Menor (Melancólico)</button></td>
          </tr>
          <tr>
            <td><strong>3. Tríada DISMINUIDA (<code>C°</code>)</strong></td>
            <td><strong>3ª Menor</strong> (<code>3 st</code>)</td>
            <td><strong>3ª Menor</strong> (<code>3 st</code>)</td>
            <td><strong>Quinta Disminuida</strong> (<code>3 + 3 = 6 st</code>)</td>
            <td><code>1 – ♭3 – ♭5</code> (<code>Do – Mi♭ – Sol♭</code>)</td>
            <td><button type="button" class="btn-audio js-treatise-chord" data-notes="48,60,63,66" data-label="Acorde Do Disminuido (C° = Do - Mi♭ - Sol♭): Dos 3ª Menores (3+3 = Quinta Disminuida)">🔊 Do Disminuido (Tenso)</button></td>
          </tr>
          <tr>
            <td><strong>4. Tríada AUMENTADA (<code>C+</code>)</strong></td>
            <td><strong>3ª Mayor</strong> (<code>4 st</code>)</td>
            <td><strong>3ª Mayor</strong> (<code>4 st</code>)</td>
            <td><strong>Quinta Aumentada</strong> (<code>4 + 4 = 8 st</code>)</td>
            <td><code>1 – 3 – #5</code> (<code>Do – Mi – Sol#</code>)</td>
            <td><button type="button" class="btn-audio js-treatise-chord" data-notes="48,60,64,68" data-label="Acorde Do Aumentado (C+ = Do - Mi - Sol#): Dos 3ª Mayores (4+4 = Quinta Aumentada)">🔊 Do Aumentado (Onírico)</button></td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
  `;
}

function buildScalesSkeletonAndAtlasHtml(): string {
  return `
  <div class="callout-box mt-6" style="border-left: 4px solid #f59e0b;" data-nivel="3">
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
  <div class="callout-box mt-6" style="border-left: 4px solid #38bdf8;" data-nivel="3">
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

    <div class="card mb-4" style="border-left: 3px solid #f472b6;">
      <h4>🔗 ¿Cómo se conecta un Modo a otro? (La Regla de 1 Solo Semitono)</h4>
      <p class="text-xs">
        Todos los modos del universo están conectados en una misma red continua de brillo → oscuridad. Para viajar desde un modo hasta su vecino inmediato <strong>solo necesitas mover UNA nota un semitono (1 traste)</strong>:<br>
        • <strong>Lidio → Jónico</strong>: baja el <code>#4</code> a <code>4J</code> (<code>F# → F</code>).<br>
        • <strong>Jónico → Mixolidio</strong>: baja la <code>7M</code> a <code>♭7</code> (<code>B → Bb</code>).<br>
        • <strong>Mixolidio → Dórico</strong>: baja la <code>3M</code> a <code>♭3</code> (<code>E → Eb</code>).<br>
        • <strong>Dórico → Eólico</strong>: baja la <code>6♮</code> a <code>♭6</code> (<code>A → Ab</code>).<br>
        • <strong>Eólico → Frigio</strong>: baja la <code>2M</code> a <code>♭2</code> (<code>D → Db</code>).<br>
        Toca cualquier nodo del siguiente diagrama interactivo para escuchar cómo suena cada modo y ver qué nota exacta cambia con sus vecinos:
      </p>
    </div>

    <article class="interactive-widget mt-5" id="lab-modos-red-14" data-lab="modes-network-14" data-nivel="3">
      <div class="widget-header">
        <span class="widget-tag">Mapa Interactivo · 14 Modos Conectados por 1 Semitono</span>
        <h3>🕸️ Red Interactiva de los 14 Modos (Mayor, Menor Melódica y Armónica)</h3>
        <p class="text-sm">Cambia la tónica, haz clic en cualquier nodo del mapa para escuchar su acorde y su escala característica, y navega entre modos vecinos moviendo <strong>un solo semitono</strong> con diagrama en Guitarra (6c) y Bajo (4c).</p>
      </div>
      <div class="lab-stage"></div>
    </article>
  </div>
  `;
}

function buildCircleOfFifthsDeepGuideHtml(): string {
  return `
  <div class="callout-box mt-6" style="border-left: 4px solid #fbbf24;">
    <h3>🧭 Anatomía Profunda del Círculo de Quintas: Construcción desde Cero, Relativos, Tritonos Opuestos (180°) y Cadena <code>6 – 2 – 5 – 1</code></h3>
    <div class="grid-cards mb-3">
      <div class="card">
        <h4>1. ¿Cómo se crea el Círculo de Quintas desde cero?</h4>
        <p class="text-xs">
          Empieza arriba a las 12 en punto con <strong>Do Mayor (<code>C</code>, 0 alteraciones)</strong>:<br>
          • <strong>Sentido Horario (+7 semitonos = Subir por Quintas Justas):</strong> Cada paso suma <strong>1 sostenido (<code>#</code>)</strong> siguiendo el orden <code>Fa – Do – Sol – Re – La – Mi – Si</code>: <code>C (0#) → G (1#: F#) → D (2#) → A (3#) → E (4#) → B (5#) → F# (6#)</code>.<br>
          • <strong>Sentido Antihorario (+5 semitonos = Subir por Cuartas Justas / Bajar por Quintas):</strong> Cada paso suma <strong>1 bemol (<code>♭</code>)</strong> en orden inverso (<code>Si – Mi – La – Re – Sol – Do – Fa</code>): <code>C (0♭) → F (1♭: Bb) → Bb (2♭) → Eb (3♭) → Ab (4♭) → Db (5♭) → Gb (6♭)</code>.
        </p>
      </div>
      <div class="card">
        <h4>2. ¿Por qué los Tritonos están diametralmente opuestos (180°)?</h4>
        <p class="text-xs">
          En el círculo hay <strong>12 horas</strong> y cada paso por quinta suma <code>7 semitonos</code>. Si das exactamente <strong>6 pasos</strong> hasta el lado opuesto del reloj (180°):<br>
          <code>6 × 7 semitonos = 42 semitonos</code> → al quitar las octavas completas (<code>42 − 36 = 6 semitonos</code>), ¡quedan exactamente <strong>6 semitonos = 1 TRITONO</strong>! Por eso <strong><code>C ↔ F#/Gb</code></strong> y <strong><code>G7 ↔ Db7</code></strong> están frente a frente a 180°: comparten exactamente las mismas dos notas guías (<code>B–F</code>) invertidas y son <strong>Sustitutos Tritonales</strong> intercambiables.
        </p>
      </div>
      <div class="card">
        <h4>3. ¿Qué es un Relativo (Mayor/Menor) y cómo se relaciona el <code>6 – 2 – 5 – 1</code>?</h4>
        <p class="text-xs">
          • <strong>Tonalidad Relativa:</strong> Son dos escalas (una Mayor y otra Menor) que <strong>usan exactamente las mismas 7 notas y la misma armadura</strong>. Para hallar el Relativo Menor de cualquier nota Mayor, solo baja <strong>3 semitonos</strong> (una 3ª menor, el 6º grado): <code>C Mayor → Am</code>, <code>G Mayor → Em</code>, <code>F Mayor → Dm</code>.<br>
          • <strong>La Cadena <code>6 – 2 – 5 – 1</code>:</strong> Observa las ramas del círculo superior (<code>Am [vi] → Dm [ii] → G7 [V7] → C [I]</code>): ¡es un deslizamiento continuo hacia la izquierda (en sentido antihorario) bajando por quintas justas hasta aterrizar en el centro <code>I</code>!
        </p>
      </div>
    </div>
    <div class="flex flex-wrap gap-2">
      <button type="button" class="btn-audio js-treatise-chord" data-mode="prog" data-groups="45,57,60,64|50,57,60,65|43,53,59,62|48,55,60,64" data-label="Cadena 6 - 2 - 5 - 1 en Do: Am7 (vi) → Dm7 (ii) → G7 (V7) → C (I)">🔊 Escuchar 6 → 2 → 5 → 1 (Am → Dm → G7 → C)</button>
      <button type="button" class="btn-audio js-treatise-chord" data-mode="prog" data-groups="50,57,60,65|43,53,59,65|49,53,59,65|48,52,55,59" data-label="Comparación Polo 180°: Dm7 → G7 → Cmaj7 vs. Dm7 → Db7 (Sustituto a 180°) → Cmaj7">🔊 Comparar G7 vs. Sustituto Tritonal Db7 (180°)</button>
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
  <div class="callout-box mt-6" style="border-left: 4px solid #a855f7;" data-nivel="3">
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
    <div class="flex flex-wrap gap-2 mb-5">
      <button type="button" class="btn-audio js-treatise-chord" data-mode="prog" data-groups="48,55,60,64|43,55,59,65|48,55,60,64|41,53,57,60|48,52,55,60|43,53,59,62|48,52,55,60" data-label="Feliz Cumpleaños Nivel 1: Armonía Básica (C - G7 - C - F - C - G7 - C)">🔊 Nivel 1: Básico (C – G7 – F)</button>
      <button type="button" class="btn-audio js-treatise-chord" data-mode="prog" data-groups="48,55,62,64|43,53,57,59,64|48,52,58,62|54,60,64,69|41,53,56,60,62|43,53,56,59,64|48,55,62,64,66" data-label="Feliz Cumpleaños Nivel Jazz/Cine: Cadd9 → G13 → C9 → F#m7b5 (Pico #11) → Fm6 → G7(b9,13) → Cmaj9(#11)">🔊 Nivel 2: Clímax con #11, IVm6 y Tensiones Glue</button>
    </div>

    <article class="interactive-widget mt-5" id="lab-piramide-tensiones" data-lab="tension-pyramid-visualizer" data-nivel="3">
      <div class="widget-header">
        <span class="widget-tag">Mapa Interactivo · 9 + 11 + 13 + Modulación Melódica</span>
        <h3>🔺 Pirámide Interactiva de Tensiones Disponibles (<code>9 + 11 + 13</code>)</h3>
        <p class="text-sm">Cuando una melodía sostiene la nota raíz (<strong>Línea Rosa</strong>), la 5ª (<strong>Línea Dorada</strong>) o la 3ª (<strong>Línea Cian</strong>), puedes rearmonizarla con cualquiera de los acordes de abajo sin perder el hilo melódico. Haz clic en cualquier círculo de la pirámide para escucharlo.</p>
      </div>
      <div class="lab-stage"></div>
    </article>
  </div>
  `;
}

function buildPolychordVsHybridMatrixHtml(): string {
  return `
  <div class="callout-box mt-6" style="border-left: 4px solid #ec4899;" data-nivel="4">
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
  <div class="callout-box mt-6" style="border-left: 4px solid #f97316;" data-nivel="3">
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
  <div class="callout-box mt-6" style="border-left: 4px solid #06b6d4;" data-nivel="4">
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

    <div class="card mb-2" style="border-left: 3px solid #ec4899;">
      <h4>🌳 ¿Qué son las Transformaciones Triádicas Neo-Riemannianas (<code>P, L, R, Slide</code>) y el Árbol Fractal?</h4>
      <p class="text-xs">
        En lugar de analizar acordes por función tonal (<code>I – IV – V</code>), la teoría Neo-Riemanniana mueve <strong>una sola nota</strong> de una tríada manteniendo las otras 2 fijas (<strong><em>Glue 2/3</em></strong>) para enlazar acordes aparentemente lejanos sin perder suavidad:<br>
        • <strong><code>P</code> (Paralela):</strong> Mantiene 1ª y 5ª fijas; mueve la 3ª <code>±1 semitono</code> (<code>C [C-E-G] ↔ Cm [C-Eb-G]</code>).<br>
        • <strong><code>L</code> (Leading-Tone Exchange):</strong> Mantiene 3ª y 5ª fijas; mueve la tónica <code>-1 semitono</code> (<code>C [C-E-G] ↔ Em [B-E-G]</code>).<br>
        • <strong><code>R</code> (Relativa):</strong> Mantiene 1ª y 3ª fijas; mueve la 5ª <code>+2 semitonos</code> (<code>C [C-E-G] ↔ Am [C-E-A]</code>).<br>
        • <strong><code>Slide</code> (Deslizamiento):</strong> Mantiene la 3ª fija en el centro (<code>E/Eb</code>) y mueve la 1ª y la 5ª <code>±1 st</code> (<code>C ↔ C#m</code>).<br>
        Explora justo arriba en el <strong>Laboratorio Tonnetz y Árboles Neo-Riemannianos</strong> tanto el <em>Árbol Genealógico de 3 Generaciones</em> como el <em>Árbol Radial Fractal 360°</em>: ¡haz clic en cualquier nodo para escuchar cada rama al instante!
      </p>
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
  <div class="callout-box mt-6" style="border-left: 4px solid #ef4444;" data-nivel="3">
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
  <div class="callout-box mt-6" style="border-left: 4px solid #f43f5e;" data-nivel="3">
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
  <div class="callout-box mt-6" style="border-left: 4px solid #6366f1;" data-nivel="3">
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

function buildInterval9thVisualizerSectionHtml(): string {
  return `
  <section id="t-visualizador-9nintervalos" class="module-section" data-cat="teoria" data-nivel="1-3" data-menu="3B. Visualizador de Intervalos y 9nas (1ª a 13ª) en Mástil">
    <div class="section-header">
      <span class="badge-level">Niveles 1–3 · Geometría Interválica y Tensiones</span>
      <h2>3B. Visualizador de Intervalos y 9nas en el Mástil (Simples y Compuestos: 1ª a 9ª, 11ª y 13ª)</h2>
      <p>
        Todo acorde extendido nace de comprender cómo se proyectan los <strong>intervalos simples</strong> (dentro de una octava: <code>2ª</code>, <code>3ª</code>, <code>4ª</code>, <code>5ª</code>, <code>6ª</code>, <code>7ª</code>) y cómo se transforman en <strong>intervalos compuestos o tensiones</strong> al cruzar la barrera de los 12 semitonos (<strong>La Regla del +7</strong>: <code>2ª + 7 = 9ª</code>, <code>4ª + 7 = 11ª</code>, <code>6ª + 7 = 13ª</code>).
      </p>
    </div>

    <div class="callout-box mt-4" style="border-left: 4px solid #6366f1;">
      <h3>📐 La Ley de la Octava (+7 Grados / +12 Semitonos): ¿Por qué una 2ª no suena igual que una 9ª?</h3>
      <p class="text-sm mb-3">
        Aunque la nota <code>Re</code> sobre una tónica <code>Do</code> es la misma clase de altura (<em>Pitch Class</em>), su comportamiento acústico cambia radicalmente según la octava en la que la coloques:
      </p>
      <div class="table-wrap mb-3">
        <table>
          <thead>
            <tr>
              <th>Intervalo Simple (Dentro de 1 Octava)</th>
              <th>Intervalo Compuesto (+1 Octava = +12 st)</th>
              <th>Efecto Acústico y Armónico</th>
              <th>Escuchar Comparación</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><strong>2ª Mayor (<code>2 st</code>)</strong> · Ej. <code>Do4–Re4</code></td>
              <td><strong>9ª Mayor (<code>14 st</code>)</strong> · Ej. <code>Do3–Re4</code></td>
              <td>En <code>2ª</code> cerrada crea un roce<em> cluster</em> íntimo; en <strong><code>9ª</code> abierta</strong> respira por encima de la 3ª y la 7ª dando amplitud cinematográfica.</td>
              <td><button type="button" class="btn-audio js-treatise-chord" data-mode="prog" data-groups="60,62,64,67|48,55,64,71,74" data-label="Comparación: 2ª cerrada (Cluster C-D-E) vs. 9ª abierta (Cmaj9)">🔊 2ª Cerrada vs. 9ª Abierta</button></td>
            </tr>
            <tr>
              <td><strong>2ª Menor (<code>1 st</code>) vs. ♭9 (<code>13 st</code>)</strong></td>
              <td><strong>9ª Menor <code>♭9</code> (<code>13 st</code>)</strong> · Ej. <code>Sol3–La♭4</code></td>
              <td>Sobre un acorde dominante (<code>V7(♭9)</code>), la <code>♭9</code> forma un acorde disminuido superior que empuja con dramatismo hacia la tónica menor o mayor.</td>
              <td><button type="button" class="btn-audio js-treatise-chord" data-mode="prog" data-groups="55,59,62,65,68|48,55,63,67" data-label="G7(b9) resolviendo a Cm">🔊 G7(♭9) → Cm</button></td>
            </tr>
            <tr>
              <td><strong>2ª Aumentada (<code>3 st</code>) vs. #9 (<code>15 st</code>)</strong></td>
              <td><strong>9ª Aumentada <code>#9</code> (<code>15 st</code>)</strong> · Ej. <code>Mi3–Sol#3–Re4–Sol4</code></td>
              <td>El famoso <em>Acorde Hendrix</em> (<code>E7#9</code>): conviven la <strong>3ª Mayor en el grave</strong> y la <strong>#9 (3ª menor enarmónica) en el agudo</strong> sin chocar gracias a la separación de octava.</td>
              <td><button type="button" class="btn-audio js-treatise-chord" data-mode="Simul" data-notes="40,56,62,67" data-label="E7(#9) — El Acorde Hendrix (convivencia 3M + #9)">🔊 E7(#9) Hendrix</button></td>
            </tr>
            <tr>
              <td><strong>4ª Justa/Aum (<code>5/6 st</code>) → 11ª / #11</strong></td>
              <td><strong>11ª Justa (<code>17 st</code>) y <code>#11</code> (<code>18 st</code>)</strong></td>
              <td>En acordes menores la <code>11ª justa</code> suena modal y abierta (Dórico); en acordes mayores o dominantes usamos la <strong><code>#11</code> Lidia</strong> para evitar el choque con la 3ª mayor.</td>
              <td><button type="button" class="btn-audio js-treatise-chord" data-mode="prog" data-groups="50,57,60,65,67|48,55,64,71,78" data-label="Dm11 (11ª Justa) → Cmaj7(#11) (#11 Lidia)">🔊 Dm11 → Cmaj7(#11)</button></td>
            </tr>
            <tr>
              <td><strong>6ª Mayor/Menor (<code>8/9 st</code>) → ♭13 / 13ª</strong></td>
              <td><strong>13ª Menor <code>♭13</code> (<code>20 st</code>) y 13ª Mayor (<code>21 st</code>)</strong></td>
              <td>La <code>13ª Mayor</code> corona al dominante de Jazz/Soul (<code>G13</code>), mientras que la <code>♭13</code> anticipa la caída a una tónica menor.</td>
              <td><button type="button" class="btn-audio js-treatise-chord" data-mode="prog" data-groups="43,53,59,64,69|43,53,59,64,68|48,55,60,63,67" data-label="G13 → G7(b13) → Cm9">🔊 G13 → G7(♭13) → Cm9</button></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <article class="interactive-widget mt-6" id="lab-visualizador-9nintervalos" data-lab="interval-9th-visualizer" data-nivel="2">
      <div class="widget-header">
        <span class="widget-tag">Laboratorio Interactivo · Mástil 6c / 4c</span>
        <h3>📐 Visualizador de Intervalos y 9nas (Simples y Compuestos: 1ª a 9ª, 11ª y 13ª)</h3>
        <p class="text-sm">Elige la nota raíz, selecciona cualquier intervalo simple o tensión compuesta (<code>♭9</code>, <code>9</code>, <code>#9</code>, <code>11</code>, <code>#11</code>, <code>♭13</code>, <code>13</code>), alterna entre <strong>Guitarra (6c)</strong> y <strong>Bajo (4c)</strong> y escucha el intervalo solo o dentro de un acorde con novena.</p>
      </div>
      <div class="lab-stage"></div>
    </article>
  </section>
  `;
}

function buildFretboardTriadsSectionHtml(sectionId: string, catId: string, menuTitle: string): string {
  return `
  <section id="${sectionId}" class="module-section" data-cat="${catId}" data-nivel="2-3" data-menu="${menuTitle}">
    <div class="section-header">
      <span class="badge-level">Niveles 2–3 · Arquitectura del Mástil</span>
      <h2>${menuTitle}</h2>
      <p>
        Dominar el mástil de punta a punta no consiste en memorizar acordes gigantes de 6 cuerdas con cejilla, sino en controlar las <strong>tríadas cerradas por grupos de 3 cuerdas adyacentes</strong> (Sets <code>1-2-3</code>, <code>2-3-4</code>, <code>3-4-5</code> y <code>4-5-6</code>) en sus <strong>3 estados de inversión</strong>, y las <strong>Tríadas Abiertas (Spread Triads / Drop 2)</strong> que saltean una cuerda intermedia.
      </p>
    </div>

    <div class="callout-box mt-4" style="border-left: 4px solid #f59e0b;">
      <h3>🎸 Las 3 Inversiones Horizontales y el Conector de <em>Voice Leading</em> en la Misma Zona</h3>
      <p class="text-sm mb-3">
        En cualquier grupo de 3 cuerdas (por ejemplo, las cuerdas agudas <code>3ª Sol – 2ª Si – 1ª Mi</code>), una misma tríada aparece <strong>3 veces a lo largo de los 12 trastes</strong> permutando el orden vertical de sus factores (<code>1–3–5</code>, <code>3–5–1</code>, <code>5–1–3</code>):
      </p>
      <div class="table-wrap mb-3">
        <table>
          <thead>
            <tr>
              <th>Inversión</th>
              <th>Orden Vertical (Grave → Agudo)</th>
              <th>Nota en el Bajo y en la Cima (Melodía)</th>
              <th>Carácter Sonoro y Uso Práctico</th>
              <th>Escuchar en Do Mayor</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><strong>Estado Fundamental</strong></td>
              <td><code>1 – 3 – 5</code> (Do – Mi – Sol)</td>
              <td>Bajo: <strong>Fundamental (1)</strong> · Cima: <strong>5ª Justa (5)</strong></td>
              <td>Estable, afirmativo y centrado. Ideal para abrir o cerrar frases.</td>
              <td><button type="button" class="btn-audio js-treatise-chord" data-mode="Simul" data-notes="60,64,67" data-label="C Mayor en Estado Fundamental (Do4-Mi4-Sol4)">🔊 Fundamental (1-3-5)</button></td>
            </tr>
            <tr>
              <td><strong>1ª Inversión</strong></td>
              <td><code>3 – 5 – 1</code> (Mi – Sol – Do)</td>
              <td>Bajo: <strong>3ª (3)</strong> · Cima: <strong>Fundamental (1)</strong></td>
              <td>Luminoso y melódico (la tónica brilla en la cuerda más aguda). Perfecto para enlazar bajos por grado conjunto.</td>
              <td><button type="button" class="btn-audio js-treatise-chord" data-mode="Simul" data-notes="64,67,72" data-label="C Mayor en 1ª Inversión (Mi4-Sol4-Do5)">🔊 1ª Inversión (3-5-1)</button></td>
            </tr>
            <tr>
              <td><strong>2ª Inversión</strong></td>
              <td><code>5 – 1 – 3</code> (Sol – Do – Mi)</td>
              <td>Bajo: <strong>5ª (5)</strong> · Cima: <strong>3ª (3)</strong></td>
              <td>Expresivo y cantabile (la 3ª, que define el modo mayor/menor, queda expuesta en la cima).</td>
              <td><button type="button" class="btn-audio js-treatise-chord" data-mode="Simul" data-notes="67,72,76" data-label="C Mayor en 2ª Inversión (Sol4-Do5-Mi5)">🔊 2ª Inversión (5-1-3)</button></td>
            </tr>
            <tr>
              <td><strong>Tríada Abierta (<em>Spread Triad</em>)</strong></td>
              <td><code>1 – 5 – 3</code> (+1 octava)</td>
              <td>Bajo en 5ª/6ª cuerda · 5ª en 4ª cuerda · <strong>3ª en 2ª cuerda</strong> (saltea la 3ª cuerda)</td>
              <td>El sonido clásico de Eric Johnson, Andy Summers y John Petrucci: intervalos de 5ª y 6ª que abren el registro como un piano.</td>
              <td><button type="button" class="btn-audio js-treatise-chord" data-mode="Simul" data-notes="48,55,64" data-label="Spread Triad de Do Mayor (Do3 - Sol3 - Mi4)">🔊 Spread Triad (1-5-10)</button></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <article class="interactive-widget mt-6" id="lab-${sectionId}" data-lab="fretboard-triads-visualizer" data-nivel="2">
      <div class="widget-header">
        <span class="widget-tag">Laboratorio Interactivo · Sets de 3 Cuerdas + Spread Triads</span>
        <h3>🎸 Visualizador de Tríadas en el Mástil (Estado Fundamental, 1ª y 2ª Inversión)</h3>
        <p class="text-sm">Selecciona la tónica, la cualidad (Mayor, Menor, Disminuida, Aumentada, Sus2, Sus4), el grupo de 3 cuerdas o <em>Spread Triad</em>, y alterna entre <strong>Guitarra (6c)</strong> y <strong>Bajo (4c)</strong> para visualizar y escuchar las 3 inversiones a lo largo del diapasón.</p>
      </div>
      <div class="lab-stage"></div>
    </article>
  </section>
  `;
}

function buildPolychordVisualizerSectionHtml(): string {
  return `
  <section id="h-visualizador-poliacordes" class="module-section" data-cat="armonia" data-nivel="3-4" data-menu="7B. Poliacordes (X | Y) y Upper Structures en el Mástil">
    <div class="section-header">
      <span class="badge-level">Niveles 3–4 · Armonía Extendida y Upper Structures</span>
      <h2>7B. Visualizador de Poliacordes (<code>Acorde Superior | Acorde Base</code>) y Tríadas de Estructura Superior (UST)</h2>
      <p>
        Un <strong>Poliacorde</strong> (escrito <code>Superior | Base</code>) consiste en tocar <strong>dos acordes independientes al mismo tiempo</strong>, apilados en dos pisos claros: un <strong>Acorde Base</strong> en el registro grave (ej. <code>C</code> o cascarón <code>C7</code>) y una <strong>Tríada Superior (<em>Upper Structure Triad</em>)</strong> en el registro agudo (ej. tríada de <code>D</code> o <code>F#</code>).
      </p>
      <div class="card mb-4" style="border-left: 3px solid #a855f7;">
        <h4>📐 ¿Cómo se forma un Poliacorde en 3 Pasos y en qué se diferencia de un Híbrido o Slash Chord?</h4>
        <p class="text-xs">
          1️⃣ <strong>Elige la Base Grave:</strong> Toca una tríada o cascarón (<code>1–3–7</code>) en el registro medio-grave respetando el <em>Low Interval Limit</em> (evita poner 3ª o 2ª muy cerradas debajo de Do3 para no enturbiar el sonido).<br>
          2️⃣ <strong>Elige una Tríada Superior según el color deseado:</strong> Si quieres color <strong>Lidio (<code>9, #11, 13</code>)</strong> sobre <code>C</code>, toca la tríada mayor que está a 1 tono arriba (<code>D = D–F#–A</code>). Si quieres un dominante simétrico explosivo sobre <code>C7</code>, toca la tríada a distancia de tritono (<code>F# | C7</code>).<br>
          3️⃣ <strong>Diferencia clave:</strong> En un <em>Slash Chord</em> (<code>C/E</code>) solo cambia la nota del bajo; en un <em>Acorde Híbrido</em> (<code>F/G</code>) el bajo es una nota suelta y se omite la 3ª del bajo; en un <strong>Poliacorde (<code>D | C</code>) ambos bloques mantienen su identidad completa como dos acordes simultáneos</strong>.
        </p>
      </div>
    </div>

    <div class="callout-box mt-4" style="border-left: 4px solid #a855f7;">
      <h3>🏛️ Las 6 Tríadas de Estructura Superior (<em>Upper Structure Triads</em>) más Poderosas</h3>
      <p class="text-sm mb-3">
        Cuando el acorde base es un <strong>Cascarón Dominante o Cuatríada</strong> en el registro grave (ej. <code>C7</code> = <code>Do–Mi–Si♭</code>) y superpones una tríada mayor o menor en las 3 cuerdas agudas, cada grado de la tríada superior activa automáticamente un paquete de tensiones:
      </p>
      <div class="table-wrap mb-3">
        <table>
          <thead>
            <tr>
              <th>Notación Poliacorde (<code>UST | Base</code>)</th>
              <th>Fórmula sobre el Bajo</th>
              <th>Tensiones Resultantes</th>
              <th>Escala / Color Asociado</th>
              <th>Escuchar Poliacorde</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><strong><code>D | C</code> o <code>D | Cmaj7</code></strong></td>
              <td>Tríada Mayor un tono arriba (<code>II | I</code>)</td>
              <td><strong><code>9ª</code>, <code>#11</code>, <code>13ª</code></strong></td>
              <td><strong>Lidio Cinematográfico</strong> (John Williams, Pat Metheny)</td>
              <td><button type="button" class="btn-audio js-treatise-chord" data-mode="Simul" data-notes="48,52,55,62,66,69" data-label="Poliacorde D | C (Cmaj13#11 Lidio)">🔊 D | C (Lidio #11)</button></td>
            </tr>
            <tr>
              <td><strong><code>D | C7</code> (UST II)</strong></td>
              <td>Tríada Mayor sobre el II de un Dominante</td>
              <td><strong><code>9ª</code>, <code>#11</code>, <code>13ª</code> sobre <code>♭7</code></strong></td>
              <td><strong>Lidio ♭7 (Overtone Scale)</strong> · Dominante brillante sin resolver</td>
              <td><button type="button" class="btn-audio js-treatise-chord" data-mode="Simul" data-notes="48,52,58,62,66,69" data-label="Poliacorde D | C7 (C13#11 Lidio b7)">🔊 D | C7 (UST II)</button></td>
            </tr>
            <tr>
              <td><strong><code>F# | C7</code> (UST ♯IV)</strong></td>
              <td>Tríada Mayor a distancia de Tritono (Polo de Bartók)</td>
              <td><strong><code>#11</code>, <code>♭7</code>, <code>♭9</code></strong></td>
              <td><strong>Simétrica Disminuida (Semitono-Tono)</strong> · El "Acorde de Petrushka" (Stravinsky)</td>
              <td><button type="button" class="btn-audio js-treatise-chord" data-mode="Simul" data-notes="48,52,58,66,70,73" data-label="Poliacorde F# | C7 (C7b9#11 — Petrushka / Disminuida)">🔊 F# | C7 (UST ♯IV)</button></td>
            </tr>
            <tr>
              <td><strong><code>Ab | C7</code> (UST ♭VI)</strong></td>
              <td>Tríada Mayor sobre la 6ª menor del Dominante</td>
              <td><strong><code>♭13</code>, <code>1</code>, <code>#9</code></strong></td>
              <td><strong>Escala Alterada (Superlocria)</strong> · Tensión máxima hacia tónica menor</td>
              <td><button type="button" class="btn-audio js-treatise-chord" data-mode="Simul" data-notes="48,52,58,68,72,75" data-label="Poliacorde Ab | C7 (C7#9b13 Alterado)">🔊 Ab | C7 (UST ♭VI)</button></td>
            </tr>
            <tr>
              <td><strong><code>Eb | C7</code> (UST ♭III)</strong></td>
              <td>Tríada Mayor sobre la 3ª menor del Dominante</td>
              <td><strong><code>#9</code>, <code>5ª</code>, <code>♭7</code></strong></td>
              <td><strong>Blues / Jazz-Rock</strong> · Convivencia feroz entre 3ª Mayor y #9</td>
              <td><button type="button" class="btn-audio js-treatise-chord" data-mode="Simul" data-notes="48,52,58,63,67,70" data-label="Poliacorde Eb | C7 (C7#9)">🔊 Eb | C7 (UST ♭III)</button></td>
            </tr>
            <tr>
              <td><strong><code>G | Cm7</code></strong></td>
              <td>Tríada Mayor del V sobre tónica menor</td>
              <td><strong><code>5ª</code>, <code>7ª Mayor</code>, <code>9ª</code></strong></td>
              <td><strong>Menor Melódica / Cine Noir</strong> (<code>Cm(maj9)</code>)</td>
              <td><button type="button" class="btn-audio js-treatise-chord" data-mode="Simul" data-notes="48,51,55,67,71,74" data-label="Poliacorde G | Cm (Cm(maj9) Noir)">🔊 G | Cm (Noir)</button></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <article class="interactive-widget mt-6" id="lab-visualizador-poliacordes" data-lab="polychord-visualizer" data-nivel="4">
      <div class="widget-header">
        <span class="widget-tag">Laboratorio Interactivo · Upper Structures + Mástil</span>
        <h3>🏛️ Visualizador de Poliacordes (<code>X | Y</code>) y Upper Structures</h3>
        <p class="text-sm">Combina cualquier <strong>Acorde Base (Graves)</strong> con cualquier <strong>Tríada de Estructura Superior (Agudos)</strong> o elige un preset de Jazz/Cine para analizar las tensiones resultantes (<code>9, #9, #11, ♭13, 13</code>) y ver el voicing separado por registros en el mástil.</p>
      </div>
      <div class="lab-stage"></div>
    </article>
  </section>
  `;
}

function buildNeighborChordsSectionHtml(): string {
  return `
  <section id="h-acordes-vecinos" class="module-section" data-cat="armonia" data-nivel="2-4" data-menu="8B. Acordes Vecinos (Neighbor Chords) y Bordaduras en Mástil">
    <div class="section-header">
      <span class="badge-level">Niveles 2–4 · Conducción de Voces y Movimiento en el Mástil</span>
      <h2>8B. Visualizador de Acordes Vecinos (<em>Neighbor Chords</em>) y Bordaduras Armónicas</h2>
      <p>
        Cuando una canción permanece varios compases sobre un mismo acorde (por ejemplo, 2 o 4 compases estáticos en <code>C Mayor</code> o <code>Am7</code>), tocar el mismo bloque rítmico cansa al oído. Un <strong>Acorde Vecino (<em>Neighbor Chord</em> o Bordadura Armónica)</strong> sale del acorde objetivo por <strong>grado conjunto (1 o 2 trastes)</strong> y regresa inmediatamente a él (<code>Acorde Objetivo → Vecino → Acorde Objetivo</code>), dando respiración y movimiento sin perder la estabilidad tonal.
      </p>
      <div class="card mb-4" style="border-left: 3px solid #38bdf8;">
        <h4>🧭 ¿Cómo sé si un acorde es Vecino y cómo se arma en 3 pasos?</h4>
        <p class="text-xs">
          <strong>¿Cómo identificarlo?</strong> Un acorde es <em>vecino</em> respecto a otro cuando sus notas están a una distancia mínima de <strong>1 o 2 semitonos</strong> de las notas del acorde central (o comparten un bajo pedal / 2 notas en común como en <code>P, L, R</code>) y su función no es iniciar una nueva progresión lejana, sino <strong>ornamentar al acorde principal y volver a él</strong>.<br>
          <strong>¿Cómo se arma? (3 métodos infalibles):</strong><br>
          1. <em>Deslizamiento paralelo (Side-Slipping):</em> Mueve tu postura completa <strong><code>+1</code> o <code>-1</code> traste</strong> en un tiempo débil y vuelve al acorde real en el tiempo fuerte (<code>Cm9 → C#m9 → Cm9</code>).<br>
          2. <em>Sobre Bajo Pedal:</em> Deja la raíz fija en el bajo y sube o baja las voces agudas un grado de la escala (<code>C → F/C → C</code>).<br>
          3. <em>Bordadura Disminuida o Neo-Riemanniana:</em> Mueve 1 sola voz por semitono (<code>C → Em → C</code>) o mete un disminuido auxiliar (<code>Cmaj7 → C°7 → Cmaj7</code>).
        </p>
      </div>
    </div>

    <div class="callout-box mt-4" style="border-left: 4px solid #38bdf8;">
      <h3>🧭 Las 5 Familias de Acordes Vecinos para Darle Vida a un Acorde Estático</h3>
      <div class="table-wrap mb-3">
        <table>
          <thead>
            <tr>
              <th>Familia de Acorde Vecino</th>
              <th>Mecánica de Voces / Trastes</th>
              <th>Ejemplo en Tónica <code>C</code> o <code>Cm7</code></th>
              <th>Escuchar Bordadura (Ida y Vuelta)</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><strong>1. Vecino Diatónico Superior (<code>IV/I</code> o <code>ii/I</code>)</strong></td>
              <td>Las voces superiores suben un grado diatónico mientras el bajo mantiene un <strong>Pedal de Tónica</strong>.</td>
              <td><code>C → F/C → C</code> o <code>C → Dm7/C → C</code></td>
              <td><button type="button" class="btn-audio js-treatise-chord" data-mode="prog" data-groups="48,55,60,64|48,57,60,65|48,55,60,64" data-label="Bordadura Diatónica sobre Pedal: C → F/C → C">🔊 C → F/C → C</button></td>
            </tr>
            <tr>
              <td><strong>2. Vecino Disminuido Auxiliar (<code>♯I°7</code> o <code>°7</code> con Fundamental Común)</strong></td>
              <td>Tres voces se mueven por semitono hacia el acorde disminuido vecino y regresan a la tríada o maj7.</td>
              <td><code>Cmaj7 → C°7 → Cmaj7</code> o <code>C → B°7/C → C</code></td>
              <td><button type="button" class="btn-audio js-treatise-chord" data-mode="prog" data-groups="48,55,59,64|48,54,57,63|48,55,59,64" data-label="Bordadura Disminuida: Cmaj7 → C°7 → Cmaj7">🔊 Cmaj7 → C°7 → Cmaj7</button></td>
            </tr>
            <tr>
              <td><strong>3. Vecino Cromático Paralelo (<em>Side-Slipping</em> <code>+1</code> o <code>-1</code> Traste)</strong></td>
              <td>Desliza <strong>exactamente el mismo molde de dedos 1 traste arriba o 1 traste abajo</strong> en tiempo débil y vuelve al traste original en tiempo fuerte.</td>
              <td><code>Cm7 (tr.3) → C#m7 (tr.4) → Cm7 (tr.3)</code></td>
              <td><button type="button" class="btn-audio js-treatise-chord" data-mode="prog" data-groups="48,55,58,63,67|49,56,59,64,68|48,55,58,63,67" data-label="Side-Slipping Cromático (+1 traste): Cm9 → C#m9 → Cm9">🔊 Cm9 → C#m9 → Cm9</button></td>
            </tr>
            <tr>
              <td><strong>4. Vecinos Neo-Riemannianos (<code>P</code>, <code>L</code>, <code>R</code>)</strong></td>
              <td>Mueve una sola voz de la tríada por 1 o 2 semitonos manteniendo <strong>2 notas en común (Glue 2/3)</strong>.</td>
              <td><code>C → Em → C</code> (Cambio L: Do baja a Si) o <code>C → Ab → C</code></td>
              <td><button type="button" class="btn-audio js-treatise-chord" data-mode="prog" data-groups="48,55,60,64|52,55,59,64|48,55,60,64" data-label="Vecino Neo-Riemanniano L: C → Em → C">🔊 C → Em → C (L)</button></td>
            </tr>
            <tr>
              <td><strong>5. Doble Bordadura Cromática (<em>Enclosure Armónico</em> <code>+1 → -1 → 0</code>)</strong></td>
              <td>Rodea al acorde objetivo primero 1 traste por encima, luego 1 traste por debajo y aterriza en el centro.</td>
              <td><code>Cm7 → Db7 → Bmaj7 → Cm7</code></td>
              <td><button type="button" class="btn-audio js-treatise-chord" data-mode="prog" data-groups="48,55,58,63|49,56,59,65|47,54,58,63|48,55,58,63" data-label="Enclosure Armónico: Cm7 → Db7 → Bmaj7 → Cm7">🔊 Enclosure Armónico</button></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <article class="interactive-widget mt-6" id="lab-acordes-vecinos" data-lab="neighbor-chords-visualizer" data-nivel="3">
      <div class="widget-header">
        <span class="widget-tag">Laboratorio Interactivo · Bordaduras + Side-Slipping en Mástil</span>
        <h3>🧭 Visualizador de Acordes Vecinos (<em>Neighbor Chords</em>) en el Mástil</h3>
        <p class="text-sm">Selecciona el acorde objetivo, elige entre las 5 familias de acordes vecinos, escucha la bordadura completa (<code>Objetivo → Vecino → Objetivo</code>) y compara los diagramas del mástil en <strong>Guitarra (6c)</strong> o <strong>Bajo (4c)</strong>.</p>
      </div>
      <div class="lab-stage"></div>
    </article>
  </section>
  `;
}

function buildGuitarStrummingSectionHtml(): string {
  return `
  <section id="ga-rasgueos" class="module-section" data-cat="guitarra-ac" data-nivel="1-2" data-menu="3B. Rasgueos (10 Ritmos) y Dedos 1–4">
    <div class="module-header">
      <span class="nav-badge badge-lvl1">Niveles 1–2 · Mano Derecha, 10 Ritmos y Dedos Mano Izquierda (1–4)</span>
      <h2 class="module-title">3B. Guitarra Acústica: Rasgueos (Pop, Balada, Funk, Reggae, Vals, Bossa, Rumba, Cumbia)</h2>
      <p class="module-subtitle">Domina el groove con el péndulo constante de mano derecha, apagados percusivos (<code>✕</code>) y la numeración de dedos de mano izquierda (<code>1</code> Índice · <code>2</code> Medio · <code>3</code> Anular · <code>4</code> Meñique) en el mástil.</p>
    </div>

    <div class="grid-cards mb-4">
      <div class="card">
        <h4>1. La Ley del Péndulo Constante</h4>
        <p class="text-xs">Tu muñeca derecha sube y baja <strong>siempre al mismo pulso constante</strong>: los tiempos fuertes (<code>1, 2, 3, 4</code>) van siempre <strong>hacia abajo (<code>↓</code>)</strong> y los contratiempos (<em>"y"</em>) van <strong>hacia arriba (<code>↑</code>)</strong>. Cuando un paso dice "Aire (<code>·</code>)", sigues moviendo la mano sin tocar las cuerdas.</p>
      </div>
      <div class="card">
        <h4>2. Dinámica, Apagado (<code>✕</code>) y Cambio al Vuelo</h4>
        <p class="text-xs">Frena las cuerdas con el canto de la mano derecha justo al golpear (<code>✕</code>) para imitar la caja en Funk, Rumba o Pop. Usa el último movimiento <code>↑</code> al aire para cambiar de acorde sin frenar el pulso.</p>
      </div>
      <div class="card">
        <h4>3. Dedos Mano Izquierda en Guitarra (<code>1–2–3–4</code>)</h4>
        <p class="text-xs">En todos los diagramas de acordes de guitarra verás círculos numerados: <strong><code>1</code> Índice</strong> (incluida cejilla), <strong><code>2</code> Medio</strong>, <strong><code>3</code> Anular</strong> y <strong><code>4</code> Meñique</strong>. Pisa justo detrás del traste metálico para sonar limpio con el mínimo esfuerzo.</p>
      </div>
    </div>

    <article class="interactive-widget mt-4" id="lab-rasgueos-guitarra" data-lab="guitar-strumming-lab" data-nivel="1">
      <div class="widget-header">
        <span class="widget-tag">Entrenador Interactivo de Rasgueos · 10 Estilos + Dedos 1–4</span>
        <h3>🎸 Laboratorio y Secuenciador de Rasgueos en Vivo</h3>
        <p class="text-sm">Elige entre <strong>10 estilos rítmicos</strong> (Pop, Balada, Funk Mute <code>✕</code>, Reggae, Vals 3/4, Folk 6/8, Punk, Bossa, Rumba, Cumbia/Vallenato), personaliza cualquier paso haciendo clic en <code>↓ / ↑ / ✕</code> y observa la posición exacta con dedos <code>1–4</code>.</p>
      </div>
      <div class="lab-stage"></div>
    </article>
  </section>
  `;
}

function buildGuitarDexterityAndMemorySectionHtml(): string {
  return `
  <section id="ga-motricidad-memoria" class="module-section" data-cat="guitarra-ac" data-nivel="1-3" data-menu="3C. Digitación BPM, Motricidad y Memorizador de Acordes">
    <div class="module-header">
      <span class="nav-badge badge-lvl1">Niveles 1–3 · Motricidad, Velocidad y Memoria en el Mástil</span>
      <h2 class="module-title">3C. Digitación por BPM, Ejercicios de Motricidad y Memorizador Aleatorio de Acordes</h2>
      <p class="module-subtitle">Dos entrenamientos prácticos diarios: independiza tus 4 dedos con el metrónomo progresivo (+5 BPM) y memoriza posiciones y nombres de acordes tocando sobre secuencias aleatorias.</p>
    </div>

    <div class="grid-cards mb-4">
      <div class="card">
        <h4>🖐️ Motricidad e Independencia (Dedos 1–2–3–4)</h4>
        <p class="text-xs">La velocidad real no nace de apretar más fuerte sino de relajar el pulgar trasero y mover solo el dedo que toca. Empieza lento (60–75 BPM) buscando cero trasteos y activa <strong>+5 BPM por vuelta</strong> cuando suene limpio.</p>
      </div>
      <div class="card">
        <h4>🧠 Método de 2 Fases para Recordar Acordes</h4>
        <p class="text-xs">En la <strong>Fase 1</strong> miras el nombre, ves los dedos <code>1–4</code> en el mástil y tocas encima. En la <strong>Fase 2</strong> desaparece el nombre del acorde: escúchalo, búscalo en tu guitarra y selecciona qué acorde está sonando.</p>
      </div>
    </div>

    <article class="interactive-widget mt-4" id="lab-digitacion-guitarra" data-lab="guitar-dexterity-lab" data-nivel="1">
      <div class="widget-header">
        <span class="widget-tag">Motricidad y Velocidad · 10 Ejercicios + Zoom de Mástil + Dedos 1–4</span>
        <h3>⚡ Gimnasio de Digitación en Guitarra (Araña, Permutaciones, Ligados y Barridos)</h3>
        <p class="text-sm">Elige entre <strong>10 rutinas progresivas</strong> (<code>1-2-3-4</code>, <code>1-3-2-4</code>, <code>1-4-2-3</code>, <code>4-3-2-1</code>, cruce en terceras, salto de cuerda, extensión, ligados H/P, arpegio Sweep y cambio de posición), haz zoom a la zona activa para ver botones grandes y alterna entre <strong>Dedos Grandes 1–4</strong> o notas con BPM progresivo.</p>
      </div>
      <div class="lab-stage"></div>
    </article>

    <article class="interactive-widget mt-5" id="lab-memoria-acordes" data-lab="chord-memory-lab" data-nivel="1">
      <div class="widget-header">
        <span class="widget-tag">Memoria Motora + Oído · Mástil con Zoom + Caja Vertical de Acorde</span>
        <h3>🎯 Entrenador y Memorizador Aleatorio de Acordes en el Mástil</h3>
        <p class="text-sm">Genera secuencias aleatorias (básicos, cejillas o jazz), repásalas en <strong>Fase 1</strong> con el mástil ampliado por zona y su <strong>Caja Vertical (1–4)</strong>, y pon a prueba tu oído en <strong>Fase 2</strong> tocando encima mientras ocultamos el nombre del acorde.</p>
      </div>
      <div class="lab-stage"></div>
    </article>
  </section>
  `;
}

function buildDailyTrainingSectionHtml(): string {
  return `
  <section id="entreno-diario" class="module-section" data-cat="guitarra-ac" data-nivel="1-3" data-menu="3D. Sesión Diaria de Entrenamiento (4 Instrumentos)">
    <div class="module-header">
      <span class="nav-badge badge-lvl2">Rutina Completa · 8 Bloques de Guitarra, Bajo, Batería y Canto</span>
      <h2 class="module-title">3D. Sesión de Entrenamiento Guiada (10, 20 o 30 Minutos)</h2>
      <p class="module-subtitle">Alterna entre <strong>Guitarra (8 ejercicios en 3 fases: motricidad, acordes con Caja Vertical y arpegios/ligados/tríadas)</strong>, Bajo Eléctrico, Batería y Canto con metrónomo guía integrado.</p>
    </div>

    <article class="interactive-widget mt-3" id="lab-sesion-entrenamiento" data-lab="daily-training-session-lab" data-preset="guitarra" data-nivel="1">
      <div class="widget-header">
        <span class="widget-tag">Entrenador Cronometrado · 4 Instrumentos + Zoom por Zona y Dedos 1–4</span>
        <h3>⏱️ Planificador y Temporizador de Práctica Diaria</h3>
        <p class="text-sm">Elige tu instrumento y duración, haz zoom a cualquier zona del mástil y completa cada bloque paso a paso sin perder el foco.</p>
      </div>
      <div class="lab-stage"></div>
    </article>
  </section>
  `;
}

function buildInstrumentSessionCalloutHtml(inst: 'guitarra' | 'bajo' | 'bateria' | 'canto', suffix: string): string {
  const labels: Record<string, string> = {
    guitarra: 'Guitarra (8 Ejercicios: Araña, Permutaciones, Cejillas, Fingerpicking PIMA, Ligados y Tríadas)',
    bajo: 'Bajo Eléctrico (Alternancia I–M, Lock-In y Walking)',
    bateria: 'Batería (Rudimentos, Gap Click, Ghost Notes y Fills)',
    canto: 'Canto (Appoggio 4-2-8, SOVT, Passaggio y Agilidad)',
  };
  return `
  <div class="callout-box guitar-card-clean mt-5" style="border-top:3px solid #10b981;" data-nivel="1">
    <h3>⏱️ Sesión Guiada de Entrenamiento — ${labels[inst]}</h3>
    <p class="text-xs mb-2">Practica con reloj real por bloques (10, 20 o 30 minutos) y metrónomo integrado adaptado a este instrumento:</p>
    <article class="interactive-widget mt-2" id="lab-sesion-${suffix}" data-lab="daily-training-session-lab" data-preset="${inst}" data-nivel="1">
      <div class="widget-header">
        <span class="widget-tag">Sesión de Práctica Diaria · ${inst.toUpperCase()}</span>
        <h4>Rutina Cronometrada Paso a Paso</h4>
      </div>
      <div class="lab-stage"></div>
    </article>
  </div>
  `;
}

function buildNotationWriterIntroAndLabHtml(preset: string): string {
  return `
  <div class="callout-box guitar-card-clean mt-6" style="border-top:3px solid #38bdf8;" data-nivel="1">
    <h3>🎼 Taller Interactivo de Escritura Musical, Band Charts y Arreglo Coral</h3>
    <p class="text-sm mb-3">
      Leer es solo la mitad del camino: escribir directamente sobre el pentagrama, cifrar con el <strong>Sistema Nashville</strong> para tu banda o repartir una melodía entre <strong>2, 3 o 4 voces</strong> fija la lectura para siempre.
    </p>
    <article class="interactive-widget mt-3" id="lab-escritor-pentagrama" data-lab="notation-writer-lab" data-preset="${preset}" data-nivel="1">
      <div class="widget-header">
        <span class="widget-tag">Escritor Interactivo · Sol / Fa / Do 3ª + Band Chart + 2/3/4 Voces</span>
        <h3>✍️ Estudio de Escritura Musical, Lead Sheet y Armonizador a 4 Voces</h3>
        <p class="text-sm">Alterna entre el escritor de pentagrama, el conversor de banda (Nashville + Kicks) y el armonizador coral/metales con detector de quintas paralelas.</p>
      </div>
      <div class="lab-stage"></div>
    </article>
  </div>
  `;
}

function buildBandChartAndVoicesSectionHtml(): string {
  return `
  <div class="callout-box mt-6" style="border-left: 4px solid #f472b6;" data-nivel="2">
    <h3>🎺 Escritura Práctica de Banda (<em>Lead Sheets</em>, <em>Kicks</em> y Nashville) + Arreglo Escrito a 2, 3 y 4 Voces</h3>
    <div class="grid-cards mb-3">
      <div class="card">
        <h4>1. El Chart Funcional (Sistema Nashville)</h4>
        <p class="text-xs">En ensayos o grabaciones de estudio, escribir los acordes como grados (<code>1 – 6m – 4 – 57</code>) permite que el guitarrista, bajista y tecladista cambien de tonalidad al vuelo si el cantante pide subir o bajar la canción.</p>
      </div>
      <div class="card">
        <h4>2. Cortes Rítmicos (<em>Kicks</em>)</h4>
        <p class="text-xs">Cuando toda la banda debe golpear exactamente un acento sincopado antes del estribillo, se dibujan rombos (<code>♦</code>) encima del pentagrama indicando el ritmo exacto sin obligar a leer cada nota.</p>
      </div>
      <div class="card">
        <h4>3. Arreglo Escrito a 2, 3 y 4 Voces</h4>
        <p class="text-xs">• <strong>2 Voces:</strong> Dueto por 3ªs o 6ªs paralelas.<br>• <strong>3 Voces:</strong> Tríada cerrada en metales o coros.<br>• <strong>4 Voces (Drop 2 / SATB):</strong> Baja la 2ª voz aguda una octava para abrir el espectro sin cruzar registros.</p>
      </div>
    </div>
    <article class="interactive-widget mt-4" id="lab-arreglo-banda-voces" data-lab="notation-writer-lab" data-preset="band" data-nivel="2">
      <div class="widget-header">
        <span class="widget-tag">Estudio de Arreglos · Band Chart + Armonizador 2/3/4 Voces</span>
        <h3>🎶 Conversor Nashville en Vivo y Armonizador Escrito a 2, 3 y 4 Voces</h3>
        <p class="text-sm">Transporta una progresión de banda en tiempo real, activa cortes rítmicos (<code>♦ Kicks</code>) o pasa a la pestaña de <strong>2, 3 y 4 Voces</strong> para escuchar y auditar cualquier melodía.</p>
      </div>
      <div class="lab-stage"></div>
    </article>
  </div>
  `;
}

function buildDrumProNotationGapAndKitHtml(): string {
  return `
  <div class="callout-box mt-6" style="border-left: 4px solid #38bdf8;" data-nivel="1">
    <h3>🥁 Notación de Batería en Pentagrama PAS Sincronizada, Gap Click, Sonido del Kit y Ejercicios de Práctica</h3>
    <p class="text-sm mb-3">
      Domina el estándar internacional PAS de lectura (<code>✕</code> arriba = Hi-Hat/Crash, espacio 3 = Caja/Tarola, espacio 1 = Bombo), pon a prueba tu reloj interno cuando desaparece el metrónomo, explora técnicas del kit y practica <strong>4 ejercicios de motricidad y coordinación</strong> en la pestaña 4.
    </p>
    <article class="interactive-widget mt-3" id="lab-bateria-pro" data-lab="drum-pro-lab" data-preset="staff" data-nivel="1">
      <div class="widget-header">
        <span class="widget-tag">Batería Completa · Pentagrama PAS + Gap Click + Sonido del Kit + Práctica</span>
        <h3>🥁 Pentagrama de Batería Sincronizado, Gap Click, Kit y Ejercicios de Práctica</h3>
        <p class="text-sm">Edita golpes en la rejilla PAS, entrena tu precisión en ms en <strong>Gap Click</strong>, prueba <strong>Sonido del Kit</strong> o practica singles, paradiddles e independencia en <strong>Ejercicios de Práctica</strong>.</p>
      </div>
      <div class="lab-stage"></div>
    </article>
  </div>
  `;
}

function buildBassLockInAndExpressiveHtml(): string {
  return `
  <div class="callout-box mt-6" style="border-left: 4px solid #f59e0b;" data-nivel="2">
    <h3>🔒 Laboratorio "Lock-In" Bajo + Bombo (4 y 5 Cuerdas) y Recursos Expresivos Avanzados</h3>
    <p class="text-sm mb-3">
      El verdadero peso de una banda ocurre cuando la envolvente del <strong>bajo y el bombo</strong> atacan y cortan exactamente en la misma subdivisión. Experimenta la diferencia entre tocar notas largas (<em>Legato/Sustain</em>), cortas (<em>Staccato</em>), anticipar un <code>-1/16</code> antes del compás o bajar a la 5ª cuerda grave (<code>B0</code>).
    </p>
    <article class="interactive-widget mt-3" id="lab-bajo-lock-in" data-lab="bass-lock-lab" data-preset="lock" data-nivel="2">
      <div class="widget-header">
        <span class="widget-tag">Groove Engine · Bombo + Bajo 4c/5c + Recursos Expresivos</span>
        <h3>🔒 Secuenciador "Lock-In" Bajo + Bombo y Técnicas Expresivas</h3>
        <p class="text-sm">Cambia entre 4 y 5 cuerdas (con <code>B0</code>), ajusta el BPM en vivo, alterna <em>Staccato vs. Sustain</em>, activa la anticipación <code>-1/16</code> o explora Armónicos, Décimas y Fretless en la 2ª pestaña.</p>
      </div>
      <div class="lab-stage"></div>
    </article>
  </div>
  `;
}

function buildBassExpressiveQuickJumpHtml(): string {
  return `
  <div class="callout-box mt-4" style="border-left: 4px solid #10b981;" data-nivel="3">
    <h3>✨ Recursos Expresivos del Bajista Moderno (Armónicos, Décimas, Glissando Fretless y Palm Mute)</h3>
    <p class="text-xs mb-2">
      Más allá de acompañar, el bajo eléctrico canta con <strong>armónicos naturales</strong> (trastes 12, 7 y 5), <strong>acordes en disposición abierta de décimas (<code>1–5–10</code>)</strong> y control de envolvente mediante <em>Palm Mute</em> junto al puente. Prueba todos los audios interactivos directamente en el laboratorio anterior (<a href="#lab-bajo-lock-in">ir a Lock-In y Recursos Expresivos</a>).
    </p>
  </div>
  `;
}

function buildVocalAgilityAndVowelLabHtml(): string {
  return `
  <div class="callout-box mb-5" style="border-left: 4px solid #ec4899;" data-nivel="1">
    <h3>🎤 Entrenamiento Vocal Completo: Respiración 4-2-8, SOVT, Agilidad y Modificación de Vocales</h3>
    <p class="text-sm mb-2">
      Todo cantante avanza seguro siguiendo este orden desde cero hasta avanzado:
    </p>
    <div class="grid-cards mb-3">
      <div class="card">
        <h4>Paso 1 · Motor y SOVT (Principiante)</h4>
        <p class="text-xs">Controla la salida del aire con el ciclo <strong>4–2–8 (Appoggio)</strong> y calienta con vibración de labios/pajilla (<strong>SOVT</strong>) para unir pecho y cabeza sin apretar la garganta.</p>
      </div>
      <div class="card">
        <h4>Paso 2 · Afinación y Vocales (Intermedio)</h4>
        <p class="text-xs">Entrena saltos limpios (<code>1–3–5–8</code>) y aprende a redondear las vocales (<code>/i/ → /ɪ/</code>, <code>/a/ → /ɔ/</code>) al subir al <em>Passaggio</em> para cantar agudos con libertad.</p>
      </div>
      <div class="card">
        <h4>Paso 3 · Agilidad y Melismas (Avanzado)</h4>
        <p class="text-xs">Dispara riffs y melismas en Pentatónica, Blues y Menor Armónica subiendo gradualmente de 60 a 145 BPM con limpieza nota por nota.</p>
      </div>
    </div>
    <article class="interactive-widget mt-3" id="lab-canto-agilidad-vocales" data-lab="vocal-agility-lab" data-preset="agility" data-nivel="1">
      <div class="widget-header">
        <span class="widget-tag">Entrenamiento Vocal · Melismas + Vocales + Respiración 4-2-8 & SOVT</span>
        <h3>🎤 Gimnasio de Melismas, Vocales en Passaggio, Respiración 4-2-8 y Afinación</h3>
        <p class="text-sm">Usa las 3 pestañas del laboratorio: <strong>1) Agilidad y Melismas</strong>, <strong>2) Modificación de Vocales</strong> y <strong>3) Temporizador Appoggio 4-2-8 + Ejercicios SOVT y Vibrato</strong>.</p>
      </div>
      <div class="lab-stage"></div>
    </article>
  </div>
  `;
}


