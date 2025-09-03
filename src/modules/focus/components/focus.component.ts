import {ChangeDetectionStrategy, Component, OnInit, signal, WritableSignal} from '@angular/core';

@Component({
  selector: 'dz-focus',
  templateUrl: './focus.component.html',
  styleUrls: ['./focus.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FocusComponent implements OnInit {
  protected readonly isFocused: WritableSignal<boolean> = signal<boolean>(false);

  public ngOnInit(): void {
    return;
  }

  protected toggleFocus(): void {
    this.isFocused.update((currentValue: boolean) => !currentValue);
  }
}
