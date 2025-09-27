import {ChangeDetectionStrategy, Component, input, InputSignal, output, OutputEmitterRef} from '@angular/core';
import {IFocus} from '../../../common/models';
import {DATE_FORMAT_ENUM} from '../../../common';
import {TimeLineComponent} from '../time-line/time-line.component';

@Component({
  selector: "dz-period",
  templateUrl: "./period.component.html",
  styleUrls: ["./period.component.scss"],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    TimeLineComponent
  ]
})
export class PeriodComponent {
  protected dateFormats: typeof DATE_FORMAT_ENUM = DATE_FORMAT_ENUM;

  public readonly period: InputSignal<IFocus.Period> = input.required<IFocus.Period>();
  public readonly blockedUrls: InputSignal<string[]> = input<string[]>([]);

  public readonly toggleBlockedWebsite: OutputEmitterRef<IFocus.BlockedWebSite> = output<IFocus.BlockedWebSite>();

  protected onToggleBlockedWebsite(site: IFocus.BlockedWebSite): void {
    this.toggleBlockedWebsite.emit(site);
  }
}
