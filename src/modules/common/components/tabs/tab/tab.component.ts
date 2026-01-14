import {
  ChangeDetectionStrategy,
  Component,
  input,
  InputSignal,
  signal,
  WritableSignal,
} from '@angular/core';

@Component({
  selector: 'dz-tab',
  imports: [],
  templateUrl: './tab.component.html',
  styleUrl: './tab.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TabComponent {
  public readonly title: InputSignal<string> = input.required<string>();

  public readonly position: WritableSignal<'left' | 'right' | 'active'> = signal<
    'left' | 'right' | 'active'
  >('left');
}
