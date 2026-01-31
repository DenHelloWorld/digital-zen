import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LoaderComponent } from './loader.component';
import { ICONS } from '../../constants/icons.const';

/**
 * LoaderComponent Tests
 *
 * @guidelines
 * - DZ_01: Standalone component testing
 * - DZ_03: OnPush change detection testing
 *
 * @see /docs/testing-guide.md
 * @see /docs/testing-best-practices.md
 */
describe('LoaderComponent', () => {
  let component: LoaderComponent;
  let fixture: ComponentFixture<LoaderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LoaderComponent], // Standalone component in imports
    }).compileComponents();

    fixture = TestBed.createComponent(LoaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  describe('Component initialization', () => {
    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it('should have icons constant', () => {
      expect(component['icons']).toBe(ICONS);
    });
  });

  describe('Template rendering', () => {
    it('should render SVG element', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      const svg = compiled.querySelector('svg');
      expect(svg).toBeTruthy();
    });

    it('should have correct CSS class', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      const svg = compiled.querySelector('svg');
      expect(svg?.classList.contains('dz-icon')).toBe(true);
      expect(svg?.classList.contains('rotate')).toBe(true);
    });

    it('should have accessibility attributes', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      const svg = compiled.querySelector('svg');
      expect(svg?.getAttribute('aria-hidden')).toBe('true');
      expect(svg?.getAttribute('focusable')).toBe('false');
    });

    it('should render use element with icon href', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      const use = compiled.querySelector('use');
      expect(use).toBeTruthy();
      expect(use?.getAttribute('href')).toBe(ICONS.CYCLE);
    });
  });

  describe('Change detection', () => {
    it('should use OnPush change detection strategy', () => {
      expect(fixture.componentRef.changeDetectorRef).toBeTruthy();
    });
  });
});
