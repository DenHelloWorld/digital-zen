import {
  ChangeDetectionStrategy,
  Component,
  input,
  signal,
  HostListener,
  computed,
} from '@angular/core';
import { NG_VALUE_ACCESSOR, ControlValueAccessor } from '@angular/forms';
import { forwardRef } from '@angular/core';
import { KEY_EVENTS_ENUM } from '../../enums/key-events.enum';
import { ICONS, UI_TEXT } from '../../constants';
import { NgTemplateOutlet } from '@angular/common';

@Component({
  selector: 'dz-value-stepper',
  templateUrl: './value-stepper.component.html',
  styleUrls: ['./value-stepper.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => ValueStepperComponent),
      multi: true,
    },
  ],
  imports: [NgTemplateOutlet],
})
export class ValueStepperComponent implements ControlValueAccessor {
  readonly #isDisabled = signal(false);

  protected readonly uiText = UI_TEXT;
  protected readonly icons = ICONS;

  protected readonly value = signal<number | null>(null);

  protected readonly isDecrementDisabled = computed(() => {
    const current = this.value() ?? this.min();
    return this.isDisabled() || current <= this.min();
  });
  protected readonly isIncrementDisabled = computed(() => {
    const current = this.value() ?? this.min();
    return this.isDisabled() || current >= this.max();
  });
  protected readonly isQuickDecrementDisabled = computed(() => {
    const current = this.value() ?? this.min();
    return this.isDisabled() || current - this.quickStep() < this.min();
  });
  protected readonly isQuickIncrementDisabled = computed(() => {
    const current = this.value() ?? this.min();
    return this.isDisabled() || current + this.quickStep() > this.max();
  });

  public readonly title = input.required<string>();
  public readonly valueLabel = input.required<string>();
  public readonly min = input<number>(-Infinity);
  public readonly max = input<number>(Infinity);
  public readonly step = input<number>(1);
  public readonly quickStep = input<number>(5);

  #onChange: (value: number | null) => void = () => {
    /*empty*/
  };

  #onTouched: () => void = () => {
    /*empty*/
  };

  public writeValue(value: number | null): void {
    this.value.set(value);
  }

  public registerOnChange(fn: (value: number | null) => void): void {
    this.#onChange = fn;
  }

  public registerOnTouched(fn: () => void): void {
    this.#onTouched = fn;
  }

  public setDisabledState(isDisabled: boolean): void {
    this.#isDisabled.set(isDisabled);
  }

  public isDisabled(): boolean {
    return this.#isDisabled();
  }

  public increment(): void {
    this.adjust(this.step());
  }

  public decrement(): void {
    this.adjust(-this.step());
  }

  public adjust(amount: number): void {
    if (this.isDisabled()) return;
    this.#updateValue((this.value() ?? this.min()) + amount);
  }

  #updateValue(newValue: number): void {
    const clamped = Math.min(Math.max(newValue, this.min()), this.max());
    this.value.set(clamped);
    this.#onChange(clamped);
    this.#onTouched();
  }

  @HostListener('keydown', ['$event'])
  public onKeyDown(event: KeyboardEvent): void {
    if (this.isDisabled()) return;

    switch (event.key) {
      case KEY_EVENTS_ENUM.ARROW_UP:
      case KEY_EVENTS_ENUM.ARROW_RIGHT:
        event.preventDefault();
        if (!this.isIncrementDisabled()) {
          this.increment();
        }
        break;
      case KEY_EVENTS_ENUM.ARROW_DOWN:
      case KEY_EVENTS_ENUM.ARROW_LEFT:
        event.preventDefault();
        if (!this.isDecrementDisabled()) {
          this.decrement();
        }
        break;
      default:
        break;
    }
  }
}
