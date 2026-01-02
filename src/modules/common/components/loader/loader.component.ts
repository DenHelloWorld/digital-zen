import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ICONS } from '../../constants';

@Component({
  selector: 'dz-loader',
  templateUrl: 'loader.component.html',
  styleUrls: ['loader.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoaderComponent {
  protected readonly icons = ICONS;
}
