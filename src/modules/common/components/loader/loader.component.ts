import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ICONS } from '../../constants';

/**
 * Loading spinner component
 *
 * @guidelines
 * - DZ_01: Standalone component
 * - DZ_03: OnPush change detection strategy
 *
 * @see /docs/coding-guidelines.md
 */
@Component({
  selector: 'dz-loader',
  templateUrl: 'loader.component.html',
  styleUrls: ['loader.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoaderComponent {
  protected readonly icons = ICONS;
}
