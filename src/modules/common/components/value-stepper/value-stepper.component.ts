import { ChangeDetectionStrategy, Component, input, signal, HostListener } from '@angular/core';
import { NG_VALUE_ACCESSOR, ControlValueAccessor } from '@angular/forms';
import { forwardRef } from '@angular/core';
import { KEY_EVENTS_ENUM } from '../../enums/key-events.enum';

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
})
export class ValueStepperComponent implements ControlValueAccessor {
  readonly #isDisabled = signal(false);

  protected readonly value = signal<number | null>(null);

  public readonly title = input<string>();
  public readonly valueKey = input.required<string>();
  public readonly min = input<number>(-Infinity);
  public readonly max = input<number>(Infinity);
  public readonly step = input<number>(1);

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
    if (this.#isDisabled()) return;
    this.#updateValue((this.value() ?? this.min()) + this.step());
  }

  public decrement(): void {
    if (this.#isDisabled()) return;
    this.#updateValue((this.value() ?? this.min()) - this.step());
  }

  #updateValue(newValue: number): void {
    const clamped = Math.min(Math.max(newValue, this.min()), this.max());
    this.value.set(clamped);
    this.#onChange(clamped);
    this.#onTouched();
  }

  @HostListener('keydown', ['$event'])
  public onKeyDown(event: KeyboardEvent): void {
    switch (event.key) {
      case KEY_EVENTS_ENUM.ARROW_UP:
      case KEY_EVENTS_ENUM.ARROW_RIGHT:
        event.preventDefault();
        this.increment();
        break;
      case KEY_EVENTS_ENUM.ARROW_DOWN:
      case KEY_EVENTS_ENUM.ARROW_LEFT:
        event.preventDefault();
        this.decrement();
        break;
      default:
        break;
    }
  }
}
