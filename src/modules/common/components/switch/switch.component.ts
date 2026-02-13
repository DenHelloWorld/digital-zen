import { ICONS, IconType } from '../../constants/icons.const';
import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';

export type SizeType = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl';

@Component({
  selector: 'dz-switch',
  imports: [
    // angular modules
    CommonModule,
  ],
  templateUrl: './switch.component.html',
  styleUrls: ['./switch.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '(keydown.enter)': 'onChange()',
  },
})
export class SwitchComponent {
  public readonly disabled = input<boolean>(false);
  public readonly size = input<SizeType>('sm');
  public readonly statusIcons = input<{ activated: IconType; unActivated: IconType }>({
    activated: ICONS.CHECK,
    unActivated: ICONS.CLOSE,
  });
  public readonly checked = input<boolean>(false);
  public readonly checkedChange = output<boolean>();

  protected readonly switchHeight = computed(() => {
    const heightMap: Record<SizeType, string> = {
      xs: 'var(--sw-size-xs)',
      sm: 'var(--sw-size-sm)',
      md: 'var(--sw-size-md)',
      lg: 'var(--sw-size-lg)',
      xl: 'var(--sw-size-xl)',
      xxl: 'var(--sw-size-xxl)',
    };
    return heightMap[this.size()];
  });

  protected onChange(): void {
    if (!this.disabled()) {
      this.checkedChange.emit(!this.checked());
    }
  }
}
