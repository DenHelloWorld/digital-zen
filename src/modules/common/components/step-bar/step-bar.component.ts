import { ChangeDetectionStrategy, Component, input, model } from '@angular/core';

import { NgTemplateOutlet } from '@angular/common';
import { UI_TEXT } from '../../constants/ui-text.const';
import { ICONS } from '../../constants/icons.const';

export interface IStepBarOption {
  label: string;
  value: string | number;
  icon: string;
}

@Component({
  selector: 'dz-step-bar',
  templateUrl: './step-bar.component.html',
  styleUrls: ['./step-bar.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgTemplateOutlet],
})
export class StepBarComponent {
  protected readonly uiText = UI_TEXT;
  protected readonly icons = ICONS;

  public readonly options = input.required<IStepBarOption[]>();
  public readonly isDisabled = input<boolean>(true);
  public readonly isShowSeparators = input<boolean>(true);
  public readonly orientation = input<'horizontal' | 'vertical'>('horizontal');

  public readonly currentOption = model<IStepBarOption | null>(null);

  protected setCurrentOption(option: IStepBarOption): void {
    this.currentOption.set(option);
  }
}
