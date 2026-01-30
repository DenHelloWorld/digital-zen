import {
  Directive,
  input,
  signal,
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
  #progressSignal = signal(0);
  #resizeObserver?: ResizeObserver;
  #themeObserver?: MutationObserver;

  public readonly progressConfig = input<ProgressBorderConfig>();
  public readonly progress = input<number>();

  ngOnInit(): void {
    this.#resizeObserver = new ResizeObserver(() => this.#setupSvgBorder());
    this.#resizeObserver.observe(this.#el.nativeElement);

    this.#themeObserver = new MutationObserver(() => this.#setupSvgBorder());
    this.#themeObserver.observe(document.body, { attributes: true, attributeFilter: ['class'] });

    effect(
      () => {
        const p = this.progress() ?? 0;
        void this.progressConfig();

        const clamped = Math.min(Math.max(p, 0), 1);
        this.#progressSignal.set(clamped);
        this.#setupSvgBorder();
      },
      { injector: this.#injector }
    );
  }

  ngOnDestroy(): void {
    this.#resizeObserver?.disconnect();
    this.#themeObserver?.disconnect();
    this.#el.nativeElement.querySelector('svg.dz-progress-border')?.remove();
  }

  #setupSvgBorder(): void {
    const el = this.#el.nativeElement;
    const rect = el.getBoundingClientRect();
    const { width: w, height: h } = rect;
    if (w === 0 || h === 0) return;

    const computed = window.getComputedStyle(el);

    const varAccent = computed.getPropertyValue('--color-zen-accent').trim() || '#ac37ff';
    const cfg = { ...DEFAULT_PROGRESS_CONFIG, ...this.progressConfig() };
    const strokeColor = cfg.color || varAccent;

    const trackColor = cfg.trackColor || `color-mix(in srgb, ${strokeColor}, transparent 80%)`;

    if (computed.position === 'static') el.style.position = 'relative';

    let svg = el.querySelector('svg.dz-progress-border') as SVGSVGElement | null;
    if (svg) svg.remove();

    svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.classList.add('dz-progress-border');
    svg.setAttribute('viewBox', `0 0 ${w} ${h}`);
    Object.assign(svg.style, {
      position: 'absolute',
      top: '0',
      left: '0',
      width: '100%',
      height: '100%',
      pointerEvents: 'none',
      overflow: 'visible',
      zIndex: '10',
    });

    const t = cfg.thickness;
    const varRadius = computed.getPropertyValue('--radius').trim() || '12px';

    const createRect = () => {
      const r = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
      r.setAttribute('x', (t / 2).toString());
      r.setAttribute('y', (t / 2).toString());
      r.setAttribute('width', (w - t).toString());
      r.setAttribute('height', (h - t).toString());
      const rVal = computed.borderRadius !== '0px' ? computed.borderRadius : varRadius;
      r.style.rx = rVal;
      r.style.ry = rVal;
      r.setAttribute('fill', 'none');
      r.setAttribute('stroke-width', t.toString());
      return r;
    };

    const bg = createRect();
    bg.setAttribute('stroke', trackColor);

    const fg = createRect();
    fg.setAttribute('stroke', strokeColor);
    fg.setAttribute('stroke-linecap', 'round');

    svg.appendChild(bg);
    svg.appendChild(fg);
    el.appendChild(svg);

    const len = fg.getTotalLength();
    fg.setAttribute('stroke-dasharray', len.toString());
    fg.setAttribute('stroke-dashoffset', (len * (1 - this.#progressSignal())).toString());
  }
}
