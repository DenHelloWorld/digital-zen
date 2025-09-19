import {ChangeDetectionStrategy, Component, input, InputSignal, OnInit} from '@angular/core';
import {IFocus} from '../../../common/models';

@Component({
  selector: "dz-period",
  templateUrl: "./period.component.html",
  styleUrls: ["./period.component.scss"],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PeriodComponent implements OnInit {

  public readonly title: InputSignal<string> = input.required<string>();
  public readonly period: InputSignal<IFocus.Period> = input.required<IFocus.Period>();
  public readonly blockedUrls: InputSignal<string[]> = input<string[]>([]);

  public ngOnInit() {
    return;
  }
}
