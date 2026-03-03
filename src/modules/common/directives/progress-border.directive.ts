import {
  Directive,
  input,
  inject,
  ElementRef,
  OnInit,
  OnDestroy,
  effect,
  Injector,
} from '@angular/core';

export interface ProgressBorderConfig {
  color?: string;
  thickness?: number;
  trackColor?: string;
}

const DEFAULT_PROGRESS_CONFIG: Required<ProgressBorderConfig> = {
  color: '',
  thickness: 4,
  trackColor: '',
};

@Directive({
  selector: '[dzProgressBorder]',
  standalone: true,
})
export class ProgressBorderDirective implements OnInit, OnDestroy {
  readonly #el = inject(ElementRef<HTMLElement>);
  readonly #injector = inject(Injector);

  #resizeObserver?: ResizeObserver;
  #themeObserver?: MutationObserver;

  #svgElement?: SVGSVGElement;
  #bgRect?: SVGRectElement;
  #fgRect?: SVGRectElement;

  public readonly progressConfig = input<ProgressBorderConfig>();
  public readonly progress = input<number>();

  ngOnInit(): void {
    this.#setupSvgStructure();

    this.#resizeObserver = new ResizeObserver(() => this.#setupSvgStructure());
    this.#resizeObserver.observe(this.#el.nativeElement);

    this.#themeObserver = new MutationObserver(() => this.#updateColors());
    this.#themeObserver.observe(document.body, { attributes: true, attributeFilter: ['class'] });

    effect(
      () => {
        const p = this.progress() ?? 0;
        const clamped = Math.min(Math.max(p, 0), 1);
        this.#updateProgress(clamped);
      },
      { injector: this.#injector }
    );

    effect(
      () => {
        this.progressConfig();
        this.#updateColors();
        this.#updateProgress(this.progress() ?? 0);
        this.#setupSvgStructure();
      },
      { injector: this.#injector }
    );
  }

  #setupSvgStructure(): void {
    const el = this.#el.nativeElement;
    const rect = el.getBoundingClientRect();
    const { width: w, height: h } = rect;
    if (w === 0 || h === 0) {
      return;
    }

    if (getComputedStyle(el).position === 'static') {
      el.style.position = 'relative';
    }

    if (!this.#svgElement) {
      this.#svgElement = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      this.#svgElement.classList.add('dz-progress-border');
      Object.assign(this.#svgElement.style, {
        position: 'absolute',
        top: '0',
        left: '0',
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        overflow: 'visible',
        zIndex: '-1',
      });

      this.#bgRect = this.#createRectElement();
      this.#fgRect = this.#createRectElement();

      this.#fgRect.style.transition = 'stroke-dashoffset 0.3s ease-in-out, stroke 0.3s ease';
      this.#fgRect.setAttribute('stroke-linecap', 'round');

      this.#svgElement.appendChild(this.#bgRect);
      this.#svgElement.appendChild(this.#fgRect);
      el.appendChild(this.#svgElement);
    }

    this.#svgElement.setAttribute('viewBox', `0 0 ${w} ${h}`);
    this.#updateRectDimensions(w, h);
    this.#updateColors();
    this.#updateProgress(this.progress() ?? 0);
  }

  #createRectElement(): SVGRectElement {
    const r = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    r.setAttribute('fill', 'none');
    return r;
  }

  #updateRectDimensions(w: number, h: number): void {
    const cfg = { ...DEFAULT_PROGRESS_CONFIG, ...this.progressConfig() };
    const t = cfg.thickness;
    const computed = window.getComputedStyle(this.#el.nativeElement);
    const varRadius = computed.getPropertyValue('--radius').trim() || '12px';
    const rVal = computed.borderRadius !== '0px' ? computed.borderRadius : varRadius;

    [this.#bgRect, this.#fgRect].forEach(r => {
      if (!r) {
        return;
      }
      r.setAttribute('x', (t / 2).toString());
      r.setAttribute('y', (t / 2).toString());
      r.setAttribute('width', (w - t).toString());
      r.setAttribute('height', (h - t).toString());
      r.style.rx = rVal;
      r.style.ry = rVal;
      r.setAttribute('stroke-width', t.toString());
    });
  }

  #updateColors(): void {
    if (!this.#bgRect || !this.#fgRect) {
      return;
    }

    const computed = window.getComputedStyle(this.#el.nativeElement);
    const varAccent = computed.getPropertyValue('--color-zen-accent').trim() || '#ac37ff';
    const cfg = { ...DEFAULT_PROGRESS_CONFIG, ...this.progressConfig() };

    const strokeColor = cfg.color || varAccent;
    const trackColor = cfg.trackColor || `color-mix(in srgb, ${strokeColor}, transparent 80%)`;

    this.#bgRect.setAttribute('stroke', trackColor);
    this.#fgRect.setAttribute('stroke', strokeColor);
  }

  #updateProgress(value: number): void {
    if (!this.#fgRect) {
      return;
    }

    const len = this.#fgRect.getTotalLength();

    this.#fgRect.setAttribute('stroke-dasharray', len.toString());

    const offset = len * (1 - value);
    this.#fgRect.setAttribute('stroke-dashoffset', offset.toString());
  }

  ngOnDestroy(): void {
    this.#resizeObserver?.disconnect();
    this.#themeObserver?.disconnect();
    this.#svgElement?.remove();
  }
}
