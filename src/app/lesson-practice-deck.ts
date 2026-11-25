import { ChangeDetectionStrategy, Component, computed, input, output, signal } from '@angular/core';
import {
  formatReviewStatusLabel,
  getLessonPracticalMicroChallenge,
  getLessonQuizQuestions,
  type AcademyAudioPrompt,
  type AcademyQuizQuestion,
  type LessonReviewRecord,
} from './academy-practice';
import { MusicAudioEngine } from './lab-engine';
import { getVisualInstrumentFocus } from './music-games-logic';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-lesson-practice-deck',
  template: `
    <section
      id="academy-lesson-practice"
      aria-label="Práctica guiada, evaluación y repaso espaciado de la lección"
      class="mt-6 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] p-4 sm:p-6 space-y-5 shadow-[var(--shadow-section)]">
      <!-- Phases 6, 7 & 9: Guided Exercise, Instrument Application & Graduation Project Bridge -->
      <div class="space-y-3 pb-5 border-b border-[var(--border-subtle)]">
        <div class="flex flex-wrap items-center justify-between gap-2">
          <div>
            <div class="text-[11px] font-semibold uppercase tracking-wider text-[var(--text-muted)]">
              Práctica Guiada · Aplicación y Proyecto
            </div>
            <h3 class="text-base sm:text-lg font-extrabold text-[var(--text-primary)] m-0 mt-0.5">
              Reto Práctico de la Lección
            </h3>
          </div>
          <button
            type="button"
            (click)="openStageGraduation.emit(stageId())"
            class="min-h-[38px] px-3 py-1.5 rounded-lg text-xs font-semibold bg-[var(--bg-elevated)] text-[var(--accent-text)] border border-[var(--accent-border)] hover:bg-[var(--accent-soft)] transition-colors cursor-pointer whitespace-nowrap shrink-0">
            🏆 Rúbrica Etapa {{ stageNumber() }} →
          </button>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div class="p-3.5 rounded-xl bg-[var(--bg-card)] border border-[var(--border-subtle)] space-y-1.5">
            <div class="text-xs font-bold text-[var(--accent-text)]">Ejercicio en 3–5 minutos</div>
            <p class="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed m-0">
              {{ microChallenge().exerciseGoal }}
            </p>
          </div>
          <div class="p-3.5 rounded-xl bg-[var(--bg-card)] border border-[var(--border-subtle)] space-y-1.5">
            <div class="text-xs font-bold text-[var(--success)]">Aplicación en tu instrumento u obra</div>
            <p class="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed m-0">
              {{ microChallenge().instrumentApplication }}
            </p>
          </div>
        </div>

        <div class="flex flex-wrap items-center justify-between gap-2 text-xs text-[var(--text-secondary)] pt-1">
          <span>
            <strong class="text-[var(--text-primary)]">Meta de {{ stageTitle() }}:</strong>
            {{ graduationTitle() }} — {{ microChallenge().checkStep }}
          </span>
        </div>
      </div>

      <!-- Phases 8 & 10: Active Recall Evaluation & Spaced Repetition -->
      <div id="academy-lesson-evaluation" class="space-y-4 scroll-mt-24">
        <div class="flex flex-wrap items-center justify-between gap-2">
          <div>
            <div class="text-[11px] font-semibold uppercase tracking-wider text-[var(--text-muted)]">
              Evaluación Activa y Repaso Espaciado
            </div>
            <h3 class="text-base sm:text-lg font-extrabold text-[var(--text-primary)] m-0 mt-0.5">
              Comprueba lo Aprendido ({{ questions().length }} preguntas)
            </h3>
          </div>
          <span class="text-xs font-mono tabular-nums text-[var(--text-muted)]">
            {{ reviewStatusLabel() }}
          </span>
        </div>

        <div class="space-y-3.5">
          @for (q of questions(); track q.id; let qIdx = $index) {
            <div class="p-3.5 sm:p-4 rounded-xl bg-[var(--bg-card)] border border-[var(--border-subtle)] space-y-3">
              <div class="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2.5">
                <div class="space-y-1 min-w-0 sm:flex-1">
                  <div class="text-[11px] font-semibold text-[var(--accent-text)]">
                    Pregunta {{ qIdx + 1 }} · {{ q.topicTag }}
                  </div>
                  <div class="text-sm font-bold text-[var(--text-primary)] leading-snug">
                    {{ q.question }}
                  </div>
                </div>
                @if (q.audioPrompt; as prompt) {
                  <button
                    type="button"
                    (click)="playAudioPrompt(prompt)"
                    class="self-start min-h-[38px] px-3 py-1.5 rounded-lg text-xs font-semibold bg-[var(--bg-surface)] text-[var(--accent-text)] border border-[var(--border-strong)] hover:border-[var(--accent-border)] hover:bg-[var(--accent-soft)] transition-colors cursor-pointer whitespace-nowrap shrink-0 max-w-full truncate">
                    🔊 {{ prompt.label }}
                  </button>
                }
              </div>

              <div class="grid grid-cols-1 gap-2">
                @for (opt of q.options; track $index; let optIdx = $index) {
                  <button
                    type="button"
                    (click)="selectOption(q.id, optIdx)"
                    [attr.aria-pressed]="selectedChoice(q.id) === optIdx"
                    [class]="optionButtonClass(q, optIdx)">
                    <span class="font-mono text-xs font-bold shrink-0 w-5 text-center">
                      {{ optionLetter(optIdx) }}
                    </span>
                    <span class="flex-1 text-left">{{ opt }}</span>
                    @if (isEvaluated()) {
                      @if (optIdx === q.correctIndex) {
                        <span class="text-[11px] font-bold text-[var(--success)] shrink-0 whitespace-nowrap">✓ Correcta</span>
                      } @else if (selectedChoice(q.id) === optIdx) {
                        <span class="text-[11px] font-bold text-[var(--danger)] shrink-0 whitespace-nowrap">✕ Tu respuesta</span>
                      }
                    }
                  </button>
                }
              </div>

              @if (isEvaluated()) {
                <div class="p-2.5 rounded-lg bg-[var(--bg-surface)] border border-[var(--border-subtle)] text-xs text-[var(--text-secondary)] leading-relaxed">
                  <strong [class]="selectedChoice(q.id) === q.correctIndex ? 'text-[var(--success)]' : 'text-[var(--warning-text)]'">
                    {{ selectedChoice(q.id) === q.correctIndex ? 'Explicación:' : 'Para recordar:' }}
                  </strong>
                  {{ q.explanation }}
                </div>
              }
            </div>
          }
        </div>

        <div class="flex flex-wrap items-center justify-between gap-3 pt-1">
          @if (!isEvaluated()) {
            <button
              type="button"
              [disabled]="!allAnswered()"
              (click)="submitQuiz()"
              [class]="allAnswered()
                ? 'min-h-[42px] px-4 py-2 rounded-lg text-xs sm:text-sm font-bold bg-[var(--accent)] text-[var(--accent-fg)] hover:bg-[var(--accent-hover)] transition-colors cursor-pointer whitespace-nowrap'
                : 'min-h-[42px] px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold bg-[var(--bg-elevated)] text-[var(--text-muted)] border border-[var(--border-subtle)] cursor-not-allowed whitespace-nowrap'">
              ✓ Comprobar y Programar Repaso ({{ answeredCount() }}/{{ questions().length }})
            </button>
          } @else {
            <div class="flex flex-wrap items-center gap-2.5">
              <span
                [class]="lastSubmittedScore() >= 75
                  ? 'text-xs sm:text-sm font-bold text-[var(--success)] tabular-nums'
                  : 'text-xs sm:text-sm font-bold text-[var(--warning-text)] tabular-nums'">
                Resultado: {{ lastSubmittedScore() }}% · {{ lastSubmittedScore() >= 75 ? 'Dominio verificado y repaso programado' : 'Repaso programado para mañana (1 día)' }}
              </span>
              @if (lastSubmittedScore() >= 75 && !isCompleted()) {
                <button
                  type="button"
                  (click)="markLessonDominated.emit(sectionId())"
                  class="min-h-[38px] px-3 py-1.5 rounded-lg text-xs font-bold bg-[var(--success)] text-[var(--success-fg)] hover:opacity-90 cursor-pointer whitespace-nowrap">
                  ✓ Marcar Lección Dominada
                </button>
              }
              <button
                type="button"
                (click)="resetQuiz()"
                class="min-h-[38px] px-3 py-1.5 rounded-lg text-xs font-semibold bg-[var(--bg-elevated)] text-[var(--text-primary)] border border-[var(--border-strong)] hover:bg-[var(--bg-hover)] cursor-pointer whitespace-nowrap">
                ↻ Repetir comprobación
              </button>
            </div>
          }
        </div>
      </div>
    </section>
  `,
})
export class LessonPracticeDeck {
  readonly sectionId = input.required<string>();
  readonly stageId = input.required<string>();
  readonly stageTitle = input.required<string>();
  readonly stageNumber = input.required<number>();
  readonly graduationTitle = input.required<string>();
  readonly reviewRecord = input<LessonReviewRecord | undefined>(undefined);
  readonly isCompleted = input<boolean>(false);
  readonly audio = input.required<MusicAudioEngine>();

  readonly reviewSubmitted = output<{ sectionId: string; scorePct: number }>();
  readonly openStageGraduation = output<string>();
  readonly markLessonDominated = output<string>();
  readonly noteStatus = output<string>();

  private readonly selections = signal<Record<string, number>>({});
  private readonly evaluatedScores = signal<Record<string, number>>({});

  readonly questions = computed<AcademyQuizQuestion[]>(() => getLessonQuizQuestions(this.sectionId()));
  readonly microChallenge = computed(() => getLessonPracticalMicroChallenge(this.sectionId()));

  readonly reviewStatusLabel = computed<string>(() => {
    return formatReviewStatusLabel(this.reviewRecord(), Date.now());
  });

  readonly answeredCount = computed<number>(() => {
    const sel = this.selections();
    return this.questions().filter((q) => typeof sel[q.id] === 'number').length;
  });

  readonly allAnswered = computed<boolean>(() => {
    return this.questions().length > 0 && this.answeredCount() === this.questions().length;
  });

  readonly isEvaluated = computed<boolean>(() => {
    return typeof this.evaluatedScores()[this.sectionId()] === 'number';
  });

  readonly lastSubmittedScore = computed<number>(() => {
    return this.evaluatedScores()[this.sectionId()] ?? 0;
  });

  selectedChoice(questionId: string): number | null {
    const val = this.selections()[questionId];
    return typeof val === 'number' ? val : null;
  }

  optionLetter(idx: number): string {
    return ['A', 'B', 'C', 'D'][idx] || 'A';
  }

  selectOption(questionId: string, optIdx: number): void {
    if (this.isEvaluated()) return;
    this.selections.update((prev) => ({ ...prev, [questionId]: optIdx }));
  }

  optionButtonClass(q: AcademyQuizQuestion, optIdx: number): string {
    const sel = this.selectedChoice(q.id);
    const evaluated = this.isEvaluated();
    const base =
      'w-full min-h-[42px] px-3 py-2 rounded-lg border text-xs sm:text-sm flex items-center gap-2.5 transition-colors cursor-pointer';

    if (!evaluated) {
      return sel === optIdx
        ? `${base} bg-[var(--accent-soft)] border-[var(--accent)] text-[var(--text-primary)] font-semibold`
        : `${base} bg-[var(--bg-surface)] border-[var(--border-subtle)] text-[var(--text-secondary)] hover:border-[var(--border-strong)] hover:text-[var(--text-primary)]`;
    }

    if (optIdx === q.correctIndex) {
      return `${base} bg-[var(--success-soft)] border-[var(--success)] text-[var(--text-primary)] font-semibold`;
    }
    if (sel === optIdx) {
      return `${base} bg-[var(--danger-soft)] border-[var(--danger)] text-[var(--danger)]`;
    }
    return `${base} bg-[var(--bg-surface)] border-[var(--border-subtle)] text-[var(--text-muted)] opacity-75`;
  }

  submitQuiz(): void {
    const qs = this.questions();
    if (qs.length === 0 || !this.allAnswered()) return;
    const sel = this.selections();
    let hits = 0;
    for (const q of qs) {
      if (sel[q.id] === q.correctIndex) hits++;
    }
    const scorePct = Math.round((hits / qs.length) * 100);
    const secId = this.sectionId();
    this.evaluatedScores.update((prev) => ({ ...prev, [secId]: scorePct }));
    this.reviewSubmitted.emit({ sectionId: secId, scorePct });
    this.noteStatus.emit(`Evaluación completada (${scorePct}%): repaso espaciado actualizado`);
  }

  resetQuiz(): void {
    const secId = this.sectionId();
    const qIds = new Set(this.questions().map((q) => q.id));
    this.selections.update((prev) => {
      const next = { ...prev };
      qIds.forEach((id) => delete next[id]);
      return next;
    });
    this.evaluatedScores.update((prev) => {
      const next = { ...prev };
      delete next[secId];
      return next;
    });
  }

  playAudioPrompt(prompt: AcademyAudioPrompt): void {
    playAcademyAudioPrompt(this.audio(), prompt);
    this.noteStatus.emit(`🔊 ${prompt.label}`);
  }
}

export function playAcademyAudioPrompt(engine: MusicAudioEngine, prompt: AcademyAudioPrompt): void {
  engine.stopAll();
  const focus = getVisualInstrumentFocus();
  const inst: 'guitar' | 'piano' | 'bass' =
    focus === 'guitar-only' ? 'guitar' : focus === 'bass-only' ? 'bass' : 'piano';

  const playSingle = (midi: number, delaySec: number, dur = 0.55) => {
    if (inst === 'bass') {
      engine.playElectricBass(midi >= 55 ? midi - 12 : midi, dur, delaySec, 0.36, 'finger', false);
    } else if (inst === 'guitar') {
      engine.playPluckedGuitar(midi, dur, delaySec, 0.28, false);
    } else {
      engine.playAcousticPiano(midi, dur, delaySec, 0.25, false);
    }
  };

  if (prompt.kind === 'progression' && prompt.chordGroups?.length) {
    prompt.chordGroups.forEach((group, idx) => {
      engine.schedule(() => {
        if (inst === 'bass') {
          group.forEach((m, j) => playSingle(m, j * 0.08, 0.65));
        } else {
          engine.strumChord(group, inst === 'guitar' ? 'guitar' : 'piano', 0, false);
        }
      }, idx * 720);
    });
  } else if (prompt.kind === 'interval' && prompt.midis.length >= 2) {
    playSingle(prompt.midis[0], 0, 0.75);
    playSingle(prompt.midis[1], 0.5, 0.75);
    playSingle(prompt.midis[0], 1.15, 1.0);
    playSingle(prompt.midis[1], 1.18, 1.0);
  } else if (prompt.kind === 'chord') {
    engine.strumChord(prompt.midis, inst === 'guitar' ? 'guitar' : 'piano', 0, false);
  } else {
    prompt.midis.forEach((m, idx) => {
      engine.schedule(() => playSingle(m, 0, 0.45), idx * 300);
    });
  }
}
