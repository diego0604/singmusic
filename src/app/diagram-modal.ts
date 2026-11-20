import { Injectable, PLATFORM_ID, inject, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

const DIAGRAM_FRAME: Record<string, { what: string; how: string; why: string }> = {
  'interval-9th-visualizer': {
    what: 'Mapa radial que conecta cada nota del acorde para mostrar todos los intervalos que se forman entre ellas.',
    how: 'Apilando terceras o subiendo una nota una octava (+12 semitonos): la 2ª se vuelve 9ª, la 4ª se vuelve 11ª y la 6ª se vuelve 13ª.',
    why: 'Para detectar tensiones ricas o choques antes de tocar el acorde en guitarra, bajo o piano.',
  },
  'neo-riemann': {
    what: 'Árbol genealógico y red fractal que enlaza tríadas moviendo solo UNA nota (Glue 2/3) mediante P, L, R y Slide.',
    how: 'Partiendo de una tríada raíz (C), aplicas transformaciones de 1 o 2 semitonos para ramificar 3 generaciones sin usar cadencias tradicionales.',
    why: 'Para componer progresiones cinematográficas y épicas enlazando acordes lejanos con total suavidad.',
  },
  'modes-network-14': {
    what: 'Cartografía de los 14 modos ordenados de más luminoso a más oscuro y conectados por líneas continuas.',
    how: 'Moviendo una sola nota 1 semitono (1 traste) saltas de un modo a su vecino (Lidio → Jónico → Mixolidio → Dórico → Eólico → Frigio).',
    why: 'Para cambiar de atmósfera emocional al instante o elegir por descarte los 3 acordes clave de cualquier modo.',
  },
  'tension-pyramid-visualizer': {
    what: 'Pirámide jerárquica que muestra todos los acordes compatibles cuando una melodía sostiene una nota específica.',
    how: 'Siguiendo los hilos de color (Rosa = Tónica, Dorado = 5ª, Cian = 3ª) hacia acordes inferiores con 9, 11 o 13.',
    why: 'Para rearmonizar melodías conocidas o modular de forma orgánica manteniendo una nota común en el agudo.',
  },
  'cof-legacy': {
    what: 'Reloj de 12 horas ordenado por quintas justas (+7 semitonos) que muestra parentescos armónicos y simetrías.',
    how: 'Sumando 1 sostenido por paso hacia la derecha y 1 bemol hacia la izquierda, con el tritono diametralmente opuesto a 180°.',
    why: 'Para deducir armaduras al instante, encontrar relativos menores, cadenas 6–2–5–1 y sustitutos tritonales.',
  },
};

const EXPAND_ICON_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="15 3 21 3 21 9"/><polyline points="9 21 3 21 3 15"/><line x1="21" y1="3" x2="14" y2="10"/><line x1="3" y1="21" x2="10" y2="14"/></svg>`;

@Injectable({ providedIn: 'root' })
export class DiagramModalManager {
  private readonly platformId = inject(PLATFORM_ID);

  readonly isOpen = signal<boolean>(false);
  readonly activeTitle = signal<string>('');

  private activeCloseFn: (() => void) | null = null;

  open(widget: HTMLElement, explicitTitle?: string): void {
    if (!isPlatformBrowser(this.platformId)) return;
    if (
      this.activeCloseFn ||
      widget.classList.contains('diagram-expanded-active') ||
      document.querySelector('.diagram-fullscreen-backdrop')
    ) {
      return;
    }

    const parent = widget.parentElement;
    if (!parent) return;

    const title =
      explicitTitle ||
      widget.querySelector('.widget-header strong, h2, h3')?.textContent?.trim() ||
      'Vista Ampliada Interactiva';

    const placeholder = document.createElement('div');
    placeholder.className = 'diagram-modal-placeholder';
    placeholder.style.cssText =
      'padding:24px; text-align:center; color:#94a3b8; border:1px dashed #334155; border-radius:12px; margin:1rem 0;';
    placeholder.textContent = `Vista ampliada abierta: ${title}`;

    parent.replaceChild(placeholder, widget);

    const backdrop = document.createElement('div');
    backdrop.className = 'diagram-fullscreen-backdrop';
    backdrop.innerHTML = `
      <div class="diagram-fullscreen-shell" role="dialog" aria-modal="true" aria-label="${this.escapeAttr(title)}">
        <div class="diagram-fullscreen-topbar">
          <div class="diagram-fullscreen-title-wrap">
            <span class="diagram-fullscreen-badge">${EXPAND_ICON_SVG} Modo Pantalla Completa</span>
            <strong class="diagram-fullscreen-title">${this.escapeHtml(title)}</strong>
          </div>
          <button type="button" class="btn js-close-expanded-modal diagram-fullscreen-close">✕ Cerrar</button>
        </div>
        <div class="diagram-fullscreen-body"></div>
      </div>
    `;

    const body = backdrop.querySelector<HTMLElement>('.diagram-fullscreen-body')!;
    widget.classList.add('diagram-expanded-active');
    body.appendChild(widget);
    document.body.appendChild(backdrop);

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    this.isOpen.set(true);
    this.activeTitle.set(title);

    const onEsc = (ev: KeyboardEvent) => {
      if (ev.key === 'Escape') {
        this.close();
      }
    };

    const restore = () => {
      document.removeEventListener('keydown', onEsc);
      widget.classList.remove('diagram-expanded-active');
      if (placeholder.parentElement) {
        placeholder.parentElement.replaceChild(widget, placeholder);
      }
      backdrop.remove();
      document.body.style.overflow = prevOverflow;
      this.activeCloseFn = null;
      this.isOpen.set(false);
      this.activeTitle.set('');
    };

    this.activeCloseFn = restore;
    document.addEventListener('keydown', onEsc);
    backdrop.querySelector('.js-close-expanded-modal')?.addEventListener('click', restore);
    backdrop.addEventListener('click', (ev) => {
      if (ev.target === backdrop) {
        restore();
      }
    });
  }

  close(): void {
    this.activeCloseFn?.();
  }

  attachExpandButtons(root: HTMLElement): void {
    if (!isPlatformBrowser(this.platformId)) return;

    root.querySelectorAll<HTMLElement>('.interactive-widget').forEach((widget) => {
      const key = widget.getAttribute('data-lab') || widget.getAttribute('data-usar') || '';
      const info = DIAGRAM_FRAME[key];

      if (info && !widget.querySelector('.js-diagram-framing')) {
        const framing = document.createElement('div');
        framing.className = 'js-diagram-framing diagram-framing-grid';
        framing.innerHTML = `
          <div class="diagram-framing-item"><strong class="df-what">❓ ¿Qué es?</strong><span>${info.what}</span></div>
          <div class="diagram-framing-item"><strong class="df-how">🧭 ¿Cómo llegamos ahí?</strong><span>${info.how}</span></div>
          <div class="diagram-framing-item"><strong class="df-why">🎯 ¿Para qué se usa?</strong><span>${info.why}</span></div>
        `;
        const header = widget.querySelector('.widget-header');
        if (header && header.nextSibling) {
          widget.insertBefore(framing, header.nextSibling);
        } else {
          widget.prepend(framing);
        }
      }

      if (widget.querySelector('.js-expand-diagram')) return;

      const labelTitle =
        widget.querySelector('.widget-header strong, h2, h3')?.textContent?.trim() || 'widget interactivo';

      const expBtn = document.createElement('button');
      expBtn.type = 'button';
      expBtn.className = 'btn js-expand-diagram';
      expBtn.setAttribute('aria-label', `Expandir ${labelTitle} a pantalla completa`);
      expBtn.title = 'Expandir diagrama a pantalla completa';
      expBtn.innerHTML = `${EXPAND_ICON_SVG}<span>Expandir</span>`;
      expBtn.addEventListener('click', (ev) => {
        ev.stopPropagation();
        this.open(widget);
      });

      const controls = widget.querySelector('.widget-controls') || widget.querySelector('.widget-header');
      if (controls) {
        controls.appendChild(expBtn);
      } else {
        const strip = document.createElement('div');
        strip.className = 'widget-expand-strip';
        strip.appendChild(expBtn);
        widget.prepend(strip);
      }
    });
  }

  private escapeHtml(str: string): string {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }

  private escapeAttr(str: string): string {
    return this.escapeHtml(str).replace(/"/g, '&quot;');
  }
}
