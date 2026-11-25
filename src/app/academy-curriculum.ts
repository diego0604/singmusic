export interface AcademyLessonRef {
  catId: string;
  sectionId: string;
  title: string;
  nivel: string;
}

export interface AcademyGraduationProject {
  badge: string;
  title: string;
  goal: string;
  deliverables: string[];
}

export interface AcademyStage {
  id: string;
  number: number;
  title: string;
  levelLabel: string;
  summary: string;
  topics: string[];
  lessons: AcademyLessonRef[];
  graduationProject: AcademyGraduationProject;
}

export interface AcademyLearningStep {
  catId: string;
  sectionId: string;
  title: string;
  badge: string;
}

export interface AcademyLearningPath {
  id: string;
  title: string;
  subtitle: string;
  steps: AcademyLearningStep[];
}

export interface AcademyChapterFrameworkStep {
  num: number;
  name: string;
  purpose: string;
}

export const CHAPTER_FRAMEWORK_10: AcademyChapterFrameworkStep[] = [
  { num: 1, name: 'Fundamento', purpose: 'Explicar el concepto desde cero.' },
  { num: 2, name: 'Teoría', purpose: 'Explicación formal y terminología.' },
  { num: 3, name: 'Visualización', purpose: 'Piano, mástil, pentagrama o diagramas.' },
  { num: 4, name: 'Escucha', purpose: 'Ejemplos sonoros comparativos.' },
  { num: 5, name: 'Laboratorio', purpose: 'Experimentación interactiva.' },
  { num: 6, name: 'Ejercicios', purpose: 'Práctica guiada y autónoma.' },
  { num: 7, name: 'Aplicación', purpose: 'Llevarlo al instrumento o composición.' },
  { num: 8, name: 'Evaluación', purpose: 'Comprobar que realmente se aprendió.' },
  { num: 9, name: 'Proyecto', purpose: 'Resolver un problema musical real.' },
  { num: 10, name: 'Repaso', purpose: 'Recuperación activa y repetición espaciada.' },
];

export const ACADEMY_STAGES: AcademyStage[] = [
  {
    id: 'etapa-0',
    number: 0,
    title: 'Etapa 0 — Alfabetización musical',
    levelLabel: 'Principiante absoluto',
    summary:
      'Primer contacto sin tecnicismos: qué es la música, pulso frente a ritmo y melodía, octavas, elección de instrumento y rutina diaria realista.',
    topics: [
      'Qué es la música',
      'Pulso, ritmo y melodía',
      'Notas y octavas',
      'Reconocimiento auditivo básico',
      'Primer contacto con un instrumento',
      'Hábitos de práctica y aprendizaje',
    ],
    lessons: [
      { catId: 'teoria', sectionId: 'intro', title: '0. Alfabetización Musical y Primer Contacto', nivel: '1' },
      { catId: 'teoria', sectionId: 't-sonido', title: '1. Sonido Intuitivo: Altura, Duración, Intensidad y Timbre', nivel: '1' },
      { catId: 'teoria', sectionId: 't-oido', title: '8. Reconocimiento Auditivo Básico', nivel: '1' },
    ],
    graduationProject: {
      badge: 'Principiante',
      title: 'Interpretar una canción sencilla con ritmo y afinación',
      goal: 'Sostener un pulso constante (60–80 BPM) y entonar o tocar una melodía corta de 4–5 notas sin perder el centro tonal.',
      deliverables: [
        'Marcar con palmas los 4 pulsos del compás durante 8 compases seguidos.',
        'Distinguir cuándo una nota sube, baja o salta una octava.',
        'Tocar o cantar una melodía sencilla de 5 notas sobre una referencia estable.',
      ],
    },
  },
  {
    id: 'etapa-1',
    number: 1,
    title: 'Etapa 1 — Fundamentos musicales',
    levelLabel: 'Bases sólidas',
    summary:
      'El alfabeto completo del lenguaje musical: las 12 notas, tonos y semitonos, ritmo desde cero con silencios y síncopa, escala mayor sin fórmulas oscuras y tonalidades.',
    topics: [
      'Notas, cifrado y enarmonía',
      'Tonos y semitonos',
      'Compases, figuras, silencios y subdivisiones',
      'Intervalos',
      'Escalas mayores, menores y pentatónicas',
      'Tonalidades, armaduras y lectura musical básica',
    ],
    lessons: [
      { catId: 'teoria', sectionId: 't-notas', title: '2. Notas, Tonos, Semitonos, #/♭ y Enarmonía', nivel: '1' },
      { catId: 'teoria', sectionId: 't-ritmo', title: '3. Ritmo Desde Cero: Figuras, Silencios, Síncopa y Compases', nivel: '1' },
      { catId: 'teoria', sectionId: 't-intervalos', title: '4. Intervalos: Medir y Escuchar Distancias', nivel: '1' },
      { catId: 'teoria', sectionId: 't-escalas', title: '5. Escala Mayor Intuitiva, Menor y Pentatónicas', nivel: '1' },
      { catId: 'teoria', sectionId: 't-tonalidades', title: '6. Tonalidad, Armaduras en 5 seg. y Círculo de Quintas', nivel: '1' },
      { catId: 'teoria', sectionId: 't-lectura', title: '7. Lectura Musical Básica en Pentagrama y Tablatura', nivel: '1' },
    ],
    graduationProject: {
      badge: 'Fundamentos',
      title: 'Transcribir y construir una melodía sencilla',
      goal: 'Elegir una tonalidad mayor o pentatónica, diseñar una frase rítmica de 4 compases en 4/4 y escribirla o cifrarla con claridad.',
      deliverables: [
        'Identificar la tonalidad leyendo una armadura con sostenidos o bemoles en menos de 5 segundos.',
        'Combinar negras, silencios de negra, corcheas y un puntillo o ligadura.',
        'Construir la escala correcta aplicando T–T–S–T–T–T–S y extraer su esqueleto pentatónico.',
      ],
    },
  },
  {
    id: 'etapa-2',
    number: 2,
    title: 'Etapa 2 — Dominio instrumental',
    levelLabel: 'Instrumentista',
    summary:
      'Técnica limpia en guitarra, bajo, batería, canto o vientos andinos: postura, coordinación de ambas manos, acordes, rasgueos, arpegios y repertorio.',
    topics: [
      'Técnica y postura',
      'Coordinación y digitación',
      'Acordes abiertos y cejillas',
      'Arpegios y rasgueos',
      'Repertorio e interpretación de canciones completas',
    ],
    lessons: [
      { catId: 'guitarra-ac', sectionId: 'ga-fundamentos', title: 'Guitarra Acústica: Postura, Afinación y Mano Derecha', nivel: '1' },
      { catId: 'guitarra-ac', sectionId: 'ga-acordes', title: 'Vocabulario de Acordes, Cejillas y CAGED', nivel: '2' },
      { catId: 'guitarra-ac', sectionId: 'ga-rasgueos', title: 'Rasgueos en 10 Estilos y Dedos 1–4', nivel: '1' },
      { catId: 'guitarra-ac', sectionId: 'ga-ritmo-fingerstyle', title: 'Arpegios PIMA y Fingerstyle', nivel: '2' },
      { catId: 'guitarra-ac', sectionId: 'ga-motricidad-memoria', title: 'Digitación BPM y Memorizador de Acordes', nivel: '1' },
      { catId: 'bajo', sectionId: 'b-fundamentos', title: 'Bajo 4 Cuerdas: Técnica y Simetría', nivel: '1' },
      { catId: 'bateria', sectionId: 'd-grooves', title: 'Batería: Grooves Esenciales y Lectura PAS', nivel: '1' },
      { catId: 'canto', sectionId: 'v-calentamiento', title: 'Canto: Respiración 4-2-8 y Calentamiento SOVT', nivel: '1' },
    ],
    graduationProject: {
      badge: 'Instrumentista',
      title: 'Interpretar 5 canciones completas',
      goal: 'Tocar o cantar 5 temas de principio a fin respetando forma, cambios de acorde a tiempo y dinámica constante.',
      deliverables: [
        'Ejecutar cambios limpios entre acordes abiertos y al menos 2 formas de cejilla sin frenar el pulso.',
        'Sostener el péndulo de mano derecha o el patrón de acompañamiento completo con metrónomo.',
        'Grabar una toma completa sin cortes de al menos 2 minutos por canción.',
      ],
    },
  },
  {
    id: 'etapa-3',
    number: 3,
    title: 'Etapa 3 — Armonía y lenguaje musical',
    levelLabel: 'Armonía',
    summary:
      'Cómo nacen los acordes apilando terceras, armonización de escalas, funciones armónicas (Tónica, Subdominante, Dominante), cadencias y conducción de voces.',
    topics: [
      'Construcción de tríadas',
      'Acordes de séptima',
      'Armonización de escalas',
      'Funciones armónicas',
      'Cadencias y progresiones',
      'Inversiones y conducción de voces',
    ],
    lessons: [
      { catId: 'armonia', sectionId: 'h-triadas', title: '1. Tríadas: Mayor, Menor, Disminuido y Aumentado', nivel: '1' },
      { catId: 'armonia', sectionId: 'h-triadas-mastil', title: '1B. Tríadas en el Mástil (3 Inversiones)', nivel: '2' },
      { catId: 'armonia', sectionId: 'h-septimas', title: '2. Cuatríadas y Acordes de Séptima', nivel: '2' },
      { catId: 'armonia', sectionId: 'h-diatonica', title: '7. Armonía Diatónica y Funciones Tonales', nivel: '1' },
      { catId: 'armonia', sectionId: 'h-cadencias', title: '8. Cadencias y Progresiones Arquetípicas', nivel: '1' },
      { catId: 'armonia', sectionId: 'h-ii-v-i', title: '9. El Motor ii–V–I y Cadenas Armónicas', nivel: '2' },
      { catId: 'armonia', sectionId: 'h-conduccion', title: '14. Conducción de Voces y Rearmonización', nivel: '3' },
    ],
    graduationProject: {
      badge: 'Armonía',
      title: 'Armonizar una melodía en diferentes tonalidades',
      goal: 'Tomar una melodía diatónica de 8 compases y rearmonizarla en al menos dos tonalidades (y con sustituciones funcionales) usando inversiones suaves.',
      deliverables: [
        'Asignar funciones Tónica, Subdominante y Dominante coherentes con cada nota fuerte.',
        'Evitar saltos bruscos usando inversiones (/3, /5) y notas guía 3ª–7ª.',
        'Transportar toda la armonización a una segunda tonalidad en menos de 2 minutos.',
      ],
    },
  },
  {
    id: 'etapa-4',
    number: 4,
    title: 'Etapa 4 — Intermedio y avanzado',
    levelLabel: 'Avanzado',
    summary:
      'Colores modales, dominantes secundarios, intercambio modal, sustitución tritonal, modulaciones, tensiones 9/11/13 e improvisación melódica consciente.',
    topics: [
      'Modos griegos y red de 14 modos',
      'Dominantes secundarios',
      'Intercambio modal',
      'Sustituciones tritonales',
      'Modulación',
      'Acordes extendidos (9, 11, 13)',
      'Improvisación sobre cambios armónicos',
    ],
    lessons: [
      { catId: 'armonia', sectionId: 'h-extensiones', title: '3. Pirámide Extendida (9, 11, 13)', nivel: '2' },
      { catId: 'armonia', sectionId: 't-visualizador-9nintervalos', title: '3B. Visualizador de Intervalos y 9nas/11nas/13nas', nivel: '2' },
      { catId: 'armonia', sectionId: 'h-alterados', title: '4. Dominantes Alterados (b9, #9, #11, b13)', nivel: '3' },
      { catId: 'armonia', sectionId: 'h-dominantes', title: '10. Dominantes Secundarios y Sustitución Tritonal', nivel: '3' },
      { catId: 'armonia', sectionId: 'h-modal', title: '11. Armonía Modal e Intercambio Modal', nivel: '3' },
      { catId: 'armonia', sectionId: 't-modos', title: '11B. Modos Griegos y Red de 14 Modos', nivel: '2' },
      { catId: 'armonia', sectionId: 'h-modulacion', title: '13. Modulación entre Tonalidades', nivel: '3' },
      { catId: 'guitarra-el', sectionId: 'ge-riffs-solos', title: 'Improvisación: Tríadas, Bordaduras y Fraseo', nivel: '3' },
    ],
    graduationProject: {
      badge: 'Avanzado',
      title: 'Improvisar sobre una progresión compleja',
      goal: 'Navegar una vuelta con dominantes secundarios, intercambio modal o ii–V–I modulante conectando las terceras y séptimas de cada acorde.',
      deliverables: [
        'Resaltar la nota característica modal (Lidio #4, Dórico 6, Mixolidio ♭7) en tiempo fuerte.',
        'Resolver una alteración dominante (♭9 o ♯9) hacia la tercera del acorde destino.',
        'Combinar motivos pentatónicos con tonos guía de los acordes de paso.',
      ],
    },
  },
  {
    id: 'etapa-5',
    number: 5,
    title: 'Etapa 5 — Composición y creatividad',
    levelLabel: 'Composición',
    summary:
      'Construcción de motivos, frases musicales, contrapunto y movimiento de voces, estructuras lineales y no lineales, prosodia y Taller Poético.',
    topics: [
      'Desarrollo de motivos y frases',
      'Melodía y contrapunto (paralelo, contrario, oblicuo)',
      'Estructura de canciones (lineales y no lineales)',
      'Escritura de letras, rima y métrica poética',
      'Composición armónica y por géneros',
    ],
    lessons: [
      { catId: 'composicion', sectionId: 'c-pensamiento', title: '1. Pensamiento Compositivo', nivel: '1' },
      { catId: 'composicion', sectionId: 'c-motivos-melodia', title: '2. Motivos y Diseño Melódico', nivel: '2' },
      { catId: 'composicion', sectionId: 'c-riffs-hooks', title: '3. Riffs, Ostinatos y Hooks', nivel: '2' },
      { catId: 'composicion', sectionId: 'c-contrapunto', title: '4. Contrapunto y Segundas Melodías', nivel: '3' },
      { catId: 'composicion', sectionId: 'c-estructura', title: '6. Estructura y Formas Musicales', nivel: '2' },
      { catId: 'composicion', sectionId: 'c-letra', title: '8. Letra, Prosodia y Métrica Poética', nivel: '2' },
      { catId: 'composicion', sectionId: 'c-taller-poetico', title: '10. Taller de Composición Poética', nivel: '1' },
      { catId: 'composicion', sectionId: 'c-desde-cero', title: '7. Flujo Completo de Composición', nivel: '2' },
    ],
    graduationProject: {
      badge: 'Composición',
      title: 'Escribir una canción completa con letra y estructura',
      goal: 'Crear una obra original con motivo melódico claro, progresión armónica intencional, forma definida y letra prosódicamente sólida.',
      deliverables: [
        'Definir una estructura consciente (ABABCB o no lineal / circular) con arco de tensión.',
        'Alinear acentos poéticos de la letra con los pulsos fuertes de la melodía.',
        'Presentar cifrado completo, melodía guía y letra final.',
      ],
    },
  },
  {
    id: 'etapa-6',
    number: 6,
    title: 'Etapa 6 — Arreglos y producción',
    levelLabel: 'Arreglos y mezcla',
    summary:
      'Reparto de roles entre instrumentos, escritura de banda (Nashville y Kicks), orquestación sin choques de registro, grabación, síntesis, mezcla y masterización.',
    topics: [
      'Instrumentación y orquestación',
      'Arreglos por secciones y texturas',
      'Grabación y microfonía',
      'MIDI y síntesis sonora',
      'Mezcla (EQ, compresión, espacio 3D) y masterización',
    ],
    lessons: [
      { catId: 'arreglos', sectionId: 'a-fundamentos', title: '1. Fundamentos del Arreglo y Roles de Banda', nivel: '2' },
      { catId: 'arreglos', sectionId: 'a-integracion', title: '2. Integración de Banda, Kicks y Nashville', nivel: '3' },
      { catId: 'arreglos', sectionId: 'a-vientos-orquestacion', title: '3. Vientos, Cuerdas y Transposición', nivel: '3' },
      { catId: 'arreglos', sectionId: 'a-generos', title: '4. Plantillas de Arreglo por Género', nivel: '3' },
      { catId: 'produccion', sectionId: 'p-fundamentos', title: '1. Acústica, Microfonía y Grabación', nivel: '2' },
      { catId: 'produccion', sectionId: 'p-mezcla', title: '2. Mezcla, EQ, Compresión y Espacio 3D', nivel: '3' },
    ],
    graduationProject: {
      badge: 'Arreglos',
      title: 'Crear un arreglo para varios instrumentos',
      goal: 'Arreglar una pieza para al menos 4 fuentes (base rítmica, bajo, armónico y melodía/coros) sin enmascaramiento de frecuencias.',
      deliverables: [
        'Asignar a cada instrumento una banda de frecuencia y función rítmica distinta.',
        'Aplicar al menos dos cambios de textura (ej. 3+1, colchón coral o apertura en embudo).',
        'Balancear volúmenes y panorama estéreo hasta obtener un demo claro y legible.',
      ],
    },
  },
  {
    id: 'etapa-7',
    number: 7,
    title: 'Etapa 7 — Maestría musical',
    levelLabel: 'Nivel experto',
    summary:
      'Armonía avanzada (poliacordes, voicings Drop/cuartales, Neorriemanniana, ejes simétricos), análisis de obras completas, contrapunto y producción integral de autor.',
    topics: [
      'Análisis de obras complejas',
      'Armonía avanzada y poliacordes',
      'Conducción de voces y cromatismo',
      'Dirección y arreglo profesional',
      'Producción de obra original con lenguaje propio',
    ],
    lessons: [
      { catId: 'armonia', sectionId: 'h-poli-hibridos', title: '5. Acordes Híbridos y Poliacordes', nivel: '3' },
      { catId: 'armonia', sectionId: 'h-visualizador-poliacordes', title: '7B. Upper Structures (UST | Base)', nivel: '3' },
      { catId: 'armonia', sectionId: 'h-voicings', title: '6. Voicings, Drops y Armonía Cuartal', nivel: '3' },
      { catId: 'armonia', sectionId: 'h-neoriemann', title: '12. Teoría Neorriemanniana (P, L, R) y Ejes', nivel: '4' },
      { catId: 'armonia', sectionId: 'h-acordes-vecinos', title: '8B. Acordes Vecinos y Bordaduras Armónicas', nivel: '3' },
      { catId: 'composicion', sectionId: 'c-ejemplo', title: '9. Análisis de Obra Completa', nivel: '3' },
      { catId: 'produccion', sectionId: 'pr-proyectos', title: '3. Proyectos Integradores Master', nivel: '3' },
    ],
    graduationProject: {
      badge: 'Experto',
      title: 'Componer, arreglar, interpretar, grabar y producir una obra original',
      goal: 'Integrar composición, armonía avanzada, arreglo multi-instrumento, interpretación expresiva y mezcla final en una obra completa con identidad propia.',
      deliverables: [
        'Partitura o guía maestra con forma, armonía documentada y arreglo de secciones.',
        'Grabación o maqueta multipista con interpretación humana de al menos un instrumento principal o voz.',
        'Mezcla final balanceada con contraste dinámico real entre introducción, desarrollo y clímax.',
      ],
    },
  },
];

export const ACADEMY_LEARNING_PATHS: AcademyLearningPath[] = [
  {
    id: 'cero-a-musico',
    title: '🌱 De Cero a Músico Completo',
    subtitle:
      'Empieza desde Etapa 0 sin conocimientos previos: pulso, notas, ritmo real, escala mayor intuitiva, intervalos, tonalidades y tríadas.',
    steps: [
      { catId: 'teoria', sectionId: 'intro', title: '0. Alfabetización Musical y Primer Contacto', badge: 'Etapa 0' },
      { catId: 'teoria', sectionId: 't-sonido', title: '1. Sonido Intuitivo: Altura, Duración y Timbre', badge: 'Etapa 0' },
      { catId: 'teoria', sectionId: 't-notas', title: '2. Notas, Tonos, Semitonos y Alteraciones', badge: 'Etapa 1' },
      { catId: 'teoria', sectionId: 't-ritmo', title: '3. Ritmo Desde Cero: Figuras, Silencios y Síncopa', badge: 'Etapa 1' },
      { catId: 'teoria', sectionId: 't-intervalos', title: '4. Intervalos Básicos (2ª a 8ª)', badge: 'Etapa 1' },
      { catId: 'teoria', sectionId: 't-escalas', title: '5. Escala Mayor Intuitiva, Menor y Pentatónicas', badge: 'Etapa 1' },
      { catId: 'teoria', sectionId: 't-tonalidades', title: '6. Tonalidad, Armaduras en 5 seg. y Círculo', badge: 'Etapa 1' },
      { catId: 'armonia', sectionId: 'h-triadas', title: 'Tríadas: Cómo Nacen los Acordes', badge: 'Etapa 3' },
    ],
  },
  {
    id: 'ruta-guitarra-completa',
    title: '🎸 Ruta Guitarra Completa (8 Fases)',
    subtitle:
      'De fundamentos musicales hasta improvisación modal, repertorio e interpretación avanzada en 6 cuerdas.',
    steps: [
      { catId: 'teoria', sectionId: 't-notas', title: '1. Fundamentos musicales (Notas, Ritmo y Escala Mayor)', badge: 'Fase 1' },
      { catId: 'guitarra-ac', sectionId: 'ga-motricidad-memoria', title: '2. Técnica de guitarra (Digitación 1–4 y Motricidad)', badge: 'Fase 2' },
      { catId: 'guitarra-ac', sectionId: 'ga-rasgueos', title: '3. Acordes y acompañamiento (Rasgueos y Cejillas)', badge: 'Fase 3' },
      { catId: 'guitarra-el', sectionId: 'ge-escalas-modos', title: '4. Escalas y arpegios en el mástil (Pentatónicas y CAGED)', badge: 'Fase 4' },
      { catId: 'armonia', sectionId: 'h-triadas-mastil', title: '5. Armonía aplicada (Tríadas e Inversiones por 3 cuerdas)', badge: 'Fase 5' },
      { catId: 'guitarra-el', sectionId: 'ge-riffs-solos', title: '6. Improvisación (Tonos guía, bordaduras y phrasing)', badge: 'Fase 6' },
      { catId: 'guitarra-ac', sectionId: 'ga-composicion', title: '7. Repertorio y composición en guitarra', badge: 'Fase 7' },
      { catId: 'guitarra-el', sectionId: 'ge-tecnica-avanzada', title: '8. Interpretación avanzada (Bending, skips y secuencias)', badge: 'Fase 8' },
    ],
  },
  {
    id: 'ruta-maestria-teorica',
    title: '🎼 Teoría, Contrapunto y Maestría (8 Fases)',
    subtitle:
      'Recorrido integral de músico compositor y arreglista: oído, melodía, armonía, forma, contrapunto y producción.',
    steps: [
      { catId: 'teoria', sectionId: 't-escalas', title: '1. Fundamentos musicales (Escalas, Intervalos y Tonalidades)', badge: 'Fase 1' },
      { catId: 'teoria', sectionId: 't-oido', title: '2. Entrenamiento auditivo funcional', badge: 'Fase 2' },
      { catId: 'teoria', sectionId: 't-ritmo', title: '3. Melodía y ritmo (Subdivisión, síncopa y métricas)', badge: 'Fase 3' },
      { catId: 'armonia', sectionId: 'h-diatonica', title: '4. Armonía funcional, cadencias y modulaciones', badge: 'Fase 4' },
      { catId: 'composicion', sectionId: 'c-estructura', title: '5. Forma musical (Lineal y no lineal)', badge: 'Fase 5' },
      { catId: 'composicion', sectionId: 'c-contrapunto', title: '6. Contrapunto y conducción de voces', badge: 'Fase 6' },
      { catId: 'composicion', sectionId: 'c-ejemplo', title: '7. Composición avanzada y análisis completo', badge: 'Fase 7' },
      { catId: 'arreglos', sectionId: 'a-vientos-orquestacion', title: '8. Orquestación y producción final', badge: 'Fase 8' },
    ],
  },
  {
    id: 'bajo',
    title: '🎸 Bajista y Lock-In con Batería',
    subtitle: 'Fundamentos en 4/5 cuerdas, muteo profesional, enlace bajo-bombo y walking bass.',
    steps: [
      { catId: 'teoria', sectionId: 't-notas', title: 'Notas y Enarmonía en el Mástil', badge: 'N1' },
      { catId: 'teoria', sectionId: 't-ritmo', title: 'Subdivisión Rítmica y Síncopa', badge: 'N1–N2' },
      { catId: 'bajo', sectionId: 'b-fundamentos', title: 'Fundamentos del Bajo Eléctrico', badge: 'N1' },
      { catId: 'bajo', sectionId: 'b-mutear-articulacion', title: 'Floating Thumb, Muteo y Slap', badge: 'N2–N3' },
      { catId: 'bajo', sectionId: 'b-bajo-bateria', title: 'Lock-In Bajo + Bombo y Recursos Expresivos', badge: 'N2–N3' },
      { catId: 'bajo', sectionId: 'b-armonia', title: 'Tríadas, Arpegios y Walking Bass', badge: 'N2–N3' },
    ],
  },
  {
    id: 'bateria',
    title: '🥁 Batería, Notación PAS y Tempo Interno',
    subtitle: 'Rudimentos, lectura de pentagrama sincronizada, Gap Click y técnicas del kit.',
    steps: [
      { catId: 'teoria', sectionId: 't-ritmo', title: 'Pulso, Figuras y Síncopa', badge: 'N1' },
      { catId: 'bateria', sectionId: 'd-fundamentos', title: 'Rudimentos, Agarre y Ghost Notes', badge: 'N1–N2' },
      { catId: 'bateria', sectionId: 'd-grooves', title: 'Grooves Esenciales y Pentagrama PAS', badge: 'N1–N3' },
      { catId: 'bateria', sectionId: 'd-fills-transiciones', title: 'Fills, Transiciones y Gap Click', badge: 'N2–N3' },
      { catId: 'bateria', sectionId: 'd-independencia', title: 'Independencia de 4 Extremidades', badge: 'N3–N4' },
    ],
  },
  {
    id: 'canto-arreglo',
    title: '🎤 Canto, Melismas y Arreglo a Voces',
    subtitle: 'Respiración, detector de tesitura, calentamiento SOVT, agilidad vocal, modificación de vocales y armonización a 2–4 voces.',
    steps: [
      { catId: 'canto', sectionId: 'v-fundamentos', title: '1. Respiración Costo-Diafragmática y Anatomía Vocal', badge: 'N1' },
      { catId: 'canto', sectionId: 'v-detector-tesitura', title: '2. Descubre tu Tesitura y 6 Ejercicios Fundamentales', badge: 'N1' },
      { catId: 'canto', sectionId: 'v-calentamiento', title: '3. Calentamiento SOVT, Autodiagnóstico y Rutina Diaria', badge: 'N1–N2' },
      { catId: 'canto', sectionId: 'v-afinacion-registros', title: '4. Registros, Passaggio y Afinación SATB', badge: 'N2–N3' },
      { catId: 'canto', sectionId: 'v-interpretacion-estilos', title: '5. Agilidad Melismática, Vocales e Interpretación', badge: 'N2–N3' },
      { catId: 'canto', sectionId: 'v-armonia-vocal', title: '6. Armonía Vocal y Coro a 2–4 Voces (SATB)', badge: 'N3' },
    ],
  },
];

// Sections originally located in teoria that pedagogically belong to Etapa 4 (Armonía)
export const RELOCATED_SECTION_TARGET_CATEGORY: Record<string, string> = {
  't-visualizador-9nintervalos': 'armonia',
  't-modos': 'armonia',
};

export interface TeoriaOrderConfig {
  id: string;
  menuTitle: string;
}

export const TEORIA_PEDAGOGICAL_ORDER: TeoriaOrderConfig[] = [
  { id: 'intro', menuTitle: '0. Etapa 0: Alfabetización Musical' },
  { id: 't-sonido', menuTitle: '1. Sonido Intuitivo y Armónicos' },
  { id: 't-notas', menuTitle: '2. Notas, Tonos, Semitonos y Alteraciones' },
  { id: 't-ritmo', menuTitle: '3. Ritmo Desde Cero y Compases' },
  { id: 't-intervalos', menuTitle: '4. Intervalos Básicos (2ª a 8ª)' },
  { id: 't-escalas', menuTitle: '5. Escala Mayor Intuitiva, Menor y Pentatónicas' },
  { id: 't-tonalidades', menuTitle: '6. Tonalidad, Armaduras y Círculo de Quintas' },
  { id: 't-lectura', menuTitle: '7. Lectura Musical Básica' },
  { id: 't-oido', menuTitle: '8. Entrenamiento Auditivo Funcional' },
];

export const CANTO_PEDAGOGICAL_ORDER: TeoriaOrderConfig[] = [
  { id: 'v-fundamentos', menuTitle: '1. Respiración, Anatomía Vocal y Apoyo (Appoggio)' },
  { id: 'v-detector-tesitura', menuTitle: '2. Descubre tu Tesitura (Micrófono) y 6 Ejercicios Fundamentales' },
  { id: 'v-calentamiento', menuTitle: '3. Calentamiento Vocal SOVT, Autodiagnóstico y Rutina Diaria' },
  { id: 'v-afinacion-registros', menuTitle: '4. Registros, Passaggio y Afinación SATB' },
  { id: 'v-interpretacion-estilos', menuTitle: '5. Agilidad Melismática, Vocales, Vibrato e Interpretación' },
  { id: 'v-armonia-vocal', menuTitle: '6. Armonía Vocal (2, 3 y 4 Voces / SATB)' },
];

function stripDuplicateCantoLegacy(html: string): string {
  return html
    .replace(/<div[^>]*data-usar="canto-legacy"[^>]*>[\s\S]*?<\/div>/gi, '')
    .replace(/<article[^>]*data-usar="canto-legacy"[^>]*>[\s\S]*?<\/article>/gi, '')
    .replace(/<!--\s*USAR:canto-legacy\s*-->/gi, '');
}

export interface ParsedHtmlSection {
  id: string;
  menuTitle: string;
  nivel: string;
  html: string;
}

/**
 * Splits a category HTML string into individual <section ...>...</section> entries.
 * Safe because the encyclopedia never nests <section> inside <section>.
 */
export function splitHtmlSections(html: string): ParsedHtmlSection[] {
  const result: ParsedHtmlSection[] = [];
  const regex = /<section\b([^>]*)>([\s\S]*?)<\/section>/g;
  let match: RegExpExecArray | null;
  while ((match = regex.exec(html)) !== null) {
    const attrs = match[1] || '';
    const id = attrs.match(/\bid="([^"]+)"/)?.[1] || '';
    const menuTitle = attrs.match(/\bdata-menu="([^"]*)"/)?.[1] || id;
    const nivel = attrs.match(/\bdata-nivel="([^"]*)"/)?.[1] || '1';
    result.push({
      id,
      menuTitle,
      nivel,
      html: match[0],
    });
  }
  return result;
}

function updateSectionAttributes(
  sectionHtml: string,
  updates: { catId?: string; menuTitle?: string; nivel?: string }
): string {
  return sectionHtml.replace(/^<section\b([^>]*)>/, (_full, attrs: string) => {
    let nextAttrs = attrs;
    if (updates.catId) {
      if (/\bdata-cat="[^"]*"/.test(nextAttrs)) {
        nextAttrs = nextAttrs.replace(/\bdata-cat="[^"]*"/, `data-cat="${updates.catId}"`);
      } else {
        nextAttrs += ` data-cat="${updates.catId}"`;
      }
    }
    if (updates.menuTitle) {
      if (/\bdata-menu="[^"]*"/.test(nextAttrs)) {
        nextAttrs = nextAttrs.replace(/\bdata-menu="[^"]*"/, `data-menu="${updates.menuTitle}"`);
      } else {
        nextAttrs += ` data-menu="${updates.menuTitle}"`;
      }
    }
    if (updates.nivel) {
      if (/\bdata-nivel="[^"]*"/.test(nextAttrs)) {
        nextAttrs = nextAttrs.replace(/\bdata-nivel="[^"]*"/, `data-nivel="${updates.nivel}"`);
      } else {
        nextAttrs += ` data-nivel="${updates.nivel}"`;
      }
    }
    return `<section${nextAttrs}>`;
  });
}

/**
 * Applies Stage 1 pedagogical reordering and relocation:
 * - Teoría follows the beginner-first order (Etapa 0 -> Sonido -> Notas -> Ritmo -> Escalas -> Intervalos -> Tonalidades -> Lectura -> Oído)
 * - Moves 3B (t-visualizador-9nintervalos) and 5 (t-modos) into Armonía (Etapa 4)
 * - Supports optional per-section upgrade callback without creating duplicate IDs
 */
export function assembleAcademyCategoryHtml(
  catId: string,
  enrichedCategoryHtml: string,
  enrichedTeoriaHtml?: string,
  upgradeSectionFn?: (sectionId: string, sectionHtml: string) => string
): string {
  const applyUpgrade = (id: string, html: string) => (upgradeSectionFn ? upgradeSectionFn(id, html) : html);

  if (catId === 'teoria') {
    const parsed = splitHtmlSections(enrichedCategoryHtml);
    const byId = new Map<string, ParsedHtmlSection>();
    for (const s of parsed) {
      if (!RELOCATED_SECTION_TARGET_CATEGORY[s.id]) {
        byId.set(s.id, s);
      }
    }

    const ordered: string[] = [];
    for (const cfg of TEORIA_PEDAGOGICAL_ORDER) {
      const found = byId.get(cfg.id);
      if (found) {
        let updated = updateSectionAttributes(found.html, { menuTitle: cfg.menuTitle });
        updated = applyUpgrade(cfg.id, updated);
        ordered.push(updated);
        byId.delete(cfg.id);
      }
    }
    for (const leftover of byId.values()) {
      ordered.push(applyUpgrade(leftover.id, leftover.html));
    }
    return ordered.join('\n');
  }

  if (catId === 'armonia') {
    const parsedArmonia = splitHtmlSections(enrichedCategoryHtml);
    const relocatedFromTeoria = enrichedTeoriaHtml
      ? splitHtmlSections(enrichedTeoriaHtml).filter((s) => RELOCATED_SECTION_TARGET_CATEGORY[s.id] === 'armonia')
      : [];

    const sec9th = relocatedFromTeoria.find((s) => s.id === 't-visualizador-9nintervalos');
    const secModes = relocatedFromTeoria.find((s) => s.id === 't-modos');

    const alreadyHas9th = parsedArmonia.some((s) => s.id === 't-visualizador-9nintervalos');
    const alreadyHasModes = parsedArmonia.some((s) => s.id === 't-modos');

    const result: string[] = [];
    for (const sec of parsedArmonia) {
      result.push(applyUpgrade(sec.id, sec.html));
      if (sec.id === 'h-extensiones' && sec9th && !alreadyHas9th) {
        result.push(
          updateSectionAttributes(sec9th.html, {
            catId: 'armonia',
            menuTitle: '3B. Intervalos Compuestos y Tensiones (9, 11, 13)',
            nivel: '2-3',
          })
        );
      }
      if (sec.id === 'h-modal' && secModes && !alreadyHasModes) {
        result.push(
          updateSectionAttributes(secModes.html, {
            catId: 'armonia',
            menuTitle: '11B. Modos Griegos y Red de 14 Modos',
            nivel: '2-4',
          })
        );
      }
    }
    return result.join('\n');
  }

  if (catId === 'canto') {
    const parsed = splitHtmlSections(enrichedCategoryHtml);
    const byId = new Map<string, ParsedHtmlSection>();
    for (const s of parsed) {
      byId.set(s.id, s);
    }

    const ordered: string[] = [];
    for (const cfg of CANTO_PEDAGOGICAL_ORDER) {
      const found = byId.get(cfg.id);
      if (found) {
        let updated = updateSectionAttributes(stripDuplicateCantoLegacy(found.html), {
          menuTitle: cfg.menuTitle,
        });
        updated = applyUpgrade(cfg.id, updated);
        ordered.push(updated);
        byId.delete(cfg.id);
      }
    }
    for (const leftover of byId.values()) {
      ordered.push(applyUpgrade(leftover.id, stripDuplicateCantoLegacy(leftover.html)));
    }
    return ordered.join('\n');
  }

  if (catId === 'all') {
    // In 'all', avoid duplicating relocated sections and reorder teoria + canto sections cleanly
    const allSections = splitHtmlSections(enrichedCategoryHtml);
    const teoriaOrderedIds = new Set(TEORIA_PEDAGOGICAL_ORDER.map((x) => x.id));
    const cantoOrderedIds = new Set(CANTO_PEDAGOGICAL_ORDER.map((x) => x.id));
    const teoriaMap = new Map<string, ParsedHtmlSection>();
    const cantoMap = new Map<string, ParsedHtmlSection>();
    const nonTeoria: ParsedHtmlSection[] = [];
    let sec9th: ParsedHtmlSection | undefined;
    let secModes: ParsedHtmlSection | undefined;
    let cantoSlotInserted = false;

    for (const sec of allSections) {
      if (sec.id === 't-visualizador-9nintervalos') {
        sec9th = sec;
      } else if (sec.id === 't-modos') {
        secModes = sec;
      } else if (teoriaOrderedIds.has(sec.id)) {
        teoriaMap.set(sec.id, sec);
      } else if (cantoOrderedIds.has(sec.id)) {
        cantoMap.set(sec.id, sec);
        if (!cantoSlotInserted) {
          cantoSlotInserted = true;
          nonTeoria.push({ id: '__CANTO_SLOT__', menuTitle: '', nivel: '1', html: '' });
        }
      } else {
        nonTeoria.push(sec);
      }
    }

    const out: string[] = [];
    for (const cfg of TEORIA_PEDAGOGICAL_ORDER) {
      const s = teoriaMap.get(cfg.id);
      if (s) {
        out.push(applyUpgrade(cfg.id, updateSectionAttributes(s.html, { menuTitle: cfg.menuTitle })));
      }
    }
    for (const sec of nonTeoria) {
      if (sec.id === '__CANTO_SLOT__') {
        for (const cfg of CANTO_PEDAGOGICAL_ORDER) {
          const cs = cantoMap.get(cfg.id);
          if (cs) {
            out.push(
              applyUpgrade(
                cfg.id,
                updateSectionAttributes(stripDuplicateCantoLegacy(cs.html), { menuTitle: cfg.menuTitle })
              )
            );
          }
        }
        continue;
      }
      out.push(applyUpgrade(sec.id, sec.html));
      if (sec.id === 'h-extensiones' && sec9th) {
        out.push(
          updateSectionAttributes(sec9th.html, {
            catId: 'armonia',
            menuTitle: '3B. Intervalos Compuestos y Tensiones (9, 11, 13)',
            nivel: '2-3',
          })
        );
      }
      if (sec.id === 'h-modal' && secModes) {
        out.push(
          updateSectionAttributes(secModes.html, {
            catId: 'armonia',
            menuTitle: '11B. Modos Griegos y Red de 14 Modos',
            nivel: '2-4',
          })
        );
      }
    }
    return out.join('\n');
  }

  if (!upgradeSectionFn) {
    return enrichedCategoryHtml;
  }
  const catSections = splitHtmlSections(enrichedCategoryHtml);
  if (catSections.length === 0) {
    return enrichedCategoryHtml;
  }
  return catSections.map((sec) => applyUpgrade(sec.id, sec.html)).join('\n');
}

/**
 * Extracts a single <section id="..."> block for Focused Lesson Reader mode.
 */
export function extractSingleSectionHtml(fullHtml: string, sectionId: string): string {
  const sections = splitHtmlSections(fullHtml);
  if (sections.length === 0) return fullHtml;
  const target = sections.find((s) => s.id === sectionId) || sections[0];
  return target.html;
}

export interface IntraLessonJumpItem {
  id: string;
  label: string;
  kind: 'heading' | 'lab' | 'callout';
}

/**
 * Extracts clean intra-lesson anchor targets for quick navigation within a single open lesson.
 */
export function extractIntraLessonAnchors(sectionHtml: string): IntraLessonJumpItem[] {
  const items: IntraLessonJumpItem[] = [];
  const seen = new Set<string>();
  const regex = /<(h3|article)\b([^>]*)>([\s\S]*?)<\/\1>/gi;
  let match: RegExpExecArray | null;
  while ((match = regex.exec(sectionHtml)) !== null) {
    const tag = match[1].toLowerCase();
    const attrs = match[2] || '';
    const inner = match[3] || '';
    const id = attrs.match(/\bid="([^"]+)"/)?.[1];
    if (!id || seen.has(id)) continue;

    if (tag === 'h3') {
      const label = inner.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
      if (label) {
        seen.add(id);
        items.push({ id, label, kind: 'heading' });
      }
    } else if (tag === 'article' && /\bdata-lab="/.test(attrs)) {
      const h3OrH4 = inner.match(/<h[34][^>]*>([\s\S]*?)<\/h[34]>|<strong[^>]*>([\s\S]*?)<\/strong>/i);
      const raw = (h3OrH4?.[1] || h3OrH4?.[2] || 'Laboratorio interactivo')
        .replace(/<[^>]+>/g, '')
        .replace(/\s+/g, ' ')
        .trim();
      seen.add(id);
      items.push({ id, label: `🧪 ${raw}`, kind: 'lab' });
    }
  }
  return items.slice(0, 7);
}

export function resolveCategoryForSectionId(sectionId: string): string {
  if (RELOCATED_SECTION_TARGET_CATEGORY[sectionId]) {
    return RELOCATED_SECTION_TARGET_CATEGORY[sectionId];
  }
  const prefixMap: [string, string][] = [
    ['intro', 'teoria'],
    ['t-', 'teoria'],
    ['h-', 'armonia'],
    ['c-', 'composicion'],
    ['ga-', 'guitarra-ac'],
    ['entreno-diario', 'entrenamiento'],
    ['e-', 'entrenamiento'],
    ['ge-', 'guitarra-el'],
    ['b-', 'bajo'],
    ['d-', 'bateria'],
    ['v-', 'canto'],
    ['f-', 'folclore'],
    ['a-', 'arreglos'],
    ['p-', 'produccion'],
    ['pr-', 'produccion'],
  ];
  for (const [prefix, catId] of prefixMap) {
    if (sectionId === prefix || sectionId.startsWith(prefix)) {
      return catId;
    }
  }
  return '';
}

export function findStageForSection(sectionId: string): AcademyStage | null {
  for (const stage of ACADEMY_STAGES) {
    if (stage.lessons.some((l) => l.sectionId === sectionId)) {
      return stage;
    }
  }
  return null;
}

export function getStageProgress(stage: AcademyStage, completedIds: string[]): { done: number; total: number; pct: number } {
  const set = new Set(completedIds);
  const total = stage.lessons.length;
  const done = stage.lessons.filter((l) => set.has(l.sectionId)).length;
  return {
    done,
    total,
    pct: total > 0 ? Math.round((done / total) * 100) : 0,
  };
}

export function getGlobalAcademyLessons(): (AcademyLessonRef & { stageNumber: number; stageTitle: string })[] {
  const list: (AcademyLessonRef & { stageNumber: number; stageTitle: string })[] = [];
  for (const stage of ACADEMY_STAGES) {
    for (const lesson of stage.lessons) {
      list.push({
        ...lesson,
        stageNumber: stage.number,
        stageTitle: stage.title,
      });
    }
  }
  return list;
}

// ============================================================================
// PURE PEDAGOGICAL LAB DATA & LOGIC (Rhythm Starter, Scale Ladder, Key Signature)
// ============================================================================

export interface RhythmStarterStep {
  id: number;
  beatLabel: string;
  playNote: boolean;
  isAccent: boolean;
  isRest: boolean;
  isTieCarry: boolean;
  durationSecFactor: number;
  offsetFrac: number; // Within 4 beats (0..4)
  caption: string;
}

export interface RhythmStarterPattern {
  id: string;
  label: string;
  concept: string;
  explanation: string;
  countingGuide: string;
  steps: RhythmStarterStep[];
}

export const RHYTHM_STARTER_PATTERNS: RhythmStarterPattern[] = [
  {
    id: 'negras',
    label: '1. Negras (Pulso 4/4)',
    concept: 'Unidad básica de pulso (1 tiempo por golpe)',
    explanation:
      'Cada negra coincide exactamente con un latido del metrónomo: 1 – 2 – 3 – 4. Es el esqueleto sobre el que se mide todo lo demás.',
    countingGuide: '1 · 2 · 3 · 4',
    steps: [
      { id: 0, beatLabel: '1', playNote: true, isAccent: true, isRest: false, isTieCarry: false, durationSecFactor: 0.85, offsetFrac: 0, caption: 'Fuerte' },
      { id: 1, beatLabel: '2', playNote: true, isAccent: false, isRest: false, isTieCarry: false, durationSecFactor: 0.85, offsetFrac: 1, caption: 'Débil' },
      { id: 2, beatLabel: '3', playNote: true, isAccent: false, isRest: false, isTieCarry: false, durationSecFactor: 0.85, offsetFrac: 2, caption: 'Semifuerte' },
      { id: 3, beatLabel: '4', playNote: true, isAccent: false, isRest: false, isTieCarry: false, durationSecFactor: 0.85, offsetFrac: 3, caption: 'Débil' },
    ],
  },
  {
    id: 'silencios',
    label: '2. Negras y Silencios',
    concept: 'El silencio tiene el mismo valor exacto que la nota',
    explanation:
      'Tocar en el pulso 1 y 3 y callar activamente en el 2 y 4 (silencio de negra 𝄽). En música, el silencio se cuenta por dentro igual que un golpe.',
    countingGuide: '1 · (shh) · 3 · (shh)',
    steps: [
      { id: 0, beatLabel: '1', playNote: true, isAccent: true, isRest: false, isTieCarry: false, durationSecFactor: 0.8, offsetFrac: 0, caption: 'Negra' },
      { id: 1, beatLabel: '2', playNote: false, isAccent: false, isRest: true, isTieCarry: false, durationSecFactor: 0.8, offsetFrac: 1, caption: 'Silencio 𝄽' },
      { id: 2, beatLabel: '3', playNote: true, isAccent: true, isRest: false, isTieCarry: false, durationSecFactor: 0.8, offsetFrac: 2, caption: 'Negra' },
      { id: 3, beatLabel: '4', playNote: false, isAccent: false, isRest: true, isTieCarry: false, durationSecFactor: 0.8, offsetFrac: 3, caption: 'Silencio 𝄽' },
    ],
  },
  {
    id: 'corcheas',
    label: '3. Corcheas Binarias',
    concept: 'Dos notas iguales por cada pulso (1 y 2 y 3 y 4 y)',
    explanation:
      'Dividimos cada pulso en dos mitades exactas: la primera cae en el número ("tierra") y la segunda en la "y" ("aire").',
    countingGuide: '1 y · 2 y · 3 y · 4 y',
    steps: [
      { id: 0, beatLabel: '1', playNote: true, isAccent: true, isRest: false, isTieCarry: false, durationSecFactor: 0.42, offsetFrac: 0, caption: 'Tierra' },
      { id: 1, beatLabel: 'y', playNote: true, isAccent: false, isRest: false, isTieCarry: false, durationSecFactor: 0.42, offsetFrac: 0.5, caption: 'Aire' },
      { id: 2, beatLabel: '2', playNote: true, isAccent: false, isRest: false, isTieCarry: false, durationSecFactor: 0.42, offsetFrac: 1, caption: 'Tierra' },
      { id: 3, beatLabel: 'y', playNote: true, isAccent: false, isRest: false, isTieCarry: false, durationSecFactor: 0.42, offsetFrac: 1.5, caption: 'Aire' },
      { id: 4, beatLabel: '3', playNote: true, isAccent: true, isRest: false, isTieCarry: false, durationSecFactor: 0.42, offsetFrac: 2, caption: 'Tierra' },
      { id: 5, beatLabel: 'y', playNote: true, isAccent: false, isRest: false, isTieCarry: false, durationSecFactor: 0.42, offsetFrac: 2.5, caption: 'Aire' },
      { id: 6, beatLabel: '4', playNote: true, isAccent: false, isRest: false, isTieCarry: false, durationSecFactor: 0.42, offsetFrac: 3, caption: 'Tierra' },
      { id: 7, beatLabel: 'y', playNote: true, isAccent: false, isRest: false, isTieCarry: false, durationSecFactor: 0.42, offsetFrac: 3.5, caption: 'Aire' },
    ],
  },
  {
    id: 'puntillo',
    label: '4. Negra con Puntillo',
    concept: 'El puntillo suma el 50% de la figura (1 + 0.5 = 1.5 pulsos)',
    explanation:
      'La negra con puntillo dura 3 corcheas (pulso 1 + pulso 2 completo hasta la "y"), obligando a la siguiente corchea a entrar en la "y" del 2.',
    countingGuide: '1 — 2 y · 3 — 4 y',
    steps: [
      { id: 0, beatLabel: '1', playNote: true, isAccent: true, isRest: false, isTieCarry: false, durationSecFactor: 1.35, offsetFrac: 0, caption: 'Negra.' },
      { id: 1, beatLabel: '2y', playNote: true, isAccent: false, isRest: false, isTieCarry: false, durationSecFactor: 0.42, offsetFrac: 1.5, caption: 'Corchea' },
      { id: 2, beatLabel: '3', playNote: true, isAccent: true, isRest: false, isTieCarry: false, durationSecFactor: 1.35, offsetFrac: 2, caption: 'Negra.' },
      { id: 3, beatLabel: '4y', playNote: true, isAccent: false, isRest: false, isTieCarry: false, durationSecFactor: 0.42, offsetFrac: 3.5, caption: 'Corchea' },
    ],
  },
  {
    id: 'ligadura',
    label: '5. Ligadura de Prolongación',
    concept: 'Une la duración de dos notas sin volver a atacar la segunda',
    explanation:
      'El pulso 2 se ata al pulso 3 mediante un arco (ligadura): tocas en 1 y 2, mantienes sonando durante el 3 sin golpear y vuelves a atacar en 4.',
    countingGuide: '1 · 2 (sostén 3) · 4',
    steps: [
      { id: 0, beatLabel: '1', playNote: true, isAccent: true, isRest: false, isTieCarry: false, durationSecFactor: 0.85, offsetFrac: 0, caption: 'Golpe' },
      { id: 1, beatLabel: '2', playNote: true, isAccent: false, isRest: false, isTieCarry: false, durationSecFactor: 1.85, offsetFrac: 1, caption: 'Ligada →' },
      { id: 2, beatLabel: '3', playNote: false, isAccent: false, isRest: false, isTieCarry: true, durationSecFactor: 0.85, offsetFrac: 2, caption: '(Sostén)' },
      { id: 3, beatLabel: '4', playNote: true, isAccent: false, isRest: false, isTieCarry: false, durationSecFactor: 0.85, offsetFrac: 3, caption: 'Golpe' },
    ],
  },
  {
    id: 'sincopa',
    label: '6. Contratiempo y Síncopa',
    concept: 'Acentuar la parte débil ("y") y ligarla sobre el pulso fuerte (3)',
    explanation:
      'Contratiempo: callar el pulso fuerte y tocar en el aire ("y"). Síncopa: atacar en el aire del 2 ("2y") y prolongarlo por encima del pulso 3.',
    countingGuide: '1 · (2) y (3) · 4',
    steps: [
      { id: 0, beatLabel: '1', playNote: true, isAccent: true, isRest: false, isTieCarry: false, durationSecFactor: 0.85, offsetFrac: 0, caption: 'Tierra' },
      { id: 1, beatLabel: '2', playNote: false, isAccent: false, isRest: true, isTieCarry: false, durationSecFactor: 0.42, offsetFrac: 1, caption: 'Silencio' },
      { id: 2, beatLabel: '2y', playNote: true, isAccent: true, isRest: false, isTieCarry: false, durationSecFactor: 1.35, offsetFrac: 1.5, caption: 'Síncopa!' },
      { id: 3, beatLabel: '3', playNote: false, isAccent: false, isRest: false, isTieCarry: true, durationSecFactor: 0.85, offsetFrac: 2, caption: '(Cruza 3)' },
      { id: 4, beatLabel: '4', playNote: true, isAccent: false, isRest: false, isTieCarry: false, durationSecFactor: 0.85, offsetFrac: 3, caption: 'Resuelve' },
    ],
  },
  {
    id: 'swing',
    label: '7. Swing / Shuffle (2:1)',
    concept: 'La primera corchea dura 2/3 del pulso y la segunda 1/3',
    explanation:
      'Aunque se escribe como corcheas normales, la sensación Swing alarga el golpe en tierra (66%) y retrasa la segunda corchea (33%): "Daa-ba Daa-ba".',
    countingGuide: '1 — a · 2 — a · 3 — a · 4 — a',
    steps: [
      { id: 0, beatLabel: '1', playNote: true, isAccent: true, isRest: false, isTieCarry: false, durationSecFactor: 0.58, offsetFrac: 0, caption: 'Larga 2/3' },
      { id: 1, beatLabel: 'a', playNote: true, isAccent: false, isRest: false, isTieCarry: false, durationSecFactor: 0.28, offsetFrac: 0.667, caption: 'Corta 1/3' },
      { id: 2, beatLabel: '2', playNote: true, isAccent: false, isRest: false, isTieCarry: false, durationSecFactor: 0.58, offsetFrac: 1, caption: 'Larga 2/3' },
      { id: 3, beatLabel: 'a', playNote: true, isAccent: false, isRest: false, isTieCarry: false, durationSecFactor: 0.28, offsetFrac: 1.667, caption: 'Corta 1/3' },
      { id: 4, beatLabel: '3', playNote: true, isAccent: true, isRest: false, isTieCarry: false, durationSecFactor: 0.58, offsetFrac: 2, caption: 'Larga 2/3' },
      { id: 5, beatLabel: 'a', playNote: true, isAccent: false, isRest: false, isTieCarry: false, durationSecFactor: 0.28, offsetFrac: 2.667, caption: 'Corta 1/3' },
      { id: 6, beatLabel: '4', playNote: true, isAccent: false, isRest: false, isTieCarry: false, durationSecFactor: 0.58, offsetFrac: 3, caption: 'Larga 2/3' },
      { id: 7, beatLabel: 'a', playNote: true, isAccent: false, isRest: false, isTieCarry: false, durationSecFactor: 0.28, offsetFrac: 3.667, caption: 'Corta 1/3' },
    ],
  },
];

export interface MajorScaleLadderPreset {
  id: string;
  label: string;
  rootMidi: number;
  notes: string[];
  midis: number[];
  accidentalsCount: number;
  collisionFixExplanation: string;
  alteredDegrees: number[]; // 1-indexed degrees altered relative to white keys
}

export const MAJOR_SCALE_LADDER_PRESETS: MajorScaleLadderPreset[] = [
  {
    id: 'C',
    label: 'C Mayor (0 alteraciones)',
    rootMidi: 60,
    notes: ['C', 'D', 'E', 'F', 'G', 'A', 'B', 'C'],
    midis: [60, 62, 64, 65, 67, 69, 71, 72],
    accidentalsCount: 0,
    collisionFixExplanation:
      'Las teclas blancas ya tienen naturalmente dos medios tonos entre Mi–Fa (grados 3→4) y Si–Do (grados 7→8). Por eso C Mayor encaja sin ningún sostenido ni bemol.',
    alteredDegrees: [],
  },
  {
    id: 'G',
    label: 'G Mayor (1 sostenido: F#)',
    rootMidi: 55,
    notes: ['G', 'A', 'B', 'C', 'D', 'E', 'F#', 'G'],
    midis: [55, 57, 59, 60, 62, 64, 66, 67],
    accidentalsCount: 1,
    collisionFixExplanation:
      'De Mi a Fa natural hay solo 1 semitono, pero la escalera mayor pide un Tono completo en el paso 6→7 y 1 semitono en 7→8. Por eso subimos Fa a F#.',
    alteredDegrees: [7],
  },
  {
    id: 'F',
    label: 'F Mayor (1 bemol: B♭)',
    rootMidi: 53,
    notes: ['F', 'G', 'A', 'B♭', 'C', 'D', 'E', 'F'],
    midis: [53, 55, 57, 58, 60, 62, 64, 65],
    accidentalsCount: 1,
    collisionFixExplanation:
      'De La a Si natural hay un Tono completo, pero entre los grados 3→4 la escalera mayor exige solo 1 semitono. Por eso bajamos Si a B♭.',
    alteredDegrees: [4],
  },
  {
    id: 'D',
    label: 'D Mayor (2 sostenidos: F#, C#)',
    rootMidi: 62,
    notes: ['D', 'E', 'F#', 'G', 'A', 'B', 'C#', 'D'],
    midis: [62, 64, 66, 67, 69, 71, 73, 74],
    accidentalsCount: 2,
    collisionFixExplanation:
      'Al arrancar en Re, tanto el paso 2→3 (Mi→Fa#) como el paso 6→7 (Si→Do#) necesitan cruzar las teclas negras para respetar T–T–S–T–T–T–S.',
    alteredDegrees: [3, 7],
  },
  {
    id: 'Bb',
    label: 'B♭ Mayor (2 bemoles: B♭, E♭)',
    rootMidi: 58,
    notes: ['B♭', 'C', 'D', 'E♭', 'F', 'G', 'A', 'B♭'],
    midis: [58, 60, 62, 63, 65, 67, 69, 70],
    accidentalsCount: 2,
    collisionFixExplanation:
      'Empezando en B♭, necesitamos bajar el 4º grado de Mi natural a E♭ para lograr el semitono obligatorio entre los grados 3→4 (D→E♭).',
    alteredDegrees: [1, 4],
  },
];

export interface KeySignatureAnalysis {
  kind: 'natural' | 'sharp' | 'flat';
  count: number;
  majorKey: string;
  relativeMinor: string;
  accidentals: string[];
  ruleSummary: string;
  tonicMidi: number;
  cadenceMidis: number[][]; // I - IV - V - I
}

const SHARP_ORDER = ['F#', 'C#', 'G#', 'D#', 'A#', 'E#', 'B#'];
const SHARP_KEYS: { major: string; minor: string; midi: number }[] = [
  { major: 'C Mayor', minor: 'A menor', midi: 60 },
  { major: 'G Mayor', minor: 'E menor', midi: 55 },
  { major: 'D Mayor', minor: 'B menor', midi: 62 },
  { major: 'A Mayor', minor: 'F# menor', midi: 57 },
  { major: 'E Mayor', minor: 'C# menor', midi: 64 },
  { major: 'B Mayor', minor: 'G# menor', midi: 59 },
  { major: 'F# Mayor', minor: 'D# menor', midi: 54 },
  { major: 'C# Mayor', minor: 'A# menor', midi: 61 },
];

const FLAT_ORDER = ['B♭', 'E♭', 'A♭', 'D♭', 'G♭', 'C♭', 'F♭'];
const FLAT_KEYS: { major: string; minor: string; midi: number }[] = [
  { major: 'C Mayor', minor: 'A menor', midi: 60 },
  { major: 'F Mayor', minor: 'D menor', midi: 53 },
  { major: 'B♭ Mayor', minor: 'G menor', midi: 58 },
  { major: 'E♭ Mayor', minor: 'C menor', midi: 63 },
  { major: 'A♭ Mayor', minor: 'F menor', midi: 56 },
  { major: 'D♭ Mayor', minor: 'B♭ menor', midi: 61 },
  { major: 'G♭ Mayor', minor: 'E♭ menor', midi: 54 },
  { major: 'C♭ Mayor', minor: 'A♭ menor', midi: 59 },
];

export function resolveKeySignatureFiveSecondRule(
  kind: 'sharp' | 'flat',
  rawCount: number
): KeySignatureAnalysis {
  const count = Math.max(0, Math.min(7, Math.round(rawCount)));
  if (count === 0) {
    return {
      kind: 'natural',
      count: 0,
      majorKey: 'C Mayor',
      relativeMinor: 'A menor',
      accidentals: [],
      ruleSummary: 'Sin sostenidos ni bemoles en la armadura = C Mayor (o su relativa A menor).',
      tonicMidi: 60,
      cadenceMidis: [
        [60, 64, 67],
        [60, 65, 69],
        [59, 62, 67],
        [60, 64, 67],
      ],
    };
  }

  if (kind === 'sharp') {
    const entry = SHARP_KEYS[count];
    const accidentals = SHARP_ORDER.slice(0, count);
    const lastSharp = accidentals[accidentals.length - 1];
    const r = entry.midi;
    return {
      kind: 'sharp',
      count,
      majorKey: entry.major,
      relativeMinor: entry.minor,
      accidentals,
      ruleSummary: `Último sostenido = ${lastSharp}. Sube 1 semitono desde ${lastSharp} → ${entry.major} (relativa ${entry.minor}).`,
      tonicMidi: r,
      cadenceMidis: [
        [r, r + 4, r + 7],
        [r, r + 5, r + 9],
        [r - 1, r + 2, r + 7],
        [r, r + 4, r + 7],
      ],
    };
  }

  const entry = FLAT_KEYS[count];
  const accidentals = FLAT_ORDER.slice(0, count);
  const penultimate = count >= 2 ? accidentals[count - 2] : '';
  const r = entry.midi;
  const ruleSummary =
    count === 1
      ? 'Excepción única (1 bemol = B♭): la tonalidad es siempre F Mayor (relativa D menor).'
      : `Penúltimo bemol = ${penultimate} → Tonalidad directa: ${entry.major} (relativa ${entry.minor}).`;

  return {
    kind: 'flat',
    count,
    majorKey: entry.major,
    relativeMinor: entry.minor,
    accidentals,
    ruleSummary,
    tonicMidi: r,
    cadenceMidis: [
      [r, r + 4, r + 7],
      [r, r + 5, r + 9],
      [r - 1, r + 2, r + 7],
      [r, r + 4, r + 7],
    ],
  };
}
