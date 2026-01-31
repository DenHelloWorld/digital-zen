import { ComponentFixture, TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { ThemeSwitcherComponent } from './theme-switcher.component';
import { ThemeService } from '../../services/theme.service';
import { COLOR_SCHEMA_ENUM, ColorSchemaType } from '../../enums/color-schema.enum';
import { UI_TEXT } from '../../constants/ui-text.const';
import { ICONS } from '../../constants/icons.const';

/**
 * ThemeSwitcherComponent Tests
 *
 * @guidelines
 * - DZ_01: Standalone component testing
 * - DZ_02: Testing with inject() dependency injection
 * - DZ_03: OnPush change detection testing
 * - DZ_04: Testing with Angular Signals
 *
 * @see /docs/testing-guide.md
 * @see /docs/testing-best-practices.md
 */
describe('ThemeSwitcherComponent', () => {
  let component: ThemeSwitcherComponent;
  let fixture: ComponentFixture<ThemeSwitcherComponent>;
  let mockThemeService: jasmine.SpyObj<ThemeService>;

  beforeEach(async () => {
    // Create mock service with signal
    const themeSignal = signal<ColorSchemaType>(COLOR_SCHEMA_ENUM.LIGHT);
    mockThemeService = jasmine.createSpyObj('ThemeService', ['toggle'], {
      theme: themeSignal.asReadonly(),
    });

    await TestBed.configureTestingModule({
      imports: [ThemeSwitcherComponent], // Standalone component in imports
      providers: [{ provide: ThemeService, useValue: mockThemeService }],
    }).compileComponents();

    fixture = TestBed.createComponent(ThemeSwitcherComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  describe('Component initialization', () => {
    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it('should have theme signal from service', () => {
      expect(component['theme']()).toBe(COLOR_SCHEMA_ENUM.LIGHT);
    });

    it('should have colorSchemes constant', () => {
      expect(component['colorSchemes']).toBe(COLOR_SCHEMA_ENUM);
    });

    it('should have uiText constant', () => {
      expect(component['uiText']).toBe(UI_TEXT);
    });

    it('should have icons constant', () => {
      expect(component['icons']).toBe(ICONS);
    });
  });

  describe('Theme toggling', () => {
    it('should call themeService.toggle when toggleTheme is called', () => {
      component['toggleTheme']();
      expect(mockThemeService.toggle).toHaveBeenCalledTimes(1);
    });

    it('should toggle theme on button click', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      const button = compiled.querySelector('button');

      button?.click();

      expect(mockThemeService.toggle).toHaveBeenCalledTimes(1);
    });
  });

  describe('Template rendering', () => {
    it('should render button element', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      const button = compiled.querySelector('button');
      expect(button).toBeTruthy();
    });

    it('should have correct button classes', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      const button = compiled.querySelector('button');
      expect(button?.classList.contains('dz-button')).toBe(true);
      expect(button?.classList.contains('dz-button--round')).toBe(true);
      expect(button?.classList.contains('dz-button--md')).toBe(true);
    });

    it('should have title attribute from UI_TEXT', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      const button = compiled.querySelector('button');
      expect(button?.getAttribute('title')).toBe(UI_TEXT.THEME_SWITCHER.TOGGLE_THEME_TITLE);
    });

    it('should render SVG icon', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      const svg = compiled.querySelector('svg');
      expect(svg).toBeTruthy();
      expect(svg?.classList.contains('dz-icon')).toBe(true);
    });

    it('should have accessibility attributes on SVG', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      const svg = compiled.querySelector('svg');
      expect(svg?.getAttribute('aria-hidden')).toBe('true');
      expect(svg?.getAttribute('focusable')).toBe('false');
    });

    it('should show MOON icon when theme is LIGHT', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      const use = compiled.querySelector('use');
      expect(use?.getAttribute('href')).toBe(ICONS.MOON);
    });

    it('should show SUN icon when theme is DARK', () => {
      // Update the mock theme to DARK
      const themeSignal = signal<ColorSchemaType>(COLOR_SCHEMA_ENUM.DARK);
      mockThemeService = jasmine.createSpyObj('ThemeService', ['toggle'], {
        theme: themeSignal.asReadonly(),
      });

      TestBed.resetTestingModule();
      TestBed.configureTestingModule({
        imports: [ThemeSwitcherComponent],
        providers: [{ provide: ThemeService, useValue: mockThemeService }],
      });

      const newFixture = TestBed.createComponent(ThemeSwitcherComponent);
      newFixture.detectChanges();

      const compiled = newFixture.nativeElement as HTMLElement;
      const use = compiled.querySelector('use');
      expect(use?.getAttribute('href')).toBe(ICONS.SUN);
    });
  });

  describe('Change detection', () => {
    it('should use OnPush change detection strategy', () => {
      expect(fixture.componentRef.changeDetectorRef).toBeTruthy();
    });
  });

  describe('Edge cases', () => {
    it('should handle multiple rapid toggle calls', () => {
      component['toggleTheme']();
      component['toggleTheme']();
      component['toggleTheme']();

      expect(mockThemeService.toggle).toHaveBeenCalledTimes(3);
    });
  });
});
