import { Component, signal, ChangeDetectionStrategy } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ProgressBorderDirective, type ProgressBorderConfig } from './progress-border.directive';
import { By } from '@angular/platform-browser';

@Component({
  standalone: true,
  imports: [ProgressBorderDirective],
  template: `
    <div
      dzProgressBorder
      [progress]="progress()"
      [progressConfig]="config()"
      style="width: 100px; height: 100px;"
    ></div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class TestHostComponent {
  progress = signal<number | undefined>(0.5);
  config = signal<ProgressBorderConfig>({ thickness: 4, color: 'rgb(0, 0, 255)' });
}

describe('ProgressBorderDirective (Zoneless)', () => {
  let fixture: ComponentFixture<TestHostComponent>;
  let component: TestHostComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestHostComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(TestHostComponent);
    component = fixture.componentInstance;

    const el = fixture.debugElement.query(By.css('div')).nativeElement as HTMLElement;

    spyOn(el, 'getBoundingClientRect').and.returnValue({
      width: 100,
      height: 100,
      top: 0,
      left: 0,
      bottom: 100,
      right: 100,
    } as DOMRect);

    fixture.detectChanges();
    await fixture.whenStable();
  });

  describe('Boundary Cases', () => {
    it('should clamp values between 0 and 1', async () => {
      component.progress.set(2);
      fixture.detectChanges();
      await fixture.whenStable();

      let fgRect = fixture.nativeElement.querySelectorAll('rect')[1] as SVGRectElement;
      expect(parseFloat(fgRect.getAttribute('stroke-dashoffset') || '0')).toBe(0);

      component.progress.set(-1);
      fixture.detectChanges();
      await fixture.whenStable();

      fgRect = fixture.nativeElement.querySelectorAll('rect')[1] as SVGRectElement;
      const totalLength = fgRect.getTotalLength();
      expect(parseFloat(fgRect.getAttribute('stroke-dashoffset') || '0')).toBeCloseTo(
        totalLength,
        1
      );
    });
  });

  describe('Cleanup', () => {
    it('should remove SVG element on destroy', async () => {
      const hostEl = fixture.debugElement.query(By.css('div')).nativeElement as HTMLElement;

      expect(hostEl.querySelector('svg.dz-progress-border')).not.toBeNull();

      fixture.destroy();

      await fixture.whenStable();

      const svg = hostEl.querySelector('svg.dz-progress-border');
      expect(svg).toBeNull();
    });
  });
});
